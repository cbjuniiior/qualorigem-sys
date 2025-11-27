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
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const BlendComposition = ({ blendComponents, harvestYear, quantity, unit, branding }: BlendCompositionProps) => {
  if (!blendComponents || blendComponents.length === 0) return null;
  
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div className="mb-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <Package className="h-8 w-8 text-gray-700" weight="duotone" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">
                  Composição do Blend
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm max-w-md">
                  Combinação de {blendComponents.length} componentes únicos para um perfil sensorial exclusivo.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6 sm:gap-8 items-center bg-gray-50 px-4 sm:px-6 py-3 rounded-xl border border-gray-100 self-start md:self-auto w-full md:w-auto justify-center md:justify-start">
              <div className="text-center border-r border-gray-200 pr-6 sm:pr-8">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">100%</div>
                <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Composição</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{blendComponents.length}</div>
                <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Componentes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Componentes */}
        <div className="p-4 sm:p-8 bg-gray-50/30">
          <div className={`grid gap-4 sm:gap-6 grid-cols-1 ${
            blendComponents.length % 3 === 0 
              ? 'md:grid-cols-3' 
              : 'md:grid-cols-2'
          }`}>
            {blendComponents.map((component) => (
              <div key={component.id} className="group bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                {/* Barra de cor superior */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ 
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                    opacity: component.component_percentage / 100 + 0.2
                  }}
                ></div>

                {/* Header do componente */}
                <div className="mb-6 mt-2">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      {component.component_name}
                    </h3>
                    <span 
                      className="inline-flex items-center justify-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                    >
                      {component.component_percentage}%
                    </span>
                  </div>
                  
                  {/* Visualização de proporção */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${component.component_percentage}%`,
                        backgroundColor: primaryColor
                      }}
                    ></div>
                  </div>
                </div>
              
                {/* Detalhes do componente em Grid Compacto */}
                <div className="space-y-3">
                  {component.producer_id && component.producers && (
                    <DetailRow 
                      icon={<User weight="duotone" />} 
                      label="Produtor" 
                      value={component.producers.name} 
                      color={primaryColor}
                    />
                  )}
                  
                  {component.association_id && component.associations && (
                    <DetailRow 
                      icon={<Medal weight="duotone" />} 
                      label="Associação" 
                      value={component.associations.name} 
                      color={accentColor}
                    />
                  )}
                  
                  {component.component_harvest_year && (
                    <DetailRow 
                      icon={<Calendar weight="duotone" />} 
                      label="Safra" 
                      value={component.component_harvest_year} 
                      color={primaryColor}
                    />
                  )}
                  
                  {component.component_variety && (
                    <DetailRow 
                      icon={<Tag weight="duotone" />} 
                      label="Variedade" 
                      value={component.component_variety} 
                      color={secondaryColor}
                    />
                  )}
                  
                  {component.component_quantity && component.component_unit && (
                    <DetailRow 
                      icon={<Scales weight="duotone" />} 
                      label="Qtd." 
                      value={`${component.component_quantity} ${component.component_unit}`} 
                      color={secondaryColor}
                    />
                  )}
                  
                  {component.component_origin && (
                    <DetailRow 
                      icon={<MapPin weight="duotone" />} 
                      label="Origem" 
                      value={component.component_origin} 
                      color={accentColor}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para linhas de detalhes
const DetailRow = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="flex items-center gap-3 text-sm group/row">
    <div 
      className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors"
      style={{ color: color }}
    >
      {icon}
    </div>
    <div className="flex-1 flex items-baseline justify-between border-b border-gray-100 pb-1 border-dashed group-hover/row:border-gray-300 transition-colors">
      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="font-medium text-gray-900 text-right ml-2 truncate max-w-[140px]" title={value}>{value}</span>
    </div>
  </div>
);
