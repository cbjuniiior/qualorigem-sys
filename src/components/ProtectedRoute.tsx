import { ReactNode, useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { hasLoggedInToTenant } from "@/lib/tenant-logins";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading } = useTenant();
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const checkedForRef = useRef<string | null>(null);

  // Reset acesso quando user ou tenant mudam
  useEffect(() => {
    const key = user && tenant ? `${user.id}_${tenant.id}` : null;
    if (key !== checkedForRef.current) {
      setHasAccess(null);
      setCheckingAccess(false);
      checkedForRef.current = null;
    }
  }, [user, tenant]);

  useEffect(() => {
    async function checkMembership() {
      if (!user || !tenant) return;

      const checkKey = `${user.id}_${tenant.id}`;
      // Evitar verificação duplicada
      if (checkedForRef.current === checkKey) return;

      setCheckingAccess(true);
      setHasAccess(null);

      try {
        // 1. Verifica se é platform admin
        const { data: isAdmin, error: rpcError } = await supabase.rpc('is_platform_admin');
        
        if (rpcError) {
          console.warn("Erro ao verificar platform admin (RPC pode não existir):", rpcError.message);
          // Não bloquear - seguir para membership check
        } else if (isAdmin) {
          setHasAccess(true);
          checkedForRef.current = checkKey;
          return;
        }

        // 2. Verifica membership no tenant
        const { data: membership, error: membershipError } = await (supabase as any)
          .from('tenant_memberships')
          .select('role')
          .eq('tenant_id', tenant.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (membershipError) {
          console.error("Erro ao verificar membership:", membershipError);
          // Em caso de erro de RLS ou tabela, tentar verificar se é platform_admin direto
          try {
            const { data: adminCheck } = await (supabase as any)
              .from('platform_admins')
              .select('user_id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (adminCheck) {
              setHasAccess(true);
              checkedForRef.current = checkKey;
              return;
            }
          } catch (e) {
            console.warn("Fallback platform_admins check falhou:", e);
          }
          
          setHasAccess(false);
          checkedForRef.current = checkKey;
          return;
        }

        setHasAccess(!!membership);
        checkedForRef.current = checkKey;
      } catch (error) {
        console.error("Erro ao verificar acesso:", error);
        setHasAccess(false);
        checkedForRef.current = `${user.id}_${tenant.id}`;
      } finally {
        setCheckingAccess(false);
      }
    }

    if (user && tenant) {
      checkMembership();
    }
  }, [user, tenant]);

  // Mostra loading enquanto autenticação, tenant ou verificação de acesso estão pendentes
  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const loginPath = tenant ? `/${tenant.slug}/auth/login` : "/";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Exige login específico neste tenant (não acesso automático por ser membro em outro)
  if (tenant && !hasLoggedInToTenant(tenant.id, user.id)) {
    return (
      <Navigate
        to={`/${tenant.slug}/auth/login`}
        state={{ from: location }}
        replace
      />
    );
  }

  // Mostra loading enquanto verifica acesso (inclui hasAccess === null = ainda não verificou)
  if (checkingAccess || (user && tenant && hasAccess === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Acesso negado
  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar a organização <strong>{tenant?.name}</strong>.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="text-blue-600 hover:underline"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
