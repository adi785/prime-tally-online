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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          financial_year_end: string | null
          financial_year_start: string | null
          gstin: string | null
          id: string
          name: string
          pan: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          financial_year_end?: string | null
          financial_year_start?: string | null
          gstin?: string | null
          id?: string
          name: string
          pan?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          financial_year_end?: string | null
          financial_year_start?: string | null
          gstin?: string | null
          id?: string
          name?: string
          pan?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ledgers: {
        Row: {
          address: string | null
          created_at: string
          current_balance: number
          email: string | null
          group_name: string
          gstin: string | null
          id: string
          is_billwise: boolean | null
          is_inventory: boolean | null
          name: string
          opening_balance: number
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          current_balance?: number
          email?: string | null
          group_name: string
          gstin?: string | null
          id?: string
          is_billwise?: boolean | null
          is_inventory?: boolean | null
          name: string
          opening_balance?: number
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          current_balance?: number
          email?: string | null
          group_name?: string
          gstin?: string | null
          id?: string
          is_billwise?: boolean | null
          is_inventory?: boolean | null
          name?: string
          opening_balance?: number
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stock_items: {
        Row: {
          created_at: string
          group_name: string
          id: string
          name: string
          quantity: number
          rate: number
          reorder_level: number | null
          unit: string
          updated_at: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          group_name?: string
          id?: string
          name: string
          quantity?: number
          rate?: number
          reorder_level?: number | null
          unit?: string
          updated_at?: string
          user_id?: string | null
          value?: number
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          name?: string
          quantity?: number
          rate?: number
          reorder_level?: number | null
          unit?: string
          updated_at?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      voucher_items: {
        Row: {
          amount: number
          created_at: string
          id: string
          ledger_id: string | null
          particulars: string | null
          type: string
          voucher_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          ledger_id?: string | null
          particulars?: string | null
          type: string
          voucher_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          ledger_id?: string | null
          particulars?: string | null
          type?: string
          voucher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voucher_items_ledger_id_fkey"
            columns: ["ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voucher_items_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      vouchers: {
        Row: {
          created_at: string
          date: string
          id: string
          narration: string | null
          party_ledger_id: string | null
          party_name: string
          total_amount: number
          type: string
          updated_at: string
          user_id: string | null
          voucher_number: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          narration?: string | null
          party_ledger_id?: string | null
          party_name: string
          total_amount?: number
          type: string
          updated_at?: string
          user_id?: string | null
          voucher_number: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          narration?: string | null
          party_ledger_id?: string | null
          party_name?: string
          total_amount?: number
          type?: string
          updated_at?: string
          user_id?: string | null
          voucher_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_party_ledger_id_fkey"
            columns: ["party_ledger_id"]
            isOneToOne: false
            referencedRelation: "ledgers"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
