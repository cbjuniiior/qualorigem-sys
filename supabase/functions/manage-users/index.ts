import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { method } = req;
    let body: Record<string, unknown> = {};
    if (method !== 'GET') {
      try {
        body = (await req.json()) as Record<string, unknown> ?? {};
      } catch {
        return new Response(
          JSON.stringify({ error: 'Corpo da requisição inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    const action = (body.action as string) || new URL(req.url).searchParams.get('action');

    // Helper to check permissions (limit(1) avoids single/maybeSingle behavior differences)
    const checkPermission = async (targetTenantId: string | null) => {
      const { data: platformRows } = await supabaseAdmin
        .from('platform_admins')
        .select('role')
        .eq('user_id', user.id)
        .limit(1);
      if (platformRows?.length) return true;

      if (targetTenantId) {
        const { data: membershipRows } = await supabaseAdmin
          .from('tenant_memberships')
          .select('role')
          .eq('user_id', user.id)
          .eq('tenant_id', targetTenantId)
          .eq('role', 'tenant_admin')
          .limit(1);
        if (membershipRows?.length) return true;
      }
      return false;
    };

    // GET or POST - List all users (filtered by tenant if not platform admin)
    const isListAction = (method === 'GET' && action === 'list') || (method === 'POST' && action === 'list');
    if (isListAction) {
      const tenantId = method === 'POST' && body.tenant_id != null
        ? String(body.tenant_id).trim() || null
        : new URL(req.url).searchParams.get('tenantId');
      
      if (!await checkPermission(tenantId)) {
        return new Response(
          JSON.stringify({ error: 'Permissão negada' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // We can't easily filter listUsers by tenant_id in Auth, so we query user_profiles
        let query = supabaseAdmin.from('user_profiles').select('*').eq('is_active', true);
        if (tenantId) {
          query = query.eq('tenant_id', tenantId);
        }
        query = query.order('created_at', { ascending: false });

        const { data: profiles, error } = await query;

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify(profiles),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (listError) {
        const message = listError instanceof Error ? listError.message : String(listError);
        return new Response(
          JSON.stringify({ error: message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST - Create user
    if (method === 'POST' && action === 'create') {
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      const password = body.password;
      const full_name = typeof body.full_name === 'string' ? body.full_name.trim() : '';
      const tenantId = typeof body.tenant_id === 'string' ? String(body.tenant_id).trim() : '';
      const role = body.role;

      if (!email || !password || !tenantId) {
        return new Response(
          JSON.stringify({ error: 'Email, senha e ID do tenant são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!await checkPermission(tenantId)) {
        return new Response(
          JSON.stringify({ error: 'Permissão negada para criar usuário neste tenant' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create Auth User
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: full_name || '',
        },
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create Profile and Membership
      if (data.user) {
        // 1. Profile
        const roleValue = typeof role === 'string' ? role : 'tenant_admin';
        const { error: profileError } = await supabaseAdmin.from('user_profiles').upsert({
          id: data.user.id,
          email: email,
          full_name: full_name || '',
          tenant_id: tenantId,
          role: roleValue,
          is_active: true
        });

        if (profileError) {
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 2. Membership
        const { error: membershipError } = await supabaseAdmin.from('tenant_memberships').insert({
          tenant_id: tenantId,
          user_id: data.user.id,
          role: typeof role === 'string' ? role : 'tenant_admin'
        });

        if (membershipError) {
          return new Response(
            JSON.stringify({ error: membershipError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name,
          created_at: data.user.created_at,
          email_confirmed_at: data.user.email_confirmed_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE - Delete user
    if (method === 'POST' && action === 'delete') {
      const { userId, tenant_id } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'ID do usuário é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check permission (needs tenant_id to verify if caller manages that user's tenant)
      // Ideally we should fetch the user's tenant first, but let's trust the passed tenant_id for permission check
      // or fetch it from user_profiles
      
      let targetTenantId = tenant_id;
      if (!targetTenantId) {
        const { data: profile } = await supabaseAdmin.from('user_profiles').select('tenant_id').eq('id', userId).single();
        targetTenantId = profile?.tenant_id;
      }

      if (!await checkPermission(targetTenantId)) {
        return new Response(
          JSON.stringify({ error: 'Permissão negada' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Soft delete (set is_active = false) instead of hard delete
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Método não suportado' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
