import { ReactNode, useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

interface PlatformProtectedRouteProps {
  children: ReactNode;
}

export const PlatformProtectedRoute = ({ children }: PlatformProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const checkedForUser = useRef<string | null>(null);

  // Reset quando user muda
  useEffect(() => {
    if (user?.id !== checkedForUser.current) {
      setIsPlatformAdmin(null);
      setChecking(false);
      checkedForUser.current = null;
    }
  }, [user]);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;

      // Evitar verificação duplicada
      if (checkedForUser.current === user.id) return;

      setChecking(true);
      setIsPlatformAdmin(null);

      try {
        // Tentar via RPC
        const { data, error: rpcError } = await supabase.rpc('is_platform_admin');
        
        if (rpcError) {
          console.warn("Erro ao verificar platform admin via RPC:", rpcError.message);
          // Fallback: verificar direto na tabela platform_admins
          try {
            const { data: adminCheck } = await (supabase as any)
              .from('platform_admins')
              .select('user_id')
              .eq('user_id', user.id)
              .maybeSingle();
            
            setIsPlatformAdmin(!!adminCheck);
          } catch (e) {
            console.error("Fallback platform_admins check falhou:", e);
            setIsPlatformAdmin(false);
          }
        } else {
          setIsPlatformAdmin(!!data);
        }
        
        checkedForUser.current = user.id;
      } catch (err) {
        console.error("Erro ao verificar platform admin:", err);
        setIsPlatformAdmin(false);
        checkedForUser.current = user.id;
      } finally {
        setChecking(false);
      }
    }

    if (user) {
      checkAdmin();
    }
  }, [user]);

  // Loading: auth carregando ou verificação pendente
  if (authLoading) {
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
    return <Navigate to="/platform/login" state={{ from: location }} replace />;
  }

  // Mostra loading enquanto verifica admin (inclui isPlatformAdmin === null)
  if (checking || isPlatformAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (isPlatformAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-4">
            Acesso restrito a administradores da plataforma.
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
