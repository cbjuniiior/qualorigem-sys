import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

interface SensorialData {
  fragrancia: number;
  sabor: number;
  finalizacao: number;
  acidez: number;
  corpo: number;
}

interface SensorialRadarChartProps {
  data: SensorialData;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const SensorialRadarChart = ({ data, branding }: SensorialRadarChartProps) => {
  const primaryColor = branding?.primaryColor || '#059669';
  const secondaryColor = branding?.secondaryColor || '#10b981';
  const accentColor = branding?.accentColor || '#34d399';
  
  const chartData = [
    {
      atributo: "Fragrância",
      valor: data.fragrancia,
      fullMark: 10,
    },
    {
      atributo: "Sabor",
      valor: data.sabor,
      fullMark: 10,
    },
    {
      atributo: "Finalização",
      valor: data.finalizacao,
      fullMark: 10,
    },
    {
      atributo: "Acidez",
      valor: data.acidez,
      fullMark: 10,
    },
    {
      atributo: "Corpo",
      valor: data.corpo,
      fullMark: 10,
    },
  ];

  const average = (data.fragrancia + data.sabor + data.finalizacao + data.acidez + data.corpo) / 5;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={500}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="atributo" 
            tick={{ fontSize: 16, fill: primaryColor, fontWeight: 500 }}
            className="text-base"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fontSize: 14, fill: secondaryColor }}
            tickCount={6}
          />
          <Radar 
            name="Avaliação" 
            dataKey="valor" 
            stroke={primaryColor} 
            fill={secondaryColor} 
            fillOpacity={0.3}
            strokeWidth={3}
            dot={{ fill: accentColor, strokeWidth: 2, r: 6 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
