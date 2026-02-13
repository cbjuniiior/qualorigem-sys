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
      tenants: {
        Row: {
          id: string
          slug: string
          name: string
          status: string
          type: string
          branding: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          name: string
          status?: string
          type?: string
          branding?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          status?: string
          type?: string
          branding?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_modules: {
        Row: {
          tenant_id: string
          module_key: string
          enabled: boolean | null
          config: Json | null
        }
        Insert: {
          tenant_id: string
          module_key: string
          enabled?: boolean | null
          config?: Json | null
        }
        Update: {
          tenant_id?: string
          module_key?: string
          enabled?: boolean | null
          config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      tenant_memberships: {
        Row: {
          tenant_id: string
          user_id: string
          role: string
          created_at: string | null
        }
        Insert: {
          tenant_id: string
          user_id: string
          role?: string
          created_at?: string | null
        }
        Update: {
          tenant_id?: string
          user_id?: string
          role?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_admins: {
        Row: {
          user_id: string
          role: string | null
          created_at: string | null
        }
        Insert: {
          user_id: string
          role?: string | null
          created_at?: string | null
        }
        Update: {
          user_id?: string
          role?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "associations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
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
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          producer_id: string
          slug: string
          updated_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          producer_id?: string
          slug?: string
          updated_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      characteristics: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "characteristics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "industries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "lot_components_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      producers_associations: {
        Row: {
          association_id: string
          producer_id: string
          role: string | null
          since: string | null
          tenant_id: string
        }
        Insert: {
          association_id: string
          producer_id: string
          role?: string | null
          since?: string | null
          tenant_id: string
        }
        Update: {
          association_id?: string
          producer_id?: string
          role?: string | null
          since?: string | null
          tenant_id?: string
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
          {
            foreignKeyName: "producers_associations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      product_lot_characteristics: {
        Row: {
          characteristic_id: string | null
          created_at: string | null
          id: string
          lot_id: string | null
          value: string | null
          tenant_id: string
        }
        Insert: {
          characteristic_id?: string | null
          created_at?: string | null
          id?: string
          lot_id?: string | null
          value?: string | null
          tenant_id: string
        }
        Update: {
          characteristic_id?: string | null
          created_at?: string | null
          id?: string
          lot_id?: string | null
          value?: string | null
          tenant_id?: string
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
          {
            foreignKeyName: "product_lot_characteristics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "product_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "seal_controls_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
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
          tenant_id: string
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          tenant_id: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_configurations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      platform_settings: {
        Row: {
          id: string
          favicon_url: string | null
          site_title: string
          site_description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          favicon_url?: string | null
          site_title?: string
          site_description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          favicon_url?: string | null
          site_title?: string
          site_description?: string | null
          updated_at?: string
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
          tenant_id: string
        }
        Insert: {
          id?: string
          lot_id?: string | null
          sensory_attribute_id?: string | null
          value: number
          created_at?: string | null
          tenant_id: string
        }
        Update: {
          id?: string
          lot_id?: string | null
          sensory_attribute_id?: string | null
          value?: number
          created_at?: string | null
          tenant_id?: string
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
          },
          {
            foreignKeyName: "product_lot_sensory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensory_attributes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
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
          tenant_id: string
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
          tenant_id: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          tenant_id: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          tenant_id: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    // === NOVAS TABELAS V3 - MARCA COLETIVA ===
    certifications: {
      Row: {
        id: string
        tenant_id: string
        name: string
        issuing_body: string | null
        valid_until: string | null
        document_url: string | null
        is_public: boolean
        created_at: string | null
        updated_at: string | null
      }
      Insert: {
        id?: string
        tenant_id: string
        name: string
        issuing_body?: string | null
        valid_until?: string | null
        document_url?: string | null
        is_public?: boolean
        created_at?: string | null
        updated_at?: string | null
      }
      Update: {
        id?: string
        tenant_id?: string
        name?: string
        issuing_body?: string | null
        valid_until?: string | null
        document_url?: string | null
        is_public?: boolean
        created_at?: string | null
        updated_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "certifications_tenant_id_fkey"
          columns: ["tenant_id"]
          isOneToOne: false
          referencedRelation: "tenants"
          referencedColumns: ["id"]
        }
      ]
    }
    certification_entities: {
      Row: {
        id: string
        certification_id: string
        entity_type: string
        entity_id: string
        tenant_id: string
        created_at: string | null
      }
      Insert: {
        id?: string
        certification_id: string
        entity_type: string
        entity_id: string
        tenant_id: string
        created_at?: string | null
      }
      Update: {
        id?: string
        certification_id?: string
        entity_type?: string
        entity_id?: string
        tenant_id?: string
        created_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "certification_entities_certification_id_fkey"
          columns: ["certification_id"]
          isOneToOne: false
          referencedRelation: "certifications"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "certification_entities_tenant_id_fkey"
          columns: ["tenant_id"]
          isOneToOne: false
          referencedRelation: "tenants"
          referencedColumns: ["id"]
        }
      ]
    }
    internal_producers: {
      Row: {
        id: string
        tenant_id: string
        cooperativa_id: string | null
        name: string
        document: string | null
        city: string | null
        state: string | null
        created_at: string | null
        updated_at: string | null
      }
      Insert: {
        id?: string
        tenant_id: string
        cooperativa_id?: string | null
        name: string
        document?: string | null
        city?: string | null
        state?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
      Update: {
        id?: string
        tenant_id?: string
        cooperativa_id?: string | null
        name?: string
        document?: string | null
        city?: string | null
        state?: string | null
        created_at?: string | null
        updated_at?: string | null
      }
      Relationships: [
        {
          foreignKeyName: "internal_producers_tenant_id_fkey"
          columns: ["tenant_id"]
          isOneToOne: false
          referencedRelation: "tenants"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "internal_producers_cooperativa_id_fkey"
          columns: ["cooperativa_id"]
          isOneToOne: false
          referencedRelation: "producers"
          referencedColumns: ["id"]
        }
      ]
    }
    product_lot_internal_producers: {
      Row: {
        lot_id: string
        internal_producer_id: string
        tenant_id: string
      }
      Insert: {
        lot_id: string
        internal_producer_id: string
        tenant_id: string
      }
      Update: {
        lot_id?: string
        internal_producer_id?: string
        tenant_id?: string
      }
      Relationships: [
        {
          foreignKeyName: "plip_lot_id_fkey"
          columns: ["lot_id"]
          isOneToOne: false
          referencedRelation: "product_lots"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "plip_internal_producer_id_fkey"
          columns: ["internal_producer_id"]
          isOneToOne: false
          referencedRelation: "internal_producers"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "plip_tenant_id_fkey"
          columns: ["tenant_id"]
          isOneToOne: false
          referencedRelation: "tenants"
          referencedColumns: ["id"]
        }
      ]
    }
    product_lot_industries: {
      Row: {
        lot_id: string
        industry_id: string
        tenant_id: string
      }
      Insert: {
        lot_id: string
        industry_id: string
        tenant_id: string
      }
      Update: {
        lot_id?: string
        industry_id?: string
        tenant_id?: string
      }
      Relationships: [
        {
          foreignKeyName: "pli_lot_id_fkey"
          columns: ["lot_id"]
          isOneToOne: false
          referencedRelation: "product_lots"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "pli_industry_id_fkey"
          columns: ["industry_id"]
          isOneToOne: false
          referencedRelation: "industries"
          referencedColumns: ["id"]
        },
        {
          foreignKeyName: "pli_tenant_id_fkey"
          columns: ["tenant_id"]
          isOneToOne: false
          referencedRelation: "tenants"
          referencedColumns: ["id"]
        }
      ]
    }
    tenant_field_settings: {
      Row: {
        tenant_id: string
        field_key: string
        enabled: boolean
        required: boolean
      }
      Insert: {
        tenant_id: string
        field_key: string
        enabled?: boolean
        required?: boolean
      }
      Update: {
        tenant_id?: string
        field_key?: string
        enabled?: boolean
        required?: boolean
      }
      Relationships: [
        {
          foreignKeyName: "tfs_tenant_id_fkey"
          columns: ["tenant_id"]
          isOneToOne: false
          referencedRelation: "tenants"
          referencedColumns: ["id"]
        }
      ]
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_lot_code: { Args: never; Returns: string }
      increment_lot_views: { Args: { lot_code: string }; Returns: undefined }
      is_platform_admin: { Args: never; Returns: boolean }
      has_tenant_role: { Args: { p_tenant_id: string; p_roles: string[] }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
