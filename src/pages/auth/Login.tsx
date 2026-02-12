import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Eye, EyeSlash, Leaf, ArrowLeft, Lock, Envelope } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { useTenant } from "@/hooks/use-tenant";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const { branding } = useBranding();
  const { tenant } = useTenant();
  const { signIn, resetPassword, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantSlug } = useParams();

  // Pegar o caminho de origem (se veio de um redirect, ex: /platform)
  const from = (location.state as any)?.from?.pathname;

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      // Se veio de um redirect (ex: /platform), voltar para lá
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      // Senão, vai pro admin do tenant
      if (tenant) {
        navigate(`/${tenant.slug}/admin`, { replace: true });
      } else if (tenantSlug) {
        navigate(`/${tenantSlug}/admin`, { replace: true });
      } else {
        navigate("/default/admin", { replace: true });
      }
    }
  }, [loading, user, navigate, tenant, tenantSlug, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetMode) {
      if (!email.trim()) {
        toast.error("Preencha seu email");
        return;
      }
      try {
        await resetPassword(email);
        setIsResetMode(false);
      } catch (error) {}
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await signIn(email, password);
      // Navegação acontece no useEffect
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const primaryColor = branding.primaryColor || '#16a34a';
  const secondaryColor = branding.secondaryColor || '#22c55e';
  const currentSlug = tenant?.slug || tenantSlug || 'default';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos Decorativos Minimalistas */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: secondaryColor }} />

      <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        {/* Header Minimalista */}
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-6">
            <Link 
              to={`/${currentSlug}`} 
              className="inline-flex items-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 hover:text-slate-600 transition-colors mb-2"
            >
              <ArrowLeft size={14} weight="bold" />
              Voltar ao site
            </Link>

            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt="Logo" 
                className="h-24 md:h-28 object-contain drop-shadow-xl transition-transform hover:scale-105 duration-500"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/10 rotate-3"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
              >
                <Leaf className="h-8 w-8 text-white" weight="fill" />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {isResetMode ? "Recuperar acesso" : "Bem-vindo de volta"}
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">
              {isResetMode ? "Enviaremos um link para seu e-mail" : "Acesse sua conta para continuar"}
            </p>
          </div>
        </div>

        {/* Card de Login Minimalista */}
        <Card className="border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  E-mail Oficial
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                    <Envelope size={20} weight="bold" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl font-bold focus-visible:ring-primary focus-visible:bg-white transition-all shadow-inner"
                    style={{ '--primary': primaryColor } as any}
                    required
                  />
                </div>
              </div>

              {!isResetMode && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex justify-between items-center px-1">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Chave de Acesso
                    </Label>
                    <button 
                      type="button" 
                      onClick={() => setIsResetMode(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-colors" 
                      style={{ color: primaryColor }}
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                      <Lock size={20} weight="bold" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 pl-12 pr-12 bg-slate-50/50 border-slate-100 rounded-2xl font-bold focus-visible:ring-primary focus-visible:bg-white transition-all shadow-inner"
                      style={{ '--primary': primaryColor } as any}
                      required={!isResetMode}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 border-0"
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 20px 40px -10px ${primaryColor}30`
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isResetMode ? "Enviando..." : "Autenticando..."}
                    </div>
                  ) : (
                    isResetMode ? "Enviar Instruções" : "Entrar no Sistema"
                  )}
                </Button>

                {isResetMode && (
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Voltar para o login
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Minimalista */}
        <div className="text-center pt-4 flex flex-col items-center gap-4">
          <p className="text-slate-300 font-black uppercase text-[9px] tracking-[0.3em]">
            {branding.siteTitle?.split(' - ')[0] || "GeoTrace"} &copy; 2026
          </p>
          <div className="h-px w-12 bg-slate-100" />
        </div>
      </div>
    </div>
  );
};

export default Login;
