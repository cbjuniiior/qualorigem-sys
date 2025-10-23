import { Badge } from "@/components/ui/badge";
import { Stack, User } from "@phosphor-icons/react";

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
}

export const HeroSection = ({ loteData, isBlend, blendComponentsCount, producerName }: HeroSectionProps) => {
  return (
    <div className="relative w-full h-[60vh] min-h-[400px] bg-gray-100 overflow-hidden">
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
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
              <Stack className="h-4 w-4 mr-2" />
              Blend
            </Badge>
          ) : (
            <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-medium">
              <User className="h-4 w-4 mr-2" />
              Individual
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
