import { Badge } from "@/components/ui/badge";
import { Package, Leaf, User, Medal, Calendar, Tag, Scales, MapPin } from "@phosphor-icons/react";
import { getComponentLocationDisplay } from "@/lib/lot-location";

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
  city?: string | null;
  state?: string | null;
  property_name?: string | null;
  producers?: {
    name: string;
    city?: string | null;
    state?: string | null;
    property_name?: string | null;
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
  
  const totalQty = Number(quantity) || blendComponents.reduce((s, c) => s + (Number(c.component_quantity) || 0), 0);
  const componentsWithPct = blendComponents.map((c) => {
    const storedPct = c.component_percentage;
    const qty = Number(c.component_quantity) || 0;
    const computedPct = totalQty > 0 && qty > 0 ? Math.round((qty / totalQty) * 1000) / 10 : 0;
    const displayPct = (storedPct != null && storedPct > 0) ? storedPct : computedPct;
    return { ...c, _displayPercentage: displayPct };
  });

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div className="mb-12">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Header - Redesign Premium */}
        <div className="p-4 sm:p-10 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-50 rounded-2xl" style={{ color: primaryColor }}>
                <Package className="h-8 w-8" weight="duotone" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">
                  Mix Exclusivo
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Composição do Blend
                </h2>
                <p className="text-slate-500 font-medium text-sm max-w-md mt-1">
                  Combinação de {blendComponents.length} componentes únicos para um perfil sensorial exclusivo.
                </p>
              </div>
            </div>
            
            <div className="flex gap-10 items-center bg-slate-50/50 px-8 py-4 rounded-[1.5rem] border border-slate-100 self-start md:self-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">100%</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Composição</div>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter">{blendComponents.length}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Origens</div>
              </div>
            </div>
          </div>
        </div>

        {/* Componentes - Grid Premium */}
        <div className="p-6 sm:p-10 bg-slate-50/30">
          <div 
            className={`grid gap-6 sm:gap-8 w-full grid-cols-1 ${
              blendComponents.length >= 2 ? 'sm:grid-cols-2' : ''
            } ${blendComponents.length >= 3 ? 'lg:grid-cols-3' : ''} ${
              blendComponents.length >= 4 ? 'xl:grid-cols-4' : ''
            }`}
          >
            {componentsWithPct.map((component) => (
              <div key={component.id} className="group bg-white border border-slate-100 rounded-[2rem] p-6 sm:p-8 hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col">
                {/* Indicador de Porcentagem Minimalista */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Componente</span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      {component.component_name}
                    </h3>
                  </div>
                  <div 
                    className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 border-white shadow-lg transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                  >
                    <span className="text-lg font-black leading-none">{(component as any)._displayPercentage ?? component.component_percentage ?? 0}</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">%</span>
                  </div>
                </div>
                
                {/* Barra de Progresso Sofisticada */}
                <div className="w-full bg-slate-50 rounded-full h-1.5 mb-8 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${(component as any)._displayPercentage ?? component.component_percentage ?? 0}%`,
                      backgroundColor: primaryColor
                    }}
                  ></div>
                </div>
              
                {/* Detalhes do componente */}
                <div className="space-y-4 mt-auto">
                  {(component.producers?.name || component.producer_id) && (
                    <DetailRow 
                      icon={<User weight="duotone" />} 
                      label="Produtor" 
                      value={component.producers?.name || "Produtor vinculado"} 
                      color={primaryColor}
                    />
                  )}

                  {getComponentLocationDisplay(component, "") && (
                    <DetailRow 
                      icon={<MapPin weight="duotone" />} 
                      label="Localização da propriedade" 
                      value={getComponentLocationDisplay(component, "")} 
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

// Componente auxiliar para linhas de detalhes - Redesign Flat
const DetailRow = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="flex items-center gap-3 group/row">
    <div 
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 transition-colors group-hover/row:bg-white"
      style={{ color: color }}
    >
      <div className="scale-90">{icon}</div>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-black text-slate-900 truncate" title={value}>{value}</p>
    </div>
  </div>
);
