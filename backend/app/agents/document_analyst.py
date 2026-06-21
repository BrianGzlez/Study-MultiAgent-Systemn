"""Agent 1: Document Analyst - Analyzes documents, detects topics, extracts key concepts."""

from app.agents.base import BaseAgent


class DocumentAnalystAgent(BaseAgent):
    name = "Document Analyst"
    description = "Analyzes documents to detect topics, key concepts, formulas, and generate summaries."
    temperature = 0.3
    max_tokens = 3000

    system_prompt = """You are the Document Analyst Agent. Your job is to analyze study material and produce enriched metadata.

Your responsibilities:
1. Detect main topics and subtopics in the text
2. Identify key concepts and definitions
3. Extract formulas, theorems, and important rules
4. Generate concise summaries per topic
5. Classify difficulty level of content

You MUST respond with valid JSON only:
{
  "topics": [
    {
      "name": "Topic Name",
      "subtopics": ["subtopic1", "subtopic2"],
      "key_concepts": ["concept1", "concept2"],
      "formulas": ["formula1"],
      "difficulty": "easy|medium|hard",
      "summary": "Brief summary of this topic"
    }
  ],
  "overall_subject": "Main subject area",
  "total_concepts": 0,
  "recommended_study_order": ["topic1", "topic2"]
}"""

    def analyze(self, text: str) -> dict:
        """Analyze document text and return enriched metadata."""
        prompt = f"""Analyze the following study material. Detect all topics, key concepts, formulas, and generate summaries.

DOCUMENT CONTENT:
{text[:8000]}

Provide your analysis as JSON."""
        return self.run(prompt)

    def enrich_chunk(self, chunk_text: str, document_topics: list[str]) -> dict:
        """Enrich a single chunk with metadata."""
        prompt = f"""Given these document topics: {document_topics}

Analyze this chunk and classify it:

CHUNK:
{chunk_text}

Respond with JSON:
{{
  "primary_topic": "main topic of this chunk",
  "concepts": ["key concepts mentioned"],
  "difficulty": "easy|medium|hard",
  "importance": "high|medium|low",
  "summary": "one-line summary"
}}"""
        return self.run(prompt)

    def _parse_response(self, content: str) -> dict:
        return self._parse_json_response(content)
