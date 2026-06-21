"""Agent 7: Progress Agent - Analyzes history, detects weaknesses, creates study plans."""

from app.agents.base import BaseAgent


class ProgressAgent(BaseAgent):
    name = "Progress Agent"
    description = "Analyzes exam history, detects weakness patterns, and recommends priorities."
    temperature = 0.3
    max_tokens = 1500

    system_prompt = """You are the Progress Agent. You analyze student performance history and identify patterns.

Your responsibilities:
1. Calculate per-topic mastery levels
2. Detect declining or improving trends
3. Identify persistent weak spots
4. Recommend study priorities
5. Set realistic improvement goals

You MUST respond with valid JSON:
{
  "topic_mastery": [
    {"topic": "name", "mastery_pct": 0, "trend": "improving|stable|declining", "exams_count": 0}
  ],
  "overall_mastery": 0,
  "weakest_topics": ["topic1", "topic2"],
  "strongest_topics": ["topic3"],
  "recommendation": "What to focus on this week",
  "next_goals": ["goal1", "goal2"]
}"""

    def analyze_progress(self, exam_history: list[dict]) -> dict:
        """Analyze exam history and produce progress report."""
        if not exam_history:
            return {
                "topic_mastery": [],
                "overall_mastery": 0,
                "weakest_topics": [],
                "strongest_topics": [],
                "recommendation": "Take your first exam to start tracking progress!",
                "next_goals": ["Complete your first practice exam"],
            }

        history_text = "\n".join([
            f"- {e['subject']}: {e['score']}% ({e['question_count']} questions, {e.get('date', 'unknown date')})"
            + (f"\n  Weak topics: {', '.join(e.get('weak_topics', []))}" if e.get('weak_topics') else "")
            for e in exam_history
        ])

        prompt = f"""Analyze this student's exam history and identify patterns:

EXAM HISTORY:
{history_text}

Provide mastery analysis, identify weak/strong topics, and recommend what to focus on."""

        return self.run(prompt)

    def _parse_response(self, content: str) -> dict:
        return self._parse_json_response(content)
