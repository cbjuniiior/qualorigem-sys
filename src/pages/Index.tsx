import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, ArrowRight, Leaf, ShieldCheck, Binoculars, Tree } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { systemConfigApi } from "@/services/api";

const Index = () => {
  const [searchCode, setSearchCode] = useState("");
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
      } catch (error) {
        console.error("Erro ao carregar branding:", error);
      }
    };
    loadBranding();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      toast.error("Digite o código do lote");
      return;
    }
    navigate(`/lote/${searchCode.trim()}`);
  };

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div 
      className="min-h-screen flex flex-col bg-gray-50/30 transition-colors duration-500"
      style={{ borderTop: `6px solid ${primaryColor}` }}
    >
      {/* Header Minimalista */}
      <header className="w-full py-6 px-6 flex justify-end">
        {/* Botões do header removidos conforme solicitado */}
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 -mt-10">
        <div className="w-full max-w-2xl flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-700">
          
          {/* Logo ou Título */}
          <div className="flex flex-col items-center gap-6">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt="Logo" 
                className="h-24 md:h-36 object-contain drop-shadow-sm transition-all duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl shadow-green-900/5" 
                  style={{ backgroundColor: primaryColor }}
                >
                  <Leaf className="h-10 w-10 text-white" weight="fill" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">GeoTrace</h1>
              </div>
            )}
            
            {!branding?.logoUrl && (
              <p className="text-center text-gray-500 text-xl font-light max-w-md leading-relaxed">
                Rastreabilidade e transparência para produtos de origem garantida.
              </p>
            )}
          </div>

          {/* Campo de Busca */}
          <div className="w-full max-w-lg relative group">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors duration-300 group-focus-within:text-gray-600">
                <MagnifyingGlass className="h-6 w-6 text-gray-400" weight="bold" />
              </div>
              <input
                type="text"
                className="w-full h-20 pl-16 pr-20 rounded-full bg-white border-0 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05),0_15px_30px_-5px_rgba(0,0,0,0.02)] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 text-xl font-medium"
                style={{ 
                  '--tw-ring-focus': primaryColor,
                  '--ring-color': primaryColor 
                } as React.CSSProperties}
                onFocus={(e) => e.currentTarget.style.boxShadow = `0 8px 30px -5px ${primaryColor}15, 0 20px 40px -5px rgba(0,0,0,0.05)`}
                onBlur={(e) => e.currentTarget.style.boxShadow = ''}
                placeholder="Digite o código do lote..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-3 bottom-3 aspect-square rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg"
                style={{ backgroundColor: primaryColor }}
                disabled={!searchCode.trim()}
              >
                <ArrowRight className="h-6 w-6" weight="bold" />
              </button>
            </form>
          </div>

          {/* Cards de Destaque - "Preenchimento" Minimalista */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.5s_forwards]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Binoculars className="h-6 w-6" weight="duotone" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Rastreabilidade Total</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Do plantio à colheita, acompanhe cada etapa da jornada do produto.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
              >
                <ShieldCheck className="h-6 w-6" weight="duotone" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Origem Certificada</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Garantia de procedência e qualidade superior em cada lote.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                <Tree className="h-6 w-6" weight="duotone" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sustentabilidade</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Compromisso com práticas que respeitam o meio ambiente.</p>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="py-8 text-center border-t border-gray-100 mt-auto bg-white/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-400 text-xs font-medium tracking-wide uppercase">
            Feito por Viva Soluções
          </p>
          <Button 
            variant="link" 
            size="sm"
            className="text-gray-300 hover:text-gray-500 h-auto p-0 text-[10px]"
            onClick={() => navigate("/admin")}
          >
            Acesso Administrativo
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Index;
