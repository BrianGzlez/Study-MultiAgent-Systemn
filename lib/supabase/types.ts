export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          filename: string
          subject: string
          file_type: string
          page_count: number | null
          file_size: number
          status: 'uploading' | 'processing' | 'ready' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          filename: string
          subject: string
          file_type: string
          page_count?: number | null
          file_size: number
          status?: 'uploading' | 'processing' | 'ready' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          filename?: string
          subject?: string
          file_type?: string
          page_count?: number | null
          file_size?: number
          status?: 'uploading' | 'processing' | 'ready' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          content: string
          chunk_index: number
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          chunk_index: number
          embedding?: number[] | null
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          chunk_index?: number
          embedding?: number[] | null
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          subject: string
          document_id: string | null
          difficulty: string
          question_count: number
          status: 'generated' | 'in_progress' | 'completed'
          score: number | null
          total_time_seconds: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          subject: string
          document_id?: string | null
          difficulty: string
          question_count: number
          status?: 'generated' | 'in_progress' | 'completed'
          score?: number | null
          total_time_seconds?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          subject?: string
          document_id?: string | null
          difficulty?: string
          question_count?: number
          status?: 'generated' | 'in_progress' | 'completed'
          score?: number | null
          total_time_seconds?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      exam_questions: {
        Row: {
          id: string
          exam_id: string
          question_text: string
          options: Json
          correct_answer: string
          explanation: string
          difficulty: string
          topic: string
          user_answer: string | null
          is_correct: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          question_text: string
          options: Json
          correct_answer: string
          explanation: string
          difficulty: string
          topic: string
          user_answer?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          question_text?: string
          options?: Json
          correct_answer?: string
          explanation?: string
          difficulty?: string
          topic?: string
          user_answer?: string | null
          is_correct?: boolean | null
          created_at?: string
        }
      }
      oral_sessions: {
        Row: {
          id: string
          subject: string
          document_id: string | null
          difficulty: string
          messages: Json
          questions_asked: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject: string
          document_id?: string | null
          difficulty: string
          messages?: Json
          questions_asked?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          subject?: string
          document_id?: string | null
          difficulty?: string
          messages?: Json
          questions_asked?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
