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
          // novos campos para suporte a multi-produtor no blend
          producer_id: string | null
          component_harvest_year: string | null
          association_id: string | null
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
          // novos campos
          producer_id?: string | null
          component_harvest_year?: string | null
          association_id?: string | null
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
          // novos campos
          producer_id?: string | null
          component_harvest_year?: string | null
          association_id?: string | null
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
          {
            foreignKeyName: "lot_components_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_components_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      associations: {
        Row: {
          id: string
          name: string
          type: string | null
          city: string | null
          state: string | null
          description: string | null
          contact_info: Json | null
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          city?: string | null
          state?: string | null
          description?: string | null
          contact_info?: Json | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          city?: string | null
          state?: string | null
          description?: string | null
          contact_info?: Json | null
          logo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      producers_associations: {
        Row: {
          producer_id: string
          association_id: string
          role: string | null
          since: string | null
        }
        Insert: {
          producer_id: string
          association_id: string
          role?: string | null
          since?: string | null
        }
        Update: {
          producer_id?: string
          association_id?: string
          role?: string | null
          since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producers_associations_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producers_associations_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          }
        ]
      }
      industries: {
        Row: {
          id: string
          name: string
          document_number: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          contact_phone: string | null
          contact_email: string | null
          logo_url: string | null
          description: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          document_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          logo_url?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          document_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          logo_url?: string | null
          description?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          profile_picture_url: string | null
          address_internal_only: boolean | null
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
          profile_picture_url?: string | null
          address_internal_only?: boolean | null
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
          profile_picture_url?: string | null
          address_internal_only?: boolean | null
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
          youtube_video_url: string | null
          video_delay_seconds: number | null
          brand_id: string | null
          industry_id: string | null
          association_id: string | null
          sensory_type: string | null
          latitude: number | null
          longitude: number | null
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
          youtube_video_url?: string | null
          video_delay_seconds?: number | null
          brand_id?: string | null
          industry_id?: string | null
          association_id?: string | null
          sensory_type?: string | null
          latitude?: number | null
          longitude?: number | null
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
          youtube_video_url?: string | null
          video_delay_seconds?: number | null
          brand_id?: string | null
          industry_id?: string | null
          association_id?: string | null
          sensory_type?: string | null
          latitude?: number | null
          longitude?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lots_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
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
            foreignKeyName: "product_lots_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          }
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
