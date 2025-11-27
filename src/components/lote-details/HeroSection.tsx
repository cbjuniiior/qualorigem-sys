import { Badge } from "@/components/ui/badge";

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
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  };
}

export const HeroSection = ({ loteData, isBlend, blendComponentsCount, producerName, branding }: HeroSectionProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const accentColor = branding?.accentColor || '#2563eb';
  const logoUrl = branding?.logoUrl;
  
  return (
    <div className="relative w-full h-[40vh] min-h-[350px] md:h-[65vh] md:min-h-[560px] bg-gray-900 overflow-hidden">
      {/* Imagem de fundo com efeito parallax sutil */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center scale-105 transition-transform duration-[20s] ease-out"
        style={{
          backgroundImage: `url(${loteData?.image_url || '/placeholder.svg'})`,
          filter: 'brightness(0.4) saturate(1.05) contrast(1.1)'
        }}
      />
       
      {/* Overlay com múltiplas camadas para profundidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/70"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
       
      {/* Container principal */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Conteúdo central */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Logo com espaçamento refinado */}
            {logoUrl && (
              <div className="mb-6 sm:mb-10 opacity-0 animate-[fadeIn_0.8s_ease-out_0.1s_forwards]">
                <div className="relative">
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-28 sm:h-32 md:h-36 object-contain max-w-[280px] sm:max-w-[320px] mx-auto filter drop-shadow-lg"
                  />
                </div>
              </div>
            )}
            
            {/* Badge com design refinado */}
            <div className="mb-6 sm:mb-8 opacity-0 animate-[fadeIn_0.8s_ease-out_0.3s_forwards]">
              {isBlend ? (
                <Badge 
                  className="text-white px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full border-0 shadow-lg"
                  style={{ 
                    backgroundColor: accentColor,
                    letterSpacing: '0.1em'
                  }}
                >
                  BLEND
                </Badge>
              ) : (
                <Badge 
                  className="text-white px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] rounded-full border-0 shadow-lg"
                  style={{ 
                    backgroundColor: primaryColor,
                    letterSpacing: '0.1em'
                  }}
                >
                  INDIVIDUAL
                </Badge>
              )}
            </div>
            
            {/* Título principal com tipografia refinada */}
            <div className="text-center mb-8 sm:mb-10 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.5s_forwards]">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-light text-white leading-[1.1] tracking-[-0.02em] mb-4 sm:mb-6">
                <span className="font-medium">{loteData?.name}</span>
              </h1>
              
              {/* Informações secundárias com separador elegante */}
              <div className="flex flex-col items-center space-y-2">
                <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-white/95">
                  <span className="text-sm sm:text-lg font-normal whitespace-nowrap">
                    {isBlend 
                      ? `${blendComponentsCount} produtor${blendComponentsCount > 1 ? 'es' : ''}`
                      : producerName
                    }
                  </span>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-white/40"></span>
                  <span className="text-sm sm:text-lg font-light text-white/85 whitespace-nowrap">
                    Safra {loteData.harvest_year}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Seção inferior - Código com design elegante */}
        <div className="pb-8 sm:pb-12 px-4 sm:px-6 opacity-0 animate-[fadeIn_0.8s_ease-out_0.7s_forwards]">
          <div className="w-full max-w-3xl mx-auto flex justify-center">
            <div className="group inline-flex items-center gap-2.5 bg-white/[0.08] backdrop-blur-md rounded-full px-3 py-1.5 sm:px-4 sm:py-2 border border-white/10 hover:bg-white/[0.12] hover:border-white/20 transition-all duration-300 shadow-lg">
              <span className="text-[8px] sm:text-[9px] text-white/50 font-medium uppercase tracking-[0.15em] leading-none">
                Código
              </span>
              <span className="w-px h-3 bg-white/20 group-hover:bg-white/30 transition-colors duration-300"></span>
              <span className="text-[10px] sm:text-xs text-white/95 font-mono font-medium tracking-wider">
                {loteData?.code}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
