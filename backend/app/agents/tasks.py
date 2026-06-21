"""CrewAI Task definitions for StudyRoom AI."""

from crewai import Task, Agent


def create_analyze_document_task(agent: Agent, text: str) -> Task:
    return Task(
        description=f"""Analyze this study material and extract structured metadata.

DOCUMENT CONTENT:
{text[:8000]}

Detect all topics, subtopics, key concepts, formulas, and generate summaries.
Classify difficulty level per topic.""",
        expected_output="""JSON with structure:
{
  "topics": [{"name": "...", "subtopics": [...], "key_concepts": [...], "formulas": [...], "difficulty": "easy|medium|hard", "summary": "..."}],
  "overall_subject": "...",
  "total_concepts": 0,
  "recommended_study_order": [...]
}""",
        agent=agent,
        output_json=True,
    )


def create_rerank_chunks_task(agent: Agent, query: str, chunks_text: str) -> Task:
    return Task(
        description=f"""Given this query and retrieved chunks, select the most relevant ones and remove noise.

QUERY: {query}

RETRIEVED CHUNKS:
{chunks_text}

Select the chunk indices that are most relevant to the query. Remove irrelevant ones.""",
        expected_output="""JSON: {"selected_indices": [0, 1, 3], "context_quality": "high|medium|low"}""",
        agent=agent,
        output_json=True,
    )


def create_generate_exam_task(
    agent: Agent, context: str, subject: str, num_questions: int, difficulty: str
) -> Task:
    return Task(
        description=f"""Design a {num_questions}-question exam for: {subject}
Difficulty setting: {difficulty}

STUDY MATERIAL:
{context}

Generate exactly {num_questions} high-quality questions. Ensure:
- Balanced topic coverage
- Difficulty distribution (~30% easy, ~50% medium, ~20% hard for 'medium' setting)
- Plausible distractors
- Teaching-oriented explanations""",
        expected_output="""A JSON array of questions:
[{"question_text": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correct_answer": "A", "explanation": "...", "difficulty": "easy|medium|hard", "topic": "..."}]""",
        agent=agent,
        output_json=True,
    )


def create_oral_question_task(agent: Agent, subject: str, material: str) -> Task:
    return Task(
        description=f"""Start an oral exam on {subject}. Greet the student briefly and ask your first question.

{"Reference material:" + material[:3000] if material else "Use general knowledge about " + subject}""",
        expected_output="""JSON: {"message": "Your greeting and first question", "feedback": null, "topic_being_tested": "..."}""",
        agent=agent,
        output_json=True,
    )


def create_oral_response_task(agent: Agent, student_answer: str, history_text: str) -> Task:
    return Task(
        description=f"""The student answered: "{student_answer}"

Conversation so far:
{history_text}

Evaluate their answer thoroughly, then ask a follow-up question that goes deeper.""",
        expected_output="""JSON: {"message": "Your response and follow-up question", "feedback": {"good": "...", "missing": "...", "better": "...", "followUp": "..."}, "topic_being_tested": "..."}""",
        agent=agent,
        output_json=True,
    )


def create_evaluate_exam_task(agent: Agent, exam_data: str) -> Task:
    return Task(
        description=f"""Evaluate this exam submission:

{exam_data}

Grade each answer. Identify weak topics and provide study recommendations.""",
        expected_output="""JSON: {"total_score": 0, "percentage": 0, "weak_topics": [...], "strong_topics": [...], "overall_feedback": "...", "study_recommendations": [...]}""",
        agent=agent,
        output_json=True,
    )


def create_coaching_task(agent: Agent, weak_topics: str, incorrect_questions: str, score: int) -> Task:
    return Task(
        description=f"""The student scored {score}% on their exam.

Weak topics: {weak_topics}

Questions they got wrong:
{incorrect_questions}

Explain their errors clearly, provide examples, and recommend what to study next.""",
        expected_output="""JSON: {"explanations": [{"topic": "...", "explanation": "...", "example": "...", "practice_suggestion": "..."}], "encouragement": "...", "priority_topics": [...], "study_tips": [...]}""",
        agent=agent,
        output_json=True,
    )


def create_progress_analysis_task(agent: Agent, history_text: str) -> Task:
    return Task(
        description=f"""Analyze this student's exam history and identify patterns:

{history_text}

Calculate mastery levels per topic, detect trends, and recommend priorities.""",
        expected_output="""JSON: {"topic_mastery": [{"topic": "...", "mastery_pct": 0, "trend": "improving|stable|declining"}], "overall_mastery": 0, "weakest_topics": [...], "strongest_topics": [...], "recommendation": "...", "next_goals": [...]}""",
        agent=agent,
        output_json=True,
    )


def create_study_plan_task(agent: Agent, subjects: str, weak_topics: str, strong_topics: str) -> Task:
    return Task(
        description=f"""Create a 7-day study plan for this student.

SUBJECTS: {subjects}
WEAK TOPICS (need more time): {weak_topics}
STRONG TOPICS (maintain): {strong_topics}

Create a realistic daily plan that prioritizes weak areas. Include practice exams and oral simulations.""",
        expected_output="""JSON: {"plan_name": "...", "duration_days": 7, "daily_schedule": [{"day": "Monday", "sessions": [{"topic": "...", "activity": "...", "duration_minutes": 45}]}], "weekly_goals": [...]}""",
        agent=agent,
        output_json=True,
    )
