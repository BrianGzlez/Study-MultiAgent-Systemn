import json
import numpy as np
from openai import OpenAI
from app.config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_embedding(text: str) -> list[float]:
    """Generate embedding for a text chunk using OpenAI."""
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """Calculate cosine similarity between two vectors."""
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))


def find_similar_chunks(query: str, chunks: list[dict], top_k: int = 8) -> list[dict]:
    """Find most similar chunks to a query using cosine similarity."""
    query_embedding = generate_embedding(query)

    scored = []
    for chunk in chunks:
        if chunk.get("embedding"):
            sim = cosine_similarity(query_embedding, chunk["embedding"])
            scored.append({**chunk, "similarity": sim})

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:top_k]


def generate_exam_questions(
    context: str, subject: str, num_questions: int, difficulty: str
) -> list[dict]:
    """Generate multiple-choice questions from context using OpenAI."""
    difficulty_map = {
        "easy": "easy (basic concepts and definitions)",
        "medium": "medium (comprehension and application)",
        "hard": "hard (analysis, synthesis, and complex cases)",
        "mixed": "mixed (varying difficulty levels)",
    }

    prompt = f"""Based on the following study material, generate exactly {num_questions} multiple-choice exam questions.

STUDY MATERIAL:
{context}

REQUIREMENTS:
- Generate exactly {num_questions} questions
- Difficulty level: {difficulty_map.get(difficulty, difficulty_map["medium"])}
- Each question must have exactly 4 options (A, B, C, D)
- Only one correct answer per question
- Options should be plausible but clearly distinguishable
- Include a brief explanation for each correct answer
- Assign a specific topic/subtopic to each question
- Cover different aspects of the material

Respond with a valid JSON array only (no markdown, no backticks):
[
  {{
    "question_text": "Question text here?",
    "options": {{"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}},
    "correct_answer": "A",
    "explanation": "Brief explanation",
    "difficulty": "easy|medium|hard",
    "topic": "Specific topic"
  }}
]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an expert professor. Always respond with valid JSON arrays only.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=6000,
    )

    content = response.choices[0].message.content.strip()
    # Clean markdown if present
    if content.startswith("```"):
        content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    return json.loads(content)


def generate_oral_response(
    messages: list[dict], subject: str, difficulty: str, context: str = ""
) -> dict:
    """Generate an oral exam response with structured feedback."""
    strictness = {
        "chill": "Be supportive and encouraging. Give hints when the student struggles.",
        "normal": "Be balanced. Helpful but honest. Point out mistakes directly.",
        "strict": "Be demanding. No hints. Expect precise, complete answers.",
    }

    system_prompt = f"""You are Professor AI, conducting an oral exam simulation.
Subject: {subject}
Style: {strictness.get(difficulty, strictness["normal"])}

{f"Reference material: {context[:3000]}" if context else ""}

Rules:
1. Ask one question at a time
2. After the student answers, provide structured feedback
3. Be conversational but academic

ALWAYS respond with valid JSON only:
{{
  "message": "Your response text",
  "feedback": null or {{
    "good": "What was good",
    "missing": "What was missing",
    "better": "A better answer would be...",
    "followUp": "Follow-up question"
  }}
}}"""

    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        api_messages.append({"role": msg["role"], "content": msg["content"]})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=api_messages,
        temperature=0.7,
        max_tokens=600,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"message": content, "feedback": None}
