"""Agent 3: Exam Designer - Designs balanced, high-quality exams."""

from app.agents.base import BaseAgent


class ExamDesignerAgent(BaseAgent):
    name = "Exam Designer"
    description = "Designs balanced exams with topic coverage, difficulty distribution, and varied question types."
    temperature = 0.7
    max_tokens = 6000

    system_prompt = """You are the Exam Designer Agent. You are an expert professor who creates high-quality, balanced exams.

Your responsibilities:
1. Design questions that cover ALL topics proportionally
2. Balance difficulty: ~30% easy, ~50% medium, ~20% hard
3. Avoid repetitive or trivial questions
4. Create plausible distractors (wrong options must seem reasonable)
5. Each question tests a different concept
6. Include explanations that teach, not just state the answer

Question types you can generate:
- Multiple choice (4 options, 1 correct)
- True/False with explanation
- Open-ended (short answer)

You MUST respond with a valid JSON array only (no markdown):
[
  {
    "question_text": "Question?",
    "type": "multiple_choice",
    "options": {"A": "opt1", "B": "opt2", "C": "opt3", "D": "opt4"},
    "correct_answer": "A",
    "explanation": "Why A is correct and why others are wrong",
    "difficulty": "easy|medium|hard",
    "topic": "Specific topic tested",
    "bloom_level": "remember|understand|apply|analyze"
  }
]"""

    def design_exam(
        self, context: str, subject: str, num_questions: int, difficulty: str,
        topics: list[str] | None = None, previous_questions: list[str] | None = None
    ) -> list[dict]:
        """Design a complete exam from context."""
        topic_instruction = ""
        if topics:
            topic_instruction = f"\nTopics to cover (distribute questions across these): {', '.join(topics)}"

        avoid_instruction = ""
        if previous_questions:
            avoid_instruction = f"\nAVOID these previously asked questions:\n- " + "\n- ".join(previous_questions[:10])

        prompt = f"""Design a {num_questions}-question exam for: {subject}
Difficulty setting: {difficulty}
{topic_instruction}
{avoid_instruction}

STUDY MATERIAL:
{context}

Generate exactly {num_questions} questions. Ensure variety and balanced coverage."""

        result = self.run(prompt)

        # If result is a list, return directly
        if isinstance(result, list):
            return result
        if isinstance(result, dict) and "questions" in result:
            return result["questions"]
        if isinstance(result, dict) and "message" in result:
            # Try to parse the message as JSON array
            return self._parse_json_response(result["message"]) if isinstance(result["message"], str) else [result]

        return []

    def _parse_response(self, content: str) -> dict | list:
        parsed = self._parse_json_response(content)
        if isinstance(parsed, list):
            return parsed
        return parsed
