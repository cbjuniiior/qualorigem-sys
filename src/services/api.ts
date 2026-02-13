import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
export type Tenant = Tables<"tenants">;
export type TenantModule = Tables<"tenant_modules">;
export type TenantMembership = Tables<"tenant_memberships">;

export type Certification = Tables<"certifications">;
export type CertificationEntity = Tables<"certification_entities">;
export type InternalProducer = Tables<"internal_producers">;
export type TenantFieldSetting = Tables<"tenant_field_settings">;
export type PlatformSettings = Tables<"platform_settings">;

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
export type CertificationInsert = TablesInsert<"certifications">;
export type CertificationEntityInsert = TablesInsert<"certification_entities">;
export type InternalProducerInsert = TablesInsert<"internal_producers">;

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

// --- NOVOS SERVIÇOS MULTI-TENANT ---

// Serviço para Tenants (Público/Resolvers)
export const tenantsApi = {
  // Buscar tenant por slug (Público)
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("slug", slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Buscar módulos ativos do tenant (Público)
  async getModules(tenantId: string) {
    const { data, error } = await supabase
      .from("tenant_modules")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("enabled", true);

    if (error) throw error;
    return data;
  },

  // Atualizar branding do tenant (usado pelo admin do tenant)
  async updateBranding(tenantId: string, branding: any) {
    const { data, error } = await supabase
      .from("tenants")
      .update({ branding } as any)
      .eq("id", tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Serviço para Plataforma (Superadmin)
export const platformApi = {
  // Listar todos os tenants
  async getAllTenants() {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  // Criar novo tenant
  async createTenant(tenant: TablesInsert<"tenants">) {
    const { data, error } = await supabase
      .from("tenants")
      .insert(tenant)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Criar tenant + primeiro admin (atômico via RPC)
  async createTenantWithAdmin(
    tenantData: { name: string; slug: string; type: string; status?: string },
    adminEmail: string,
    adminPassword: string,
    adminName: string
  ) {
    // 1. Criar o tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert(tenantData)
      .select()
      .single();
    if (tenantError) throw tenantError;

    // 2. Criar o usuário e vinculá-lo ao tenant
    try {
      const { data: userId, error: userError } = await supabase
        .rpc("create_user_for_tenant", {
          p_email: adminEmail,
          p_password: adminPassword,
          p_full_name: adminName,
          p_tenant_id: tenant.id,
          p_role: "tenant_admin",
        });
      if (userError) throw userError;
      return { tenant, userId };
    } catch (err) {
      // Se falhar ao criar usuário, tentar excluir o tenant criado
      await supabase.from("tenants").delete().eq("id", tenant.id);
      throw err;
    }
  },

  // Atualizar tenant
  async updateTenant(id: string, updates: TablesUpdate<"tenants">) {
    const { data, error } = await supabase
      .from("tenants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Excluir tenant
  async deleteTenant(id: string) {
    const { error } = await supabase
      .from("tenants")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // Suspender tenant
  async suspendTenant(id: string) {
    return this.updateTenant(id, { status: "suspended" } as any);
  },

  // Ativar tenant
  async activateTenant(id: string) {
    return this.updateTenant(id, { status: "active" } as any);
  },

  // Estatísticas globais (via RPC)
  async getGlobalStats() {
    const { data, error } = await supabase.rpc("get_platform_stats");
    if (error) throw error;
    return data?.[0] || { total_tenants: 0, active_tenants: 0, total_users: 0, total_lots: 0 };
  },

  // Estatísticas de um tenant (via RPC)
  async getTenantStats(tenantId: string) {
    const { data, error } = await supabase.rpc("get_tenant_stats", { p_tenant_id: tenantId });
    if (error) throw error;
    return data?.[0] || { producers_count: 0, lots_count: 0, members_count: 0, certifications_count: 0 };
  },

  async getTenantActivity(tenantId: string) {
    const { data, error } = await supabase.rpc("get_tenant_activity", { p_tenant_id: tenantId });
    if (error) throw error;
    return data || [];
  },

  async getTenantBranding(tenantId: string) {
    const { data, error } = await supabase
      .from("tenants")
      .select("branding")
      .eq("id", tenantId)
      .single();
    if (error) throw error;
    return data?.branding || null;
  },
};

// Módulos por Tenant
export const AVAILABLE_MODULES = [
  { key: "traceability", name: "Rastreabilidade", description: "Gestão de lotes, QR codes e rastreio completo", icon: "Package" },
  { key: "certifications", name: "Certificações", description: "Gestão de certificados e documentos oficiais", icon: "Certificate" },
  { key: "internal_producers", name: "Produtores Internos", description: "Cadastro de produtores associados/cooperados", icon: "Users" },
  { key: "sensory_analysis", name: "Análise Sensorial", description: "Avaliação sensorial e perfil de sabor", icon: "Eye" },
  { key: "seal_control", name: "Controle de Selos", description: "Gestão de selos de rastreabilidade", icon: "Fingerprint" },
  { key: "reports", name: "Relatórios", description: "Relatórios e dashboards avançados", icon: "ChartBar" },
  { key: "crm", name: "CRM", description: "Gestão de relacionamento com clientes", icon: "UserCircle" },
];

export const tenantModulesApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("tenant_modules")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return data;
  },
  async upsert(tenantId: string, moduleKey: string, enabled: boolean, config: any = {}) {
    const { data, error } = await supabase
      .from("tenant_modules")
      .upsert({ tenant_id: tenantId, module_key: moduleKey, enabled, config } as any, { onConflict: "tenant_id,module_key" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(tenantId: string, moduleKey: string) {
    const { error } = await supabase
      .from("tenant_modules")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("module_key", moduleKey);
    if (error) throw error;
  },
};

// Memberships por Tenant
export const tenantMembershipsApi = {
  async getAll(tenantId: string) {
    // Via RPC para obter dados do auth.users
    const { data, error } = await supabase.rpc("get_tenant_members", { p_tenant_id: tenantId });
    if (error) throw error;
    return data;
  },
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("tenant_memberships")
      .select("*, tenants(*)")
      .eq("user_id", userId);
    if (error) throw error;
    return data;
  },
  async create(tenantId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from("tenant_memberships")
      .insert({ tenant_id: tenantId, user_id: userId, role } as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async updateRole(tenantId: string, userId: string, role: string) {
    const { data, error } = await supabase
      .from("tenant_memberships")
      .update({ role } as any)
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(tenantId: string, userId: string) {
    const { error } = await supabase
      .from("tenant_memberships")
      .delete()
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);
    if (error) throw error;
  },
};

// Platform Admins
export const platformAdminsApi = {
  async getAll() {
    const { data, error } = await supabase.rpc("get_platform_admins");
    if (error) throw error;
    return data;
  },
  async add(userId: string) {
    const { data, error } = await supabase
      .from("platform_admins")
      .insert({ user_id: userId, role: "superadmin" } as any)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async remove(userId: string) {
    const { error } = await supabase
      .from("platform_admins")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
  },
  async createAdmin(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.rpc("create_platform_admin", {
      p_email: email,
      p_password: password,
      p_full_name: fullName,
    });
    if (error) throw error;
    return data;
  },
};

// Usuários globais (cross-tenant)
export const platformUsersApi = {
  async getAll() {
    const { data, error } = await supabase.rpc("get_all_users_for_platform");
    if (error) throw error;
    return data;
  },
  async createForTenant(email: string, password: string, fullName: string, tenantId: string, role: string = "tenant_admin") {
    const { data, error } = await supabase.rpc("create_user_for_tenant", {
      p_email: email,
      p_password: password,
      p_full_name: fullName,
      p_tenant_id: tenantId,
      p_role: role,
    });
    if (error) throw error;
    return data;
  },
};

// Assinaturas de tenant
export const tenantSubscriptionsApi = {
  async getByTenant(tenantId: string) {
    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(sub: { tenant_id: string; plan: string; started_at?: string; expires_at?: string | null; status?: string; notes?: string }) {
    const { data, error } = await supabase
      .from("tenant_subscriptions")
      .upsert(sub as any, { onConflict: "tenant_id" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("tenant_subscriptions")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// Templates de tipos de sistema
export const systemTypeTemplatesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("system_type_templates")
      .select("*")
      .order("type_key");
    if (error) throw error;
    return data;
  },
  async getByType(typeKey: string) {
    const { data, error } = await supabase
      .from("system_type_templates")
      .select("*")
      .eq("type_key", typeKey)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(template: { type_key: string; name: string; description?: string; default_modules?: any; default_fields?: any; color?: string; icon?: string }) {
    const { data, error } = await supabase
      .from("system_type_templates")
      .upsert(template as any, { onConflict: "type_key" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// --- SERVIÇOS REFATORADOS (TENANT-AWARE) ---

// Serviços para Produtores
export const producersApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("producers")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");

    if (error) throw error;
    return data;
  },

  async getById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from("producers")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();

    if (error) throw error;
    return data;
  },

  async create(producer: ProducerInsert) {
    // tenant_id deve vir no objeto producer
    const { data, error } = await supabase
      .from("producers")
      .insert(producer)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, tenantId: string, updates: ProducerUpdate) {
    const { data, error } = await supabase
      .from("producers")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("producers")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) throw error;
  }
};

// Serviços para Lotes de Produtos
export const productLotsApi = {
  async getAll(tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Buscar componentes separadamente (mantendo lógica antiga, mas filtrando por tenant se possível, 
    // embora lot_id já filtre implicitamente)
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
          .eq("lot_id", lot.id)
          .eq("tenant_id", tenantId); // Garantia extra

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

  // Buscar lote por código (Público/QR Code - precisa do tenantId para garantir unicidade)
  async getByCode(code: string, tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .single();

    if (error) throw error;

    const { data: components } = await supabase
      .from("lot_components")
      .select(`
        *,
        producers:producers(*),
        associations:associations(*)
      `)
      .eq("lot_id", data.id)
      .eq("tenant_id", tenantId)
      .order("created_at");

    return {
      ...data,
      components: components || [],
      characteristics: data.product_lot_characteristics || [],
      sensory_analysis: data.product_lot_sensory || []
    };
  },

  async getById(id: string, tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .single();

    if (error) throw error;

    const { data: components } = await supabase
      .from("lot_components")
      .select(`
        *,
        producers:producers(*),
        associations:associations(*)
      `)
      .eq("lot_id", id)
      .eq("tenant_id", tenantId);

    return {
      ...data,
      components: components || [],
      characteristics: data.product_lot_characteristics || [],
      sensory_analysis: data.product_lot_sensory || []
    };
  },

  async getByProducer(producerId: string, tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

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

  async update(id: string, tenantId: string, updates: ProductLotUpdate) {
    const { data, error } = await supabase
      .from("product_lots")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
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

  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("product_lots")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    if (error) throw error;
  },

  async createComponent(component: LotComponentInsert) {
    const { data, error } = await supabase
      .from("lot_components")
      .insert(component)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteComponentsByLot(lotId: string, tenantId: string) {
    const { error } = await supabase
      .from("lot_components")
      .delete()
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);

    if (error) throw error;
  },

  async getByCategory(category: string, tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async incrementViews(code: string) {
    // increment_lot_views é uma RPC que não recebe tenant_id por padrão
    // Idealmente deveria, mas como é só contador de views, pode ficar assim ou ser atualizada
    const { error } = await supabase.rpc('increment_lot_views', { lot_code: code });
    if (error) throw error;
  }
};

// Serviços para Gerenciamento de Usuários (Admin)
export const usersApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("is_active", true)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      email_confirmed_at: user.created_at,
    }));
  },

  async create(userData: { email: string; password: string; full_name?: string }, tenantId: string) {
    try {
      const { data: currentSession } = await supabase.auth.getSession();
      const adminSession = currentSession?.session;

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name || '',
          },
        },
      });

      if (error) {
        if (error.message.includes('email') || error.message.includes('confirmation') || error.message.includes('smtp')) {
          throw new Error('Erro de email/SMTP. Verifique configurações do Supabase.');
        }
        throw error;
      }

      // Atualizar user_profiles com tenant_id
      if (data.user) {
        await supabase.from("user_profiles").upsert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.full_name || '',
          is_active: true,
          tenant_id: tenantId // VINCULA AO TENANT
        }, { onConflict: 'id' });

        // Criar membership
        await supabase.from("tenant_memberships").insert({
          tenant_id: tenantId,
          user_id: data.user.id,
          role: 'viewer' // Default role
        });
      }

      if (adminSession) {
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
      }

      return {
        id: data.user?.id,
        email: userData.email,
        full_name: userData.full_name,
        created_at: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err.status === 500 || err.message?.includes('500')) {
        throw new Error('Erro no servidor de autenticação.');
      }
      throw err;
    }
  },

  async delete(userId: string, tenantId: string) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ is_active: false })
      .eq("id", userId)
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return { success: true };
  },
};

// Serviços de Autenticação (Global, mas pode ser adaptado se necessário)
export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
  async updateProfile(data: { full_name?: string }) {
    const updateData: { data?: { full_name?: string } } = {};
    if (data.full_name !== undefined) {
      updateData.data = { full_name: data.full_name };
    }
    const { data: userData, error } = await supabase.auth.updateUser(updateData);
    if (error) throw error;

    if (userData.user && data.full_name !== undefined) {
      await supabase
        .from("user_profiles")
        .update({ full_name: data.full_name })
        .eq("id", userData.user.id);
    }
    return userData;
  },
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
    return data;
  }
};

// Serviços para Componentes de Lote
export const lotComponentsApi = {
  async getByLot(lotId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("lot_components")
      .select("*")
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId)
      .order("created_at");

    if (error) throw error;
    return data;
  },
  async create(component: LotComponentInsert) {
    const { data, error } = await supabase
      .from("lot_components")
      .insert(component)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, tenantId: string, updates: LotComponentUpdate) {
    const { data, error } = await supabase
      .from("lot_components")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("lot_components")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  },
  async deleteByLot(lotId: string, tenantId: string) {
    const { error } = await supabase
      .from("lot_components")
      .delete()
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Controle de Selos
export const sealControlsApi = {
  async getByLot(lotId: string, tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .order("generation_date", { ascending: false });
    if (error) throw error;
    return data;
  },
  async getByProducer(producerId: string, tenantId: string) {
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
      .eq("tenant_id", tenantId)
      .order("generation_date", { ascending: false });
    if (error) throw error;
    return data;
  },
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
  async update(id: string, tenantId: string, updates: SealControlUpdate) {
    const { data, error } = await supabase
      .from("seal_controls")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
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
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("seal_controls")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  },
  calculateSeals(totalQuantity: number, packageSize: number, packageUnit: string) {
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
  async getByKey(key: string, tenantId: string) {
    const { data, error } = await supabase
      .from("system_configurations")
      .select("*")
      .eq("config_key", key)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("system_configurations")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("config_key");
    if (error) throw error;
    return data;
  },
  async upsert(config: SystemConfigurationInsert) {
    // config deve ter tenant_id
    const { data, error } = await supabase
      .from("system_configurations")
      .upsert(config, {
        onConflict: 'tenant_id,config_key',
        ignoreDuplicates: false
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(key: string, tenantId: string) {
    const { error } = await supabase
      .from("system_configurations")
      .delete()
      .eq("config_key", key)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  },
  // Helpers de config (recebem tenantId)
  async getLotIdConfig(tenantId: string) {
    const config = await this.getByKey('lot_id_mode', tenantId);
    return config?.config_value || { mode: 'auto', prefix: 'GT', auto_increment: true };
  },
  async getQRCodeConfig(tenantId: string) {
    const config = await this.getByKey('qrcode_mode', tenantId);
    return config?.config_value || { mode: 'individual', generic_categories: [] };
  },
  async getVideoConfig(tenantId: string) {
    const config = await this.getByKey('video_settings', tenantId);
    return config?.config_value || { enabled: true, auto_play: true, show_after_seconds: 3 };
  },
  async getBrandingConfig(tenantId: string) {
    const config = await this.getByKey('branding_settings', tenantId);
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

const PLATFORM_SETTINGS_ID = "00000000-0000-0000-0000-000000000001" as const;

export const platformSettingsApi = {
  async get() {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", PLATFORM_SETTINGS_ID)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(settings: { favicon_url?: string | null; site_title?: string; site_description?: string | null }) {
    const { data, error } = await supabase
      .from("platform_settings")
      .upsert(
        {
          id: PLATFORM_SETTINGS_ID,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Serviços para Associações
export const associationsApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("associations")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data;
  },
  async getProducerCount(associationId: string, tenantId: string) {
    const { count, error } = await supabase
      .from("producers_associations")
      .select("producer_id", { count: "exact", head: true })
      .eq("association_id", associationId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return count || 0;
  },
  async getProducers(associationId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("producers_associations")
      .select(`
        producers:producers (
          id,
          name,
          property_name,
          city,
          state
        )
      `)
      .eq("association_id", associationId)
      .eq("tenant_id", tenantId)
      .order("since", { ascending: false });
    if (error) throw error;
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
  async update(id: string, tenantId: string, updates: AssociationUpdate) {
    const { data, error } = await supabase
      .from("associations")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getByProducer(producerId: string, tenantId: string) {
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
      .eq("producer_id", producerId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return data?.map((item: any) => item.associations) || [];
  },
  async addProducerToAssociation(producerId: string, associationId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("producers_associations")
      .insert({ 
        producer_id: producerId, 
        association_id: associationId,
        tenant_id: tenantId 
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async removeProducerFromAssociation(producerId: string, associationId: string, tenantId: string) {
    const { error } = await supabase
      .from("producers_associations")
      .delete()
      .eq("producer_id", producerId)
      .eq("association_id", associationId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  },
  async delete(id: string, tenantId: string) {
    const { error: relationError } = await supabase
      .from("producers_associations")
      .delete()
      .eq("association_id", id)
      .eq("tenant_id", tenantId);
    if (relationError) throw relationError;

    const { error: lotError } = await supabase
      .from("product_lots")
      .update({ association_id: null })
      .eq("association_id", id)
      .eq("tenant_id", tenantId);
    if (lotError) throw lotError;

    const { error: componentError } = await supabase
      .from("lot_components")
      .update({ association_id: null })
      .eq("association_id", id)
      .eq("tenant_id", tenantId);
    if (componentError) throw componentError;

    const { error } = await supabase
      .from("associations")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  },
};

// Serviços para Marcas
export const brandsApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data;
  },
  async getByProducer(producerId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("producer_id", producerId)
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data;
  },
  async create(brand: BrandInsert) {
    const { data, error } = await supabase
      .from("brands")
      .insert(brand)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, tenantId: string, updates: BrandUpdate) {
    const { data, error } = await supabase
      .from("brands")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Indústrias
export const industriesApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("industries")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data;
  },
  async getById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from("industries")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();
    if (error) throw error;
    return data;
  },
  async create(industry: IndustryInsert) {
    const { data, error } = await supabase
      .from("industries")
      .insert(industry)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, tenantId: string, updates: IndustryUpdate) {
    const { data, error } = await supabase
      .from("industries")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("industries")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Categorias
export const categoriesApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("tenant_id", tenantId)
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
  async update(id: string, tenantId: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Características
export const characteristicsApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("characteristics")
      .select("*")
      .eq("tenant_id", tenantId)
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
  async update(id: string, tenantId: string, updates: CharacteristicUpdate) {
    const { data, error } = await supabase
      .from("characteristics")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("characteristics")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Características de Lote
export const productLotCharacteristicsApi = {
  async getByLot(lotId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("product_lot_characteristics")
      .select(`
        *,
        characteristics (*)
      `)
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
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
  async update(id: string, tenantId: string, updates: ProductLotCharacteristicUpdate) {
    const { data, error } = await supabase
      .from("product_lot_characteristics")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("product_lot_characteristics")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  },
  async deleteByLot(lotId: string, tenantId: string) {
    const { error } = await supabase
      .from("product_lot_characteristics")
      .delete()
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Atributos Sensoriais
export const sensoryAttributesApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("sensory_attributes")
      .select("*")
      .eq("tenant_id", tenantId)
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
  async update(id: string, tenantId: string, updates: SensoryAttributeUpdate) {
    const { data, error } = await supabase
      .from("sensory_attributes")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string, tenantId: string) {
    const { error } = await supabase
      .from("sensory_attributes")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// Serviços para Análise Sensorial do Lote
export const productLotSensoryApi = {
  async getByLot(lotId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("product_lot_sensory")
      .select(`
        *,
        sensory_attributes (*)
      `)
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
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
  async deleteByLot(lotId: string, tenantId: string) {
    const { error } = await supabase
      .from("product_lot_sensory")
      .delete()
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
  }
};

// --- SERVIÇOS V3 - MARCA COLETIVA ---

// Serviços para Certificações
export const certificationsApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) {
      // Tabela pode não existir se MIGRATION_V3 não foi aplicada (404)
      if (error.code === "PGRST301" || (error as any).status === 404) return [];
      throw error;
    }
    return data ?? [];
  },
  async getById(id: string, tenantId: string) {
    const { data, error } = await supabase
      .from("certifications")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .single();
    if (error) throw error;
    return data;
  },
  async create(cert: CertificationInsert) {
    const { data, error } = await supabase
      .from("certifications")
      .insert(cert)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<CertificationInsert>) {
    const { data, error } = await supabase
      .from("certifications")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("certifications")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
  // Buscar certificações públicas de um lote
  async getPublicByLot(lotId: string) {
    const { data, error } = await supabase
      .from("certification_entities")
      .select(`
        certification_id,
        certifications (*)
      `)
      .eq("entity_type", "lot")
      .eq("entity_id", lotId);
    if (error) {
      if (error.code === "PGRST301" || (error as any).status === 404) return [];
      throw error;
    }
    return (data || [])
      .map((d: any) => d.certifications)
      .filter((c: any) => c && c.is_public);
  },
  // Buscar entidades vinculadas a uma certificação
  async getEntities(certificationId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("certification_entities")
      .select("*")
      .eq("certification_id", certificationId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return data;
  },
  // Vincular certificação a entidade
  async linkEntity(entity: CertificationEntityInsert) {
    const { data, error } = await supabase
      .from("certification_entities")
      .insert(entity)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // Desvincular certificação de entidade
  async unlinkEntity(certificationId: string, entityType: string, entityId: string) {
    const { error } = await supabase
      .from("certification_entities")
      .delete()
      .eq("certification_id", certificationId)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId);
    if (error) throw error;
  },
  // Sincronizar certificações de um lote (replace all)
  async syncLotCertifications(lotId: string, certificationIds: string[], tenantId: string) {
    // Remover vinculações existentes
    await supabase
      .from("certification_entities")
      .delete()
      .eq("entity_type", "lot")
      .eq("entity_id", lotId)
      .eq("tenant_id", tenantId);
    // Inserir novas
    if (certificationIds.length > 0) {
      const inserts = certificationIds.map(cid => ({
        certification_id: cid,
        entity_type: "lot" as const,
        entity_id: lotId,
        tenant_id: tenantId,
      }));
      const { error } = await supabase
        .from("certification_entities")
        .insert(inserts);
      if (error) throw error;
    }
  }
};

// Serviços para Produtores Internos
export const internalProducersApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("internal_producers")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data;
  },
  async getByCooperativa(cooperativaId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("internal_producers")
      .select("*")
      .eq("cooperativa_id", cooperativaId)
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw error;
    return data;
  },
  async create(producer: InternalProducerInsert) {
    const { data, error } = await supabase
      .from("internal_producers")
      .insert(producer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async bulkCreate(producers: InternalProducerInsert[]) {
    const { data, error } = await supabase
      .from("internal_producers")
      .insert(producers)
      .select();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: Partial<InternalProducerInsert>) {
    const { data, error } = await supabase
      .from("internal_producers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async delete(id: string) {
    const { error } = await supabase
      .from("internal_producers")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
  // Contagem de produtores internos por lote (para exibição pública)
  async countByLot(lotId: string) {
    const { count, error } = await supabase
      .from("product_lot_internal_producers")
      .select("internal_producer_id", { count: "exact", head: true })
      .eq("lot_id", lotId);
    if (error) throw error;
    return count || 0;
  },
  // Buscar produtores internos vinculados a um lote
  async getByLot(lotId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("product_lot_internal_producers")
      .select(`
        internal_producer_id,
        internal_producers (*)
      `)
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return (data || []).map((d: any) => d.internal_producers).filter(Boolean);
  },
  // Sincronizar produtores internos de um lote
  async syncLotProducers(lotId: string, internalProducerIds: string[], tenantId: string) {
    await supabase
      .from("product_lot_internal_producers")
      .delete()
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (internalProducerIds.length > 0) {
      const inserts = internalProducerIds.map(pid => ({
        lot_id: lotId,
        internal_producer_id: pid,
        tenant_id: tenantId,
      }));
      const { error } = await supabase
        .from("product_lot_internal_producers")
        .insert(inserts);
      if (error) throw error;
    }
  }
};

// Serviços para Múltiplas Indústrias por Lote
export const lotIndustriesApi = {
  async getByLot(lotId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("product_lot_industries")
      .select(`
        industry_id,
        industries (*)
      `)
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return (data || []).map((d: any) => d.industries).filter(Boolean);
  },
  async syncLotIndustries(lotId: string, industryIds: string[], tenantId: string) {
    await supabase
      .from("product_lot_industries")
      .delete()
      .eq("lot_id", lotId)
      .eq("tenant_id", tenantId);
    if (industryIds.length > 0) {
      const inserts = industryIds.map(iid => ({
        lot_id: lotId,
        industry_id: iid,
        tenant_id: tenantId,
      }));
      const { error } = await supabase
        .from("product_lot_industries")
        .insert(inserts);
      if (error) throw error;
    }
  }
};

// Serviços para Configuração de Campos por Tenant
export const fieldSettingsApi = {
  async getAll(tenantId: string) {
    const { data, error } = await supabase
      .from("tenant_field_settings")
      .select("*")
      .eq("tenant_id", tenantId);
    if (error) throw error;
    return data;
  },
  async getByKey(tenantId: string, fieldKey: string) {
    const { data, error } = await supabase
      .from("tenant_field_settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("field_key", fieldKey)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async upsert(setting: { tenant_id: string; field_key: string; enabled: boolean; required?: boolean }) {
    const { data, error } = await supabase
      .from("tenant_field_settings")
      .upsert(setting, { onConflict: "tenant_id,field_key" })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // Helper: verificar se campo está habilitado (default: true se não configurado)
  async isEnabled(tenantId: string, fieldKey: string): Promise<boolean> {
    const setting = await this.getByKey(tenantId, fieldKey);
    return setting?.enabled ?? true;
  },
  async isRequired(tenantId: string, fieldKey: string): Promise<boolean> {
    const setting = await this.getByKey(tenantId, fieldKey);
    return setting?.required ?? false;
  }
};
