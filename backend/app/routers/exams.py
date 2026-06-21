import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, DocumentChunk, Exam, ExamQuestion
from app.agents import run_exam_generation, run_evaluation_and_coaching

router = APIRouter(prefix="/api/exams", tags=["exams"])


class GenerateExamRequest(BaseModel):
    document_id: str
    subject: str
    num_questions: int = 20
    difficulty: str = "medium"
    topics: str | None = None  # Comma-separated specific topics to focus on


class SubmitAnswer(BaseModel):
    question_id: str
    user_answer: str


class SubmitExamRequest(BaseModel):
    answers: list[SubmitAnswer]
    total_time_seconds: int


@router.get("")
def list_exams(db: Session = Depends(get_db)):
    """List all exams."""
    exams = db.query(Exam).order_by(Exam.created_at.desc()).all()
    return {
        "exams": [
            {
                "id": str(e.id),
                "title": e.title,
                "subject": e.subject,
                "difficulty": e.difficulty,
                "question_count": e.question_count,
                "status": e.status,
                "score": e.score,
                "total_time_seconds": e.total_time_seconds,
                "created_at": e.created_at.isoformat() if e.created_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
            }
            for e in exams
        ]
    }


@router.get("/{exam_id}")
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    """Get exam with questions."""
    exam = db.query(Exam).filter(Exam.id == uuid.UUID(exam_id)).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    questions = (
        db.query(ExamQuestion)
        .filter(ExamQuestion.exam_id == exam.id)
        .order_by(ExamQuestion.created_at)
        .all()
    )

    return {
        "exam": {
            "id": str(exam.id),
            "title": exam.title,
            "subject": exam.subject,
            "difficulty": exam.difficulty,
            "question_count": exam.question_count,
            "status": exam.status,
            "score": exam.score,
            "total_time_seconds": exam.total_time_seconds,
            "created_at": exam.created_at.isoformat() if exam.created_at else None,
        },
        "questions": [
            {
                "id": str(q.id),
                "question_text": q.question_text,
                "options": q.options,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "difficulty": q.difficulty,
                "topic": q.topic,
                "user_answer": q.user_answer,
                "is_correct": q.is_correct,
            }
            for q in questions
        ],
    }


@router.post("/generate")
def generate_exam(body: GenerateExamRequest, db: Session = Depends(get_db)):
    """Generate exam using multi-agent pipeline: RAG Retrieval → Exam Designer."""
    # Verify document exists
    doc = db.query(Document).filter(Document.id == uuid.UUID(body.document_id)).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Get chunks with embeddings
    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == doc.id)
        .order_by(DocumentChunk.chunk_index)
        .all()
    )

    if not chunks:
        raise HTTPException(status_code=404, detail="No content found for this document")

    chunk_dicts = [{"content": c.content, "embedding": c.embedding} for c in chunks]

    # Multi-agent pipeline: RAG → Exam Designer (CrewAI)
    # Parse specific topics if provided
    topic_list = [t.strip() for t in body.topics.split(",")] if body.topics else None

    questions_data = run_exam_generation(
        chunks=chunk_dicts,
        subject=body.subject,
        num_questions=body.num_questions,
        difficulty=body.difficulty,
        topics=topic_list,
    )

    if not questions_data:
        raise HTTPException(status_code=500, detail="Failed to generate questions")

    # Create exam record
    exam = Exam(
        id=uuid.uuid4(),
        title=f"{body.subject} — Practice Exam",
        subject=body.subject,
        document_id=doc.id,
        difficulty=body.difficulty,
        question_count=len(questions_data),
        status="generated",
    )
    db.add(exam)

    # Create questions
    for q_data in questions_data:
        if not isinstance(q_data, dict):
            continue
        question = ExamQuestion(
            id=uuid.uuid4(),
            exam_id=exam.id,
            question_text=q_data.get("question_text", ""),
            options=q_data.get("options", {}),
            correct_answer=q_data.get("correct_answer", ""),
            explanation=q_data.get("explanation", ""),
            difficulty=q_data.get("difficulty", body.difficulty),
            topic=q_data.get("topic", body.subject),
        )
        db.add(question)

    db.commit()

    return {
        "success": True,
        "exam": {
            "id": str(exam.id),
            "title": exam.title,
            "question_count": len(questions_data),
            "difficulty": body.difficulty,
        },
    }


@router.post("/{exam_id}/submit")
def submit_exam(exam_id: str, body: SubmitExamRequest, db: Session = Depends(get_db)):
    """Submit exam answers — Evaluation Agent grades, Learning Coach provides feedback."""
    exam = db.query(Exam).filter(Exam.id == uuid.UUID(exam_id)).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    questions = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam.id).all()
    question_map = {str(q.id): q for q in questions}

    # Grade answers
    correct_count = 0
    for answer in body.answers:
        question = question_map.get(answer.question_id)
        if question:
            is_correct = question.correct_answer == answer.user_answer
            question.user_answer = answer.user_answer
            question.is_correct = is_correct
            if is_correct:
                correct_count += 1

    score = round((correct_count / len(questions)) * 100) if questions else 0

    exam.status = "completed"
    exam.score = score
    exam.total_time_seconds = body.total_time_seconds
    exam.completed_at = datetime.now(timezone.utc)
    db.commit()

    # Get weak topics
    incorrect = [q for q in questions if q.is_correct is False]
    weak_topics = list(set(q.topic for q in incorrect))

    # Use Learning Coach crew for feedback on errors
    coaching = None
    if incorrect and len(incorrect) <= 10:
        try:
            coaching = run_evaluation_and_coaching(
                questions=[
                    {"id": str(q.id), "question_text": q.question_text, "correct_answer": q.correct_answer, "topic": q.topic, "options": q.options}
                    for q in questions
                ],
                answers={str(a.question_id): a.user_answer for a in body.answers},
                score=score,
            )
        except Exception:
            pass  # Coaching is optional

    return {
        "success": True,
        "results": {
            "score": score,
            "correct_count": correct_count,
            "total_questions": len(questions),
            "total_time_seconds": body.total_time_seconds,
            "weak_topics": weak_topics,
            "coaching": coaching,
        },
    }
