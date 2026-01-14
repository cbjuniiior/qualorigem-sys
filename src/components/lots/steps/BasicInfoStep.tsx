import { 
  Package, 
  QrCode, 
  Calendar, 
  Tag, 
  CheckCircle, 
  IdentificationCard, 
  XCircle, 
  WarningCircle, 
  Trash, 
  Info,
  Plus,
  ListBullets,
  PlusCircle,
  Users,
  Buildings,
  CircleNotch,
  Medal,
  CaretDown
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { categoriesApi, characteristicsApi, brandsApi, associationsApi, producersApi, systemConfigApi } from "@/services/api";
import { generateSlug } from "@/utils/slug-generator";
import { generateLotCode } from "@/utils/lot-code-generator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode: boolean;
  setIsBlendMode: (mode: boolean) => void;
  qrValue: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string | null;
  } | null;
  producers: any[];
  associations: any[];
  industries: any[];
}

export const BasicInfoStep = ({
  formData,
  setFormData,
  isBlendMode,
  setIsBlendMode,
  qrValue,
  branding,
  producers,
  associations,
  industries
}: BasicInfoStepProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  const [categories, setCategories] = useState<any[]>([]);
  const [allCharacteristics, setAllCharacteristics] = useState<any[]>([]);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [lotConfig, setLotConfig] = useState<any>(null);
  const [codeMode, setCodeMode] = useState<'auto' | 'manual'>('auto');

  useEffect(() => {
    loadEntities();
    loadLotConfig();
  }, []);

  const loadLotConfig = async () => {
    try {
      const config = await systemConfigApi.getLotIdConfig();
      setLotConfig(config);
      if (config.mode === 'manual') {
        setCodeMode('manual');
      }
    } catch (e) {}
  };

  useEffect(() => {
    const loadProducerData = async () => {
      if (formData.producer_id) {
        setLoadingBrands(true);
        try {
          const [brandsData] = await Promise.all([
            brandsApi.getByProducer(formData.producer_id),
          ]);
          setBrands(brandsData);
        } catch (error) {
          console.error("Erro ao carregar dados do produtor:", error);
        } finally {
          setLoadingBrands(false);
        }
      } else {
        setBrands([]);
      }
    };
    
    if (!isBlendMode) {
      loadProducerData();
    }
  }, [formData.producer_id, isBlendMode]);

  // Efeito para atualizar o código automaticamente quando produtor ou marca mudar
  useEffect(() => {
    if (!isBlendMode && formData.producer_id && codeMode === 'auto' && lotConfig?.mode !== 'manual') {
      const updateCode = async () => {
        let prefix = "";
        if (lotConfig?.mode === 'producer_brand') {
          const producer = producers.find(p => p.id === formData.producer_id);
          if (producer) {
            if (formData.brand_id && formData.brand_id !== "none" && formData.brand_id !== "") {
              const brand = brands.find(b => b.id === formData.brand_id);
              if (brand) {
                prefix = generateSlug(brand.name).toUpperCase();
              }
            } else {
              prefix = generateSlug(producer.name).toUpperCase();
            }
          }
        }
        
        try {
          const newCode = await generateLotCode(prefix || undefined, false);
          if (newCode !== formData.code) {
            setFormData((prev: any) => ({ ...prev, code: newCode }));
          }
        } catch (e) {
          console.error("Erro ao atualizar código no efeito:", e);
        }
      };
      updateCode();
    }
  }, [formData.producer_id, formData.brand_id, codeMode, lotConfig, isBlendMode, producers, brands]);

  const handleProducerChange = (value: string) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      producer_id: value, 
      brand_id: "", 
      association_id: "" 
    }));
  };

  const handleBrandChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, brand_id: value }));
  };

  const loadEntities = async () => {
    try {
      const [cats, chars] = await Promise.all([
        categoriesApi.getAll(),
        characteristicsApi.getAll()
      ]);
      setCategories(cats);
      setAllCharacteristics(chars);
    } catch (error) {
      console.error("Erro ao carregar entidades:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName) return;
    try {
      const newCat = await categoriesApi.create({ name: newCategoryName });
      setCategories([...categories, newCat]);
      setFormData((prev: any) => ({ ...prev, category: newCat.name }));
      setIsNewCategoryModalOpen(false);
      setNewCategoryName("");
      toast.success("Categoria criada e selecionada!");
    } catch (error) {
      toast.error("Erro ao criar categoria");
    }
  };

  const addCharacteristic = () => {
    setFormData((prev: any) => ({
      ...prev,
      characteristics: [...(prev.characteristics || []), { characteristic_id: "", value: "" }]
    }));
  };

  const removeCharacteristic = (index: number) => {
    setFormData((prev: any) => {
      const characteristics = [...(prev.characteristics || [])];
      characteristics.splice(index, 1);
      return { ...prev, characteristics };
    });
  };

  const updateCharacteristic = (index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const characteristics = [...(prev.characteristics || [])];
      characteristics[index] = { ...characteristics[index], [field]: value };
      return { ...prev, characteristics };
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 text-left">
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Estrutura de Produção</Label>
        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.5rem] shadow-inner ring-1 ring-slate-200/50 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setIsBlendMode(false);
              setFormData({ ...formData, components: [] });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
              !isBlendMode 
                ? "bg-white shadow-lg scale-105" 
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={!isBlendMode ? { color: primaryColor } : {}}
          >
            <Package size={20} weight={!isBlendMode ? "fill" : "bold"} />
            Produto Único
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBlendMode(true);
              if (formData.components.length === 0) {
                const initialComponent = {
                  id: crypto.randomUUID(),
                  component_name: "",
                  component_variety: "",
                  component_percentage: 0,
                  component_quantity: 0,
                  component_unit: "g",
                  component_origin: "",
                  producer_id: undefined,
                  component_harvest_year: "",
                  association_id: undefined
                };
                setFormData({ ...formData, components: [initialComponent] });
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
              isBlendMode 
                ? "bg-white shadow-lg scale-105" 
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={isBlendMode ? { color: primaryColor } : {}}
          >
            <Tag size={20} weight={isBlendMode ? "fill" : "bold"} />
            Blend / Mistura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-10 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div 
                className="p-2.5 rounded-xl border shadow-sm"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
              >
                <IdentificationCard size={24} weight="duotone" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Identificação do Produto</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Essas informações serão o primeiro contato do consumidor com seu produto.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
              <div className="space-y-8">
                {/* Seleção de Produtor/Marca se não for Blend */}
                {!isBlendMode && (
                  <div className="grid grid-cols-1 gap-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Users size={16} style={{ color: primaryColor }} /> Produtor Responsável *
                      </Label>
                      <Select value={formData.producer_id} onValueChange={handleProducerChange}>
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                          <SelectValue placeholder="Selecione o produtor" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          {producers.map((producer) => (
                            <SelectItem key={producer.id} value={producer.id}>{producer.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">O proprietário ou fazenda principal deste lote.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Medal size={16} style={{ color: primaryColor }} /> Marca Vinculada
                      </Label>
                      <Select 
                        value={formData.brand_id || "none"} 
                        onValueChange={handleBrandChange}
                        disabled={!formData.producer_id}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                          <SelectValue placeholder={loadingBrands ? "Buscando marcas..." : "Marca do Produto"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          <SelectItem value="none" className="font-bold text-slate-400 italic">Sem Marca Própria</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Tag size={16} style={{ color: primaryColor }} /> Nome do Lote *
                  </Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Ex: Café Especial da Fazenda" 
                    className="h-12 bg-slate-50 border-0 rounded-xl focus-visible:ring-primary font-bold"
                    style={{ '--primary': primaryColor } as any}
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Como o consumidor verá o produto na página pública.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1 mb-1">
                    <Label className="flex items-center gap-2 font-black text-slate-700">
                      <Package size={16} style={{ color: primaryColor }} /> Categoria *
                    </Label>
                    <button 
                      type="button"
                      onClick={() => setIsNewCategoryModalOpen(true)}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                      style={{ color: primaryColor }}
                    >
                      <Plus size={12} weight="bold" /> Nova
                    </button>
                  </div>
                  <Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}>
                    <SelectTrigger 
                      className="h-12 rounded-xl bg-slate-50 border-0 font-bold px-6 focus:ring-primary"
                      style={{ '--primary': primaryColor } as any}
                    >
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                {/* Código do Lote com Modos */}
                <div 
                  className="p-6 rounded-[2.5rem] space-y-6 border shadow-sm transition-all duration-500"
                  style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="font-black text-sm flex items-center gap-2" style={{ color: primaryColor }}>
                        <QrCode size={18} weight="bold" />
                        Código do Lote
                      </Label>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identificador exclusivo</p>
                    </div>
                    
                    {lotConfig?.mode === 'producer_brand' && (
                      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        <button
                          type="button"
                          onClick={() => setCodeMode('auto')}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${codeMode === 'auto' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          style={codeMode === 'auto' ? { backgroundColor: primaryColor } : {}}
                        >
                          Auto
                        </button>
                        <button
                          type="button"
                          onClick={() => setCodeMode('manual')}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${codeMode === 'manual' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          style={codeMode === 'manual' ? { backgroundColor: primaryColor } : {}}
                        >
                          Manual
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="relative group">
                    {codeMode === 'auto' ? (
                      <div className="h-14 bg-white border border-slate-100 rounded-2xl flex items-center px-6 transition-all group-hover:border-primary/30 shadow-inner" style={{ '--primary': primaryColor } as any}>
                        <span className="text-2xl font-mono font-black text-slate-800 tracking-tighter">
                          {formData.code || "GERANDO..."}
                        </span>
                        {formData.code && (
                          <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                        )}
                      </div>
                    ) : (
                      <Input 
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="DIGITE O CÓDIGO"
                        className="h-14 bg-white border-slate-200 rounded-2xl font-mono font-black text-2xl text-slate-800 focus-visible:ring-primary text-center uppercase tracking-widest placeholder:text-slate-200"
                        style={{ '--primary': primaryColor } as any}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 px-2">
                    <Info size={14} className="text-slate-400" />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                      {codeMode === 'auto' 
                        ? "O código é gerado automaticamente seguindo as regras da plataforma." 
                        : "Você tem total liberdade para definir o código deste lote."}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between ml-1 mb-1">
                    <Label className="flex items-center gap-2 font-black text-slate-700">
                      <ListBullets size={16} style={{ color: primaryColor }} /> Características
                    </Label>
                    <button 
                      type="button" 
                      onClick={addCharacteristic}
                      className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                      style={{ color: primaryColor }}
                    >
                      <Plus size={12} weight="bold" /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(formData.characteristics || []).map((char: any, index: number) => (
                      <div key={index} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex-1">
                          <Select 
                            value={char.characteristic_id} 
                            onValueChange={value => updateCharacteristic(index, 'characteristic_id', value)}
                          >
                            <SelectTrigger className="h-10 rounded-xl bg-slate-50 border-0 font-bold text-xs">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-bold">
                              {allCharacteristics.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-[1.5]">
                          <Input 
                            value={char.value}
                            onChange={e => updateCharacteristic(index, 'value', e.target.value)}
                            placeholder="Valor"
                            className="h-10 bg-slate-50 border-0 rounded-xl font-bold text-xs"
                          />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeCharacteristic(index)} className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl">
                          <Trash size={16} weight="bold" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card 
            className="border-0 shadow-2xl rounded-[3rem] overflow-hidden sticky top-4"
            style={{ backgroundColor: `${primaryColor}08`, ring: `1px solid ${primaryColor}20` }}
          >
            <div className="p-10 space-y-10 flex flex-col items-center">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2" style={{ color: primaryColor }}>
                  <div className="w-8 h-px opacity-20" style={{ backgroundColor: primaryColor }} />
                  <QrCode size={24} weight="bold" />
                  <div className="w-8 h-px opacity-20" style={{ backgroundColor: primaryColor }} />
                </div>
                <h4 className="font-black text-2xl tracking-tight text-slate-800">QR Code Único</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed px-2">Identificação digital exclusiva que garante a origem e qualidade do seu lote.</p>
              </div>

              <div className="relative group">
                <div className="absolute -inset-6 rounded-full blur-3xl transition-all duration-700 opacity-20" style={{ backgroundColor: primaryColor }} />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl transition-transform duration-500 group-hover:scale-105 ring-8 ring-slate-100/50">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={160} 
                    level="H" 
                    includeMargin={false}
                    imageSettings={branding?.logoUrl ? { src: branding.logoUrl, height: 35, width: 35, excavate: true } : undefined}
                  />
                </div>
              </div>

              <div className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-inner space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <span>Ponto de Acesso</span>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                </div>
                <p className="text-[11px] font-mono text-slate-400 break-all leading-tight text-center">{qrValue}</p>
              </div>

              <div className="px-6 py-2.5 rounded-full border flex items-center gap-2" style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20`, color: accentColor }}>
                <CheckCircle size={18} weight="fill" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Link Validado</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Criar Categoria</DialogTitle>
            <DialogDescription className="font-medium tracking-tight">Adicione uma nova categoria de produto rapidamente.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Nome *</Label>
              <Input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Ex: Mel, Queijo..." className="h-12 bg-slate-50 border-0 rounded-xl font-bold" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewCategoryModalOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
            <Button onClick={handleCreateCategory} className="rounded-xl font-bold text-white" style={{ backgroundColor: primaryColor }}>Criar e Usar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
