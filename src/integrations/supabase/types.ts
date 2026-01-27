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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      associations: {
        Row: {
          city: string | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          state: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          state?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          state?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          producer_id: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          producer_id: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          producer_id?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      characteristics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      industries: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          document_number: string | null
          id: string
          logo_url: string | null
          name: string
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          document_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          document_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      lot_components: {
        Row: {
          address: string | null
          altitude: number | null
          association_id: string | null
          cep: string | null
          city: string | null
          component_harvest_year: string | null
          component_name: string
          component_origin: string | null
          component_percentage: number | null
          component_quantity: number | null
          component_unit: string | null
          component_variety: string | null
          created_at: string | null
          id: string
          latitude: number | null
          longitude: number | null
          lot_id: string | null
          photos: string[] | null
          producer_id: string | null
          property_description: string | null
          property_name: string | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          altitude?: number | null
          association_id?: string | null
          cep?: string | null
          city?: string | null
          component_harvest_year?: string | null
          component_name: string
          component_origin?: string | null
          component_percentage?: number | null
          component_quantity?: number | null
          component_unit?: string | null
          component_variety?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lot_id?: string | null
          photos?: string[] | null
          producer_id?: string | null
          property_description?: string | null
          property_name?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          altitude?: number | null
          association_id?: string | null
          cep?: string | null
          city?: string | null
          component_harvest_year?: string | null
          component_name?: string
          component_origin?: string | null
          component_percentage?: number | null
          component_quantity?: number | null
          component_unit?: string | null
          component_variety?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lot_id?: string | null
          photos?: string[] | null
          producer_id?: string | null
          property_description?: string | null
          property_name?: string | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_components_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_components_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_components_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          address: string | null
          address_internal_only: boolean | null
          altitude: number | null
          average_temperature: number | null
          cep: string | null
          city: string
          created_at: string | null
          custom_prefix: string | null
          document_number: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          lot_prefix_mode: string | null
          name: string
          phone: string | null
          photos: string[] | null
          profile_picture_url: string | null
          property_description: string | null
          property_name: string
          state: string
          updated_at: string | null
          use_coordinates: boolean | null
        }
        Insert: {
          address?: string | null
          address_internal_only?: boolean | null
          altitude?: number | null
          average_temperature?: number | null
          cep?: string | null
          city: string
          created_at?: string | null
          custom_prefix?: string | null
          document_number?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lot_prefix_mode?: string | null
          name: string
          phone?: string | null
          photos?: string[] | null
          profile_picture_url?: string | null
          property_description?: string | null
          property_name: string
          state: string
          updated_at?: string | null
          use_coordinates?: boolean | null
        }
        Update: {
          address?: string | null
          address_internal_only?: boolean | null
          altitude?: number | null
          average_temperature?: number | null
          cep?: string | null
          city?: string
          created_at?: string | null
          custom_prefix?: string | null
          document_number?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          lot_prefix_mode?: string | null
          name?: string
          phone?: string | null
          photos?: string[] | null
          profile_picture_url?: string | null
          property_description?: string | null
          property_name?: string
          state?: string
          updated_at?: string | null
          use_coordinates?: boolean | null
        }
        Relationships: []
      }
      producers_associations: {
        Row: {
          association_id: string
          producer_id: string
          role: string | null
          since: string | null
        }
        Insert: {
          association_id: string
          producer_id: string
          role?: string | null
          since?: string | null
        }
        Update: {
          association_id?: string
          producer_id?: string
          role?: string | null
          since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producers_associations_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producers_associations_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lot_characteristics: {
        Row: {
          characteristic_id: string | null
          created_at: string | null
          id: string
          lot_id: string | null
          value: string | null
        }
        Insert: {
          characteristic_id?: string | null
          created_at?: string | null
          id?: string
          lot_id?: string | null
          value?: string | null
        }
        Update: {
          characteristic_id?: string | null
          created_at?: string | null
          id?: string
          lot_id?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lot_characteristics_characteristic_id_fkey"
            columns: ["characteristic_id"]
            isOneToOne: false
            referencedRelation: "characteristics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_lot_characteristics_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      product_lots: {
        Row: {
          acidity_score: number | null
          address: string | null
          address_internal_only: boolean | null
          altitude: number | null
          association_id: string | null
          average_temperature: number | null
          body_score: number | null
          brand_id: string | null
          category: string | null
          cep: string | null
          city: string | null
          code: string
          created_at: string | null
          finish_score: number | null
          flavor_score: number | null
          fragrance_score: number | null
          harvest_year: string | null
          id: string
          image_url: string | null
          industry_id: string | null
          latitude: number | null
          longitude: number | null
          lot_observations: string | null
          name: string
          photos: string[] | null
          producer_id: string | null
          property_description: string | null
          property_name: string | null
          quantity: number | null
          seals_quantity: number | null
          sensory_notes: string | null
          sensory_type: string | null
          state: string | null
          unit: string | null
          updated_at: string | null
          variety: string | null
          video_delay_seconds: number | null
          video_description: string | null
          views: number
          youtube_video_url: string | null
        }
        Insert: {
          acidity_score?: number | null
          address?: string | null
          address_internal_only?: boolean | null
          altitude?: number | null
          association_id?: string | null
          average_temperature?: number | null
          body_score?: number | null
          brand_id?: string | null
          category?: string | null
          cep?: string | null
          city?: string | null
          code: string
          created_at?: string | null
          finish_score?: number | null
          flavor_score?: number | null
          fragrance_score?: number | null
          harvest_year?: string | null
          id?: string
          image_url?: string | null
          industry_id?: string | null
          latitude?: number | null
          longitude?: number | null
          lot_observations?: string | null
          name: string
          photos?: string[] | null
          producer_id?: string | null
          property_description?: string | null
          property_name?: string | null
          quantity?: number | null
          seals_quantity?: number | null
          sensory_notes?: string | null
          sensory_type?: string | null
          state?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
          video_delay_seconds?: number | null
          video_description?: string | null
          views?: number
          youtube_video_url?: string | null
        }
        Update: {
          acidity_score?: number | null
          address?: string | null
          address_internal_only?: boolean | null
          altitude?: number | null
          association_id?: string | null
          average_temperature?: number | null
          body_score?: number | null
          brand_id?: string | null
          category?: string | null
          cep?: string | null
          city?: string | null
          code?: string
          created_at?: string | null
          finish_score?: number | null
          flavor_score?: number | null
          fragrance_score?: number | null
          harvest_year?: string | null
          id?: string
          image_url?: string | null
          industry_id?: string | null
          latitude?: number | null
          longitude?: number | null
          lot_observations?: string | null
          name?: string
          photos?: string[] | null
          producer_id?: string | null
          property_description?: string | null
          property_name?: string | null
          quantity?: number | null
          seals_quantity?: number | null
          sensory_notes?: string | null
          sensory_type?: string | null
          state?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
          video_delay_seconds?: number | null
          video_description?: string | null
          views?: number
          youtube_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lots_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_lots_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_lots_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_lots_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      seal_controls: {
        Row: {
          created_at: string | null
          generation_date: string | null
          id: string
          lot_id: string | null
          notes: string | null
          package_size: number
          package_unit: string
          producer_id: string | null
          seal_type: string
          total_packages: number
          total_seals_generated: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          generation_date?: string | null
          id?: string
          lot_id?: string | null
          notes?: string | null
          package_size: number
          package_unit: string
          producer_id?: string | null
          seal_type: string
          total_packages: number
          total_seals_generated: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          generation_date?: string | null
          id?: string
          lot_id?: string | null
          notes?: string | null
          package_size?: number
          package_unit?: string
          producer_id?: string | null
          seal_type?: string
          total_packages?: number
          total_seals_generated?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seal_controls_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seal_controls_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      system_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_lot_sensory: {
        Row: {
          id: string
          lot_id: string | null
          sensory_attribute_id: string | null
          value: number
          created_at: string | null
        }
        Insert: {
          id?: string
          lot_id?: string | null
          sensory_attribute_id?: string | null
          value: number
          created_at?: string | null
        }
        Update: {
          id?: string
          lot_id?: string | null
          sensory_attribute_id?: string | null
          value?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lot_sensory_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_lot_sensory_sensory_attribute_id_fkey"
            columns: ["sensory_attribute_id"]
            isOneToOne: false
            referencedRelation: "sensory_attributes"
            referencedColumns: ["id"]
          }
        ]
      }
      sensory_attributes: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          show_radar: boolean | null
          show_average: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type: string
          show_radar?: boolean | null
          show_average?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          show_radar?: boolean | null
          show_average?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          assigned_to: string | null
          due_date: string | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_lot_code: { Args: never; Returns: string }
      increment_lot_views: { Args: { lot_code: string }; Returns: undefined }
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
