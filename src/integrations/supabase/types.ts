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
      lot_components: {
        Row: {
          component_name: string
          component_origin: string | null
          component_percentage: number | null
          component_quantity: number | null
          component_unit: string | null
          component_variety: string | null
          created_at: string | null
          id: string
          lot_id: string | null
          updated_at: string | null
        }
        Insert: {
          component_name: string
          component_origin?: string | null
          component_percentage?: number | null
          component_quantity?: number | null
          component_unit?: string | null
          component_variety?: string | null
          created_at?: string | null
          id?: string
          lot_id?: string | null
          updated_at?: string | null
        }
        Update: {
          component_name?: string
          component_origin?: string | null
          component_percentage?: number | null
          component_quantity?: number | null
          component_unit?: string | null
          component_variety?: string | null
          created_at?: string | null
          id?: string
          lot_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lot_components_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          address: string | null
          altitude: number | null
          average_temperature: number | null
          cep: string | null
          city: string
          created_at: string | null
          document_number: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          photos: string[] | null
          property_description: string | null
          property_name: string
          state: string
          updated_at: string | null
          use_coordinates: boolean | null
        }
        Insert: {
          address?: string | null
          altitude?: number | null
          average_temperature?: number | null
          cep?: string | null
          city: string
          created_at?: string | null
          document_number?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          photos?: string[] | null
          property_description?: string | null
          property_name: string
          state: string
          updated_at?: string | null
          use_coordinates?: boolean | null
        }
        Update: {
          address?: string | null
          altitude?: number | null
          average_temperature?: number | null
          cep?: string | null
          city?: string
          created_at?: string | null
          document_number?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          photos?: string[] | null
          property_description?: string | null
          property_name?: string
          state?: string
          updated_at?: string | null
          use_coordinates?: boolean | null
        }
        Relationships: []
      }
      product_lots: {
        Row: {
          acidity_score: number | null
          body_score: number | null
          category: string | null
          code: string
          created_at: string | null
          finish_score: number | null
          flavor_score: number | null
          fragrance_score: number | null
          harvest_year: string | null
          id: string
          image_url: string | null
          lot_observations: string | null
          name: string
          producer_id: string | null
          quantity: number | null
          sensory_notes: string | null
          unit: string | null
          updated_at: string | null
          variety: string | null
          views: number
        }
        Insert: {
          acidity_score?: number | null
          body_score?: number | null
          category?: string | null
          code: string
          created_at?: string | null
          finish_score?: number | null
          flavor_score?: number | null
          fragrance_score?: number | null
          harvest_year?: string | null
          id?: string
          image_url?: string | null
          lot_observations?: string | null
          name: string
          producer_id?: string | null
          quantity?: number | null
          sensory_notes?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
          views?: number
        }
        Update: {
          acidity_score?: number | null
          body_score?: number | null
          category?: string | null
          code?: string
          created_at?: string | null
          finish_score?: number | null
          flavor_score?: number | null
          fragrance_score?: number | null
          harvest_year?: string | null
          id?: string
          image_url?: string | null
          lot_observations?: string | null
          name?: string
          producer_id?: string | null
          quantity?: number | null
          sensory_notes?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
          views?: number
        }
        Relationships: [
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_lot_views: {
        Args: { lot_code: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  TableName extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName] extends {
  Insert: infer I
}
  ? I
  : never

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"] = keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName] extends {
  Update: infer U
}
  ? U
  : never
