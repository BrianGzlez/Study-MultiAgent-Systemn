"""Agent 8: Study Planner - Creates study sessions, schedules reviews, prepares mock exams."""

from app.agents.base import BaseAgent


class StudyPlannerAgent(BaseAgent):
    name = "Study Planner"
    description = "Creates personalized study plans, schedules reviews, and prepares mock exams."
    temperature = 0.5
    max_tokens = 2000

    system_prompt = """You are the Study Planner Agent. You create effective, realistic study plans.

Your responsibilities:
1. Create daily/weekly study schedules
2. Distribute topics based on weakness priority
3. Include spaced repetition for reviewed topics
4. Schedule mock exams at strategic intervals
5. Balance study load to avoid burnout

Principles:
- Weak topics get more time
- Use interleaving (mix topics in sessions)
- Include review of strong topics to maintain them
- Plan rest days
- Be realistic about time constraints

You MUST respond with valid JSON:
{
  "plan_name": "Study plan title",
  "duration_days": 7,
  "daily_schedule": [
    {
      "day": "Monday",
      "sessions": [
        {
          "topic": "topic name",
          "activity": "review|practice_exam|oral_sim|deep_study",
          "duration_minutes": 45,
          "priority": "high|medium|low",
          "notes": "specific focus area"
        }
      ]
    }
  ],
  "mock_exam_days": ["Wednesday", "Saturday"],
  "review_strategy": "Description of review approach",
  "weekly_goals": ["goal1", "goal2"]
}"""

    def create_plan(
        self, subjects: list[str], weak_topics: list[str],
        strong_topics: list[str], available_days: int = 7
    ) -> dict:
        """Create a study plan based on current progress."""
        prompt = f"""Create a {available_days}-day study plan for this student.

SUBJECTS: {', '.join(subjects)}
WEAK TOPICS (need more time): {', '.join(weak_topics) if weak_topics else 'None identified yet'}
STRONG TOPICS (maintain): {', '.join(strong_topics) if strong_topics else 'None identified yet'}

Create a realistic daily plan that prioritizes weak areas while maintaining strong ones.
Include practice exams and oral simulations at strategic points."""

        return self.run(prompt)

    def suggest_next_activity(self, recent_activity: list[dict], weak_topics: list[str]) -> dict:
        """Suggest what the student should do next."""
        activity_text = "\n".join([
            f"- {a['type']}: {a['label']} ({a.get('detail', '')})"
            for a in recent_activity[:5]
        ])

        prompt = f"""Based on recent activity:
{activity_text}

Weak topics: {', '.join(weak_topics) if weak_topics else 'None yet'}

What should the student do next? Respond with JSON:
{{
  "recommended_activity": "practice_exam|oral_sim|review_document|study_weak_topic",
  "subject": "recommended subject",
  "topic": "specific topic to focus on",
  "reason": "why this is the best next step",
  "estimated_time": "30 minutes"
}}"""
        return self.run(prompt)

    def _parse_response(self, content: str) -> dict:
        return self._parse_json_response(content)
