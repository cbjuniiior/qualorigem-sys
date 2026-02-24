import { Package, Tag, Calendar } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

interface Producer {
  id: string;
  name: string;
}

interface BlendCompositionStepProps {
  formData: any;
  setFormData: (data: any) => void;
  producers: Producer[];
  branding?: { primaryColor: string; secondaryColor?: string; accentColor?: string } | null;
}

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

export const BlendCompositionStep = ({ formData, setFormData, producers, branding }: BlendCompositionStepProps) => {
  const primaryColor = branding?.primaryColor || "#16a34a";
  const components = formData.components || [];

  const totalQuantity = components.reduce((sum: number, c: any) => sum + (parseFloat(c.component_quantity) || 0), 0);

  useEffect(() => {
    setFormData((prev: any) => {
      const current = prev.quantity === undefined ? "" : String(prev.quantity);
      const next = totalQuantity > 0 ? totalQuantity.toString() : "";
      if (current === next) return prev;
      return { ...prev, quantity: next };
    });
  }, [totalQuantity, setFormData]);

  const updateComponent = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newComponents = [...(prev.components || [])];
      newComponents[index] = { ...newComponents[index], [field]: value };
      const total = newComponents.reduce((sum: number, c: any) => sum + (parseFloat(c.component_quantity) || 0), 0);
      return { ...prev, components: newComponents, quantity: total.toString() };
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <FormSection title="Volume e Composição do Blend" icon={Package} description="Ano da safra, peso total e quantidades por participante" primaryColor={primaryColor}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Calendar size={16} style={{ color: primaryColor }} /> Ano da Safra *
            </Label>
            <Input
              type="number"
              value={formData.harvest_year || ""}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, harvest_year: e.target.value }))}
              placeholder="2024"
              className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm"
              style={{ '--primary': primaryColor } as any}
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Ano em que o produto foi colhido.</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Package size={16} style={{ color: primaryColor }} /> Peso Total do Lote *
            </Label>
            <Input
              type="number"
              step="0.01"
              value={formData.quantity || ""}
              readOnly
              className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold opacity-80 cursor-not-allowed"
              style={{ '--primary': primaryColor } as any}
            />
            <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Soma das quantidades dos participantes (automático).</p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
              <Tag size={16} style={{ color: primaryColor }} /> Unidade de Medida *
            </Label>
            <Select value={formData.unit || "Kg"} onValueChange={(v) => setFormData((prev: any) => ({ ...prev, unit: v }))}>
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
                onChange={(e) => setFormData((prev: any) => ({ ...prev, seals_quantity: e.target.value }))}
                placeholder="Qtd Etiquetas"
                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm pr-20"
                style={{ '--primary': primaryColor } as any}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Badge className="border-0 font-black text-[10px] uppercase" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                  Selos
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {components.length > 0 && (
          <>
            <hr className="border-slate-100 my-8" />
            <div>
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-4">Composição por participante</h4>
              <p className="text-xs text-slate-500 font-bold mb-6">Defina o produto e a quantidade de cada origem. O percentual é calculado automaticamente.</p>
              <div className="space-y-6">
                {components.map((comp: any, index: number) => {
                  const qty = parseFloat(comp.component_quantity) || 0;
                  const pct = totalQuantity > 0 ? (qty / totalQuantity) * 100 : 0;
                  const producerName = comp.producer_id ? producers.find((p) => p.id === comp.producer_id)?.name : "";

                  return (
                    <div key={comp.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/30 space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ backgroundColor: primaryColor }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{producerName || "Produtor"}</p>
                          {comp.property_name && (
                            <p className="text-xs text-slate-500 font-bold">{comp.property_name} {comp.city && comp.state && ` · ${comp.city}, ${comp.state}`}</p>
                          )}
                        </div>
                        {totalQuantity > 0 && (
                          <Badge className="ml-auto border-0 font-black text-xs" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                            {pct.toFixed(1)}% do blend
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2 lg:col-span-2">
                          <Label className="font-black text-slate-700 text-xs">Identificação do item *</Label>
                          <Input
                            value={comp.component_name || ""}
                            onChange={(e) => updateComponent(index, "component_name", e.target.value)}
                            placeholder="Ex: Grão tipo A"
                            className="h-12 rounded-xl bg-white border border-slate-200 font-bold"
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-slate-700 text-xs">Quantidade *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={comp.component_quantity ?? ""}
                            onChange={(e) => updateComponent(index, "component_quantity", parseFloat(e.target.value) || 0)}
                            placeholder="Ex: 250"
                            className="h-12 rounded-xl bg-white border border-slate-200 font-bold"
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-black text-slate-700 text-xs">Unidade</Label>
                          <Select
                            value={comp.component_unit || "g"}
                            onValueChange={(v) => updateComponent(index, "component_unit", v)}
                          >
                            <SelectTrigger className="h-12 rounded-xl bg-white border border-slate-200 font-bold" style={{ '--primary': primaryColor } as any}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-bold">
                              <SelectItem value="Kg">Kg</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {components.length === 0 && (
          <div className="text-center py-10 text-slate-500 font-bold">
            Nenhum participante. Volte ao passo anterior (Produtores) para adicionar produtores e propriedades.
          </div>
        )}
      </FormSection>
    </div>
  );
};
