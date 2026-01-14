import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface SensorialRadarChartProps {
  data: Record<string, number>;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  showAverage?: boolean;
}

export const SensorialRadarChart = ({ data, branding, showAverage = true }: SensorialRadarChartProps) => {
  const primaryColor = branding?.primaryColor || '#059669';
  const secondaryColor = branding?.secondaryColor || '#10b981';
  const accentColor = branding?.accentColor || '#34d399';
  
  // Transformar objeto { chave: valor } em array [{ atributo: 'Nome', valor: 5 }]
  const chartData = Object.entries(data).map(([key, value]) => ({
    atributo: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    valor: value,
    fullMark: 10,
  }));

  // Se não houver dados, mostrar um gráfico vazio para manter o layout
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-slate-300 font-bold uppercase text-[10px] tracking-widest bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        Selecione atributos quantitativos
      </div>
    );
  }

  const values = Object.values(data);
  const average = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return (
    <div className="w-full relative">
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="atributo" 
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 800 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={false}
            axisLine={false}
          />
          <Radar 
            name="Avaliação" 
            dataKey="valor" 
            stroke={primaryColor} 
            fill={primaryColor} 
            fillOpacity={0.2}
            strokeWidth={3}
            dot={{ fill: primaryColor, strokeWidth: 2, r: 4, stroke: '#fff' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {showAverage && values.length > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Média</span>
          <span className="text-3xl font-black tracking-tighter" style={{ color: primaryColor }}>{average.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};
