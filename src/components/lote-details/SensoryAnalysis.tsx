import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { ChartPieSlice, CheckCircle } from "@phosphor-icons/react";
import { Slider } from "@/components/ui/slider";

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
  const primaryColor = branding?.primaryColor || '#16a34a';
  
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
    <div className="mb-16 text-left">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <div className="p-8 md:p-12 pb-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-2xl bg-slate-50" style={{ color: primaryColor }}>
              <ChartPieSlice className="h-8 w-8" weight="duotone" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Análise Sensorial</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Perfil de qualidade e características do lote</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 md:p-12 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Lado Esquerdo: Gráfico Radar (se houver dados quantitativos) */}
            {hasQuantitative && (
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[400px] aspect-square relative">
                  <SensorialRadarChart 
                    data={useFallback ? fallbackSensorialData : radarData} 
                    branding={branding} 
                    showAverage={!useFallback ? quantitativeRadar.some(s => s.sensory_attributes.show_average) : true}
                  />
                </div>
              </div>
            )}

            {/* Lado Direito: Scores e Escalas Sensoriais */}
            <div className={`${hasQuantitative ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-10`}>
              
              {/* Atributos Quantitativos (Notas) */}
              {hasQuantitative && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                  {useFallback ? (
                    <>
                      <AttributeSimple label="Fragrância" value={loteData?.fragrance_score} color={primaryColor} />
                      <AttributeSimple label="Sabor" value={loteData?.flavor_score} color={primaryColor} />
                      <AttributeSimple label="Finalização" value={loteData?.finish_score} color={primaryColor} />
                      <AttributeSimple label="Acidez" value={loteData?.acidity_score} color={primaryColor} />
                      <AttributeSimple label="Corpo" value={loteData?.body_score} color={primaryColor} />
                    </>
                  ) : (
                    [...quantitativeRadar, ...quantitativeOthers].map(s => (
                      <AttributeSimple 
                        key={s.id} 
                        label={s.sensory_attributes.name} 
                        value={s.value} 
                        color={primaryColor} 
                      />
                    ))
                  )}
                </div>
              )}

              {/* Atributos Qualitativos (Escalas Sensoriais) */}
              {qualitative.length > 0 && (
                <div className="space-y-8 pt-6 border-t border-slate-50">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Percepções Sensoriais</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {qualitative.map(s => (
                      <div key={s.id} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{s.sensory_attributes.name}</span>
                          <span className="text-[10px] font-black text-primary px-2 py-0.5 rounded-full bg-primary/10" style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>{s.value}%</span>
                        </div>
                        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
                            style={{ width: `${s.value}%`, backgroundColor: primaryColor }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <span>Menos</span>
                          <span>Mais</span>
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
