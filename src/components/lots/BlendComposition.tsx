import { Package, PlusCircle, X, Medal, Users, CaretDown, CaretRight, Calendar, MapPin, Mountains, Buildings, Tag, Camera, Trash, Plus, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LocationPicker } from "@/components/ui/location-picker";
import { useState, useEffect } from "react";
import { uploadImageToSupabase } from "@/services/upload";
import { toast } from "sonner";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

interface Association {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
}

interface BlendCompositionProps {
  formData: any;
  setFormData: (data: any) => void;
  producers: Producer[];
  associations: Association[];
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
}

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

export const BlendComposition = ({ formData, setFormData, producers, associations, branding }: BlendCompositionProps) => {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  // Calcular quantidade total automaticamente quando os componentes mudarem
  useEffect(() => {
    const totalQuantity = formData.components.reduce((sum: any, component: any) => {
      return sum + (parseFloat(component.component_quantity) || 0);
    }, 0);
    
    // Só atualizar se a quantidade calculada for diferente da atual
    if (parseFloat(formData.quantity) !== totalQuantity) {
      setFormData({ 
        ...formData, 
        quantity: totalQuantity.toString()
      });
    }
  }, [formData.components]);

  const addComponent = () => {
    const newComponent = {
      id: crypto.randomUUID(),
      component_name: "",
      component_variety: "",
      component_percentage: 0,
      component_quantity: 0,
      component_unit: "g",
      component_origin: "",
      producer_id: undefined,
      component_harvest_year: "",
      association_id: undefined,
      latitude: undefined,
      longitude: undefined,
      property_name: "",
      altitude: undefined,
      city: "",
      state: "",
      photos: [] as string[]
    };
    setFormData({
      ...formData,
      components: [...formData.components, newComponent]
    });
    setExpandedComponents(new Set([...expandedComponents, newComponent.id]));
  };

  const removeComponent = (index: number) => {
    const newComponents = formData.components.filter((_: any, i: number) => i !== index);
    
    // Recalcular a quantidade total após remover um componente
    const totalQuantity = newComponents.reduce((sum: any, component: any) => {
      return sum + (parseFloat(component.component_quantity) || 0);
    }, 0);
    
    setFormData({ 
      ...formData, 
      components: newComponents,
      quantity: totalQuantity.toString()
    });
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    
    // Se a quantidade de um componente foi alterada, recalcular a quantidade total
    if (field === 'component_quantity') {
      const totalQuantity = newComponents.reduce((sum: any, component: any) => {
        return sum + (parseFloat(component.component_quantity) || 0);
      }, 0);
      
      setFormData({ 
        ...formData, 
        components: newComponents,
        quantity: totalQuantity.toString()
      });
    } else {
      setFormData({ ...formData, components: newComponents });
    }
  };

  const handleProducerChange = (index: number, producerId: string) => {
    const producer = producers.find(p => p.id === producerId);
    if (producer) {
      const newComponents = [...formData.components];
      newComponents[index] = {
        ...newComponents[index],
        producer_id: producerId,
        property_name: producer.property_name || "",
        city: producer.city || "",
        state: producer.state || "",
        latitude: producer.latitude || undefined,
        longitude: producer.longitude || undefined,
        altitude: producer.altitude || undefined,
        property_description: producer.property_description || "",
        photos: producer.photos || []
      };
      setFormData({ ...formData, components: newComponents });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const componentId = formData.components[index].id;
    setUploadingPhoto(componentId);
    try {
      const currentPhotos = [...(formData.components[index].photos || [])];
      for (const file of files) {
        const url = await uploadImageToSupabase(file);
        currentPhotos.push(url);
      }
      updateComponent(index, 'photos', currentPhotos);
      toast.success("Fotos do componente carregadas!");
    } catch (error) {
      toast.error("Erro no upload das fotos");
    } finally {
      setUploadingPhoto(null);
    }
  };

  const toggleComponent = (componentId: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId);
    } else {
      newExpanded.add(componentId);
    }
    setExpandedComponents(newExpanded);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Quantidade Total do Blend */}
      <div className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6 shadow-inner">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Package weight="fill" size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">Métricas Gerais do Blend</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume total e emissão de selos</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-black text-slate-700 ml-1 text-xs">Peso Final do Blend (Auto)</Label>
            <Input 
              type="number" 
              step="0.01" 
              value={formData.quantity} 
              readOnly
              className="h-12 bg-white border-0 rounded-xl font-bold opacity-70 cursor-not-allowed"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="font-black text-slate-700 ml-1 text-xs">Unidade Matéria Prima *</Label>
            <Select value={formData.unit} onValueChange={value => setFormData({ ...formData, unit: value })}>
              <SelectTrigger className="h-12 bg-white border-0 rounded-xl font-bold focus:ring-primary" style={{ '--primary': primaryColor } as any}>
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
            <Label className="font-black text-slate-700 ml-1 text-xs">Total de Selos *</Label>
            <Input 
              type="number" 
              step="1" 
              value={formData.seals_quantity || ""} 
              onChange={e => setFormData({ ...formData, seals_quantity: e.target.value })} 
              placeholder="Ex: 100" 
              className="h-12 bg-white border-0 rounded-xl font-bold focus-visible:ring-primary"
              style={{ '--primary': primaryColor } as any}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-slate-100" />

      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h4 className="font-black text-slate-800 tracking-tight uppercase text-sm">Componentes da Mistura</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Defina produtores e locais para cada item</p>
        </div>
        <Button
          type="button"
          onClick={addComponent}
          className="rounded-xl font-black text-white hover:opacity-90 shadow-lg gap-2"
          style={{ backgroundColor: accentColor }}
        >
          <PlusCircle size={20} weight="bold" />
          Novo Componente
        </Button>
      </div>

      {formData.components.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Medal size={32} className="text-slate-200" />
          </div>
          <h3 className="font-black text-slate-900 mb-1">Nenhum componente adicionado</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 px-10">Este blend precisa de pelo menos uma origem cadastrada.</p>
          <Button 
            onClick={addComponent} 
            className="rounded-2xl font-black text-white px-8 h-12 shadow-xl transition-all"
            style={{ backgroundColor: accentColor }}
          >
            Adicionar Primeiro Componente
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.components.map((component: any, index: number) => {
            const isExpanded = expandedComponents.has(component.id);
            const selectedProducer = producers.find(p => p.id === component.producer_id);
            const selectedAssociation = associations.find(a => a.id === component.association_id);
            
            return (
              <div key={component.id} className="border border-slate-100 rounded-[1.5rem] bg-white shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Header da Sanfona */}
                <div 
                  className={`flex items-center justify-between p-5 cursor-pointer transition-colors ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/30'}`}
                  onClick={() => toggleComponent(component.id)}
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      <span className="text-sm font-black">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedProducer ? (
                          <span className="font-black text-slate-800 text-sm">{selectedProducer.name}</span>
                        ) : (
                          <span className="font-black text-slate-300 text-sm italic">Defina a origem</span>
                        )}
                        {component.component_name && (
                          <Badge className="bg-slate-100 text-slate-500 border-0 font-bold text-[10px] uppercase">{component.component_name}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {component.component_percentage > 0 && (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{component.component_percentage}% do blend</span>
                        )}
                        {component.city && (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <MapPin size={12} weight="fill" /> {component.city}, {component.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(index);
                      }}
                      className="h-9 w-9 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <X size={18} weight="bold" />
                    </Button>
                    <div className={`p-2 rounded-lg bg-slate-100/50 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <CaretDown size={16} weight="bold" />
                    </div>
                  </div>
                </div>

                {/* Conteúdo da Sanfona */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-8 space-y-10 animate-in slide-in-from-top-4 duration-300 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Produtor */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Produtor Origem *</Label>
                        <Select 
                          value={component.producer_id || undefined} 
                          onValueChange={value => handleProducerChange(index, value)}
                        >
                          <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                            <SelectValue placeholder="Selecione o produtor" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {producers.map((producer) => (
                              <SelectItem key={producer.id} value={producer.id}>
                                <span className="font-bold text-slate-700">{producer.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Nome do Componente */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Identificação do Item *</Label>
                        <Input 
                          value={component.component_name} 
                          onChange={e => updateComponent(index, 'component_name', e.target.value)} 
                          placeholder="Ex: Grão colheita tardia" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Nome da Propriedade *</Label>
                        <Input 
                          value={component.property_name} 
                          onChange={e => updateComponent(index, 'property_name', e.target.value)} 
                          placeholder="Nome do sítio/fazenda" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Cidade Origem</Label>
                        <Input 
                          value={component.city} 
                          onChange={e => updateComponent(index, 'city', e.target.value)} 
                          placeholder="Cidade" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Estado</Label>
                        <Select value={component.state} onValueChange={v => updateComponent(index, 'state', v)}>
                          <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                            <SelectValue placeholder="UF" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {stateOptions.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Percentual (%) *</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          step="0.1"
                          value={component.component_percentage} 
                          onChange={e => updateComponent(index, 'component_percentage', parseFloat(e.target.value) || 0)} 
                          placeholder="Ex: 50" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary text-emerald-600"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Quantidade Individual</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number" 
                            step="0.01" 
                            value={component.component_quantity} 
                            onChange={e => updateComponent(index, 'component_quantity', parseFloat(e.target.value) || 0)} 
                            placeholder="Ex: 250.00" 
                            className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary flex-1"
                            style={{ '--primary': primaryColor } as any}
                          />
                          <Select value={component.component_unit} onValueChange={v => updateComponent(index, 'component_unit', v)}>
                            <SelectTrigger className="h-12 w-24 bg-slate-50 border-0 rounded-xl font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="Kg">Kg</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Altitude (m)</Label>
                        <Input 
                          type="number"
                          value={component.altitude} 
                          onChange={e => updateComponent(index, 'altitude', e.target.value)} 
                          placeholder="Ex: 1100" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Safra</Label>
                        <Input 
                          value={component.component_harvest_year} 
                          onChange={e => updateComponent(index, 'component_harvest_year', e.target.value)} 
                          placeholder="Ex: 2024" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label className="font-black text-slate-700 ml-1 text-xs uppercase tracking-widest flex items-center gap-2">
                          <MapPin size={16} style={{ color: primaryColor }} weight="fill" /> Localização desta Origem
                        </Label>
                        <LocationPicker 
                          value={component.latitude && component.longitude ? { lat: parseFloat(component.latitude), lng: parseFloat(component.longitude) } : null}
                          onChange={(coords) => {
                            const newComponents = [...formData.components];
                            newComponents[index] = { ...newComponents[index], latitude: coords.lat.toString(), longitude: coords.lng.toString() };
                            setFormData({ ...formData, components: newComponents });
                          }}
                          primaryColor={primaryColor}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label className="font-black text-slate-700 ml-1 text-xs uppercase tracking-widest flex items-center gap-2">
                          <Camera size={16} style={{ color: primaryColor }} weight="fill" /> Fotos desta Propriedade
                        </Label>
                        <div className="grid grid-cols-3 gap-4">
                          {component.photos?.map((p: string, i: number) => (
                            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm">
                              <img src={p} className="w-full h-full object-cover" alt="Propriedade" />
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newPhotos = component.photos.filter((_: any, idx: number) => idx !== i);
                                  updateComponent(index, 'photos', newPhotos);
                                }}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                              >
                                <Trash size={18} weight="fill" />
                              </button>
                            </div>
                          ))}
                          <button 
                            type="button"
                            onClick={() => document.getElementById(`comp-photos-${index}`)?.click()}
                            disabled={uploadingPhoto === component.id}
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 transition-all group"
                          >
                            {uploadingPhoto === component.id ? <CircleNotch className="animate-spin h-5 w-5" /> : (
                              <>
                                <div className="p-1.5 bg-slate-100 rounded-lg group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                  <Plus size={16} weight="bold" />
                                </div>
                                <span className="text-[9px] font-black uppercase">Foto</span>
                              </>
                            )}
                          </button>
                          <input id={`comp-photos-${index}`} type="file" multiple className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, index)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
