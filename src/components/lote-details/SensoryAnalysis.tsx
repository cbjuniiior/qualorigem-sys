import { useState, useEffect } from "react";
import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { ChartPieSlice, CheckCircle } from "@phosphor-icons/react";
import { Slider } from "@/components/ui/slider";
import { useTenant } from "@/hooks/use-tenant";
import { fieldSettingsApi } from "@/services/api";

interface SensoryAnalysisProps {
  loteData: {
    fragrance_score: number | null;
    flavor_score: number | null;
    finish_score: number | null;
    acidity_score: number | null;
    body_score: number | null;
    sensory_analysis?: Array<{
      id: string;
      sensory_attribute_id: string;
      value: number;
      sensory_attributes: {
        id: string;
        name: string;
        type: 'quantitative' | 'qualitative';
        show_radar: boolean;
        show_average: boolean;
        description: string | null;
      };
    }>;
  };
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const SensoryAnalysis = ({ loteData, branding }: SensoryAnalysisProps) => {
  const { tenant } = useTenant();
  const [showRadar, setShowRadar] = useState(true);
  const primaryColor = branding?.primaryColor || '#16a34a';

  useEffect(() => {
    if (!tenant?.id) return;
    fieldSettingsApi.isEnabled(tenant.id, 'radar_chart').then(setShowRadar);
  }, [tenant?.id]);

  // Agrupar atributos
  const dynamicSensory = loteData.sensory_analysis || [];
  const quantitativeRadar = dynamicSensory.filter(s => s.sensory_attributes.type === 'quantitative' && s.sensory_attributes.show_radar);
  const quantitativeOthers = dynamicSensory.filter(s => s.sensory_attributes.type === 'quantitative' && !s.sensory_attributes.show_radar);
  const qualitative = dynamicSensory.filter(s => s.sensory_attributes.type === 'qualitative');

  // Preparar dados para o gráfico radar
  const radarData: Record<string, number> = {};
  quantitativeRadar.forEach(s => {
    radarData[s.sensory_attributes.name] = s.value;
  });

  // Se não houver dados dinâmicos, usar o fallback (dados legados)
  const useFallback = dynamicSensory.length === 0;
  
  const fallbackSensorialData = {
    fragrancia: loteData?.fragrance_score ?? 0,
    sabor: loteData?.flavor_score ?? 0,
    finalizacao: loteData?.finish_score ?? 0,
    acidez: loteData?.acidity_score ?? 0,
    corpo: loteData?.body_score ?? 0,
  };

  const hasQuantitative = quantitativeRadar.length > 0 || quantitativeOthers.length > 0 || (useFallback && Object.values(fallbackSensorialData).some(v => v > 0));

  return (
    <div className="mb-12 text-left">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="p-4 sm:p-6 md:p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-slate-50" style={{ color: primaryColor }}>
              <ChartPieSlice className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Análise Sensorial</h2>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Perfil de qualidade e características do lote</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8 pt-6">
          <div className="flex flex-col items-center">
            
            {/* Gráfico Radar Centralizado */}
            {showRadar && hasQuantitative && (
              <div className="w-full max-w-[400px] aspect-square relative mb-6">
                <SensorialRadarChart 
                  data={useFallback ? fallbackSensorialData : radarData} 
                  branding={branding} 
                  showAverage={false} 
                />
              </div>
            )}

            {/* Atributos Qualitativos (Escalas Sensoriais) */}
            {qualitative.length > 0 && (
              <div className="w-full space-y-6 pt-8 border-t border-slate-50">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Percepções Sensoriais</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl mx-auto w-full">
                  {qualitative.map(s => (
                    <div key={s.id} className="space-y-2 group">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>{s.sensory_attributes.name}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>{s.value}%</span>
                      </div>
                      <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
                          style={{ width: `${s.value}%`, backgroundColor: primaryColor }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">
                        <span>Sutil</span>
                        <span>Intenso</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasQuantitative && qualitative.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <ChartPieSlice size={48} weight="thin" className="text-slate-200" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhuma análise sensorial registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AttributeSimple = ({ label, value, color }: { label: string, value: number | null | undefined, color: string }) => {
  const safeValue = value ?? 0;
  return (
    <div className="flex flex-col items-center text-center group">
      <span className="text-4xl font-black tracking-tighter text-slate-800 mb-1 group-hover:scale-110 transition-transform" style={{ color }}>
        {safeValue.toFixed(1)}
      </span>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="w-6 h-1 bg-slate-100 rounded-full mt-3 group-hover:w-10 transition-all"></div>
    </div>
  );
};
