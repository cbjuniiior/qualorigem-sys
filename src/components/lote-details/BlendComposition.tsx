import { Badge } from "@/components/ui/badge";
import { Package, Leaf, User, Medal, Calendar, Tag, Scales, MapPin } from "@phosphor-icons/react";

interface BlendComponent {
  id: string;
  component_name: string;
  component_percentage: number;
  producer_id?: string;
  association_id?: string;
  component_harvest_year?: string;
  component_variety?: string;
  component_quantity?: number;
  component_unit?: string;
  component_origin?: string;
  producers?: {
    name: string;
  };
  associations?: {
    name: string;
  };
}

interface BlendCompositionProps {
  blendComponents: BlendComponent[];
  harvestYear: string;
  quantity: number | null;
  unit: string | null;
}

export const BlendComposition = ({ blendComponents, harvestYear, quantity, unit }: BlendCompositionProps) => {
  if (!blendComponents || blendComponents.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center">
                <Package className="h-6 w-6 mr-3 text-gray-600" />
                Composição do Blend
              </h2>
              <p className="text-gray-600">
                {blendComponents.length} componente{blendComponents.length > 1 ? 's' : ''} cuidadosamente selecionado{blendComponents.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-500">Composição Total</div>
            </div>
          </div>
        </div>

        {/* Componentes */}
        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blendComponents.map((component) => (
              <div key={component.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                {/* Header do componente */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{component.component_name}</h3>
                    <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
                      {component.component_percentage}%
                    </Badge>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${component.component_percentage}%` }}
                    ></div>
                  </div>
                </div>
              
                {/* Detalhes do componente */}
                <div className="space-y-4">
                  {component.producer_id && component.producers && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Produtor</div>
                        <div className="font-medium text-gray-900 text-sm">{component.producers.name}</div>
                      </div>
                    </div>
                  )}
                  
                  {component.association_id && component.associations && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Medal className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Associação</div>
                        <div className="font-medium text-gray-900 text-sm">{component.associations.name}</div>
                      </div>
                    </div>
                  )}
                  
                  {component.component_harvest_year && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Safra</div>
                        <div className="font-medium text-gray-900 text-sm">{component.component_harvest_year}</div>
                      </div>
                    </div>
                  )}
                  
                  {component.component_variety && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Tag className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Variedade</div>
                        <div className="font-medium text-gray-900 text-sm">{component.component_variety}</div>
                      </div>
                    </div>
                  )}
                  
                  {component.component_quantity && component.component_unit && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Scales className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Quantidade</div>
                        <div className="font-medium text-gray-900 text-sm">{component.component_quantity} {component.component_unit}</div>
                      </div>
                    </div>
                  )}
                  
                  {component.component_origin && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Origem</div>
                        <div className="font-medium text-gray-900 text-sm">{component.component_origin}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Resumo do blend */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Blend Artesanal</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Este produto é um blend especial composto por <strong>{blendComponents.length} componente{blendComponents.length > 1 ? 's' : ''}</strong> cuidadosamente selecionado{blendComponents.length > 1 ? 's' : ''}, 
                  cada um contribuindo com suas características únicas para criar um perfil sensorial excepcional.
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas do blend */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{blendComponents.length}</div>
              <div className="text-sm text-gray-600">Componentes</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Composição</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{harvestYear}</div>
              <div className="text-sm text-gray-600">Safra</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{quantity}</div>
              <div className="text-sm text-gray-600">{unit}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
