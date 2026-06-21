"""Agent 5: Evaluation Agent - Grades answers, detects missing concepts."""

from app.agents.base import BaseAgent


class EvaluationAgent(BaseAgent):
    name = "Evaluation Agent"
    description = "Grades exam answers, detects missing concepts, and provides detailed scoring."
    temperature = 0.2
    max_tokens = 2000

    system_prompt = """You are the Evaluation Agent. You grade student answers with precision and fairness.

Your responsibilities:
1. Grade each answer objectively
2. Identify specific concepts the student missed
3. Detect partial understanding vs complete misunderstanding
4. Provide constructive feedback per question
5. Identify weak topics patterns

You MUST respond with valid JSON:
{
  "total_score": 0,
  "max_score": 0,
  "percentage": 0,
  "grade": "A|B|C|D|F",
  "question_results": [
    {
      "question_id": "id",
      "is_correct": true,
      "score": 1,
      "max_score": 1,
      "missing_concepts": [],
      "feedback": "specific feedback"
    }
  ],
  "weak_topics": ["topic1", "topic2"],
  "strong_topics": ["topic3"],
  "overall_feedback": "General assessment",
  "study_recommendations": ["recommendation1"]
}"""

    def evaluate_exam(self, questions: list[dict], answers: dict[str, str]) -> dict:
        """Evaluate a complete exam submission."""
        eval_data = []
        for q in questions:
            user_answer = answers.get(str(q["id"]), "")
            eval_data.append({
                "id": str(q["id"]),
                "question": q["question_text"],
                "correct_answer": q["correct_answer"],
                "user_answer": user_answer,
                "topic": q.get("topic", ""),
                "options": q.get("options", {}),
            })

        prompt = f"""Evaluate this exam submission:

{self._format_exam_data(eval_data)}

Grade each answer. Identify weak topics and provide study recommendations."""

        return self.run(prompt)

    def evaluate_oral_answer(self, question: str, answer: str, expected_concepts: list[str]) -> dict:
        """Evaluate a single oral exam answer."""
        prompt = f"""Evaluate this oral exam answer:

Question: {question}
Student's answer: {answer}
Expected key concepts: {', '.join(expected_concepts)}

Respond with JSON:
{{
  "score": 0-10,
  "precision": "high|medium|low",
  "missing_concepts": ["concepts not mentioned"],
  "incorrect_statements": ["any wrong claims"],
  "depth": "superficial|adequate|deep",
  "feedback": "specific constructive feedback"
}}"""
        return self.run(prompt)

    def _format_exam_data(self, data: list[dict]) -> str:
        lines = []
        for i, q in enumerate(data, 1):
            lines.append(f"Q{i}: {q['question']}")
            lines.append(f"   Correct: {q['correct_answer']} ({q['options'].get(q['correct_answer'], '')})")
            lines.append(f"   Student: {q['user_answer']} ({q['options'].get(q['user_answer'], 'no answer')})")
            lines.append(f"   Topic: {q['topic']}")
            lines.append("")
        return "\n".join(lines)

    def _parse_response(self, content: str) -> dict:
        return self._parse_json_response(content)
