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
      businesses: {
        Row: {
          id: string
          owner_id: string
          name: string
          category: string
          location: string | null
          timezone: string
          logo_url: string | null
          primary_color: string | null
          welcome_message: Json | null
          google_review_url: string | null
          default_language: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          category?: string
          location?: string | null
          timezone?: string
          logo_url?: string | null
          primary_color?: string | null
          welcome_message?: Json | null
          google_review_url?: string | null
          default_language?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          category?: string
          location?: string | null
          timezone?: string
          logo_url?: string | null
          primary_color?: string | null
          welcome_message?: Json | null
          google_review_url?: string | null
          default_language?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      campaigns: {
        Row: {
          id: string
          business_id: string
          name: string
          slug: string
          active: boolean
          google_review_url_override: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          slug: string
          active?: boolean
          google_review_url_override?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          slug?: string
          active?: boolean
          google_review_url_override?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      menu_items: {
        Row: {
          id: string
          business_id: string
          name: Json
          active: boolean | null
          position: number | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: Json
          active?: boolean | null
          position?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: Json
          active?: boolean | null
          position?: number | null
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          business_id: string
          key: string
          type: 'rating' | 'single_choice' | 'multi_choice' | 'text'
          text: Json
          config: Json | null
          required: boolean
          position: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          key: string
          type: 'rating' | 'single_choice' | 'multi_choice' | 'text'
          text: Json
          config?: Json | null
          required?: boolean
          position: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          key?: string
          type?: 'rating' | 'single_choice' | 'multi_choice' | 'text'
          text?: Json
          config?: Json | null
          required?: boolean
          position?: number
          active?: boolean
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          campaign_id: string
          business_id: string
          status: 'landed' | 'in_progress' | 'completed'
          language: string | null
          device_type: string | null
          started_at: string | null
          last_activity_at: string | null
          completed_at: string | null
          ip_hash: string | null
          ua_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          business_id: string
          status?: 'landed' | 'in_progress' | 'completed'
          language?: string | null
          device_type?: string | null
          started_at?: string | null
          last_activity_at?: string | null
          completed_at?: string | null
          ip_hash?: string | null
          ua_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          business_id?: string
          status?: 'landed' | 'in_progress' | 'completed'
          language?: string | null
          device_type?: string | null
          started_at?: string | null
          last_activity_at?: string | null
          completed_at?: string | null
          ip_hash?: string | null
          ua_hash?: string | null
          created_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          session_id: string
          question_id: string
          question_key: string
          value: Json
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          question_id: string
          question_key: string
          value: Json
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          question_id?: string
          question_key?: string
          value?: Json
          created_at?: string
        }
      }
      review_drafts: {
        Row: {
          id: string
          session_id: string
          original_text: string | null
          final_text: string | null
          method: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          original_text?: string | null
          final_text?: string | null
          method?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          original_text?: string | null
          final_text?: string | null
          method?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      private_feedback: {
        Row: {
          id: string
          session_id: string
          business_id: string
          category: string
          message: string
          contact_name: string | null
          contact_value: string | null
          contact_consent: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          business_id: string
          category: string
          message: string
          contact_name?: string | null
          contact_value?: string | null
          contact_consent?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          business_id?: string
          category?: string
          message?: string
          contact_name?: string | null
          contact_value?: string | null
          contact_consent?: boolean | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          session_id: string
          campaign_id: string | null
          business_id: string | null
          event_type: string
          client_event_id: string | null
          metadata: Json | null
          timestamp: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          campaign_id?: string | null
          business_id?: string | null
          event_type: string
          client_event_id?: string | null
          metadata?: Json | null
          timestamp?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          campaign_id?: string | null
          business_id?: string | null
          event_type?: string
          client_event_id?: string | null
          metadata?: Json | null
          timestamp?: string | null
          created_at?: string
        }
      }
      session_flags: {
        Row: {
          id: string
          session_id: string
          business_id: string | null
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          business_id?: string | null
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          business_id?: string | null
          reason?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      seed_default_questions: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      generate_random_slug: {
        Args: { length?: number }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}

export type Business = Database['public']['Tables']['businesses']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type MenuItem = Database['public']['Tables']['menu_items']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type ReviewDraft = Database['public']['Tables']['review_drafts']['Row']
export type PrivateFeedback = Database['public']['Tables']['private_feedback']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type SessionFlag = Database['public']['Tables']['session_flags']['Row']
