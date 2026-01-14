import { Package, Tag, QrCode, Info, CheckCircle, Sliders } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { systemConfigApi } from "@/services/api";
import { generateLotCode } from "@/utils/lot-code-generator";
import { generateSlug } from "@/utils/slug-generator";

interface VolumeStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode: boolean;
  producers: any[];
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
}

export const VolumeStep = ({ formData, setFormData, isBlendMode, producers, branding }: VolumeStepProps) => {
  const [lotConfig, setLotConfig] = useState<any>(null);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');

  const primaryColor = branding?.primaryColor || '#16a34a';
  const accentColor = branding?.accentColor || '#10b981';

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await systemConfigApi.getLotIdConfig();
        setLotConfig(config);
        if (config.mode === 'manual') {
          setCodeMode('manual');
        }
      } catch (error) {
        console.error("Erro ao carregar config de lote:", error);
      }
    };
    loadConfig();
  }, []);

  const FormSection = ({ title, icon: Icon, children, description, primaryColor }: any) => (
    <div className="space-y-6 text-left">
      <div className="flex items-start gap-4 px-2">
        <div 
          className="p-2.5 rounded-xl border shadow-sm"
          style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
        >
          <Icon size={24} weight="duotone" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
          {description && <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{description}</p>}
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <FormSection title="Volume de Produção" icon={Package} description="Quantidades e métricas de controle" primaryColor={primaryColor}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Package size={16} style={{ color: primaryColor }} /> Peso Total do Lote *
            </Label>
            <Input 
              type="number" 
              step="0.01" 
              value={formData.quantity} 
              onChange={e => setFormData((prev: any) => ({ ...prev, quantity: e.target.value }))} 
              placeholder="Ex: 500.00" 
              className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm"
              style={{ '--primary': primaryColor } as any}
              readOnly={isBlendMode}
            />
            {isBlendMode && <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Calculado automaticamente via componentes</p>}
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Tag size={16} style={{ color: primaryColor }} /> Unidade de Medida *
            </Label>
            <Select value={formData.unit} onValueChange={value => setFormData((prev: any) => ({ ...prev, unit: value }))}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold">
                <SelectItem value="Kg">Quilogramas (Kg)</SelectItem>
                <SelectItem value="L">Litros (L)</SelectItem>
                <SelectItem value="g">Gramas (g)</SelectItem>
                <SelectItem value="ml">Mililitros (ml)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Tag size={16} style={{ color: primaryColor }} /> Selos para Emissão *
            </Label>
            <div className="relative">
              <Input 
                type="number" 
                value={formData.seals_quantity || ""} 
                onChange={e => setFormData((prev: any) => ({ ...prev, seals_quantity: e.target.value }))} 
                placeholder="Qtd Etiquetas" 
                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm"
                style={{ '--primary': primaryColor } as any}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Badge 
                  className="border-0 font-black text-[10px] uppercase"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  Selos
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        <div 
          className="p-6 rounded-[1.5rem] flex flex-col items-stretch gap-6 border shadow-sm transition-all duration-500"
          style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100"
                style={{ color: primaryColor }}
              >
                <QrCode size={24} weight="fill" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Único de Rastreio</p>
                {codeMode === 'auto' ? (
                  <h4 className="text-2xl font-mono font-black text-slate-800 tracking-tighter">{formData.code || "GERANDO..."}</h4>
                ) : (
                  <Input 
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="DIGITE O CÓDIGO"
                    className="h-12 bg-white border-slate-200 rounded-xl font-mono font-black text-xl w-64 text-slate-800 focus-visible:ring-primary shadow-inner"
                    style={{ '--primary': primaryColor } as any}
                  />
                )}
              </div>
            </div>
            
            {lotConfig?.mode === 'producer_brand' && (
              <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    setCodeMode('auto');
                    let prefix = "";
                    if (lotConfig?.mode === 'producer_brand') {
                      const producer = producers.find(p => p.id === formData.producer_id);
                      if (producer) {
                        if (formData.brand_id && formData.brand_id !== "none" && formData.brand_id !== "") {
                          // Note: brands needs to be fetched or passed here if needed, 
                          // but since it's step 3, producer_id should be stable.
                          // For now, let's assume update happens in Step 1/2 or handle it.
                        } else {
                          prefix = generateSlug(producer.name).toUpperCase();
                        }
                      }
                    }
                    const newCode = await generateLotCode(prefix || undefined, false);
                    setFormData({ ...formData, code: newCode });
                  }}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${codeMode === 'auto' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  style={codeMode === 'auto' ? { backgroundColor: primaryColor } : {}}
                >
                  Automático
                </button>
                <button
                  type="button"
                  onClick={() => setCodeMode('manual')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${codeMode === 'manual' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  style={codeMode === 'manual' ? { backgroundColor: primaryColor } : {}}
                >
                  Manual
                </button>
              </div>
            )}

            <div 
              className="px-6 py-3 rounded-2xl border flex items-center gap-2"
              style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20`, color: accentColor }}
            >
              <CheckCircle size={20} weight="fill" />
              <span className="text-xs font-black uppercase tracking-tight">Validado pelo Sistema</span>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};
