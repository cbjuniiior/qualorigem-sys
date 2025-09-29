import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Tipos para facilitar o uso
export type Producer = Tables<"producers">;
export type ProductLot = Tables<"product_lots">;
export type LotComponent = Tables<"lot_components">;
export type SealControl = Tables<"seal_controls">;
export type SystemConfiguration = Tables<"system_configurations">;

export type ProducerInsert = TablesInsert<"producers">;
export type ProductLotInsert = TablesInsert<"product_lots">;
export type LotComponentInsert = TablesInsert<"lot_components">;
export type SealControlInsert = TablesInsert<"seal_controls">;
export type SystemConfigurationInsert = TablesInsert<"system_configurations">;

export type ProducerUpdate = TablesUpdate<"producers">;
export type ProductLotUpdate = TablesUpdate<"product_lots">;
export type LotComponentUpdate = TablesUpdate<"lot_components">;
export type SealControlUpdate = TablesUpdate<"seal_controls">;
export type SystemConfigurationUpdate = TablesUpdate<"system_configurations">;

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
          average_temperature
        )
      `)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
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
          average_temperature
        )
      `)
      .eq("code", code)
      .single();
    
    if (error) throw error;
    
    // Buscar componentes do blend se existirem
    const { data: components } = await supabase
      .from("lot_components")
      .select("*")
      .eq("lot_id", data.id)
      .order("created_at");
    
    return {
      ...data,
      components: components || []
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
          average_temperature
        )
      `)
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
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
          average_temperature
        )
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
          average_temperature
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
          average_temperature
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
          average_temperature
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
    
    if (error) throw error;
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
  }
}; 