import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import OralSession, DocumentChunk
from app.services.ai_service import generate_oral_response

router = APIRouter(prefix="/api/oral", tags=["oral"])


class StartSessionRequest(BaseModel):
    subject: str
    document_id: str | None = None
    difficulty: str = "normal"


class ContinueSessionRequest(BaseModel):
    session_id: str
    user_message: str


@router.post("/start")
def start_session(body: StartSessionRequest, db: Session = Depends(get_db)):
    """Start a new oral simulation session."""
    # Get context from document if provided
    context = ""
    if body.document_id:
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == uuid.UUID(body.document_id))
            .order_by(DocumentChunk.chunk_index)
            .limit(6)
            .all()
        )
        context = "\n\n".join([c.content for c in chunks])

    # Generate initial question
    messages = [{"role": "user", "content": "Start the oral exam session. Ask your first question."}]

    result = generate_oral_response(
        messages=messages,
        subject=body.subject,
        difficulty=body.difficulty,
        context=context,
    )

    # Create session
    session = OralSession(
        id=uuid.uuid4(),
        subject=body.subject,
        document_id=uuid.UUID(body.document_id) if body.document_id else None,
        difficulty=body.difficulty,
        messages=[
            {"role": "assistant", "content": result["message"]},
        ],
        questions_asked=1,
    )
    db.add(session)
    db.commit()

    return {
        "session_id": str(session.id),
        "message": result["message"],
        "feedback": None,
    }


@router.post("/respond")
def respond_to_session(body: ContinueSessionRequest, db: Session = Depends(get_db)):
    """Continue an existing oral session with a student response."""
    session = db.query(OralSession).filter(OralSession.id == uuid.UUID(body.session_id)).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Build conversation history
    existing_messages = session.messages or []
    conversation = []
    for msg in existing_messages:
        conversation.append(msg)
    conversation.append({"role": "user", "content": body.user_message})

    # Get context if document linked
    context = ""
    if session.document_id:
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == session.document_id)
            .order_by(DocumentChunk.chunk_index)
            .limit(6)
            .all()
        )
        context = "\n\n".join([c.content for c in chunks])

    # Generate AI response
    result = generate_oral_response(
        messages=conversation,
        subject=session.subject,
        difficulty=session.difficulty,
        context=context,
    )

    # Update session
    updated_messages = list(existing_messages)
    updated_messages.append({"role": "user", "content": body.user_message})
    updated_messages.append({"role": "assistant", "content": result["message"]})

    session.messages = updated_messages
    session.questions_asked = (session.questions_asked or 0) + 1
    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "session_id": str(session.id),
        "message": result["message"],
        "feedback": result.get("feedback"),
    }
