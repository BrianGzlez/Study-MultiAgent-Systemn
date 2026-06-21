from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import documents, exams, oral, stats, settings

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyRoom AI API",
    description="Backend for the StudyRoom AI study platform",
    version="1.0.0",
)

# CORS - allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(documents.router)
app.include_router(exams.router)
app.include_router(oral.router)
app.include_router(stats.router)
app.include_router(settings.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "StudyRoom AI API"}
