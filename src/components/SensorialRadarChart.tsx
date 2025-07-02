
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
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold text-green-600">
          {average.toFixed(1)}
        </div>
        <div className="text-sm text-gray-600">Nota Geral</div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="atributo" 
            tick={{ fontSize: 12, fill: "#6b7280" }}
            className="text-xs"
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 10]} 
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickCount={6}
          />
          <Radar 
            name="Avaliação" 
            dataKey="valor" 
            stroke="#059669" 
            fill="#10b981" 
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        {chartData.map((item) => (
          <div key={item.atributo} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-gray-600">{item.atributo}</span>
            <span className="font-semibold text-green-600">{item.valor.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
