export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      producers: {
        Row: {
          id: string
          name: string
          document_number: string | null
          phone: string | null
          email: string | null
          property_name: string
          property_description: string | null
          address: string | null
          city: string
          state: string
          altitude: number | null
          average_temperature: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          document_number?: string | null
          phone?: string | null
          email?: string | null
          property_name: string
          property_description?: string | null
          address?: string | null
          city: string
          state: string
          altitude?: number | null
          average_temperature?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          document_number?: string | null
          phone?: string | null
          email?: string | null
          property_name?: string
          property_description?: string | null
          address?: string | null
          city?: string
          state?: string
          altitude?: number | null
          average_temperature?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_lots_producer_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["producer_id"]
          }
        ]
      }
      product_lots: {
        Row: {
          id: string
          code: string
          name: string
          category: string | null
          variety: string | null
          harvest_year: string | null
          quantity: number | null
          unit: string | null
          image_url: string | null
          producer_id: string
          fragrance_score: number | null
          flavor_score: number | null
          finish_score: number | null
          acidity_score: number | null
          body_score: number | null
          sensory_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          category?: string | null
          variety?: string | null
          harvest_year?: string | null
          quantity?: number | null
          unit?: string | null
          image_url?: string | null
          producer_id: string
          fragrance_score?: number | null
          flavor_score?: number | null
          finish_score?: number | null
          acidity_score?: number | null
          body_score?: number | null
          sensory_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          category?: string | null
          variety?: string | null
          harvest_year?: string | null
          quantity?: number | null
          unit?: string | null
          image_url?: string | null
          producer_id?: string
          fragrance_score?: number | null
          flavor_score?: number | null
          finish_score?: number | null
          acidity_score?: number | null
          body_score?: number | null
          sensory_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_lots_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
