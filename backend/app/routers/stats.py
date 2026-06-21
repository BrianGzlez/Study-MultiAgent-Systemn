from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Document, Exam, ExamQuestion, OralSession

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    # Total exams completed
    exams_done = db.query(Exam).filter(Exam.status == "completed").count()

    # Average score
    avg_score_result = (
        db.query(func.avg(Exam.score))
        .filter(Exam.status == "completed", Exam.score.isnot(None))
        .scalar()
    )
    avg_score = round(avg_score_result) if avg_score_result else 0

    # Documents count
    docs_count = db.query(Document).filter(Document.status == "ready").count()

    # Oral sessions count
    oral_count = db.query(OralSession).count()

    # Top subject (most exams)
    top_subject_result = (
        db.query(Exam.subject, func.count(Exam.id).label("count"))
        .filter(Exam.status == "completed")
        .group_by(Exam.subject)
        .order_by(func.count(Exam.id).desc())
        .first()
    )
    top_subject = top_subject_result[0] if top_subject_result else "None yet"

    # Recent activity
    recent_exams = (
        db.query(Exam)
        .order_by(Exam.created_at.desc())
        .limit(5)
        .all()
    )

    recent_docs = (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .limit(3)
        .all()
    )

    recent_oral = (
        db.query(OralSession)
        .order_by(OralSession.created_at.desc())
        .limit(3)
        .all()
    )

    # Build activity feed
    activity = []

    for exam in recent_exams:
        activity.append({
            "type": "exam",
            "label": f"Practice exam — {exam.subject}",
            "detail": f"{exam.score}%" if exam.score is not None else "In progress",
            "created_at": exam.created_at.isoformat() if exam.created_at else None,
        })

    for doc in recent_docs:
        activity.append({
            "type": "upload",
            "label": f"Uploaded: {doc.filename}",
            "detail": f"{doc.file_type} · {doc.page_count or '?'} pages",
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
        })

    for session in recent_oral:
        activity.append({
            "type": "oral",
            "label": f"Oral simulation — {session.subject}",
            "detail": f"{session.questions_asked} questions asked",
            "created_at": session.created_at.isoformat() if session.created_at else None,
        })

    # Sort by date
    activity.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return {
        "stats": {
            "exams_done": exams_done,
            "avg_score": avg_score,
            "documents_count": docs_count,
            "oral_sessions": oral_count,
            "top_subject": top_subject,
        },
        "activity": activity[:8],
    }
