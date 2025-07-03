import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { authApi } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginToastShown, setLoginToastShown] = useState(false);

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const user = await authApi.getCurrentUser();
        setUser(user);
        // Para obter a sessão completa, precisamos usar o cliente Supabase diretamente
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Erro ao obter sessão inicial:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = authApi.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN" && !loginToastShown) {
          toast.success("Login realizado com sucesso!");
          setLoginToastShown(true);
        } else if (event === "SIGNED_OUT") {
          toast.success("Logout realizado com sucesso!");
          setLoginToastShown(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authApi.signIn(email, password);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authApi.signUp(email, password);
      toast.success("Conta criada com sucesso! Verifique seu email.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authApi.signOut();
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 