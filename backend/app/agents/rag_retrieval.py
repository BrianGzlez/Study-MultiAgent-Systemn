"""Agent 2: RAG Retrieval - Finds and ranks the most relevant chunks for a given task."""

import numpy as np
from app.agents.base import BaseAgent, client


class RAGRetrievalAgent(BaseAgent):
    name = "RAG Retrieval"
    description = "Retrieves and ranks the most relevant document chunks for a given query."
    temperature = 0.1
    max_tokens = 1000

    system_prompt = """You are the RAG Retrieval Agent. Your job is to rerank and filter retrieved chunks to provide optimal context.

Given retrieved chunks and a query, you must:
1. Remove irrelevant or noisy chunks
2. Reorder by relevance to the specific query
3. Identify if the context is sufficient or if more is needed

Respond with JSON:
{
  "selected_indices": [0, 2, 4],
  "context_quality": "high|medium|low",
  "missing_info": "description of any missing information or null"
}"""

    def retrieve(self, query: str, chunks: list[dict], top_k: int = 8) -> list[dict]:
        """Retrieve most relevant chunks using embedding similarity."""
        query_embedding = self._get_embedding(query)

        scored = []
        for chunk in chunks:
            if chunk.get("embedding"):
                sim = self._cosine_similarity(query_embedding, chunk["embedding"])
                scored.append({**chunk, "similarity": sim})

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        return scored[:top_k]

    def retrieve_and_rerank(self, query: str, chunks: list[dict], top_k: int = 8) -> str:
        """Retrieve chunks, then use LLM to rerank and filter noise."""
        # Step 1: Vector similarity retrieval
        candidates = self.retrieve(query, chunks, top_k=top_k + 4)

        if not candidates:
            # Fallback: return raw chunk content
            return "\n\n".join([c.get("content", "") for c in chunks[:top_k]])

        # Step 2: LLM reranking
        chunk_summaries = "\n".join([
            f"[{i}] {c['content'][:200]}..." for i, c in enumerate(candidates)
        ])

        rerank_prompt = f"""Query: {query}

Retrieved chunks:
{chunk_summaries}

Select the most relevant chunks for answering this query. Remove noise."""

        result = self.run(rerank_prompt)
        selected_indices = result.get("selected_indices", list(range(min(top_k, len(candidates)))))

        # Build context from selected chunks
        selected = [candidates[i] for i in selected_indices if i < len(candidates)]
        if not selected:
            selected = candidates[:top_k]

        return "\n\n".join([c["content"] for c in selected])

    def _get_embedding(self, text: str) -> list[float]:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding

    def _cosine_similarity(self, a: list[float], b: list[float]) -> float:
        a_np = np.array(a)
        b_np = np.array(b)
        return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))

    def _parse_response(self, content: str) -> dict:
        return self._parse_json_response(content)
