-- StudyRoom AI Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Documents table
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  filename text not null,
  subject text not null,
  file_type text not null,
  page_count integer,
  file_size bigint not null,
  status text not null default 'uploading' check (status in ('uploading', 'processing', 'ready', 'error')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Document chunks with vector embeddings
create table if not exists document_chunks (
  id uuid default gen_random_uuid() primary key,
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  chunk_index integer not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Exams table
create table if not exists exams (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subject text not null,
  document_id uuid references documents(id) on delete set null,
  difficulty text not null,
  question_count integer not null,
  status text not null default 'generated' check (status in ('generated', 'in_progress', 'completed')),
  score integer,
  total_time_seconds integer,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Exam questions
create table if not exists exam_questions (
  id uuid default gen_random_uuid() primary key,
  exam_id uuid references exams(id) on delete cascade,
  question_text text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text not null,
  difficulty text not null,
  topic text not null,
  user_answer text,
  is_correct boolean,
  created_at timestamptz default now()
);

-- Oral simulation sessions
create table if not exists oral_sessions (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  document_id uuid references documents(id) on delete set null,
  difficulty text not null default 'normal',
  messages jsonb not null default '[]'::jsonb,
  questions_asked integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_document_chunks_document_id on document_chunks(document_id);
create index if not exists idx_exam_questions_exam_id on exam_questions(exam_id);
create index if not exists idx_exams_document_id on exams(document_id);
create index if not exists idx_exams_status on exams(status);
create index if not exists idx_documents_status on documents(status);

-- Vector similarity search function
create or replace function match_document_chunks(
  query_embedding vector(1536),
  match_document_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  chunk_index integer,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where dc.document_id = match_document_id
    and dc.embedding is not null
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Storage bucket for documents (run in Supabase dashboard > Storage)
-- insert into storage.buckets (id, name, public) values ('documents', 'documents', false);
