import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface SensorialRadarChartProps {
  data: Record<string, number>;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  showAverage?: boolean;
}

/** Quebra o texto em até 2 linhas por palavras (evita cortar no meio). */
function splitLabelIntoTwoLines(label: string, maxCharsPerLine: number = 14): [string, string] {
  const words = label.trim().split(/\s+/);
  if (words.length <= 1) return [label, ""];
  let line1 = "";
  let line2 = "";
  for (const w of words) {
    const next = line1 ? `${line1} ${w}` : w;
    if (next.length <= maxCharsPerLine) {
      line1 = next;
    } else {
      line2 = line2 ? `${line2} ${w}` : w;
    }
  }
  if (!line1 && line2) return [line2, ""];
  return [line1, line2];
}

/** Tick customizado: 2 linhas + tooltip com nota (porcentagem em escala 0-10). */
function PolarAngleTick({
  payload,
  x,
  y,
  textAnchor,
  chartData,
  index,
}: {
  payload?: { value?: string; atributo?: string; valor?: number };
  x?: number;
  y?: number;
  textAnchor?: string;
  chartData?: { atributo: string; valor: number }[];
  index?: number;
}) {
  const label = (payload?.value ?? payload?.atributo ?? "") as string;
  const nota =
    payload?.valor ??
    (typeof index === "number" && chartData?.[index]?.valor != null
      ? chartData[index].valor
      : chartData?.find((d) => d.atributo === label || d.atributo?.toLowerCase() === label?.toLowerCase())?.valor);
  const [line1, line2] = splitLabelIntoTwoLines(label);
  const fill = "#94a3b8";
  const fontSize = 9;
  // Escala 0-10 → porcentagem para exibição
  const pct = nota != null ? Math.round((Number(nota) / 10) * 100) : null;
  const tooltipText = pct != null ? `${label}: ${pct}%` : nota != null ? `${label}: ${Number(nota).toFixed(1)}` : label;
  return (
    <g className="recharts-layer recharts-polar-angle-axis-tick" style={{ cursor: "pointer" }}>
      <title>{tooltipText}</title>
      <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={fontSize} fontWeight={900}>
        <tspan x={x} dy="0em">{line1}</tspan>
        {line2 ? <tspan x={x} dy="1.1em">{line2}</tspan> : null}
      </text>
    </g>
  );
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

  const chartHeight = 380;

  return (
    <div className="w-full h-full min-h-[320px] relative">
      <ResponsiveContainer width="100%" height="100%" minHeight={chartHeight}>
        <RadarChart data={chartData} margin={{ top: 28, right: 38, bottom: 28, left: 38 }}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="atributo" 
            tick={(props) => {
              const label = (props.payload?.value ?? props.payload?.atributo) as string | undefined;
              const idx = label != null ? chartData.findIndex((d) => d.atributo === label || d.atributo?.toLowerCase() === label?.toLowerCase()) : -1;
              return <PolarAngleTick {...props} chartData={chartData} index={idx >= 0 ? idx : undefined} />;
            }}
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
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0].payload as { atributo: string; valor: number };
              const pct = Math.round((item.valor / 10) * 100);
              return (
                <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg border border-slate-700">
                  {item.atributo}: {pct}%
                </div>
              );
            }}
            cursor={false}
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
