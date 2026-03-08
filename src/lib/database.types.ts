export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'student' | 'teacher' | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          progress_percentage: number
          student_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          progress_percentage?: number
          student_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          progress_percentage?: number
          student_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
