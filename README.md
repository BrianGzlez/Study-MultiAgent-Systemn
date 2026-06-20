# StudyRoom AI

Personal AI-powered study dashboard for exam preparation. Upload documents, generate practice exams, simulate oral exams, and track your progress.

## Features

- **Document Upload** — Upload PDF, PPTX, DOCX files. Text is extracted, chunked, and embedded for AI retrieval.
- **Practice Exam Generation** — Generate multiple-choice exams from your uploaded documents using OpenAI.
- **Exam Mode** — Take timed exams, get scored, and review answers with explanations.
- **Results & Weak Topics** — See your score breakdown and identify areas that need more study.
- **Oral Simulation** — Chat with an AI professor who asks questions and gives structured feedback on your answers.
- **Settings** — Configure language, subjects, AI strictness, and dark mode.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: OpenAI (GPT-4o-mini for generation, text-embedding-3-small for embeddings)
- **File Processing**: pdf-parse, mammoth (DOCX), jszip (PPTX)

## Setup

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)
- An [OpenAI](https://platform.openai.com) API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Setup the database

1. Go to your Supabase project → SQL Editor
2. Run the contents of `supabase/schema.sql`
3. Go to Storage → Create a new bucket called `documents` (private)

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/                  # API routes (backend)
│   │   ├── documents/        # Upload & list documents
│   │   ├── exams/            # Generate, fetch, submit exams
│   │   └── oral/             # Oral simulation sessions
│   ├── documents/            # Documents page
│   ├── oral/                 # Oral simulation page
│   ├── practice/             # Practice exam config + taking + results
│   └── settings/             # User settings
├── components/               # Shared UI components
├── lib/
│   ├── openai.ts             # OpenAI client + embedding generation
│   ├── document-processor.ts # PDF/DOCX/PPTX text extraction + chunking
│   └── supabase/             # Supabase clients + types
├── supabase/
│   └── schema.sql            # Database schema (run in Supabase SQL Editor)
└── .env.example              # Environment variables template
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/documents` | GET | List all documents |
| `/api/documents/upload` | POST | Upload & process a document |
| `/api/exams` | GET | List all exams |
| `/api/exams/generate` | POST | Generate exam from document |
| `/api/exams/[id]` | GET | Get exam with questions |
| `/api/exams/[id]/submit` | POST | Submit answers & get score |
| `/api/oral` | POST | Start/continue oral session |

## Development

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run lint    # Run linter
```
