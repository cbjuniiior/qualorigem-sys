import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeSlash, Lock, Envelope, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { usePlatformBranding } from "@/hooks/use-platform-branding";
import { toast } from "sonner";

const PlatformLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  usePlatformBranding();

  const from = (location.state as any)?.from?.pathname || "/platform";

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [loading, user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await signIn(email, password);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1520] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos Decorativos */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none bg-lime-500" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-15 pointer-events-none bg-lime-400" />
      <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-5 pointer-events-none bg-white" />

      <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-lime-500/30 rotate-3 bg-lime-400">
              <ShieldCheck className="h-10 w-10 text-slate-900" weight="fill" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white tracking-tight">
              Painel da Plataforma
            </h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              Acesso restrito a administradores
            </p>
          </div>
        </div>

        {/* Card de Login */}
        <Card className="border border-slate-600/60 shadow-[0_24px_48px_rgba(0,0,0,0.4)] bg-slate-800/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  E-mail do Administrador
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors">
                    <Envelope size={20} weight="bold" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-900/50 border-slate-600/50 rounded-2xl font-bold text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:bg-slate-900 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Senha
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors">
                    <Lock size={20} weight="bold" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 pr-12 bg-slate-900/50 border-slate-600/50 rounded-2xl font-bold text-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:bg-slate-900 transition-all"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlash size={20} weight="bold" /> : <Eye size={20} weight="bold" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-14 text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-lime-500/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 border-0 bg-lime-400 hover:bg-lime-300 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                      Autenticando...
                    </div>
                  ) : (
                    "Acessar Plataforma"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-4 flex flex-col items-center gap-4">
          <p className="text-slate-500 font-black uppercase text-[9px] tracking-[0.3em]">
            QualOrigem Platform &copy; 2026
          </p>
          <div className="h-px w-12 bg-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default PlatformLogin;
