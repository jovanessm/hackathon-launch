export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          signal_strength: number
          source_id: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind: string
          signal_strength?: number
          source_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          signal_strength?: number
          source_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      competencies: {
        Row: {
          description: string | null
          id: string
          key: string
          label: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          label: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          category: string
          enabled: boolean
          id: string
          key: string
          label: string
        }
        Insert: {
          category: string
          enabled?: boolean
          id?: string
          key: string
          label: string
        }
        Update: {
          category?: string
          enabled?: boolean
          id?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          filename: string
          id: string
          mime: string | null
          storage_path: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          filename: string
          id?: string
          mime?: string | null
          storage_path: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          filename?: string
          id?: string
          mime?: string | null
          storage_path?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evaluation_log: {
        Row: {
          created_at: string
          document_id: string
          id: string
          modifier_value: number
          opportunity_id: string
          snippet: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          modifier_value?: number
          opportunity_id: string
          snippet?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          modifier_value?: number
          opportunity_id?: string
          snippet?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_log_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          baseline_score: number
          competency_id: string | null
          created_at: string
          id: string
          phase: string | null
          rationale: string
          therapeutic_modality: string | null
          title: string
          why_now: string
        }
        Insert: {
          baseline_score?: number
          competency_id?: string | null
          created_at?: string
          id?: string
          phase?: string | null
          rationale: string
          therapeutic_modality?: string | null
          title: string
          why_now: string
        }
        Update: {
          baseline_score?: number
          competency_id?: string | null
          created_at?: string
          id?: string
          phase?: string | null
          rationale?: string
          therapeutic_modality?: string | null
          title?: string
          why_now?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_evidence: {
        Row: {
          id: string
          opportunity_id: string
          published_at: string | null
          source_id: string | null
          title: string
          url: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          published_at?: string | null
          source_id?: string | null
          title: string
          url: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          published_at?: string | null
          source_id?: string | null
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_evidence_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_evidence_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_events: {
        Row: {
          evidence_url: string | null
          from_phase: string | null
          id: string
          occurred_at: string
          to_phase: string
          watchlist_item_id: string
        }
        Insert: {
          evidence_url?: string | null
          from_phase?: string | null
          id?: string
          occurred_at?: string
          to_phase: string
          watchlist_item_id: string
        }
        Update: {
          evidence_url?: string | null
          from_phase?: string | null
          id?: string
          occurred_at?: string
          to_phase?: string
          watchlist_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_events_watchlist_item_id_fkey"
            columns: ["watchlist_item_id"]
            isOneToOne: false
            referencedRelation: "watchlist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          org: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          org?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          org?: string | null
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string
          id: string
          name: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          payload?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_alert_state: {
        Row: {
          alert_id: string
          dismissed_at: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          alert_id: string
          dismissed_at?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string
          dismissed_at?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_state_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          created_at: string
          current_phase: string | null
          id: string
          kind: string
          last_phase_change_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string
          current_phase?: string | null
          id?: string
          kind: string
          last_phase_change_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string
          current_phase?: string | null
          id?: string
          kind?: string
          last_phase_change_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "analyst" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["analyst", "admin"],
    },
  },
} as const
