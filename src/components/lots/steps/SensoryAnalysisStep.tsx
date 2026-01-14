import { Eye, Coffee, Leaf, Info, ChatCircleText, ChartLineUp, CheckCircle, CircleNotch, Plus, Trash } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { useState, useEffect } from "react";
import { sensoryAttributesApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SensoryAnalysisStepProps {
  formData: any;
  setFormData: (data: any) => void;
  branding?: any;
}

export const SensoryAnalysisStep = ({ formData, setFormData, branding }: SensoryAnalysisStepProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttributes = async () => {
      try {
        const data = await sensoryAttributesApi.getAll();
        setAttributes(data);
      } catch (error) {
        toast.error("Erro ao carregar atributos sensoriais");
      } finally {
        setLoading(false);
      }
    };
    loadAttributes();
  }, []);

  const addAttribute = (attributeId: string) => {
    const attr = attributes.find(a => a.id === attributeId);
    if (!attr) return;

    if (formData.sensory_analysis.some((s: any) => s.sensory_attribute_id === attributeId)) {
      toast.error("Este atributo já foi adicionado");
      return;
    }

    setFormData({
      ...formData,
      sensory_analysis: [
        ...formData.sensory_analysis,
        { sensory_attribute_id: attributeId, value: attr.type === 'quantitative' ? 5 : 50 }
      ]
    });
  };

  const removeAttribute = (index: number) => {
    const sensory = [...formData.sensory_analysis];
    sensory.splice(index, 1);
    setFormData({ ...formData, sensory_analysis: sensory });
  };

  const updateValue = (index: number, value: number) => {
    const sensory = [...formData.sensory_analysis];
    sensory[index] = { ...sensory[index], value };
    setFormData({ ...formData, sensory_analysis: sensory });
  };

  // Preparar dados para o gráfico radar (apenas quantitativos que pedem radar)
  const radarData: any = {};
  formData.sensory_analysis.forEach((s: any) => {
    const attr = attributes.find(a => a.id === s.sensory_attribute_id);
    if (attr && attr.type === 'quantitative' && attr.show_radar) {
      radarData[attr.name] = s.value;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <CircleNotch className="animate-spin text-primary" size={40} style={{ color: primaryColor }} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 text-left">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div 
                className="p-2.5 rounded-xl border shadow-sm"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
              >
                <ChartLineUp size={24} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Atributos Sensoriais</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Configure o perfil dinâmico do produto</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select onValueChange={addAttribute}>
                <SelectTrigger className="w-56 h-11 rounded-xl bg-slate-50 border-0 font-bold focus:ring-primary">
                  <div className="flex items-center gap-2">
                    <Plus size={18} weight="bold" style={{ color: primaryColor }} />
                    <SelectValue placeholder="Adicionar Atributo" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  {attributes.map(attr => (
                    <SelectItem 
                      key={attr.id} 
                      value={attr.id}
                      disabled={formData.sensory_analysis.some((s: any) => s.sensory_attribute_id === attr.id)}
                    >
                      {attr.name} ({attr.type === 'quantitative' ? 'Nota' : 'Escala'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.sensory_analysis.map((s: any, index: number) => {
              const attr = attributes.find(a => a.id === s.sensory_attribute_id);
              if (!attr) return null;

              return (
                <div key={s.sensory_attribute_id} className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100/50 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/30 group relative">
                  <button 
                    onClick={() => removeAttribute(index)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash size={16} weight="bold" />
                  </button>

                  <div className="flex justify-between items-center pr-6">
                    <div className="flex flex-col">
                      <Label className="text-xs font-black text-slate-700 uppercase tracking-widest">{attr.name}</Label>
                      {attr.description && <span className="text-[9px] text-slate-400 font-medium">{attr.description}</span>}
                    </div>
                    <Badge 
                      className="bg-white border-slate-100 font-black text-sm px-3 shadow-sm ring-1 ring-slate-100"
                      style={{ color: primaryColor }}
                    >
                      {attr.type === 'quantitative' ? s.value.toFixed(1) : `${s.value}%`}
                    </Badge>
                  </div>

                  <Slider 
                    value={[s.value]} 
                    onValueChange={([val]) => updateValue(index, val)} 
                    max={attr.type === 'quantitative' ? 10 : 100} 
                    min={0} 
                    step={attr.type === 'quantitative' ? 0.1 : 1} 
                    className="py-4 cursor-pointer" 
                    style={{ '--primary': primaryColor } as any}
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">
                    <span className="flex items-center gap-1">
                      <CheckCircle size={10} className="text-slate-300" /> 
                      {attr.type === 'quantitative' ? "0.0" : "Menos"}
                    </span>
                    <span className="flex items-center gap-1 text-right">
                      {attr.type === 'quantitative' ? "10.0" : "Mais"} 
                      <CheckCircle size={10} className="text-slate-300" />
                    </span>
                  </div>
                </div>
              );
            })}

            {formData.sensory_analysis.length === 0 && (
              <div className="md:col-span-2 flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-300">
                  <Eye size={40} weight="thin" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Nenhum atributo selecionado</p>
                  <p className="text-[10px] text-slate-400 font-medium">Use o seletor acima para adicionar critérios à análise.</p>
                </div>
              </div>
            )}

            <div className="md:col-span-2 space-y-4 pt-4">
              <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                <ChatCircleText size={18} style={{ color: primaryColor }} /> Notas do Especialista / Observações Sensoriais
              </Label>
              <Textarea 
                value={formData.sensory_notes} 
                onChange={e => setFormData({ ...formData, sensory_notes: e.target.value })} 
                placeholder="Descreva detalhes como: Notas de chocolate, frutas cítricas, retrogosto prolongado..." 
                className="min-h-[120px] rounded-2xl focus-visible:ring-primary bg-slate-50 border-0 font-medium"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center sticky top-4">
            <div className="text-center mb-6">
              <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Preview do Perfil</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Atualização em Tempo Real</p>
            </div>
            
            <div className="w-full aspect-square flex items-center justify-center scale-90 -mt-10 -mb-10">
              <SensorialRadarChart data={radarData} branding={branding} />
            </div>

            <div className="w-full space-y-4 mt-4">
              <Separator className="bg-slate-50" />
              <div 
                className="p-4 rounded-2xl border flex gap-3"
                style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
              >
                <div 
                  className="p-2 h-fit bg-white rounded-lg shadow-sm border border-slate-100"
                  style={{ color: primaryColor }}
                >
                  <Info size={16} weight="fill" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">Análise Dinâmica</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Atributos marcados como "Radar" aparecerão no gráfico. Atributos "Sensoriais" serão exibidos como barras de intensidade na página pública.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
