"""Orchestrator - Coordinates all agents in the multi-agent system."""

from app.agents.document_analyst import DocumentAnalystAgent
from app.agents.rag_retrieval import RAGRetrievalAgent
from app.agents.exam_designer import ExamDesignerAgent
from app.agents.oral_professor import OralProfessorAgent
from app.agents.evaluation import EvaluationAgent
from app.agents.learning_coach import LearningCoachAgent
from app.agents.progress import ProgressAgent
from app.agents.study_planner import StudyPlannerAgent


class AgentOrchestrator:
    """Coordinates all agents for complex multi-step tasks."""

    def __init__(self):
        self.document_analyst = DocumentAnalystAgent()
        self.rag_retrieval = RAGRetrievalAgent()
        self.exam_designer = ExamDesignerAgent()
        self.oral_professor = OralProfessorAgent()
        self.evaluation = EvaluationAgent()
        self.learning_coach = LearningCoachAgent()
        self.progress = ProgressAgent()
        self.study_planner = StudyPlannerAgent()

    def analyze_document(self, text: str) -> dict:
        """Pipeline: Document Analyst analyzes text."""
        return self.document_analyst.analyze(text)

    def generate_exam(
        self, chunks: list[dict], subject: str, num_questions: int,
        difficulty: str, topics: list[str] | None = None
    ) -> list[dict]:
        """Pipeline: RAG Retrieval → Exam Designer.

        1. RAG agent retrieves and ranks relevant context
        2. Exam Designer creates balanced questions
        """
        # Step 1: RAG Retrieval gets optimized context
        query = f"Key concepts, definitions, formulas, and important topics in {subject}"
        context = self.rag_retrieval.retrieve_and_rerank(query, chunks)

        # Step 2: Exam Designer creates the exam
        questions = self.exam_designer.design_exam(
            context=context,
            subject=subject,
            num_questions=num_questions,
            difficulty=difficulty,
            topics=topics,
        )

        return questions

    def evaluate_exam(self, questions: list[dict], answers: dict[str, str]) -> dict:
        """Pipeline: Evaluation Agent → Learning Coach.

        1. Evaluation agent grades the exam
        2. Learning Coach provides explanations for errors
        """
        # Step 1: Grade the exam
        eval_result = self.evaluation.evaluate_exam(questions, answers)

        # Step 2: If there are weak topics, get coaching
        weak_topics = eval_result.get("weak_topics", [])
        incorrect = [q for q in questions if answers.get(str(q["id"])) != q["correct_answer"]]

        coaching = None
        if incorrect:
            score = eval_result.get("percentage", 0)
            coaching = self.learning_coach.coach_after_exam(
                weak_topics=weak_topics,
                incorrect_questions=incorrect,
                score=score,
            )

        return {
            "evaluation": eval_result,
            "coaching": coaching,
        }

    def start_oral_session(self, subject: str, difficulty: str, chunks: list[dict] | None = None) -> dict:
        """Pipeline: RAG Retrieval → Oral Professor.

        1. RAG gets relevant material context
        2. Oral Professor starts the session
        """
        material = ""
        if chunks:
            query = f"Important concepts and questions about {subject}"
            material = self.rag_retrieval.retrieve_and_rerank(query, chunks, top_k=5)

        return self.oral_professor.start_session(subject, difficulty, material)

    def oral_respond(
        self, student_answer: str, subject: str, difficulty: str,
        material: str = "", history: list[dict] | None = None
    ) -> dict:
        """Oral Professor evaluates and responds."""
        return self.oral_professor.respond(student_answer, subject, difficulty, material, history)

    def get_progress_analysis(self, exam_history: list[dict]) -> dict:
        """Pipeline: Progress Agent → Study Planner.

        1. Progress agent analyzes history
        2. Study Planner creates a plan based on analysis
        """
        # Step 1: Analyze progress
        progress = self.progress.analyze_progress(exam_history)

        # Step 2: Create study plan
        weak = progress.get("weakest_topics", [])
        strong = progress.get("strongest_topics", [])
        subjects = list(set(e.get("subject", "") for e in exam_history if e.get("subject")))

        plan = None
        if subjects:
            plan = self.study_planner.create_plan(
                subjects=subjects,
                weak_topics=weak,
                strong_topics=strong,
            )

        return {
            "progress": progress,
            "study_plan": plan,
        }

    def suggest_next_step(self, recent_activity: list[dict], weak_topics: list[str]) -> dict:
        """Study Planner suggests what to do next."""
        return self.study_planner.suggest_next_activity(recent_activity, weak_topics)
