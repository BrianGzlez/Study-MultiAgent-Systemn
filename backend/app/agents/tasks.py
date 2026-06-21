"""CrewAI Task definitions — detailed, pedagogically-focused prompts."""

from crewai import Task, Agent


def create_analyze_document_task(agent: Agent, text: str) -> Task:
    return Task(
        description=f"""Deeply analyze this study material. Don't just list topics — understand the pedagogical structure.

DOCUMENT CONTENT:
{text[:8000]}

For each topic, identify:
1. Prerequisites (what must be understood first)
2. Core concepts vs supplementary details
3. Formulas/theorems with their conditions of applicability
4. Common student misconceptions
5. Exam-critical information (what's most likely to be tested)""",
        expected_output="""Valid JSON:
{
  "topics": [{"name": "...", "subtopics": [...], "key_concepts": [...], "formulas": [...], "prerequisites": [...], "common_misconceptions": [...], "difficulty": "easy|medium|hard", "exam_importance": "high|medium|low", "summary": "..."}],
  "overall_subject": "...",
  "concept_map": [{"from": "concept_a", "to": "concept_b", "relationship": "requires|extends|contrasts"}],
  "recommended_study_order": [...]
}""",
        agent=agent,
    )


def create_rerank_chunks_task(agent: Agent, query: str, chunks_text: str) -> Task:
    return Task(
        description=f"""Rerank these document chunks for the learning task.

TASK: {query}

CHUNKS:
{chunks_text}

Consider: Which chunks contain the most pedagogically valuable content for this task? Remove noise and redundancy.""",
        expected_output="""JSON: {"selected_indices": [0, 1, 3], "context_quality": "high|medium|low", "coverage_notes": "what's well covered and what might be missing"}""",
        agent=agent,
    )


def create_generate_exam_task(
    agent: Agent, context: str, subject: str, num_questions: int, difficulty: str
) -> Task:
    return Task(
        description=f"""Design a {num_questions}-question exam for: {subject}
Difficulty: {difficulty}

STUDY MATERIAL:
{context}

DESIGN PRINCIPLES:
- Each question must test a DIFFERENT concept (no repeats)
- For "medium" difficulty: 30% easy (definitions), 50% application (scenarios), 20% hard (synthesis/analysis)
- Distractors must be carefully crafted:
  * One should be a common misconception
  * One should be partially correct but missing a key distinction
  * One should confuse related concepts
- Explanations should TEACH — explain why the wrong answers are wrong too
- Include the Bloom's taxonomy level: remember, understand, apply, analyze, evaluate

Generate EXACTLY {num_questions} questions. Make them challenging but fair.""",
        expected_output="""A valid JSON array (no markdown):
[{"question_text": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correct_answer": "A", "explanation": "Why A is correct AND why B/C/D are wrong", "difficulty": "easy|medium|hard", "topic": "specific topic", "bloom_level": "remember|understand|apply|analyze"}]""",
        agent=agent,
    )


def create_oral_question_task(agent: Agent, subject: str, material: str) -> Task:
    return Task(
        description=f"""Start an oral exam on {subject}. 

{"REFERENCE MATERIAL (use this to ask informed, specific questions):" + chr(10) + material[:4000] if material else "Use your knowledge of " + subject + " at university level."}

Begin with a greeting and your FIRST question. Make it a foundational question that opens the door to deeper follow-ups.
Good first questions:
- Ask them to EXPLAIN a concept (not just define it)
- Ask them to COMPARE two related things
- Ask about the SIGNIFICANCE or APPLICATION of something""",
        expected_output="""Valid JSON only:
{"message": "Your greeting and first question", "feedback": null, "topic_being_tested": "the specific topic"}""",
        agent=agent,
    )


def create_oral_response_task(agent: Agent, student_answer: str, history_text: str) -> Task:
    return Task(
        description=f"""Evaluate the student's answer and continue the oral exam.

CONVERSATION SO FAR:
{history_text}

STUDENT'S LATEST ANSWER: "{student_answer}"

EVALUATE thoroughly:
1. What did they get RIGHT? (be specific)
2. What did they MISS or get wrong?
3. Is their understanding superficial or deep?

Then ask a FOLLOW-UP that:
- If they answered WELL → go deeper, ask about edge cases or connections
- If they were PARTIAL → probe the gap specifically
- If they were WRONG → correct gently and redirect

Your follow-up should be ONE clear question that pushes their understanding.""",
        expected_output="""Valid JSON only:
{"message": "Your evaluation comment followed by your next question", "feedback": {"good": "Specific things they got right", "missing": "Specific concepts they missed or got wrong", "better": "What a complete answer would include (be specific and educational)", "followUp": "Your next question"}, "topic_being_tested": "current topic"}""",
        agent=agent,
    )


def create_evaluate_exam_task(agent: Agent, exam_data: str) -> Task:
    return Task(
        description=f"""Grade this exam with precision:

{exam_data}

For each wrong answer, determine:
- Was it a careless error or a conceptual gap?
- What prerequisite might they be missing?
- Is there a pattern (same type of error repeated)?""",
        expected_output="""JSON: {"percentage": 0, "weak_topics": [...], "strong_topics": [...], "error_patterns": ["pattern1"], "overall_feedback": "...", "readiness_assessment": "ready|almost|not_ready for the real exam"}""",
        agent=agent,
    )


def create_coaching_task(agent: Agent, weak_topics: str, incorrect_questions: str, score: int) -> Task:
    return Task(
        description=f"""The student scored {score}% on their exam.

WEAK TOPICS: {weak_topics}

QUESTIONS THEY GOT WRONG (with correct answers and explanations):
{incorrect_questions}

For EACH error:
1. Explain WHY their answer was wrong (what misconception led to it)
2. Give a simple analogy or example that makes the correct concept click
3. Suggest ONE specific exercise to fix this gap

Be warm but honest. If they're far from ready, say so constructively.""",
        expected_output="""Valid JSON:
{"explanations": [{"topic": "...", "error_type": "misconception|confusion|incomplete|careless", "why_wrong": "What led to the error", "correct_explanation": "Clear explanation with example", "analogy": "Everyday analogy to build intuition", "practice_suggestion": "Specific exercise"}], "encouragement": "Honest motivational message", "priority_topics": ["most urgent to review"], "study_tips": ["actionable tips"], "readiness": "honest assessment of exam readiness"}""",
        agent=agent,
    )


def create_progress_analysis_task(agent: Agent, history_text: str) -> Task:
    return Task(
        description=f"""Analyze this student's exam history:

{history_text}

Look for:
- Overall trajectory (improving, declining, plateau?)
- Per-topic mastery levels
- Persistent weaknesses vs one-time mistakes
- Forgetting patterns (did they know it before but forgot?)
- Prerequisite gaps (weak in X because they never mastered Y?)""",
        expected_output="""Valid JSON:
{"topic_mastery": [{"topic": "...", "mastery_pct": 0, "trend": "improving|stable|declining", "sessions": 0}], "overall_mastery": 0, "weakest_topics": [...], "strongest_topics": [...], "recommendation": "Specific, actionable recommendation", "next_goals": ["goal1"], "exam_readiness": "ready|almost|not_ready"}""",
        agent=agent,
    )


def create_study_plan_task(agent: Agent, subjects: str, weak_topics: str, strong_topics: str) -> Task:
    return Task(
        description=f"""Create a 7-day study plan.

SUBJECTS: {subjects}
WEAK TOPICS (priority): {weak_topics}
STRONG TOPICS (maintain): {strong_topics}

Requirements:
- Sessions of 25-50 minutes (Pomodoro-friendly)
- Mix topics within days (interleaving)
- More time on weak areas
- Include at least 2 practice exams and 1 oral simulation
- Include review days for previously studied material
- Be realistic (assume the student has other classes too)""",
        expected_output="""Valid JSON:
{"plan_name": "...", "duration_days": 7, "daily_schedule": [{"day": "Monday", "sessions": [{"topic": "...", "activity": "practice_exam|oral_sim|deep_study|review|flashcards", "duration_minutes": 30, "priority": "high|medium|low", "specific_focus": "What exactly to study"}]}], "mock_exam_days": ["day1", "day2"], "weekly_goals": ["measurable goals"], "tips": ["study tips"]}""",
        agent=agent,
    )
