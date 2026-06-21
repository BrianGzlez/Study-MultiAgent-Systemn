"""Base agent class for the multi-agent system."""

import json
from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


class BaseAgent:
    """Base class for all agents in the StudyRoom AI system."""

    name: str = "BaseAgent"
    description: str = ""
    system_prompt: str = ""
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 2000

    def run(self, user_message: str, context: dict | None = None) -> dict:
        """Execute the agent with a user message and optional context."""
        messages = [{"role": "system", "content": self._build_system_prompt(context)}]

        if context and context.get("history"):
            for msg in context["history"]:
                messages.append(msg)

        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        content = response.choices[0].message.content.strip()
        return self._parse_response(content)

    def _build_system_prompt(self, context: dict | None = None) -> str:
        """Build the system prompt, optionally injecting context."""
        return self.system_prompt

    def _parse_response(self, content: str) -> dict:
        """Parse LLM response. Override for JSON parsing."""
        return {"message": content}

    def _parse_json_response(self, content: str) -> dict:
        """Helper to parse JSON from LLM response."""
        # Clean markdown code blocks
        if content.startswith("```"):
            content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"message": content, "error": "Failed to parse JSON"}
