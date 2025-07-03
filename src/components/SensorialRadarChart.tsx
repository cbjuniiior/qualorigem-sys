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
}

export const SensorialRadarChart = ({ data }: SensorialRadarChartProps) => {
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
            tick={{ fontSize: 16, fill: "#6b7280" }}
            className="text-base"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fontSize: 14, fill: "#9ca3af" }}
            tickCount={6}
          />
          <Radar 
            name="Avaliação" 
            dataKey="valor" 
            stroke="#059669" 
            fill="#10b981" 
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: "#059669", strokeWidth: 2, r: 5 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
