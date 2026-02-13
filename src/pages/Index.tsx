import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, ArrowRight, Leaf, ShieldCheck, Binoculars, Tree, Fingerprint, WarningCircle, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { productLotsApi } from "@/services/api";
import { useBranding } from "@/hooks/use-branding";
import { useTenant } from "@/hooks/use-tenant";

const Index = () => {
  const [searchCode, setSearchCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { branding } = useBranding();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    const code = searchCode.trim().toUpperCase();
    
    if (!code) return;

    setLoading(true);
    setNotFound(false);

    try {
      // Verificar se o lote existe antes de navegar
      const lot = await productLotsApi.getByCode(code, tenant.id);
      if (lot) {
        navigate(`/${tenant.slug}/lote/${code}`);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#2563eb';
  const headerImageUrl = branding?.headerImageUrl;

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-black overflow-hidden font-sans">
      {/* 1. Background Dinâmico com Parallax e Zoom suave */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center scale-110 animate-[slowZoom_20s_infinite_alternate]"
        style={{
          backgroundImage: `url(${headerImageUrl || '/placeholder.svg'})`,
          filter: 'brightness(0.25) contrast(1.2) saturate(0.8)'
        }}
      />
       
      {/* 2. Overlays de Profundidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
      
      {/* 3. Brilho Periférico Dinâmico (Glow) */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] blur-[120px] opacity-20 rounded-full"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] blur-[100px] opacity-10 rounded-full"
        style={{ backgroundColor: secondaryColor }}
      />

      {/* Conteúdo Central */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="w-full max-w-4xl flex flex-col items-center gap-12 text-center">
          
          {/* Logo Premium */}
          <div className="flex flex-col items-center gap-8 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
            {branding?.logoUrl ? (
              <div className="relative group">
                <div 
                  className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000 rounded-full scale-150"
                  style={{ backgroundColor: primaryColor }}
                />
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="h-24 md:h-32 object-contain filter brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10 transition-all duration-700 hover:scale-105" 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl" 
                  style={{ backgroundColor: primaryColor }}
                >
                  <Leaf className="h-10 w-10 text-white" weight="fill" />
                </div>
              </div>
            )}
            
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight drop-shadow-2xl">
                {branding?.siteTitle || "GeoTrace"}
              </h1>
              <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed max-w-lg mx-auto">
                {branding?.siteDescription || "Rastreabilidade e transparência para produtos de origem garantida."}
              </p>
            </div>
          </div>

          {/* Campo de Busca e Mensagens de Erro */}
          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            <div className="w-full relative group opacity-0 animate-[fadeInUp_1s_ease-out_0.3s_forwards]">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none transition-colors duration-300">
                  <MagnifyingGlass className="h-6 w-6 text-white/30" weight="bold" />
                </div>
                <input
                  type="text"
                  className={`w-full h-20 pl-16 pr-20 rounded-[2rem] bg-white/10 backdrop-blur-3xl border shadow-2xl text-white placeholder:text-white/30 focus:outline-none focus:ring-4 transition-all duration-500 text-xl font-bold uppercase tracking-widest ${
                    notFound ? 'border-rose-500/50 ring-rose-500/10' : 'border-white/10 focus:ring-white/5'
                  }`}
                  style={{ 
                    '--tw-ring-focus': notFound ? hexToRgba('#f43f5e', 0.2) : hexToRgba(primaryColor, 0.2),
                  } as any}
                  placeholder="DIGITE O CÓDIGO"
                  value={searchCode}
                  onChange={(e) => {
                    setSearchCode(e.target.value);
                    if (notFound) setNotFound(false);
                  }}
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-3 bottom-3 aspect-square rounded-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                  disabled={!searchCode.trim() || loading}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="h-6 w-6" weight="bold" />
                  )}
                </button>
              </form>

              {/* Card de Erro - Lote não encontrado */}
              {notFound && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 rounded-2xl p-4 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                      <WarningCircle size={24} weight="fill" className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-black text-sm uppercase tracking-wider">Código Inválido</h4>
                      <p className="text-rose-200/70 text-xs font-bold leading-tight">O lote <span className="text-white">#{searchCode.toUpperCase()}</span> não foi encontrado em nossa base de dados.</p>
                    </div>
                    <button 
                      onClick={() => setNotFound(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={16} className="text-white/40" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Badge de Sugestão */}
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 opacity-0 animate-[fadeIn_1s_ease-out_0.6s_forwards]">
              <Fingerprint size={16} className="text-white/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Insira o código do rótulo para rastrear</span>
            </div>
          </div>

          {/* Cards de Destaque Premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12 opacity-0 animate-[fadeInUp_1s_ease-out_0.8s_forwards]">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-500 group shadow-2xl">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-xl group-hover:scale-110"
                style={{ backgroundColor: hexToRgba(primaryColor, 0.2), color: primaryColor }}
              >
                <Binoculars className="h-7 w-7" weight="duotone" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 uppercase tracking-tight">Rastreabilidade</h3>
              <p className="text-sm text-white/50 font-medium leading-relaxed">Acompanhe a jornada completa do seu produto desde a origem.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-500 group shadow-2xl">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-xl group-hover:scale-110"
                style={{ backgroundColor: hexToRgba(secondaryColor, 0.2), color: secondaryColor }}
              >
                <ShieldCheck className="h-7 w-7" weight="duotone" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 uppercase tracking-tight">Certificação</h3>
              <p className="text-sm text-white/50 font-medium leading-relaxed">Garantia de procedência e qualidade superior em cada detalhe.</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col items-center text-center hover:bg-white/15 transition-all duration-500 group shadow-2xl">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-xl group-hover:scale-110"
                style={{ backgroundColor: hexToRgba(accentColor, 0.2), color: accentColor }}
              >
                <Tree className="h-7 w-7" weight="duotone" />
              </div>
              <h3 className="font-black text-white text-lg mb-2 uppercase tracking-tight">Consciência</h3>
              <p className="text-sm text-white/50 font-medium leading-relaxed">Compromisso com práticas sustentáveis e transparentes.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="relative z-10 py-10 text-center mt-auto">
        <div className="flex flex-col items-center gap-4">
          <p className="text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">
            Plataforma de Rastreabilidade Premium
          </p>
          <div className="flex items-center gap-6">
            <Button 
              variant="link" 
              size="sm"
              className="text-white/30 hover:text-white/60 h-auto p-0 text-[10px] font-bold uppercase tracking-widest transition-colors"
              onClick={() => navigate(tenant?.slug ? `/${tenant.slug}/auth/login` : '/')}
            >
              Acesso Restrito
            </Button>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Viva Soluções
            </p>
          </div>
        </div>
      </footer>

      {/* Estilos Globais para as Animações */}
      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Index;
