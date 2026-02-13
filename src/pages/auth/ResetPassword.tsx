import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle, Leaf } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { useTenant } from "@/hooks/use-tenant";
import { toast } from "sonner";
import { authApi } from "@/services/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { branding } = useBranding();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const { tenantSlug } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      await authApi.updatePassword(password);
      toast.success("Senha atualizada com sucesso!");
      const slug = tenant?.slug ?? tenantSlug ?? '';
      navigate(slug ? `/${slug}/auth/login` : '/');
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = branding.primaryColor || '#16a34a';
  const secondaryColor = branding.secondaryColor || '#22c55e';
  const currentSlug = tenant?.slug ?? tenantSlug ?? '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ backgroundColor: secondaryColor }} />

      <div className="w-full max-w-md space-y-10 animate-in fade-in zoom-in-95 duration-700 relative z-10">
        
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center gap-6">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt="Logo" 
                className="h-24 md:h-28 object-contain drop-shadow-xl"
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Nova Senha</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">Defina sua nova chave de acesso</p>
          </div>
        </div>

        <Card className="border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Nova Senha
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                    <Lock size={20} weight="bold" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl font-bold focus-visible:ring-primary focus-visible:bg-white transition-all shadow-inner"
                    style={{ '--primary': primaryColor } as any}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Confirmar Senha
                </Label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                    <CheckCircle size={20} weight="bold" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="h-14 pl-12 bg-slate-50/50 border-slate-100 rounded-2xl font-bold focus-visible:ring-primary focus-visible:bg-white transition-all shadow-inner"
                    style={{ '--primary': primaryColor } as any}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 border-0"
                style={{ 
                  backgroundColor: primaryColor,
                  boxShadow: `0 20px 40px -10px ${primaryColor}30`
                }}
                disabled={loading}
              >
                {loading ? "Atualizando..." : "Redefinir Senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center pt-4 flex flex-col items-center gap-4">
          <Link 
            to={currentSlug ? `/${currentSlug}/auth/login` : '/'}
            className="inline-flex items-center text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] gap-2 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={14} weight="bold" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
