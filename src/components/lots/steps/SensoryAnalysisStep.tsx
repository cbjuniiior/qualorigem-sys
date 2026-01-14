import { Eye, Coffee, Leaf, Info, ChatCircleText, ChartLineUp, CheckCircle } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SensoryAnalysisStepProps {
  formData: any;
  setFormData: (data: any) => void;
  branding?: any;
}

export const SensoryAnalysisStep = ({ formData, setFormData, branding }: SensoryAnalysisStepProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  
  const sensoryType = formData.sensory_type || 'nota';

  const handleTypeChange = (type: string) => {
    setFormData({ ...formData, sensory_type: type });
  };

  const renderSlider = (label: string, field: string, minLabel?: string, maxLabel?: string) => (
    <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 group">
      <div className="flex justify-between items-center text-left">
        <Label 
          className="text-xs font-black text-slate-500 uppercase tracking-widest transition-colors group-hover:text-primary"
          style={{ '--tw-text-opacity': '1' } as any}
        >
          {label}
        </Label>
        <Badge 
          className="bg-white border-slate-100 font-black text-sm px-3 shadow-sm shadow-slate-200/50 ring-1 ring-slate-100"
          style={{ color: primaryColor }}
        >
          {formData[field]?.toFixed(1) || "0.0"}
        </Badge>
      </div>
      <Slider 
        value={[formData[field] || 0]} 
        onValueChange={([value]) => setFormData({ ...formData, [field]: value })} 
        max={10} 
        min={0} 
        step={0.1} 
        className="py-4 cursor-pointer" 
        style={{ '--primary': primaryColor } as any}
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
        <span>{minLabel || "Suave"}</span>
        <span>{maxLabel || "Intenso"}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Cabeçalho de Tipo - Estilo Moderno */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Modelo de Análise Sensorial</Label>
        <Tabs value={sensoryType} onValueChange={handleTypeChange} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1.5 rounded-[1.25rem] shadow-inner ring-1 ring-slate-200/50 h-auto">
            <TabsTrigger 
              value="nota" 
              className="flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-black data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              style={{ color: sensoryType === 'nota' ? primaryColor : undefined }}
            >
              <Coffee size={20} weight={sensoryType === 'nota' ? "fill" : "bold"} />
              Pontuação (Café)
            </TabsTrigger>
            <TabsTrigger 
              value="caracteristica" 
              className="flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-black data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              style={{ color: sensoryType === 'caracteristica' ? primaryColor : undefined }}
            >
              <Leaf size={20} weight={sensoryType === 'caracteristica' ? "fill" : "bold"} />
              Perfil (Erva-Mate)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="flex items-start gap-4">
            <div 
              className="p-2.5 rounded-xl border shadow-sm"
              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
            >
              <ChartLineUp size={24} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Atributos Sensoriais</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Defina a escala de 0 a 10 para cada item</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center gap-2">
            <Eye size={18} className="text-amber-600" weight="fill" />
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">Exibição Visual Ativada</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderSlider(
            sensoryType === 'nota' ? "Fragrância" : "Intensidade", 
            "fragrance_score",
            sensoryType === 'nota' ? "Baixa" : "Suave",
            sensoryType === 'nota' ? "Alta" : "Intensa"
          )}
          {renderSlider(
            sensoryType === 'nota' ? "Sabor" : "Amargor", 
            "flavor_score",
            sensoryType === 'nota' ? "Fraco" : "Leve",
            sensoryType === 'nota' ? "Marcante" : "Forte"
          )}
          {renderSlider(
            sensoryType === 'nota' ? "Finalização" : "Doçura", 
            "finish_score",
            sensoryType === 'nota' ? "Curta" : "Baixa",
            sensoryType === 'nota' ? "Longa" : "Alta"
          )}
          {renderSlider(
            sensoryType === 'nota' ? "Acidez" : "Cor Visual", 
            "acidity_score",
            sensoryType === 'nota' ? "Baixa" : "Clara",
            sensoryType === 'nota' ? "Alta" : "Escura"
          )}
          {renderSlider(
            sensoryType === 'nota' ? "Corpo / Densidade" : "Textura", 
            "body_score",
            sensoryType === 'nota' ? "Leve" : "Fina",
            sensoryType === 'nota' ? "Pesado" : "Encorpada"
          )}

          <div className="space-y-4 p-2 text-left">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <ChatCircleText size={18} style={{ color: primaryColor }} /> Notas do Especialista
            </Label>
            <Textarea 
              value={formData.sensory_notes} 
              onChange={e => setFormData({ ...formData, sensory_notes: e.target.value })} 
              placeholder="Descreva detalhes como: Notas de chocolate, frutas cítricas, retrogosto prolongado..." 
              className="min-h-[140px] rounded-2xl focus-visible:ring-primary bg-slate-50 border-0"
              style={{ '--primary': primaryColor } as any}
            />
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div 
          className="p-6 rounded-[2rem] flex items-start gap-5 border shadow-inner ring-1 ring-white/50 text-left"
          style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
        >
          <div 
            className="p-3 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100"
            style={{ color: primaryColor }}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <Info size={24} weight="fill" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Sobre o Gráfico Radar</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Estes dados alimentarão automaticamente o Gráfico Radar na página pública do lote. 
              Valores acima de 8.0 são geralmente considerados de categoria "Especial" ou "Premium".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
