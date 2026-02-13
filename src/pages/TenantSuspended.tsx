import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { House, Headset, ChatCircleText } from "@phosphor-icons/react";
import { useTenant } from "@/hooks/use-tenant";
import { useBranding } from "@/hooks/use-branding";

/**
 * Página de Redesign para Tenant Suspenso.
 * Focada no usuário final, mantendo a identidade visual do cliente.
 */
const TenantSuspended = () => {
  const { tenant } = useTenant();
  const { branding } = useBranding();
  const primaryColor = branding?.primaryColor || "#16a34a";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] relative overflow-hidden px-4 py-12">
      {/* Elementos decorativos de fundo */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-5 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="w-full max-w-xl relative z-10">
        {/* Header com Logo */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {branding?.logoUrl ? (
            <div className="mb-10 transition-transform hover:scale-105 duration-500">
              <img 
                src={branding.logoUrl} 
                alt={tenant?.name || "Logo"} 
                className="h-24 w-auto object-contain"
              />
            </div>
          ) : (
            <div 
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl mb-8"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Headset size={48} style={{ color: primaryColor }} weight="duotone" />
            </div>
          )}
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Acesso indisponível
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            <span className="text-slate-800 font-bold">{tenant?.name || "QualOrigem"}</span>
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 sm:p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700 delay-200">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 mb-2">
              <ChatCircleText size={32} weight="duotone" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Ocorreu um imprevisto técnico
            </h2>
            <p className="text-slate-500 leading-relaxed max-w-sm mx-auto">
              Não foi possível carregar as informações desta página no momento. Por favor, solicite ao <strong className="text-slate-700">administrador</strong> que entre em contato com nosso suporte.
            </p>
          </div>

          <div className="pt-4">
            <Button
              asChild
              className="w-full h-14 rounded-2xl font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 15px 30px -8px ${primaryColor}50`
              }}
            >
              <Link to="/" className="flex items-center justify-center gap-3">
                <House size={22} weight="bold" />
                Voltar para o Início
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer Simples */}
        <div className="mt-12 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2026 QualOrigem &bull; Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default TenantSuspended;
