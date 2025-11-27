import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, User, MapPin, Mountains, Thermometer, Images, MapTrifold, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useState, useEffect, useCallback } from "react";
import { SlideshowLightbox } from 'lightbox.js-react';
import useEmblaCarousel from 'embla-carousel-react';

interface Producer {
  id: string;
  name: string;
  property_name: string;
  property_description?: string | null;
  city: string;
  state: string;
  address?: string | null; // Adicionado campo address
  altitude?: number | null;
  average_temperature?: number | null;
  latitude?: string;
  longitude?: string;
  photos?: string[];
}

interface BlendComponent {
  id: string;
  component_percentage: number;
  producers?: Producer;
}

interface ProducersSectionProps {
  isBlend: boolean;
  blendComponents: BlendComponent[];
  producer?: Producer;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const ProducersSection = ({ isBlend, blendComponents, producer, branding }: ProducersSectionProps) => {
  const [activeTab, setActiveTab] = useState("0");
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  if (isBlend) {
    return (
      <div className="mb-12 lg:mb-16">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gray-50">
                <Users className="h-6 w-6 text-gray-700" weight="duotone" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Propriedades dos Produtores</h2>
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
                      {component.producers?.name || `Produtor ${index + 1}`}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            
              {blendComponents.map((component, index) => (
                <TabsContent key={component.id} value={index.toString()} className="mt-0 animate-fade-in">
                  <ProducerDetailsContent 
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
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gray-50">
              <User className="h-6 w-6 text-gray-700" weight="duotone" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Sobre a Fazenda</h2>
          </div>
          <p className="text-gray-500 ml-12 max-w-2xl text-sm sm:text-base">
            Explore a propriedade onde este lote foi cultivado com dedicação e cuidado.
          </p>
        </div>
        
        <div className="p-4 sm:p-8 bg-gray-50/30">
          <ProducerDetailsContent 
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

// Componente auxiliar para o conteúdo dos detalhes do produtor
const ProducerDetailsContent = ({ producer, primaryColor, secondaryColor, accentColor, percentage }: { 
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
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: producer?.photos && producer.photos.length > 4,
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
    if (!emblaApi || !producer?.photos || producer.photos.length <= 4) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);

    return () => clearInterval(autoplay);
  }, [emblaApi, producer?.photos]);

  useEffect(() => {
    if (!producer) return;

    const lat = producer.latitude ? Number(producer.latitude.toString().replace(',', '.')) : 0;
    const lng = producer.longitude ? Number(producer.longitude.toString().replace(',', '.')) : 0;

    if (lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
      setMapCoords({ lat, lng });
    } else if (producer.city || producer.state) {
      // Tentar buscar coordenadas pelo endereço se não tiver latitude/longitude salvas
      setLoadingMap(true);
      
      const fetchCoordinates = async () => {
        try {
          // Tenta primeiro com endereço completo
          const fullQuery = `${producer.address ? producer.address + ', ' : ''}${producer.city ? producer.city + ', ' : ''}${producer.state || ''}, Brazil`;
          let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`);
          let data = await response.json();

          if (data && data.length > 0) {
            setMapCoords({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
            return;
          }

          // Se falhar e tiver endereço específico, tenta apenas Cidade + Estado
          if (producer.address) {
            const cityQuery = `${producer.city ? producer.city + ', ' : ''}${producer.state || ''}, Brazil`;
            response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}`);
            data = await response.json();
            
            if (data && data.length > 0) {
              setMapCoords({ lat: Number(data[0].lat), lng: Number(data[0].lon) });
              return;
            }
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
  }, [producer]);

  if (!producer) return <div className="text-center py-12 text-gray-500">Informações do produtor não disponíveis.</div>;

  return (
    <div className="space-y-8">
      {/* Header da propriedade */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {producer.property_name}
            </h3>
            {percentage !== undefined && (
              <Badge className="bg-gray-900 text-white hover:bg-gray-800">{percentage}% do Blend</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" weight="bold" />
            <span className="font-medium">{producer.name}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {producer.city && producer.state && (
            <InfoBadge icon={<MapPin weight="duotone" />} text={`${producer.city}, ${producer.state}`} color={primaryColor} />
          )}
          {producer.altitude && (
            <InfoBadge icon={<Mountains weight="duotone" />} text={`${producer.altitude}m`} color={secondaryColor} />
          )}
          {producer.average_temperature && (
            <InfoBadge icon={<Thermometer weight="duotone" />} text={`${producer.average_temperature}°C`} color={accentColor} />
          )}
        </div>
      </div>
      
      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Coluna Principal: Descrição */}
        <div className="lg:col-span-8 space-y-8">
          {/* Descrição */}
          {producer.property_description && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {producer.property_description}
              </p>
            </div>
          )}
        </div>
        
        {/* Coluna Lateral: Mapa e Infos Adicionais */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full h-72 md:h-80 lg:h-auto lg:aspect-square rounded-xl overflow-hidden bg-gray-100 min-h-[300px]">
              {/* Forçar altura mínima e posicionamento absoluto para garantir renderização */}
              {mapCoords && (
                <div className="absolute inset-0 w-full h-full z-0">
                  <iframe
                    title={`Mapa de ${producer.property_name}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.01}%2C${mapCoords.lat - 0.01}%2C${mapCoords.lng + 0.01}%2C${mapCoords.lat + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lng}`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              {loadingMap ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center relative z-10 bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                  <span className="text-sm">Carregando mapa...</span>
                </div>
              ) : mapCoords ? (
                <>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-white text-gray-900 px-3 py-1.5 rounded-lg shadow-md text-xs font-bold transition hover:bg-gray-50 flex items-center gap-1.5 z-10"
                  >
                    <MapTrifold className="w-4 h-4" weight="duotone" />
                    Ver no Google Maps
                  </a>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center relative z-10 bg-gray-100">
                  <MapPin className="w-8 h-8 mb-2 opacity-50" weight="duotone" />
                  <span className="text-sm">Localização exata não disponível</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Galeria - 100% width */}
      {producer.photos && producer.photos.length > 0 && (
        <div className="w-full group/gallery">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-900 font-semibold">
              <Images className="w-5 h-5 text-gray-500" weight="duotone" />
              <h4>Galeria da Propriedade</h4>
            </div>
            
            {/* Controles de Navegação */}
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
              {producer.photos.map((photo, idx) => (
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
                      alt={`${producer.property_name} ${idx + 1}`}
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
            images={producer.photos.map(src => ({ src, alt: producer.property_name }))}
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

// Componente auxiliar para badges de informação
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
    <span className="text-sm font-semibold text-gray-700">{text}</span>
  </div>
);
