import { Badge } from "@/components/ui/badge";
import { Fingerprint, CaretDown } from "@phosphor-icons/react";

interface HeroSectionProps {
  loteData: {
    name: string;
    code: string;
    image_url: string | null;
    harvest_year: string;
    youtube_video_url?: string | null;
  };
  isBlend: boolean;
  blendComponentsCount: number;
  producerName?: string;
  onScrollToContent?: () => void;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
    headerImageUrl?: string | null;
  };
}

export const HeroSection = ({ loteData, isBlend, blendComponentsCount, producerName, onScrollToContent, branding }: HeroSectionProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#2563eb';
  const logoUrl = branding?.logoUrl;
  const headerImageUrl = branding?.headerImageUrl || loteData?.image_url;
  
  return (
    <div className="relative w-full min-h-[80vh] md:min-h-[90vh] bg-black overflow-hidden font-sans flex flex-col">
      {/* 1. Background Dinâmico com Parallax e Zoom suave */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center scale-110 animate-[slowZoom_20s_infinite_alternate]"
        style={{
          backgroundImage: `url(${headerImageUrl || '/placeholder.svg'})`,
          filter: 'brightness(0.3) contrast(1.2) saturate(0.8)'
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
       
      {/* 4. Container Principal */}
      <div className="relative z-10 flex-1 flex flex-col container mx-auto px-4 sm:px-6 max-w-7xl py-8 sm:py-12 md:py-20">
        
        {/* Topo - Logo Premium */}
        <div className="flex justify-center opacity-0 animate-[fadeIn_1s_ease-out_forwards] mb-12">
          {logoUrl ? (
            <div className="relative group cursor-pointer">
              <div 
                className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-1000 rounded-full scale-150"
                style={{ backgroundColor: primaryColor }}
              />
              <img
                src={logoUrl}
                alt="Logo"
                className="h-20 sm:h-28 md:h-36 object-contain filter brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10 transition-all duration-700 hover:scale-105"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          )}
        </div>

        {/* Centro - Epicenter do Conteúdo */}
        <div className="flex-1 flex flex-col justify-center items-center py-8 md:py-12">
          <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
            
            {/* Badge de Verificação de Origem */}
            <div className="mb-8 opacity-0 animate-[fadeIn_1s_ease-out_0.3s_forwards]">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <div className="flex -space-x-2">
                  <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center overflow-hidden" style={{ backgroundColor: primaryColor }}>
                    <Fingerprint size={12} className="text-white" />
                  </div>
                </div>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-white/90">
                  {isBlend ? 'Composição Blend' : 'Origem Controlada'}
                </span>
              </div>
            </div>
            
            {/* Título Principal Imponente */}
            <div className="relative mb-8 opacity-0 animate-[fadeInUp_1.2s_ease-out_0.5s_forwards]">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {loteData?.name}
              </h1>
              
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">Responsável</span>
                    <span className="text-lg md:text-2xl font-bold text-white tracking-tight">
                      {isBlend ? `${blendComponentsCount} Produtores` : producerName}
                    </span>
                  </div>
                  
                  <div className="w-12 h-px bg-white/10 sm:w-px sm:h-10"></div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/40 mb-1">Temporada</span>
                    <span className="text-lg md:text-2xl font-bold text-white tracking-tight">
                      Safra {loteData.harvest_year}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rodapé - Interação e Identidade do Lote */}
        <div className="mt-auto pt-12 flex flex-col items-center gap-10 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards]">
          
          {/* Botão de Scroll Convite */}
          <button 
            onClick={onScrollToContent}
            className="flex flex-col items-center gap-3 group transition-all duration-500 hover:translate-y-1"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full border border-white/20 scale-150 animate-ping opacity-20" />
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 group-hover:bg-white/10 transition-colors">
                <CaretDown size={24} className="text-white/60 group-hover:text-white transition-all duration-500" />
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white/70 transition-colors">
              Explorar Origem
            </span>
          </button>

          {/* Tag de Identificação Estilo Selo de Segurança */}
          <div className="group relative">
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4 bg-white/[0.03] backdrop-blur-3xl rounded-2xl px-6 py-3 border border-white/5 shadow-2xl transition-all duration-500 hover:border-white/20">
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5">Autenticidade</span>
                <span className="text-xs md:text-sm text-white font-mono font-bold tracking-[0.2em] uppercase">
                  #{loteData?.code}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10 mx-1"></div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/80 transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110 shadow-inner"
                style={{ backgroundColor: `${primaryColor}15`, border: `1px solid ${primaryColor}30` }}
              >
                <Fingerprint size={22} weight="duotone" />
              </div>
            </div>
          </div>
        </div>
      </div>

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
