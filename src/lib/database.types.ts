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
          steply_score: number
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          steply_score?: number
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'student' | 'teacher' | null
          steply_score?: number
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          progress_percentage: number
          user_id: string
          files: Json
          team_members: Json
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          progress_percentage?: number
          user_id: string
          files?: Json
          team_members?: Json
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          progress_percentage?: number
          user_id?: string
          files?: Json
          team_members?: Json
          created_at?: string
        }
      }
      followers: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          project_id: string
          user_id: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          score: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          score?: number
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
      calculate_steply_score: {
        Args: {
          user_uuid: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
