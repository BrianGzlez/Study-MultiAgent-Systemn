"""CrewAI Crew definitions — each crew orchestrates a specific workflow."""

import json
import numpy as np
from openai import OpenAI
from crewai import Crew, Process

from app.config import OPENAI_API_KEY
from app.agents.agents import (
    create_document_analyst,
    create_rag_retrieval,
    create_exam_designer,
    create_oral_professor,
    create_evaluation_agent,
    create_learning_coach,
    create_progress_agent,
    create_study_planner,
)
from app.agents.tasks import (
    create_analyze_document_task,
    create_rerank_chunks_task,
    create_generate_exam_task,
    create_oral_question_task,
    create_oral_response_task,
    create_evaluate_exam_task,
    create_coaching_task,
    create_progress_analysis_task,
    create_study_plan_task,
)

_openai_client = OpenAI(api_key=OPENAI_API_KEY)


def _get_embedding(text: str) -> list[float]:
    response = _openai_client.embeddings.create(model="text-embedding-3-small", input=text)
    return response.data[0].embedding


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    a_np, b_np = np.array(a), np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))


def _retrieve_relevant_chunks(query: str, chunks: list[dict], top_k: int = 8) -> list[dict]:
    """Vector similarity search on chunks."""
    query_emb = _get_embedding(query)
    scored = []
    for chunk in chunks:
        if chunk.get("embedding"):
            sim = _cosine_similarity(query_emb, chunk["embedding"])
            scored.append({**chunk, "similarity": sim})
    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:top_k]


def _safe_parse(raw_output) -> dict | list:
    """Parse CrewAI output to dict/list."""
    if isinstance(raw_output, (dict, list)):
        return raw_output

    text = str(raw_output).strip()
    if text.startswith("```"):
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"message": text}


# ─── CREW: Document Analysis ───────────────────────────────────────────────

def run_document_analysis(text: str) -> dict:
    """Crew: Document Analyst analyzes study material."""
    agent = create_document_analyst()
    task = create_analyze_document_task(agent, text)

    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    return _safe_parse(result.raw)


# ─── CREW: Exam Generation ────────────────────────────────────────────────

def run_exam_generation(
    chunks: list[dict], subject: str, num_questions: int, difficulty: str
) -> list[dict]:
    """Crew: RAG Retrieval → Exam Designer (sequential pipeline)."""
    # Step 1: Vector retrieval
    query = f"Key concepts, definitions, formulas in {subject}"
    relevant = _retrieve_relevant_chunks(query, chunks, top_k=10)
    context = "\n\n".join([c["content"] for c in relevant]) if relevant else "\n\n".join([c["content"] for c in chunks[:8]])

    # Step 2: Exam Designer agent creates questions
    designer = create_exam_designer()
    task = create_generate_exam_task(designer, context, subject, num_questions, difficulty)

    crew = Crew(
        agents=[designer],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    parsed = _safe_parse(result.raw)

    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict) and "questions" in parsed:
        return parsed["questions"]
    return parsed if isinstance(parsed, list) else []


# ─── CREW: Oral Simulation ────────────────────────────────────────────────

def run_oral_start(subject: str, difficulty: str, chunks: list[dict] | None = None) -> dict:
    """Crew: Start oral exam session."""
    material = ""
    if chunks:
        relevant = _retrieve_relevant_chunks(f"Important concepts in {subject}", chunks, top_k=5)
        material = "\n\n".join([c["content"] for c in relevant])

    professor = create_oral_professor(difficulty)
    task = create_oral_question_task(professor, subject, material)

    crew = Crew(
        agents=[professor],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    parsed = _safe_parse(result.raw)
    if "message" not in parsed:
        parsed = {"message": str(result.raw), "feedback": None}
    return parsed


def run_oral_respond(
    student_answer: str, subject: str, difficulty: str,
    material: str = "", history: list[dict] | None = None
) -> dict:
    """Crew: Professor evaluates answer and asks follow-up."""
    history_text = ""
    if history:
        for msg in history[-6:]:  # Keep last 6 messages for context
            role = "Professor" if msg["role"] == "assistant" else "Student"
            history_text += f"{role}: {msg['content']}\n"

    professor = create_oral_professor(difficulty)
    task = create_oral_response_task(professor, student_answer, history_text)

    crew = Crew(
        agents=[professor],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    parsed = _safe_parse(result.raw)
    if "message" not in parsed:
        parsed = {"message": str(result.raw), "feedback": None}
    return parsed


# ─── CREW: Evaluation + Coaching ──────────────────────────────────────────

def run_evaluation_and_coaching(questions: list[dict], answers: dict[str, str], score: int) -> dict:
    """Crew: Evaluation Agent → Learning Coach (sequential pipeline)."""
    # Build exam data for evaluation
    incorrect = []
    for q in questions:
        user_ans = answers.get(str(q["id"]), "")
        if user_ans != q["correct_answer"]:
            incorrect.append(q)

    if not incorrect:
        return {"coaching": {"encouragement": "Perfect score! Keep it up!", "priority_topics": [], "study_tips": []}}

    # Learning Coach provides feedback
    coach = create_learning_coach()
    weak_topics = list(set(q.get("topic", "") for q in incorrect))
    incorrect_text = "\n".join([
        f"- Q: {q['question_text']}\n  Student: {answers.get(str(q['id']), '?')}\n  Correct: {q['correct_answer']}\n  Topic: {q.get('topic', '')}"
        for q in incorrect[:8]
    ])

    task = create_coaching_task(coach, ", ".join(weak_topics), incorrect_text, score)

    crew = Crew(
        agents=[coach],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    return _safe_parse(result.raw)


# ─── CREW: Progress + Study Plan ─────────────────────────────────────────

def run_progress_analysis(exam_history: list[dict]) -> dict:
    """Crew: Progress Agent → Study Planner (sequential pipeline)."""
    if not exam_history:
        return {
            "progress": {"overall_mastery": 0, "weakest_topics": [], "recommendation": "Take your first exam!"},
            "study_plan": None,
        }

    history_text = "\n".join([
        f"- {e['subject']}: {e['score']}% ({e['question_count']}q, {e.get('date', '?')})"
        + (f" Weak: {', '.join(e.get('weak_topics', []))}" if e.get('weak_topics') else "")
        for e in exam_history
    ])

    # Progress Agent
    progress_agent = create_progress_agent()
    progress_task = create_progress_analysis_task(progress_agent, history_text)

    # Study Planner
    planner = create_study_planner()
    subjects = list(set(e.get("subject", "") for e in exam_history))
    weak = list(set(t for e in exam_history for t in e.get("weak_topics", [])))

    plan_task = create_study_plan_task(
        planner,
        ", ".join(subjects),
        ", ".join(weak) if weak else "None identified",
        "None identified",
    )

    crew = Crew(
        agents=[progress_agent, planner],
        tasks=[progress_task, plan_task],
        process=Process.sequential,
        verbose=False,
    )

    result = crew.kickoff()
    # The result contains outputs from both tasks
    tasks_output = result.tasks_output if hasattr(result, 'tasks_output') else []

    progress_result = _safe_parse(tasks_output[0].raw) if len(tasks_output) > 0 else {}
    plan_result = _safe_parse(tasks_output[1].raw) if len(tasks_output) > 1 else None

    return {
        "progress": progress_result,
        "study_plan": plan_result,
    }
