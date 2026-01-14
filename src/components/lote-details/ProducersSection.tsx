import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, User, MapPin, Mountains, Thermometer, Images, MapTrifold, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useState, useEffect, useCallback } from "react";
import { SlideshowLightbox } from 'lightbox.js-react';
import useEmblaCarousel from 'embla-carousel-react';

interface PropertyInfo {
  property_name?: string | null;
  property_description?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  altitude?: number | null;
  average_temperature?: number | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  photos?: string[] | null;
  address_internal_only?: boolean | null;
}

interface Producer extends PropertyInfo {
  id: string;
  name: string;
  profile_picture_url?: string | null;
}

interface BlendComponent extends PropertyInfo {
  id: string;
  component_percentage: number;
  producers?: Producer;
}

interface ProducersSectionProps {
  isBlend: boolean;
  blendComponents: BlendComponent[];
  producer?: Producer;
  loteData?: PropertyInfo;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const ProducersSection = ({ isBlend, blendComponents, producer, loteData, branding }: ProducersSectionProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  if (isBlend) {
    return (
      <div className="mb-12 lg:mb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gray-50">
                <Users className="h-6 w-6 text-gray-700" weight="duotone" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Origens da Mistura</h2>
            </div>
            <p className="text-gray-500 ml-12 max-w-2xl text-sm sm:text-base">
              Conheça a origem de cada parte deste blend e as histórias por trás de quem produz.
            </p>
          </div>
          
          <div className="p-4 sm:p-8 bg-gray-50/30">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap w-full justify-start gap-2 mb-6 sm:mb-8 bg-transparent p-0 h-auto">
                {blendComponents.map((component, index) => (
                  <TabsTrigger 
                    key={component.id} 
                    value={index.toString()}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border border-gray-200 bg-white text-gray-600 data-[state=active]:border-transparent data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                    style={{ 
                      backgroundColor: activeTab === index.toString() ? primaryColor : undefined,
                      borderColor: activeTab === index.toString() ? primaryColor : undefined
                    }}
                  >
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${activeTab === index.toString() ? 'bg-white' : 'bg-gray-300'}`}></div>
                    <span className="truncate max-w-[120px] sm:max-w-[150px]">
                      {component.producers?.name || `Origem ${index + 1}`}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            
              {blendComponents.map((component, index) => (
                <TabsContent key={component.id} value={index.toString()} className="mt-0 animate-fade-in">
                  <ProducerDetailsContent 
                    data={component} 
                    producer={component.producers}
                    primaryColor={primaryColor} 
                    secondaryColor={secondaryColor} 
                    accentColor={accentColor}
                    percentage={component.component_percentage}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  // Seção para produtor individual
  return (
    <div className="mb-12 lg:mb-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100 text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gray-50">
              <User className="h-6 w-6 text-gray-700" weight="duotone" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Sobre a Origem</h2>
          </div>
          <p className="text-gray-500 ml-12 max-w-2xl text-sm sm:text-base">
            Explore a propriedade onde este lote foi cultivado com dedicação e cuidado.
          </p>
        </div>
        
        <div className="p-4 sm:p-8 bg-gray-50/30">
          <ProducerDetailsContent 
            data={loteData || producer} 
            producer={producer}
            primaryColor={primaryColor} 
            secondaryColor={secondaryColor} 
            accentColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
};

const ProducerDetailsContent = ({ data, producer, primaryColor, secondaryColor, accentColor, percentage }: { 
  data?: PropertyInfo, 
  producer?: Producer,
  primaryColor: string, 
  secondaryColor: string, 
  accentColor: string,
  percentage?: number 
}) => {
  const [mapCoords, setMapCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: data?.photos && data.photos.length > 4,
    align: 'start',
    containScroll: 'trimSnaps'
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !data?.photos || data.photos.length <= 4) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(autoplay);
  }, [emblaApi, data?.photos]);

  useEffect(() => {
    if (!data) return;

    const lat = data.latitude ? Number(data.latitude.toString().replace(',', '.')) : 0;
    const lng = data.longitude ? Number(data.longitude.toString().replace(',', '.')) : 0;

    if (lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
      setMapCoords({ lat, lng });
    } else if (data.city || data.state) {
      setLoadingMap(true);
      
      const fetchCoordinates = async () => {
        try {
          const fullQuery = `${data.address ? data.address + ', ' : ''}${data.city ? data.city + ', ' : ''}${data.state || ''}, Brazil`;
          let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`);
          let resData = await response.json();

          if (resData && resData.length > 0) {
            setMapCoords({ lat: Number(resData[0].lat), lng: Number(resData[0].lon) });
            return;
          }
          
          setMapCoords(null);
        } catch (err) {
          console.error("Erro ao buscar coordenadas:", err);
          setMapCoords(null);
        } finally {
          setLoadingMap(false);
        }
      };

      fetchCoordinates();
    } else {
      setMapCoords(null);
    }
  }, [data]);

  const photos = data?.photos || [];
  const propertyName = data?.property_name || producer?.property_name || 'Propriedade não informada';
  const propertyDescription = data?.property_description || producer?.property_description || '';

  return (
    <div className="space-y-10 text-left">
      {/* 1. Responsável pela Produção - Design Premium */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
        
        <div className="relative flex flex-row items-start gap-6 sm:gap-8">
          {/* Foto Proeminente do Produtor */}
          <div className="relative flex-shrink-0">
            <div 
              className="w-24 h-24 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-white shadow-2xl transition-transform duration-500"
              style={{ boxShadow: `0 20px 40px -12px ${hexToRgba(primaryColor, 0.2)}` }}
            >
              {producer?.profile_picture_url ? (
                <img src={producer.profile_picture_url} alt={producer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <User size={48} weight="duotone" className="text-slate-300" />
                </div>
              )}
            </div>
            <div 
              className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center border-2 sm:border-4 border-white shadow-lg text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <User size={18} weight="fill" className="sm:hidden" />
              <User size={24} weight="fill" className="hidden sm:block" />
            </div>
          </div>

          <div className="flex-1 text-left pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-50 text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3">
              Produtor Responsável
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-3 sm:mb-6 tracking-tight">
              {producer?.name || 'Produtor não informado'}
            </h3>
            
            <div className="flex flex-wrap justify-start gap-2 sm:gap-3">
              {data?.city && data?.state && (
                <InfoBadge icon={<MapPin weight="fill" />} text={`${data.city}, ${data.state}`} color={primaryColor} />
              )}
              {percentage !== undefined && (
                <div className="px-4 py-2 rounded-xl bg-gray-900 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200">
                  {percentage}% do Blend
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 2. Grid de Conteúdo - Descrição e Mapa (Largura Total) */}
      <div className="grid grid-cols-1 gap-8 items-stretch">
        <div className="w-full flex flex-col space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-slate-50" style={{ color: primaryColor }}>
                <MapTrifold size={24} weight="duotone" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Sobre a Propriedade</h4>
            </div>
            
            {propertyDescription ? (
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base flex-1">
                {propertyDescription}
              </p>
            ) : (
              <p className="text-slate-400 italic text-xs flex-1">
                Nenhuma descrição disponível para esta propriedade.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
              {data?.altitude && (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Altitude</p>
                  <p className="text-lg font-black text-slate-900">{data.altitude}m</p>
                </div>
              )}
              {data?.average_temperature && (
                <div className="space-y-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temperatura</p>
                  <p className="text-lg font-black text-slate-900">{data.average_temperature}°C</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm h-full min-h-[300px] sm:min-h-[400px] relative group/map">
            <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-50 border-2 border-white shadow-inner">
              {mapCoords && (
                <iframe
                  title={`Mapa de ${propertyName}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="absolute inset-0 w-full h-full grayscale-[0.2] contrast-[1.1] brightness-[1.02]"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.01}%2C${mapCoords.lat - 0.01}%2C${mapCoords.lng + 0.01}%2C${mapCoords.lat + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lng}`}
                  allowFullScreen
                ></iframe>
              )}
              
              {!mapCoords && !loadingMap && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 p-8 text-center bg-slate-50">
                  <MapPin size={48} weight="thin" className="mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">Localização exata<br/>não informada</p>
                </div>
              )}

              {loadingMap && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-400 rounded-full animate-spin"></div>
                </div>
              )}

              {mapCoords && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-xl shadow-xl text-xs font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2 z-10 border border-white"
                >
                  <MapTrifold size={18} weight="fill" style={{ color: primaryColor }} />
                  GOOGLE MAPS
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Galeria */}
      {photos.length > 0 && (
        <div className="w-full group/gallery">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Images className="w-5 h-5 text-gray-500" weight="duotone" />
              <h4>Galeria da Propriedade</h4>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={scrollPrev}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                aria-label="Foto anterior"
              >
                <CaretLeft className="w-4 h-4" weight="bold" />
              </button>
              <button 
                onClick={scrollNext}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                aria-label="Próxima foto"
              >
                <CaretRight className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </div>
          
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4">
              {photos.map((photo, idx) => (
                <div 
                  key={idx} 
                  className="flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 pl-4"
                >
                  <div 
                    className="relative aspect-video rounded-2xl overflow-hidden shadow-sm group cursor-pointer border border-gray-100"
                    onClick={() => {
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={photo}
                      alt={`${propertyName} ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Images className="text-white w-8 h-8 drop-shadow-lg" weight="duotone" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SlideshowLightbox
            images={photos.map(src => ({ src, alt: propertyName }))}
            showThumbnails={true} 
            open={lightboxOpen} 
            startingSlideIndex={lightboxIndex} 
            onClose={() => setLightboxOpen(false)}
            theme="day"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

const InfoBadge = ({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) => (
  <div 
    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors"
    style={{ 
      backgroundColor: `${color}08`, 
      borderColor: `${color}20`,
      color: color 
    }}
  >
    <div className="w-4 h-4">{icon}</div>
    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">{text}</span>
  </div>
);
