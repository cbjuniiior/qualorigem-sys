import { Package, Tag, Calendar } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

// FormSection extraído para evitar re-renders
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

export const VolumeStep = ({ formData, setFormData, isBlendMode, producers, branding }: VolumeStepProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <FormSection title="Volume de Produção" icon={Package} description="Quantidades e métricas de controle" primaryColor={primaryColor}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Primeira linha: Ano da Safra e Peso Total */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Calendar size={16} style={{ color: primaryColor }} /> Ano da Safra *
            </Label>
            <Input 
              type="number" 
              value={formData.harvest_year || ""} 
              onChange={e => setFormData((prev: any) => ({ ...prev, harvest_year: e.target.value }))} 
              placeholder="2024" 
              className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm"
              style={{ '--primary': primaryColor } as any}
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">O ano em que o produto foi colhido.</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Package size={16} style={{ color: primaryColor }} /> Peso Total do Lote *
            </Label>
            <Input 
              type="number" 
              step="0.01" 
              value={formData.quantity || ""} 
              onChange={e => setFormData((prev: any) => ({ ...prev, quantity: e.target.value }))} 
              placeholder="Ex: 500.00" 
              className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm"
              style={{ '--primary': primaryColor } as any}
              readOnly={isBlendMode}
            />
            {isBlendMode && <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Calculado automaticamente via componentes</p>}
          </div>

          {/* Segunda linha: Unidade de Medida e Selos */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Tag size={16} style={{ color: primaryColor }} /> Unidade de Medida *
            </Label>
            <Select 
              value={formData.unit || ""} 
              onValueChange={value => setFormData((prev: any) => ({ ...prev, unit: value }))}
            >
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                <SelectValue placeholder="Selecione a unidade" />
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
                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm pr-20"
                style={{ '--primary': primaryColor } as any}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
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
      </FormSection>
    </div>
  );
};
