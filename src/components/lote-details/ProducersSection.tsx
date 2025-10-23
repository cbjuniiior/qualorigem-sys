import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, User, MapPin, Mountains, Thermometer } from "@phosphor-icons/react";
import { useState } from "react";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  property_description?: string | null;
  city: string;
  state: string;
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
}

export const ProducersSection = ({ isBlend, blendComponents, producer }: ProducersSectionProps) => {
  const [activeTab, setActiveTab] = useState("0");

  if (isBlend) {
    return (
      <div className="mb-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
              <Users className="h-6 w-6 mr-3 text-gray-600" />
              Propriedades dos Produtores
            </h2>
            <p className="text-gray-600">
              Explore as propriedades de cada produtor que contribuiu para este blend
            </p>
          </div>
          
          <div className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8 bg-gray-100 p-1 rounded-xl">
                {blendComponents.map((component, index) => (
                  <TabsTrigger 
                    key={component.id} 
                    value={index.toString()}
                    className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="truncate">
                        {component.producers?.name || `Produtor ${index + 1}`}
                      </span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            
              {blendComponents.map((component, index) => (
                <TabsContent key={component.id} value={index.toString()} className="mt-0">
                  <div className="space-y-8">
                    {/* Header da propriedade */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {component.producers?.property_name || 'Propriedade não informada'}
                          </h3>
                          <p className="text-gray-600">
                            Produtor: <span className="font-medium text-gray-900">{component.producers?.name || 'Nome não informado'}</span>
                          </p>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          {component.component_percentage}%
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Badges da propriedade */}
                    <div className="flex flex-wrap gap-3">
                      {component.producers?.city && component.producers?.state && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{component.producers.city}, {component.producers.state}</span>
                        </div>
                      )}
                      {component.producers?.altitude && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <Mountains className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{component.producers.altitude}m</span>
                        </div>
                      )}
                      {component.producers?.average_temperature && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                          <Thermometer className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{component.producers.average_temperature}°C</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Descrição da propriedade */}
                    {component.producers?.property_description && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Sobre a Propriedade</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {component.producers.property_description}
                        </p>
                      </div>
                    )}
                    
                    {/* Galeria e Mapa da propriedade */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Galeria de imagens */}
                      {component.producers?.photos?.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Galeria de Fotos</h4>
                          <div className="relative w-full aspect-video rounded-xl shadow-lg bg-white overflow-hidden group">
                            <img
                              src={component.producers.photos[0]}
                              alt={`Foto da propriedade ${component.producers.name}`}
                              className="object-cover w-full h-full cursor-zoom-in transition-transform duration-200 hover:scale-105 rounded-xl"
                              loading="lazy"
                            />
                          </div>
                          {/* Miniaturas */}
                          <div className="flex gap-2 mt-4">
                            {component.producers.photos.slice(0, 4).map((photo: string, idx: number) => (
                              <img
                                key={idx}
                                src={photo}
                                alt={`Miniatura ${idx + 1}`}
                                className="h-12 w-16 object-cover rounded-lg border-2 border-transparent opacity-70 hover:opacity-100 cursor-pointer shadow-sm"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Mapa da propriedade */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Localização no Mapa</h4>
                        <div className="w-full h-64 relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
                          {component.producers?.latitude && component.producers?.longitude ? (
                            <iframe
                              title={`Mapa da propriedade ${component.producers.name}`}
                              width="100%"
                              height="100%"
                              frameBorder="0"
                              style={{ border: 0 }}
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(component.producers.longitude) - 0.01}%2C${Number(component.producers.latitude) - 0.01}%2C${Number(component.producers.longitude) + 0.01}%2C${Number(component.producers.latitude) + 0.01}&layer=mapnik&marker=${component.producers.latitude},${component.producers.longitude}`}
                              allowFullScreen
                            ></iframe>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <div className="text-sm">Localização não disponível</div>
                              </div>
                            </div>
                          )}
                          {component.producers?.latitude && component.producers?.longitude && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${component.producers.latitude},${component.producers.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute bottom-2 right-2 bg-gray-700 text-white px-3 py-2 rounded-lg shadow text-sm font-medium transition hover:bg-gray-800 z-20"
                            >
                              Ver no Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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
    <div className="mb-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
            <User className="h-6 w-6 mr-3 text-gray-600" />
            Sobre a Fazenda
          </h2>
          <p className="text-gray-600">
            Conheça a propriedade que produziu este lote
          </p>
        </div>
        
        <div className="p-8">
          {/* Header da propriedade */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {producer?.property_name}
            </h3>
            <p className="text-gray-600">
              Produtor: <span className="font-medium text-gray-900">{producer?.name}</span>
            </p>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            {producer?.city && producer?.state && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{producer.city}, {producer.state}</span>
              </div>
            )}
            {producer?.altitude && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Mountains className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{producer.altitude}m</span>
              </div>
            )}
            {producer?.average_temperature && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Thermometer className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{producer.average_temperature}°C</span>
              </div>
            )}
          </div>
          
          {/* Descrição */}
          {producer?.property_description && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Sobre a Propriedade</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {producer.property_description}
              </p>
            </div>
          )}
          
          {/* Galeria e Mapa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galeria de imagens */}
            {producer?.photos?.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Galeria de Fotos</h4>
                <div className="relative w-full aspect-video rounded-xl shadow-lg bg-white overflow-hidden group">
                  <img
                    src={producer.photos[0]}
                    alt={`Foto da propriedade ${producer.name}`}
                    className="object-cover w-full h-full cursor-zoom-in transition-transform duration-200 hover:scale-105 rounded-xl"
                    loading="lazy"
                  />
                </div>
                {/* Miniaturas */}
                <div className="flex gap-2 mt-4">
                  {producer.photos.slice(0, 4).map((photo: string, idx: number) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Miniatura ${idx + 1}`}
                      className="h-12 w-16 object-cover rounded-lg border-2 border-transparent opacity-70 hover:opacity-100 cursor-pointer shadow-sm"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Mapa da propriedade */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Localização no Mapa</h4>
              <div className="w-full h-64 relative rounded-xl overflow-hidden shadow-lg bg-gray-100">
                {producer?.latitude && producer?.longitude ? (
                  <iframe
                    title={`Mapa da propriedade ${producer.name}`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(producer.longitude) - 0.01}%2C${Number(producer.latitude) - 0.01}%2C${Number(producer.longitude) + 0.01}%2C${Number(producer.latitude) + 0.01}&layer=mapnik&marker=${producer.latitude},${producer.longitude}`}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <div className="text-sm">Localização não disponível</div>
                    </div>
                  </div>
                )}
                {producer?.latitude && producer?.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${producer.latitude},${producer.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-gray-700 text-white px-3 py-2 rounded-lg shadow text-sm font-medium transition hover:bg-gray-800 z-20"
                  >
                    Ver no Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
