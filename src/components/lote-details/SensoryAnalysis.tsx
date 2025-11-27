import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { Medal, Leaf, Calendar, Thermometer, Scales, ChartPieSlice } from "@phosphor-icons/react";

interface SensoryAnalysisProps {
  loteData: {
    fragrance_score: number | null;
    flavor_score: number | null;
    finish_score: number | null;
    acidity_score: number | null;
    body_score: number | null;
  };
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const SensoryAnalysis = ({ loteData, branding }: SensoryAnalysisProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';
  
  const sensorialData = {
    fragrancia: loteData?.fragrance_score ?? 0,
    sabor: loteData?.flavor_score ?? 0,
    finalizacao: loteData?.finish_score ?? 0,
    acidez: loteData?.acidity_score ?? 0,
    corpo: loteData?.body_score ?? 0,
  };

  const notaGeral = (
    sensorialData.fragrancia +
    sensorialData.sabor +
    sensorialData.finalizacao +
    sensorialData.acidez +
    sensorialData.corpo
  ) / 5;

  return (
    <div className="mb-16">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* Header Minimalista */}
        <div className="p-8 pb-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gray-50">
              <ChartPieSlice className="h-6 w-6 text-gray-700" weight="duotone" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Análise Sensorial</h2>
          </div>
          <p className="text-gray-500 ml-12 max-w-2xl">
            Perfil detalhado dos atributos sensoriais deste lote, avaliado por especialistas.
          </p>
        </div>
        
        <div className="p-8 md:p-12 pt-10">
          <div className="flex flex-col items-center">
            
            {/* 1. Nota Geral (Topo) - Mais espaçamento */}
            <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
              <div className="text-5xl md:text-7xl font-light tracking-tighter text-gray-900 transition-all duration-300" style={{ color: primaryColor }}>
                {notaGeral.toFixed(1)}
              </div>
              <div className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-[0.25em] mt-2 md:mt-4">
                Nota Geral
              </div>
            </div>

            {/* 2. Gráfico Radar (Meio) - Sem margens negativas e com container maior */}
            <div className="w-full max-w-[350px] md:max-w-[500px] aspect-square mb-10 md:mb-16">
              <SensorialRadarChart data={sensorialData} branding={branding} />
            </div>
            
            {/* 3. Atributos (Abaixo) - Grid mais espaçado e cards mais limpos */}
            <div className="w-full max-w-5xl">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-12">
                <AttributeSimple 
                  label="Fragrância" 
                  value={loteData?.fragrance_score} 
                />
                <AttributeSimple 
                  label="Sabor" 
                  value={loteData?.flavor_score} 
                />
                <AttributeSimple 
                  label="Finalização" 
                  value={loteData?.finish_score} 
                />
                <AttributeSimple 
                  label="Acidez" 
                  value={loteData?.acidity_score} 
                />
                <AttributeSimple 
                  label="Corpo" 
                  value={loteData?.body_score} 
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Componente simplificado para os atributos - Mais limpo e arejado
const AttributeSimple = ({ label, value }: { label: string, value: number | null | undefined }) => {
  const safeValue = value ?? 0;
  
  return (
    <div className="flex flex-col items-center text-center p-2">
      <span className="text-3xl font-light text-gray-900 mb-3">{safeValue.toFixed(1)}</span>
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="w-8 h-1 bg-gray-100 rounded-full mt-4"></div>
    </div>
  );
};
