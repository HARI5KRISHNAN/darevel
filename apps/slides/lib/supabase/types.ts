import type { Slide, Presentation } from '@/lib/types'

export interface Database {
  public: {
    Tables: {
      presentations: {
        Row: {
          id: string
          user_id: string
          title: string
          slides: Slide[]
          thumbnail: string | null
          created_at: string
          updated_at: string
          is_public: boolean
          shared_with: string[]
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          slides?: Slide[]
          thumbnail?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
          shared_with?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slides?: Slide[]
          thumbnail?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
          shared_with?: string[]
        }
      }
      collaboration_sessions: {
        Row: {
          id: string
          presentation_id: string
          user_id: string
          user_email: string | null
          user_name: string | null
          cursor_position: {
            x: number
            y: number
            slideIndex?: number
          }
          current_slide_index: number
          color: string
          last_active: string
        }
        Insert: {
          id?: string
          presentation_id: string
          user_id: string
          user_email?: string | null
          user_name?: string | null
          cursor_position?: {
            x: number
            y: number
            slideIndex?: number
          }
          current_slide_index?: number
          color: string
          last_active?: string
        }
        Update: {
          id?: string
          presentation_id?: string
          user_id?: string
          user_email?: string | null
          user_name?: string | null
          cursor_position?: {
            x: number
            y: number
            slideIndex?: number
          }
          current_slide_index?: number
          color?: string
          last_active?: string
        }
      }
    }
  }
}

export type PresentationRow = Database['public']['Tables']['presentations']['Row']
export type CollaborationSessionRow = Database['public']['Tables']['collaboration_sessions']['Row']
