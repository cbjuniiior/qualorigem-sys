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
    <div className="relative w-full h-[60vh] min-h-[400px] bg-gray-100 overflow-hidden">
      {/* Logo no topo esquerdo */}
      {logoUrl && (
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-10 sm:h-12 object-contain max-w-[200px] bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"
          />
        </div>
      )}
      {/* Imagem de fundo com overlay sutil */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${loteData?.image_url || '/placeholder.svg'})`,
          filter: 'brightness(0.4)'
        }}
      />
       
      {/* Overlay minimalista */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/20 to-transparent"></div>
       
      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
        {/* Badge do tipo de lote */}
        <div className="mb-6">
          {isBlend ? (
            <Badge 
              className="text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: accentColor }}
            >
              BLEND
            </Badge>
          ) : (
            <Badge 
              className="text-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: primaryColor }}
            >
              INDIVIDUAL
            </Badge>
          )}
        </div>
        
        {/* Título principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
          {loteData?.name}
        </h1>
        
        {/* Subtítulo */}
        <p className="text-lg sm:text-xl text-white/80 font-light mb-6 max-w-2xl">
          {isBlend 
            ? `${blendComponentsCount} produtor${blendComponentsCount > 1 ? 'es' : ''} • Safra ${loteData.harvest_year}`
            : `${producerName} • Safra ${loteData.harvest_year}`
          }
        </p>
        
        {/* Código do lote */}
        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <span className="text-white/90 font-mono text-sm">
            {loteData?.code}
          </span>
        </div>
      </div>
    </div>
  );
};
