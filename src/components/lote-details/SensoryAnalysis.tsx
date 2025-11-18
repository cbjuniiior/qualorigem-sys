import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { Medal, Leaf, Calendar, Thermometer, Scales } from "@phosphor-icons/react";

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
    <div className="mb-12">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div 
          className="p-8 border-b"
          style={{
            background: `linear-gradient(to right, ${primaryColor}10, ${secondaryColor}10)`,
            borderColor: `${primaryColor}30`,
          }}
        >
          <div className="text-center">
            <span 
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: primaryColor }}
            >
              Análise Premium
            </span>
            <h2 className="text-2xl font-semibold text-gray-900 mt-2">Análise Sensorial</h2>
            <p className="text-gray-600 mt-2">Veja como este lote se destaca nos principais atributos sensoriais</p>
          </div>
        </div>
        
        <div className="p-8">
          {/* Nota geral */}
          <div className="text-center mb-8">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 text-white rounded-full text-2xl font-bold shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {notaGeral.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 font-medium mt-3">Média geral</div>
          </div>
          
          {/* Gráfico radar */}
          <div className="w-full flex justify-center items-center mb-8">
            <div className="w-full max-w-xl">
              <SensorialRadarChart data={sensorialData} branding={branding} />
            </div>
          </div>
          
          {/* Cards de atributos */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Medal className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-sm text-gray-700 mb-2 font-medium">Fragrância</span>
              <span className="text-xl font-bold text-gray-900">{loteData?.fragrance_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Leaf className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-sm text-gray-700 mb-2 font-medium">Sabor</span>
              <span className="text-xl font-bold text-gray-900">{loteData?.flavor_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Calendar className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-sm text-gray-700 mb-2 font-medium">Finalização</span>
              <span className="text-xl font-bold text-gray-900">{loteData?.finish_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Thermometer className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-sm text-gray-700 mb-2 font-medium">Acidez</span>
              <span className="text-xl font-bold text-gray-900">{loteData?.acidity_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Scales className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <span className="text-sm text-gray-700 mb-2 font-medium">Corpo</span>
              <span className="text-xl font-bold text-gray-900">{loteData?.body_score?.toFixed(1) ?? '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
