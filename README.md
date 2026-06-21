# StudyRoom AI

Personal AI-powered study dashboard for exam preparation. Upload documents, generate practice exams, simulate oral exams, and track your progress.

## Features

- **Document Upload** — Upload PDF, PPTX, DOCX files. Text is extracted, chunked, and embedded for AI retrieval.
- **Practice Exam Generation** — Generate multiple-choice exams from your uploaded documents using OpenAI.
- **Exam Mode** — Take timed exams, get scored, and review answers with explanations.
- **Results & Weak Topics** — See your score breakdown and identify areas that need more study.
- **Oral Simulation** — Chat with an AI professor who asks questions and gives structured feedback.
- **Settings** — Configure language, subjects, AI strictness, and dark mode.

## Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌────────────┐
│  Next.js (UI)   │ ───── │  FastAPI Backend  │ ───── │ PostgreSQL │
│  localhost:3000  │       │  localhost:8000   │       │   (local)  │
└─────────────────┘       └──────────────────┘       └────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │  OpenAI API  │
                          └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| Backend | FastAPI (Python 3.13) |
| Database | PostgreSQL 16 (local) |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| File Processing | PyPDF2, python-docx, python-pptx |

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 16 (via Homebrew: `brew install postgresql@16`)
- An [OpenAI](https://platform.openai.com) API key

### 1. Start PostgreSQL

```bash
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createdb studyroom_ai
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Edit `backend/.env` with your OpenAI key:
```env
DATABASE_URL=postgresql://your_user@localhost:5432/studyroom_ai
OPENAI_API_KEY=sk-your-key
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

```bash
# From project root
npm install
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the app

- Frontend: [http://localhost:3000](http://localhost:3000)
- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
├── app/                    # Next.js frontend pages
│   ├── documents/          # Document upload & management
│   ├── oral/               # Oral simulation
│   ├── practice/           # Exam config, taking, results
│   └── settings/           # User settings
├── components/             # Shared UI components
├── lib/
│   ├── api.ts              # API client (points to FastAPI)
│   └── utils.ts            # Utility functions
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── config.py       # Environment config
│   │   ├── database.py     # SQLAlchemy setup
│   │   ├── models.py       # Database models
│   │   ├── routers/        # API route handlers
│   │   │   ├── documents.py
│   │   │   ├── exams.py
│   │   │   └── oral.py
│   │   └── services/       # Business logic
│   │       ├── ai_service.py
│   │       └── document_processor.py
│   ├── requirements.txt
│   └── .env
└── .env.local              # Frontend env vars
```

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/documents` | GET | List all documents |
| `/api/documents/upload` | POST | Upload & process a document |
| `/api/exams` | GET | List all exams |
| `/api/exams/generate` | POST | Generate exam from document |
| `/api/exams/{id}` | GET | Get exam with questions |
| `/api/exams/{id}/submit` | POST | Submit answers & get score |
| `/api/oral/start` | POST | Start oral session |
| `/api/oral/respond` | POST | Send student response |

## Development

```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
npm run dev
```
