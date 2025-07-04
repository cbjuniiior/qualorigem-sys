import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Tipos para facilitar o uso
export type Producer = Tables<"producers">;
export type ProductLot = Tables<"product_lots">;
export type ProducerInsert = TablesInsert<"producers">;
export type ProductLotInsert = TablesInsert<"product_lots">;
export type ProducerUpdate = TablesUpdate<"producers">;
export type ProductLotUpdate = TablesUpdate<"product_lots">;

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
    return data;
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