import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import OralSession, DocumentChunk
from app.agents.orchestrator import AgentOrchestrator

router = APIRouter(prefix="/api/oral", tags=["oral"])
orchestrator = AgentOrchestrator()


class StartSessionRequest(BaseModel):
    subject: str
    document_id: str | None = None
    difficulty: str = "normal"


class ContinueSessionRequest(BaseModel):
    session_id: str
    user_message: str


@router.post("/start")
def start_session(body: StartSessionRequest, db: Session = Depends(get_db)):
    """Start oral session using Oral Professor Agent with RAG context."""
    # Get chunks for context
    chunks = None
    if body.document_id:
        chunk_records = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == uuid.UUID(body.document_id))
            .order_by(DocumentChunk.chunk_index)
            .all()
        )
        chunks = [{"content": c.content, "embedding": c.embedding} for c in chunk_records]

    # Multi-agent: RAG Retrieval → Oral Professor
    result = orchestrator.start_oral_session(
        subject=body.subject,
        difficulty=body.difficulty,
        chunks=chunks,
    )

    # Create session in DB
    session = OralSession(
        id=uuid.uuid4(),
        subject=body.subject,
        document_id=uuid.UUID(body.document_id) if body.document_id else None,
        difficulty=body.difficulty,
        messages=[{"role": "assistant", "content": result.get("message", "")}],
        questions_asked=1,
    )
    db.add(session)
    db.commit()

    return {
        "session_id": str(session.id),
        "message": result.get("message", ""),
        "feedback": None,
    }


@router.post("/respond")
def respond_to_session(body: ContinueSessionRequest, db: Session = Depends(get_db)):
    """Continue oral session — Oral Professor Agent evaluates and asks follow-up."""
    session = db.query(OralSession).filter(OralSession.id == uuid.UUID(body.session_id)).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get material context if document linked
    material = ""
    if session.document_id:
        chunks = (
            db.query(DocumentChunk)
            .filter(DocumentChunk.document_id == session.document_id)
            .order_by(DocumentChunk.chunk_index)
            .limit(6)
            .all()
        )
        material = "\n\n".join([c.content for c in chunks])

    # Build conversation history
    history = []
    for msg in (session.messages or []):
        history.append(msg)
    history.append({"role": "user", "content": body.user_message})

    # Oral Professor Agent responds
    result = orchestrator.oral_respond(
        student_answer=body.user_message,
        subject=session.subject,
        difficulty=session.difficulty,
        material=material,
        history=history,
    )

    # Update session
    updated_messages = list(session.messages or [])
    updated_messages.append({"role": "user", "content": body.user_message})
    updated_messages.append({"role": "assistant", "content": result.get("message", "")})

    session.messages = updated_messages
    session.questions_asked = (session.questions_asked or 0) + 1
    session.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "session_id": str(session.id),
        "message": result.get("message", ""),
        "feedback": result.get("feedback"),
    }
