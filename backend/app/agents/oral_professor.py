"""Agent 4: Oral Professor - Simulates a real professor in oral exams."""

from app.agents.base import BaseAgent


class OralProfessorAgent(BaseAgent):
    name = "Oral Professor"
    description = "Simulates a university professor conducting an oral exam with follow-up questions."
    temperature = 0.8
    max_tokens = 800

    def _build_system_prompt(self, context: dict | None = None) -> str:
        difficulty = (context or {}).get("difficulty", "normal")
        subject = (context or {}).get("subject", "the subject")
        material = (context or {}).get("material", "")

        strictness = {
            "chill": "Be supportive, encouraging, and give hints when the student struggles. Celebrate correct answers warmly.",
            "normal": "Be balanced — helpful but honest. Point out mistakes directly but encourage improvement. Ask follow-ups to deepen understanding.",
            "strict": "Be demanding like a real strict professor. No hints. Expect precise, complete answers. Challenge weak spots aggressively. If the answer is vague, say so.",
        }

        return f"""You are Professor AI conducting an oral exam on {subject}.

PERSONALITY: {strictness.get(difficulty, strictness["normal"])}

RULES:
1. Ask ONE question at a time
2. After the student answers, evaluate thoroughly then ask a FOLLOW-UP that goes deeper
3. If the student answers well, increase difficulty
4. If the student struggles, guide them but note it
5. Reference specific concepts from the material when possible
6. Be conversational but academic — like a real university oral exam

{f"REFERENCE MATERIAL (use this to ask informed questions):{chr(10)}{material[:4000]}" if material else ""}

ALWAYS respond with valid JSON:
{{
  "message": "Your spoken response to the student (question or comment)",
  "feedback": null or {{
    "good": "What was good about their answer",
    "missing": "What key points were missing",
    "better": "A more complete answer would include...",
    "followUp": "Your next follow-up question"
  }},
  "difficulty_adjustment": "same|up|down",
  "topic_being_tested": "current topic"
}}

For your FIRST message (no student answer yet), feedback should be null."""

    def start_session(self, subject: str, difficulty: str, material: str = "") -> dict:
        """Generate the first question to start the oral exam."""
        context = {"subject": subject, "difficulty": difficulty, "material": material}
        return self.run(
            "Start the oral exam. Greet the student briefly and ask your first question.",
            context=context,
        )

    def respond(self, student_answer: str, subject: str, difficulty: str, material: str = "", history: list[dict] | None = None) -> dict:
        """Respond to a student's answer with evaluation and follow-up."""
        context = {
            "subject": subject,
            "difficulty": difficulty,
            "material": material,
            "history": history or [],
        }
        return self.run(
            f"The student answered: \"{student_answer}\"\n\nEvaluate their answer and ask a follow-up question.",
            context=context,
        )

    def _parse_response(self, content: str) -> dict:
        parsed = self._parse_json_response(content)
        # Ensure required fields
        if "message" not in parsed:
            parsed["message"] = content
        if "feedback" not in parsed:
            parsed["feedback"] = None
        return parsed
