"""Logging configuration for StudyRoom AI backend."""

import logging
import sys


def setup_logging():
    """Configure structured logging for the application."""
    # Root logger
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-7s | %(name)-25s | %(message)s",
        datefmt="%H:%M:%S",
        stream=sys.stdout,
    )

    # CrewAI logger — show agent activity
    logging.getLogger("crewai").setLevel(logging.INFO)

    # Our agents logger
    logging.getLogger("studyroom.agents").setLevel(logging.INFO)
    logging.getLogger("studyroom.crews").setLevel(logging.INFO)

    # Suppress noisy loggers
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("openai").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
