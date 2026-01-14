import { Medal, Users, Calendar, Package, MapPin, Tag, Buildings, CheckCircle, WarningCircle, CircleNotch } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BlendComposition } from "../BlendComposition";
import { useState, useEffect } from "react";
import { brandsApi, producersApi, associationsApi, industriesApi } from "@/services/api";
import { generateSlug } from "@/utils/slug-generator";
import { generateLotCode } from "@/utils/lot-code-generator";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

interface ProductionStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode: boolean;
  producers: Producer[];
  associations: any[];
  industries: any[];
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
  qrValue?: string;
}

export const ProductionStep = ({ formData, setFormData, isBlendMode, producers, associations, industries, branding, qrValue }: ProductionStepProps) => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [filteredAssociations, setFilteredAssociations] = useState<any[]>([]);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  useEffect(() => {
    const loadProducerData = async () => {
      if (formData.producer_id) {
        setLoadingBrands(true);
        try {
          const [brandsData, producerAssocs] = await Promise.all([
            brandsApi.getByProducer(formData.producer_id),
            associationsApi.getByProducer(formData.producer_id)
          ]);
          setBrands(brandsData);
          setFilteredAssociations(producerAssocs);
          
          if (producerAssocs.length === 1 && !formData.association_id) {
            setFormData((prev: any) => ({ ...prev, association_id: producerAssocs[0].id }));
          }
        } catch (error) {
          console.error("Erro ao carregar dados do produtor:", error);
        } finally {
          setLoadingBrands(false);
        }
      } else {
        setBrands([]);
        setFilteredAssociations([]);
      }
    };
    
    loadProducerData();
  }, [formData.producer_id, setFormData]);

  const updateLotCode = async (producerId: string, brandId?: string) => {
    try {
      const producer = producers.find(p => p.id === producerId);
      if (!producer) return;

      let prefix = "";
      if (brandId && brandId !== "none" && brandId !== "") {
        const brand = brands.find(b => b.id === brandId);
        if (brand) {
          prefix = generateSlug(brand.name);
        }
      } else {
        prefix = generateSlug(producer.name);
      }

      const newCode = await generateLotCode(prefix.toUpperCase());
      setFormData({ ...formData, code: newCode });
    } catch (error) {
      console.error("Erro ao atualizar código do lote:", error);
    }
  };

  const handleProducerChange = (value: string) => {
    setFormData({ ...formData, producer_id: value, brand_id: "", association_id: "" });
    updateLotCode(value);
  };

  const handleBrandChange = (value: string) => {
    setFormData({ ...formData, brand_id: value });
    updateLotCode(formData.producer_id, value);
  };

  const FormSection = ({ title, icon: Icon, children, description }: any) => (
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
      {isBlendMode ? (
        <FormSection title="Composição do Blend" icon={Users} description="Mistura de diferentes origens e lotes">
          <BlendComposition 
            formData={formData}
            setFormData={setFormData}
            producers={producers}
            associations={associations}
            branding={branding}
          />
        </FormSection>
      ) : (
        <>
          <FormSection title="Origem & Vinculação" icon={Medal} description="Selecione o produtor e parceiros institucionais">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Users size={16} style={{ color: primaryColor }} /> Produtor Responsável *
                </Label>
                <Select value={formData.producer_id} onValueChange={handleProducerChange}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                    <SelectValue placeholder="Selecione o produtor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {producers.map((producer) => (
                      <SelectItem key={producer.id} value={producer.id}>
                        <div className="flex flex-col text-left py-1">
                          <span className="font-bold text-slate-700">{producer.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{producer.property_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Buildings size={16} style={{ color: primaryColor }} /> Associação / Cooperativa *
                </Label>
                <Select 
                  value={formData.association_id} 
                  onValueChange={value => setFormData({ ...formData, association_id: value })}
                  disabled={!formData.producer_id}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                    <SelectValue placeholder={!formData.producer_id ? "Aguardando produtor..." : "Selecione a entidade"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {filteredAssociations.map((assoc) => (
                      <SelectItem key={assoc.id} value={assoc.id}>
                        <span className="font-bold text-slate-700">{assoc.name}</span>
                      </SelectItem>
                    ))}
                    {filteredAssociations.length === 0 && formData.producer_id && (
                      <div className="p-4 text-center">
                        <p className="text-xs text-rose-500 font-bold">Nenhuma associação vinculada ao produtor.</p>
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Calendar size={16} style={{ color: primaryColor }} /> Ano da Safra *
                </Label>
                <Input 
                  type="number" 
                  value={formData.harvest_year} 
                  onChange={e => setFormData({ ...formData, harvest_year: e.target.value })} 
                  placeholder="2024" 
                  className="h-12 rounded-xl bg-slate-50 border-0 font-bold focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Tag size={16} style={{ color: primaryColor }} /> Indústria Parceira
                </Label>
                <Select 
                  value={formData.industry_id} 
                  onValueChange={value => setFormData({ ...formData, industry_id: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                    <SelectValue placeholder="Processamento (Opcional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none" className="font-bold text-slate-400 italic">Venda Direta / Sem Indústria</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        <span className="font-bold text-slate-700">{industry.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.producer_id && (
                <div className="space-y-2 animate-in slide-in-from-left-4 duration-300">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Medal size={16} style={{ color: primaryColor }} /> Marca Vinculada
                  </Label>
                  <Select value={formData.brand_id} onValueChange={handleBrandChange}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                      <SelectValue placeholder={loadingBrands ? "Buscando marcas..." : "Marca do Produto"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none" className="font-bold text-slate-400 italic">Sem Marca Própria</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          <span className="font-bold text-slate-700">{brand.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection title="Volume de Produção" icon={Package} description="Quantidades e métricas de controle">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Package size={16} style={{ color: primaryColor }} /> Peso Total do Lote *
                </Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.quantity} 
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })} 
                  placeholder="Ex: 500.00" 
                  className="h-12 rounded-xl bg-slate-50 border-0 font-bold focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Tag size={16} style={{ color: primaryColor }} /> Unidade de Medida *
                </Label>
                <Select value={formData.unit} onValueChange={value => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0 focus:ring-primary" style={{ '--primary': primaryColor } as any}>
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
                    onChange={e => setFormData({ ...formData, seals_quantity: e.target.value })} 
                    placeholder="Qtd Etiquetas" 
                    className="h-12 rounded-xl bg-slate-50 border-0 font-bold focus-visible:ring-primary"
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

            <div className="p-6 bg-slate-50 rounded-[1.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 shadow-inner">
              <div className="flex items-center gap-4">
                <div 
                  className="p-3 bg-white rounded-2xl shadow-sm"
                  style={{ color: primaryColor }}
                >
                  <Tag size={24} weight="fill" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Único de Rastreio</p>
                  <h4 className="text-2xl font-mono font-black text-slate-800 tracking-tighter">{formData.code || "GERANDO..."}</h4>
                </div>
              </div>
              <div 
                className="px-6 py-3 rounded-2xl border flex items-center gap-2"
                style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20`, color: accentColor }}
              >
                <CheckCircle size={20} weight="fill" />
                <span className="text-xs font-black uppercase tracking-tight">Validado pelo Sistema</span>
              </div>
            </div>
          </FormSection>
        </>
      )}
    </div>
  );
};
