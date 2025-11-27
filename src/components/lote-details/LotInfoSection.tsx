import { Badge } from "@/components/ui/badge";
import { Calendar, Scales, Leaf, Tag, Users, User } from "@phosphor-icons/react";

interface LotInfoSectionProps {
  loteData: {
    name: string;
    code: string;
    category: string;
    harvest_year: string;
    quantity: number | null;
    unit: string | null;
    variety?: string;
    seals_quantity?: number | null;
    image_url: string | null;
  };
  isBlend: boolean;
  blendComponents: Array<{
    id: string;
    producers?: { name: string };
    component_percentage: number;
  }>;
  producerName?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const LotInfoSection = ({ loteData, isBlend, blendComponents, producerName, branding }: LotInfoSectionProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div className="mb-12 lg:mb-24">
      {/* Layout principal com imagem e informações */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Imagem do produto - 5 colunas */}
        <div className="order-2 lg:order-1 lg:col-span-5">
          <div className="relative group">
            <div 
              className="absolute -inset-4 bg-gradient-to-tr from-gray-100 to-gray-50 rounded-[2rem] opacity-50 blur-2xl group-hover:opacity-70 transition-opacity duration-500" 
              style={{ 
                background: `linear-gradient(to top right, ${primaryColor}10, ${secondaryColor}10)` 
              }}
            ></div>
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5 aspect-[4/5]">
              <img
                src={loteData.image_url || "/placeholder.svg"}
                alt={loteData.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay sutil no hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Informações do lote - 7 colunas */}
        <div className="order-1 lg:order-2 lg:col-span-7">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-8 lg:mb-10">
              <div className="flex flex-wrap items-center gap-3 mb-4 lg:mb-6">
                {isBlend ? (
                  <Badge 
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-0 shadow-sm"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    BLEND
                  </Badge>
                ) : (
                  <Badge 
                    className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider border-0 shadow-sm"
                    style={{ backgroundColor: primaryColor, color: 'white' }}
                  >
                    INDIVIDUAL
                  </Badge>
                )}
                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {loteData.category}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                {loteData.name}
              </h1>
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">COD</span>
                <span className="text-sm font-mono text-gray-600 font-medium tracking-wide">{loteData.code}</span>
              </div>
            </div>
            
            {/* Grid de informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 lg:mb-10">
              <div className="group p-4 lg:p-5 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                  >
                    <Calendar className="h-6 w-6" weight="duotone" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Safra</div>
                    <div className="text-lg font-semibold text-gray-900">{loteData.harvest_year}</div>
                  </div>
                </div>
              </div>
              
              <div className="group p-5 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                    style={{ backgroundColor: `${secondaryColor}10`, color: secondaryColor }}
                  >
                    <Scales className="h-6 w-6" weight="duotone" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Quantidade</div>
                    <div className="text-lg font-semibold text-gray-900">{loteData.quantity} {loteData.unit}</div>
                  </div>
                </div>
              </div>
              
              {loteData.variety && (
                <div className="group p-5 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                      style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                    >
                      <Leaf className="h-6 w-6" weight="duotone" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Variedade</div>
                      <div className="text-lg font-semibold text-gray-900">{loteData.variety}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {loteData.seals_quantity && (
                <div className="group p-5 bg-white border border-gray-100 hover:border-gray-200 rounded-2xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      <Tag className="h-6 w-6" weight="duotone" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Selos</div>
                      <div className="text-sm font-semibold text-gray-900 leading-snug">
                        {(() => {
                          const packageSize = loteData.quantity! / loteData.seals_quantity!;
                          const roundedSize = Math.round(packageSize * 100) / 100;
                          
                          if (loteData.unit === 'Kg' && roundedSize < 1) {
                            const grams = Math.round(roundedSize * 1000);
                            return `${loteData.seals_quantity} Selos em embalagens de ${grams}g`;
                          }
                          return `${loteData.seals_quantity} Selos em embalagens de ${roundedSize}${loteData.unit}`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informações do produtor ou blend - Design Card */}
            <div className="mt-auto">
              {isBlend ? (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Users className="h-5 w-5" style={{ color: accentColor }} weight="fill" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Composição do Blend</h3>
                      <p className="text-sm text-gray-500">{blendComponents.length} produtores participantes</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {blendComponents.slice(0, 3).map((component) => (
                      <div key={component.id} className="flex items-center justify-between py-3 px-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                            {component.producers?.name?.charAt(0) || 'P'}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {component.producers?.name || 'Produtor não informado'}
                          </span>
                        </div>
                        <div 
                          className="px-2.5 py-1 rounded-md text-xs font-bold"
                          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                          {component.component_percentage}%
                        </div>
                      </div>
                    ))}
                    {blendComponents.length > 3 && (
                      <button className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700 py-2 transition-colors">
                        Ver mais {blendComponents.length - 3} produtores
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-1 border border-gray-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                      <User className="h-7 w-7 text-gray-400" weight="duotone" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Produtor Responsável</div>
                      <div className="text-lg font-bold text-gray-900">
                        {producerName || 'Produtor não informado'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
