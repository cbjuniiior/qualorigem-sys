import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: platformAdmin } = await supabaseAdmin
      .from('platform_admins')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!platformAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores da plataforma podem criar clientes.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { tenantData, adminEmail, adminPassword, adminName } = body;

    if (!tenantData?.name || !tenantData?.slug || !adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Nome, slug, email e senha do administrador são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (adminPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'A senha deve ter pelo menos 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { name, slug, type, status } = tenantData;
    const statusValue = status ?? 'active';

    const { data: newTenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({ name, slug, type, status: statusValue })
      .select('id')
      .single();

    if (tenantError) {
      return new Response(
        JSON.stringify({ error: tenantError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tenantId = newTenant.id;
    const adminRole = 'tenant_admin';
    const fullName = adminName || adminEmail.split('@')[0];

    const { data: existingUserId } = await supabaseAdmin.rpc('get_user_id_by_email', {
      p_email: adminEmail,
    });

    let userId: string;

    if (existingUserId) {
      userId = existingUserId;
      const { error: membershipError } = await supabaseAdmin.from('tenant_memberships').insert({
        tenant_id: tenantId,
        user_id: userId,
        role: adminRole,
      });
      if (membershipError) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
        return new Response(
          JSON.stringify({ error: membershipError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

      if (createError) {
        await supabaseAdmin.from('tenants').delete().eq('id', tenantId);
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = createData.user!.id;

      await supabaseAdmin.from('user_profiles').upsert({
        id: userId,
        email: adminEmail,
        full_name: fullName,
        tenant_id: tenantId,
        role: adminRole,
        is_active: true,
      }, { onConflict: 'id' });

      await supabaseAdmin.from('tenant_memberships').insert({
        tenant_id: tenantId,
        user_id: userId,
        role: adminRole,
      });
    }

    return new Response(
      JSON.stringify({
        tenantId,
        userId,
        tenant: { id: tenantId, name, slug, type, status: statusValue },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
