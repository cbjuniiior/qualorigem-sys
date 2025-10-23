import { Badge } from "@/components/ui/badge";
import { Calendar, Scales, Leaf, Tag, Users, User, Stack } from "@phosphor-icons/react";

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
  };
  isBlend: boolean;
  blendComponents: Array<{
    id: string;
    producers?: { name: string };
    component_percentage: number;
  }>;
  producerName?: string;
}

export const LotInfoSection = ({ loteData, isBlend, blendComponents, producerName }: LotInfoSectionProps) => {
  return (
    <div className="mb-12">
      {/* Layout principal com imagem e informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Imagem do produto */}
        <div className="order-2 lg:order-1">
          <div className="relative group">
            <img
              src={loteData.image_url || "/placeholder.svg"}
              alt={loteData.name}
              className="w-full h-96 object-cover rounded-2xl shadow-xl"
            />
            {/* Overlay sutil no hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 rounded-2xl"></div>
          </div>
        </div>

        {/* Informações do lote */}
        <div className="order-1 lg:order-2">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {isBlend ? (
                  <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-medium">
                    <Stack className="h-4 w-4 mr-1" />
                    Blend
                  </Badge>
                ) : (
                  <Badge className="bg-green-600 text-white px-3 py-1 text-sm font-medium">
                    <User className="h-4 w-4 mr-1" />
                    Individual
                  </Badge>
                )}
                <Badge variant="outline" className="text-gray-600 border-gray-300">
                  {loteData.category}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">
                {loteData.name}
              </h1>
              
              <p className="text-gray-500 font-mono text-sm">
                {loteData.code}
              </p>
            </div>
            
            {/* Grid de informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Safra</div>
                  <div className="font-semibold text-gray-900">{loteData.harvest_year}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scales className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Quantidade</div>
                  <div className="font-semibold text-gray-900">{loteData.quantity} {loteData.unit}</div>
                </div>
              </div>
              
              {loteData.variety && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Variedade</div>
                    <div className="font-semibold text-gray-900">{loteData.variety}</div>
                  </div>
                </div>
              )}
              
              {loteData.seals_quantity && (
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Selos</div>
                    <div className="font-semibold text-gray-900 text-sm">
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
              )}
            </div>

            {/* Informações do produtor ou blend */}
            {isBlend ? (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {blendComponents.length} Produtor{blendComponents.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="space-y-3">
                  {blendComponents.slice(0, 3).map((component) => (
                    <div key={component.id} className="flex items-center justify-between py-3 px-4 bg-white border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-900">
                        {component.producers?.name || 'Produtor não informado'}
                      </span>
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {component.component_percentage}%
                      </Badge>
                    </div>
                  ))}
                  {blendComponents.length > 3 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      +{blendComponents.length - 3} mais produtores
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {producerName || 'Produtor não informado'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
