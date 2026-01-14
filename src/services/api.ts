import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const SUPABASE_URL = "https://giomnnxpgjrpwyjrkkwr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpb21ubnhwZ2pycHd5anJra3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MTg1MzUsImV4cCI6MjA2Njk5NDUzNX0.L0WG0KW0keg2IwdraGVOmNxokIaZXNWrdCKty79bYv4";

// Tipos para facilitar o uso
export type Producer = Tables<"producers">;
export type ProductLot = Tables<"product_lots">;
export type LotComponent = Tables<"lot_components">;
export type SealControl = Tables<"seal_controls">;
export type SystemConfiguration = Tables<"system_configurations">;
export type Association = Tables<"associations">;
export type Brand = Tables<"brands">;
export type Industry = Tables<"industries">;
export type Category = Tables<"categories">;
export type Characteristic = Tables<"characteristics">;
export type ProductLotCharacteristic = Tables<"product_lot_characteristics">;
export type SensoryAttribute = Tables<"sensory_attributes">;
export type ProductLotSensory = Tables<"product_lot_sensory">;

export type ProducerInsert = TablesInsert<"producers">;
export type ProductLotInsert = TablesInsert<"product_lots">;
export type LotComponentInsert = TablesInsert<"lot_components">;
export type SealControlInsert = TablesInsert<"seal_controls">;
export type SystemConfigurationInsert = TablesInsert<"system_configurations">;
export type AssociationInsert = TablesInsert<"associations">;
export type BrandInsert = TablesInsert<"brands">;
export type IndustryInsert = TablesInsert<"industries">;
export type CategoryInsert = TablesInsert<"categories">;
export type CharacteristicInsert = TablesInsert<"characteristics">;
export type ProductLotCharacteristicInsert = TablesInsert<"product_lot_characteristics">;
export type SensoryAttributeInsert = TablesInsert<"sensory_attributes">;
export type ProductLotSensoryInsert = TablesInsert<"product_lot_sensory">;

export type ProducerUpdate = TablesUpdate<"producers">;
export type ProductLotUpdate = TablesUpdate<"product_lots">;
export type LotComponentUpdate = TablesUpdate<"lot_components">;
export type SealControlUpdate = TablesUpdate<"seal_controls">;
export type SystemConfigurationUpdate = TablesUpdate<"system_configurations">;
export type AssociationUpdate = TablesUpdate<"associations">;
export type BrandUpdate = TablesUpdate<"brands">;
export type IndustryUpdate = TablesUpdate<"industries">;
export type CategoryUpdate = TablesUpdate<"categories">;
export type CharacteristicUpdate = TablesUpdate<"characteristics">;
export type ProductLotCharacteristicUpdate = TablesUpdate<"product_lot_characteristics">;
export type SensoryAttributeUpdate = TablesUpdate<"sensory_attributes">;
export type ProductLotSensoryUpdate = TablesUpdate<"product_lot_sensory">;

// Serviços para Produtores
export const producersApi = {
  // Buscar todos os produtores
  async getAll() {
    const { data, error } = await supabase
      .from("producers")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data;
  },

  // Buscar produtor por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("producers")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Criar novo produtor
  async create(producer: ProducerInsert) {
    const { data, error } = await supabase
      .from("producers")
      .insert(producer)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar produtor
  async update(id: string, updates: ProducerUpdate) {
    const { data, error } = await supabase
      .from("producers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar produtor
  async delete(id: string) {
    const { error } = await supabase
      .from("producers")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};

// Serviços para Lotes de Produtos
export const productLotsApi = {
  // Buscar todos os lotes
  async getAll() {
    const { data, error } = await supabase
      .from("product_lots")
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        ),
        product_lot_characteristics (
          id,
          characteristic_id,
          value,
          characteristics (
            id,
            name
          )
        ),
        product_lot_sensory (
          id,
          sensory_attribute_id,
          value,
          sensory_attributes (*)
        )
      `)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    // Buscar componentes separadamente para cada lote
    const lotsWithComponents = await Promise.all(
      data.map(async (lot) => {
        const { data: components } = await supabase
          .from("lot_components")
          .select(`
            id,
            component_name,
            component_percentage,
            component_variety,
            component_quantity,
            component_unit,
            component_origin,
            producer_id,
            component_harvest_year,
            association_id,
            latitude,
            longitude,
            altitude,
            property_name,
            property_description,
            photos,
            address,
            city,
            state,
            cep,
            producers (
              id,
              name,
              property_name,
              city,
              state,
              latitude,
              longitude,
              photos,
              profile_picture_url
            ),
            associations (
              id,
              name,
              type
            )
          `)
          .eq("lot_id", lot.id);
        
        return {
          ...lot,
          lot_components: components || [],
          characteristics: lot.product_lot_characteristics || [],
          sensory_analysis: lot.product_lot_sensory || []
        };
      })
    );
    
    return lotsWithComponents;
  },

  // Buscar lote por código
  async getByCode(code: string) {
    const { data, error } = await supabase
      .from("product_lots")
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        ),
        product_lot_characteristics (
          id,
          characteristic_id,
          value,
          characteristics (
            id,
            name
          )
        ),
        product_lot_sensory (
          id,
          sensory_attribute_id,
          value,
          sensory_attributes (*)
        )
      `)
      .eq("code", code)
      .single();
    
    if (error) throw error;
    
    // Buscar componentes do blend incluindo produtor e associação, se existirem
    const { data: components } = await supabase
      .from("lot_components")
      .select(`
        *,
        producers:producers(*),
        associations:associations(*)
      `)
      .eq("lot_id", data.id)
      .order("created_at");
    
    return {
      ...data,
      components: components || [],
      characteristics: data.product_lot_characteristics || [],
      sensory_analysis: data.product_lot_sensory || []
    };
  },

  // Buscar lote por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("product_lots")
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        ),
        product_lot_characteristics (
          id,
          characteristic_id,
          value,
          characteristics (
            id,
            name
          )
        ),
        product_lot_sensory (
          id,
          sensory_attribute_id,
          value,
          sensory_attributes (*)
        )
      `)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    
    // Buscar componentes do blend incluindo produtor e associação, se existirem
    const { data: components } = await supabase
      .from("lot_components")
      .select(`
        *,
        producers:producers(*),
        associations:associations(*)
      `)
      .eq("lot_id", id);
    
    return {
      ...data,
      components: components || [],
      characteristics: data.product_lot_characteristics || [],
      sensory_analysis: data.product_lot_sensory || []
    };
  },

  // Buscar lotes por produtor
  async getByProducer(producerId: string) {
    const { data, error } = await supabase
      .from("product_lots")
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        ),
        lot_components (*)
      `)
      .eq("producer_id", producerId)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Criar novo lote
  async create(lot: ProductLotInsert) {
    const { data, error } = await supabase
      .from("product_lots")
      .insert(lot)
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar lote
  async update(id: string, updates: ProductLotUpdate) {
    const { data, error } = await supabase
      .from("product_lots")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar lote
  async delete(id: string) {
    const { error } = await supabase
      .from("product_lots")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  // Criar componente de blend
  async createComponent(component: any) {
    const { data, error } = await supabase
      .from("lot_components")
      .insert(component)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar componentes por lote
  async deleteComponentsByLot(lotId: string) {
    const { error } = await supabase
      .from("lot_components")
      .delete()
      .eq("lot_id", lotId);
    
    if (error) throw error;
  },

  // Buscar lotes por categoria
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from("product_lots")
      .select(`
        *,
        producers (
          id,
          name,
          property_name,
          property_description,
          city,
          state,
          altitude,
          average_temperature,
          latitude,
          longitude,
          photos,
          profile_picture_url
        )
      `)
      .eq("category", category)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Incrementar views do lote
  async incrementViews(code: string) {
    const { error } = await supabase.rpc('increment_lot_views', { lot_code: code });
    if (error) throw error;
  }
};

// Serviços para Gerenciamento de Usuários (Admin)
// Usa Edge Function para segurança
export const usersApi = {
  // Listar todos os usuários (requer admin)
  async getAll() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    // Usar fetch diretamente para GET
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-users?action=list`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao listar usuários');
    }

    const data = await response.json();
    return data;
  },

  // Criar novo usuário (requer admin)
  async create(userData: { email: string; password: string; full_name?: string }) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-users`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          email: userData.email,
          password: userData.password,
          full_name: userData.full_name,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar usuário');
    }

    const data = await response.json();
    return data;
  },

  // Deletar usuário (requer admin)
  async delete(userId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/manage-users`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          userId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar usuário');
    }

    const data = await response.json();
    return data;
  },
};

// Serviços de Autenticação
export const authApi = {
  // Login com email e senha
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Cadastro com email e senha
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obter usuário atual
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Atualizar perfil do usuário (apenas nome)
  async updateProfile(data: { full_name?: string }) {
    const updateData: { data?: { full_name?: string } } = {};
    
    // Atualizar nome nos metadados do usuário
    if (data.full_name !== undefined) {
      updateData.data = { full_name: data.full_name };
    }
    
    const { data: userData, error } = await supabase.auth.updateUser(updateData);
    
    if (error) throw error;
    return userData;
  },

  // Atualizar senha do usuário
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) throw error;
    return data;
  },

  // Recuperar senha (enviar email)
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    return data;
  }
};

// Serviços para Componentes de Lote (Blend)
export const lotComponentsApi = {
  // Buscar componentes por lote
  async getByLot(lotId: string) {
    const { data, error } = await supabase
      .from("lot_components")
      .select("*")
      .eq("lot_id", lotId)
      .order("created_at");
    
    if (error) throw error;
    return data;
  },

  // Criar componente
  async create(component: LotComponentInsert) {
    const { data, error } = await supabase
      .from("lot_components")
      .insert(component)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar componente
  async update(id: string, updates: LotComponentUpdate) {
    const { data, error } = await supabase
      .from("lot_components")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar componente
  async delete(id: string) {
    const { error } = await supabase
      .from("lot_components")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  // Deletar todos os componentes de um lote
  async deleteByLot(lotId: string) {
    const { error } = await supabase
      .from("lot_components")
      .delete()
      .eq("lot_id", lotId);
    
    if (error) throw error;
  }
};

// Serviços para Controle de Selos
export const sealControlsApi = {
  // Buscar controles por lote
  async getByLot(lotId: string) {
    const { data, error } = await supabase
      .from("seal_controls")
      .select(`
        *,
        producers (
          id,
          name,
          property_name
        )
      `)
      .eq("lot_id", lotId)
      .order("generation_date", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Buscar controles por produtor
  async getByProducer(producerId: string) {
    const { data, error } = await supabase
      .from("seal_controls")
      .select(`
        *,
        product_lots (
          id,
          code,
          name,
          category
        )
      `)
      .eq("producer_id", producerId)
      .order("generation_date", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Criar controle de selo
  async create(sealControl: SealControlInsert) {
    const { data, error } = await supabase
      .from("seal_controls")
      .insert(sealControl)
      .select(`
        *,
        producers (
          id,
          name,
          property_name
        ),
        product_lots (
          id,
          code,
          name,
          category
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar controle de selo
  async update(id: string, updates: SealControlUpdate) {
    const { data, error } = await supabase
      .from("seal_controls")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        producers (
          id,
          name,
          property_name
        ),
        product_lots (
          id,
          code,
          name,
          category
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar controle de selo
  async delete(id: string) {
    const { error } = await supabase
      .from("seal_controls")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  },

  // Calcular selos necessários baseado no fracionamento
  calculateSeals(totalQuantity: number, packageSize: number, packageUnit: string) {
    // Converter para a mesma unidade base (gramas)
    let totalInGrams = totalQuantity;
    let packageInGrams = packageSize;

    if (packageUnit === 'kg') {
      packageInGrams = packageSize * 1000;
    } else if (packageUnit === 'g') {
      packageInGrams = packageSize;
    }

    const totalPackages = Math.floor(totalInGrams / packageInGrams);
    return totalPackages;
  }
};

// Serviços para Configurações do Sistema
export const systemConfigApi = {
  // Buscar configuração por chave
  async getByKey(key: string) {
    const { data, error } = await supabase
      .from("system_configurations")
      .select("*")
      .eq("config_key", key)
      .single();
    
    // Se não encontrar, retorna null ao invés de lançar erro
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Registro não encontrado
      }
      throw error;
    }
    return data;
  },

  // Buscar todas as configurações
  async getAll() {
    const { data, error } = await supabase
      .from("system_configurations")
      .select("*")
      .order("config_key");
    
    if (error) throw error;
    return data;
  },

  // Criar ou atualizar configuração
  async upsert(config: SystemConfigurationInsert) {
    const { data, error } = await supabase
      .from("system_configurations")
      .upsert(config, { 
        onConflict: 'config_key',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar configuração
  async delete(key: string) {
    const { error } = await supabase
      .from("system_configurations")
      .delete()
      .eq("config_key", key);
    
    if (error) throw error;
  },

  // Configurações específicas
  async getLotIdConfig() {
    const config = await this.getByKey('lot_id_mode');
    return config?.config_value || { mode: 'auto', prefix: 'GT', auto_increment: true };
  },

  async getQRCodeConfig() {
    const config = await this.getByKey('qrcode_mode');
    return config?.config_value || { mode: 'individual', generic_categories: [] };
  },

  async getVideoConfig() {
    const config = await this.getByKey('video_settings');
    return config?.config_value || { enabled: true, auto_play: true, show_after_seconds: 3 };
  },

  async getBrandingConfig() {
    const config = await this.getByKey('branding_settings');
    return config?.config_value || { 
      preset: 'default',
      primaryColor: '#16a34a',
      secondaryColor: '#22c55e',
      accentColor: '#10b981',
      logoUrl: null,
      headerImageUrl: null,
      videoBackgroundUrl: null,
      siteTitle: 'GeoTrace - Sistema de Rastreabilidade',
      siteDescription: 'Plataforma premium para rastreabilidade de produtos de origem.'
    };
  }
}; 

// Serviços para Associações/Cooperativas
export const associationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("associations")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },
  // Retorna a contagem de produtores vinculados a uma associação
  async getProducerCount(associationId: string) {
    const { count, error } = await supabase
      .from("producers_associations")
      .select("producer_id", { count: "exact", head: true })
      .eq("association_id", associationId);
    if (error) throw error;
    return count || 0;
  },
  // Lista produtores vinculados a uma associação
  async getProducers(associationId: string) {
    const { data, error } = await supabase
      .from("producers_associations")
      .select(
        `
        producers:producers (
          id,
          name,
          property_name,
          city,
          state
        )
      `
      )
      .eq("association_id", associationId)
      .order("since", { ascending: false });
    if (error) throw error;
    // data é uma lista de linhas com campo aninhado producers
    return (data || []).map((row: any) => row.producers).filter(Boolean);
  },
  async create(association: AssociationInsert) {
    const { data, error } = await supabase
      .from("associations")
      .insert(association)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: AssociationUpdate) {
    const { data, error } = await supabase
      .from("associations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // Lista associações de um produtor
  async getByProducer(producerId: string) {
    const { data, error } = await supabase
      .from("producers_associations")
      .select(`
        associations (
          id,
          name,
          type,
          city,
          state,
          description,
          contact_info,
          logo_url
        )
      `)
      .eq("producer_id", producerId);
    if (error) throw error;
    return data?.map((item: any) => item.associations) || [];
  },
  // Adiciona produtor a uma associação
  async addProducerToAssociation(producerId: string, associationId: string) {
    const { data, error } = await supabase
      .from("producers_associations")
      .insert({ producer_id: producerId, association_id: associationId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // Remove produtor de uma associação
  async removeProducerFromAssociation(producerId: string, associationId: string) {
    const { error } = await supabase
      .from("producers_associations")
      .delete()
      .eq("producer_id", producerId)
      .eq("association_id", associationId);
    if (error) throw error;
  },
};

// Serviços para Marcas
export const brandsApi = {
  // Buscar todas as marcas de um produtor
  async getByProducer(producerId: string) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("producer_id", producerId)
      .order("name");
    
    if (error) throw error;
    return data;
  },

  // Criar nova marca
  async create(brand: BrandInsert) {
    const { data, error } = await supabase
      .from("brands")
      .insert(brand)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar marca
  async update(id: string, updates: BrandUpdate) {
    const { data, error } = await supabase
      .from("brands")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar marca
  async delete(id: string) {
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};

// Serviços para Indústrias
export const industriesApi = {
  // Buscar todas as indústrias
  async getAll() {
    const { data, error } = await supabase
      .from("industries")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data;
  },

  // Buscar indústria por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from("industries")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Criar nova indústria
  async create(industry: IndustryInsert) {
    const { data, error } = await supabase
      .from("industries")
      .insert(industry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Atualizar indústria
  async update(id: string, updates: IndustryUpdate) {
    const { data, error } = await supabase
      .from("industries")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Deletar indústria
  async delete(id: string) {
    const { error } = await supabase
      .from("industries")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};

// Serviços para Categorias
export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },
  async create(category: CategoryInsert) {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
};

// Serviços para Características
export const characteristicsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("characteristics")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },
  async create(characteristic: CharacteristicInsert) {
    const { data, error } = await supabase
      .from("characteristics")
      .insert(characteristic)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: CharacteristicUpdate) {
    const { data, error } = await supabase
      .from("characteristics")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("characteristics")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
};

// Serviços para Características de Lote
export const productLotCharacteristicsApi = {
  async getByLot(lotId: string) {
    const { data, error } = await supabase
      .from("product_lot_characteristics")
      .select(`
        *,
        characteristics (*)
      `)
      .eq("lot_id", lotId);
    if (error) throw error;
    return data;
  },
  async create(lotCharacteristic: ProductLotCharacteristicInsert) {
    const { data, error } = await supabase
      .from("product_lot_characteristics")
      .insert(lotCharacteristic)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: ProductLotCharacteristicUpdate) {
    const { data, error } = await supabase
      .from("product_lot_characteristics")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("product_lot_characteristics")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
  async deleteByLot(lotId: string) {
    const { error } = await supabase
      .from("product_lot_characteristics")
      .delete()
      .eq("lot_id", lotId);
    if (error) throw error;
  }
};

// Serviços para Atributos Sensoriais
export const sensoryAttributesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("sensory_attributes")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },
  async create(attribute: SensoryAttributeInsert) {
    const { data, error } = await supabase
      .from("sensory_attributes")
      .insert(attribute)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: SensoryAttributeUpdate) {
    const { data, error } = await supabase
      .from("sensory_attributes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("sensory_attributes")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
};

// Serviços para Análise Sensorial do Lote
export const productLotSensoryApi = {
  async getByLot(lotId: string) {
    const { data, error } = await supabase
      .from("product_lot_sensory")
      .select(`
        *,
        sensory_attributes (*)
      `)
      .eq("lot_id", lotId);
    if (error) throw error;
    return data;
  },
  async create(lotSensory: ProductLotSensoryInsert) {
    const { data, error } = await supabase
      .from("product_lot_sensory")
      .insert(lotSensory)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteByLot(lotId: string) {
    const { error } = await supabase
      .from("product_lot_sensory")
      .delete()
      .eq("lot_id", lotId);
    if (error) throw error;
  }
};
