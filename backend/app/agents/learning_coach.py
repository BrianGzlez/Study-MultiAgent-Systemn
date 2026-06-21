"""Agent 6: Learning Coach - Explains errors, gives examples, recommends exercises."""

from app.agents.base import BaseAgent


class LearningCoachAgent(BaseAgent):
    name = "Learning Coach"
    description = "Explains errors, provides examples, and recommends targeted exercises."
    temperature = 0.6
    max_tokens = 2000

    system_prompt = """You are the Learning Coach Agent. You help students understand their mistakes and improve.

Your personality: Patient, encouraging, but precise. You break down complex concepts into digestible pieces.

Your responsibilities:
1. Explain WHY the student got a question wrong (not just the correct answer)
2. Provide a simple example or analogy to clarify the concept
3. Suggest specific exercises or practice areas
4. Connect related concepts to build deeper understanding
5. Motivate the student while being honest about gaps

You MUST respond with valid JSON:
{
  "explanations": [
    {
      "topic": "topic name",
      "error_type": "misunderstanding|confusion|incomplete|careless",
      "explanation": "Clear explanation of the concept",
      "example": "Concrete example or analogy",
      "practice_suggestion": "What to practice"
    }
  ],
  "encouragement": "Motivational message based on performance",
  "priority_topics": ["most important topic to review first"],
  "study_tips": ["actionable study tips"]
}"""

    def coach_after_exam(self, weak_topics: list[str], incorrect_questions: list[dict], score: int) -> dict:
        """Provide coaching after an exam based on results."""
        questions_text = "\n".join([
            f"- Q: {q['question_text']}\n  Wrong answer: {q.get('user_answer', '?')}\n  Correct: {q['correct_answer']}\n  Topic: {q.get('topic', '')}"
            for q in incorrect_questions[:8]
        ])

        prompt = f"""The student just completed an exam with score: {score}%

Weak topics identified: {', '.join(weak_topics)}

Questions they got wrong:
{questions_text}

Provide coaching: explain errors, give examples, and recommend what to study next."""

        return self.run(prompt)

    def explain_concept(self, concept: str, context: str = "") -> dict:
        """Explain a specific concept the student is struggling with."""
        prompt = f"""The student is struggling with: {concept}

{f"Context from their study material: {context[:2000]}" if context else ""}

Explain this concept clearly with:
1. Simple definition
2. Real-world analogy
3. Common mistakes students make
4. How to remember it

Respond with JSON:
{{
  "concept": "{concept}",
  "simple_definition": "...",
  "analogy": "...",
  "common_mistakes": ["..."],
  "memory_tip": "...",
  "related_concepts": ["..."]
}}"""
        return self.run(prompt)

    def _parse_response(self, content: str) -> dict:
        return self._parse_json_response(content)
