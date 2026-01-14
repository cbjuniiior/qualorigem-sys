import { Package, PlusCircle, X, Medal, Users, CaretDown, CaretRight, Calendar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

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

export const BlendComposition = ({ formData, setFormData, producers, associations, branding }: BlendCompositionProps) => {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());

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
      association_id: undefined
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
      <div className="bg-slate-50/50 border border-slate-100 rounded-[1.5rem] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <Package weight="fill" size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 tracking-tight">Quantidade Total do Blend</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Volume total produzido do blend</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="font-black text-slate-700 ml-1 text-xs">Quantidade Matéria Prima *</Label>
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
            <Label className="font-black text-slate-700 ml-1 text-xs">Número de Selos *</Label>
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
          <h4 className="font-black text-slate-800 tracking-tight uppercase text-sm">Componentes do Blend</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure cada item individualmente</p>
        </div>
        <Button
          type="button"
          onClick={addComponent}
          className="rounded-xl font-black text-white hover:opacity-90 shadow-lg gap-2"
          style={{ backgroundColor: accentColor }}
        >
          <PlusCircle size={20} weight="bold" />
          Adicionar Componente
        </Button>
      </div>

      {formData.components.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Package size={32} className="text-slate-200" />
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
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                    >
                      <span className="text-sm font-black">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      {/* Título Principal - Produtor + Produto */}
                      <div className="flex items-center gap-2 mb-1">
                        {selectedProducer ? (
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-sm">{selectedProducer.name}</span>
                          </div>
                        ) : (
                          <span className="font-black text-slate-300 text-sm italic">Novo Componente</span>
                        )}
                        
                        {component.component_name && (
                          <>
                            <span className="text-slate-300 text-xs font-black px-1">•</span>
                            <span className="font-bold text-slate-500 text-sm">{component.component_name}</span>
                          </>
                        )}
                      </div>
                      
                      {/* Informações Secundárias */}
                      <div className="flex items-center gap-4">
                        {component.component_percentage > 0 && (
                          <Badge 
                            className="border-0 font-black text-[10px] uppercase"
                            style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                          >
                            {component.component_percentage}%
                          </Badge>
                        )}
                        {selectedAssociation && (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Users size={14} className="text-slate-300" weight="fill" />
                            {selectedAssociation.name}
                          </span>
                        )}
                        {component.component_harvest_year && (
                          <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-l border-slate-100 pl-4">
                            <Calendar size={14} className="text-slate-300" weight="fill" />
                            Safra {component.component_harvest_year}
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
                  <div className="border-t border-slate-100 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {/* Produtor */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Produtor Responsável *</Label>
                        <Select 
                          value={component.producer_id || undefined} 
                          onValueChange={value => updateComponent(index, 'producer_id', value)}
                        >
                          <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus:ring-primary" style={{ '--primary': primaryColor } as any}>
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

                      {/* Nome do Componente */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Nome do Componente *</Label>
                        <Input 
                          value={component.component_name} 
                          onChange={e => updateComponent(index, 'component_name', e.target.value)} 
                          placeholder="Ex: Café Arábica Especial" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      {/* Variedade */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Variedade / Processamento</Label>
                        <Input 
                          value={component.component_variety} 
                          onChange={e => updateComponent(index, 'component_variety', e.target.value)} 
                          placeholder="Ex: Catuaí Vermelho" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      {/* Associação */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Associação / Cooperativa</Label>
                        <Select 
                          value={component.association_id || undefined} 
                          onValueChange={value => updateComponent(index, 'association_id', value)}
                        >
                          <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                            <SelectValue placeholder="Selecione a entidade" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {associations.map((association) => (
                              <SelectItem key={association.id} value={association.id}>
                                <div className="flex flex-col text-left py-1">
                                  <span className="font-bold text-slate-700">{association.name}</span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{association.type}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Percentual */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Percentual na Mistura (%) *</Label>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          step="0.1"
                          value={component.component_percentage} 
                          onChange={e => updateComponent(index, 'component_percentage', parseFloat(e.target.value) || 0)} 
                          placeholder="Ex: 50" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      {/* Quantidade */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Quantidade Individual</Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={component.component_quantity} 
                          onChange={e => updateComponent(index, 'component_quantity', parseFloat(e.target.value) || 0)} 
                          placeholder="Ex: 250.00" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      {/* Unidade */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Unidade</Label>
                        <Select 
                          value={component.component_unit} 
                          onValueChange={value => updateComponent(index, 'component_unit', value)}
                        >
                          <SelectTrigger className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                            <SelectValue placeholder="Unidade" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            <SelectItem value="Kg">Quilogramas (Kg)</SelectItem>
                            <SelectItem value="L">Litros (L)</SelectItem>
                            <SelectItem value="un">Unidades</SelectItem>
                            <SelectItem value="g">Gramas (g)</SelectItem>
                            <SelectItem value="ml">Mililitros (ml)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ano da Safra */}
                      <div className="space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Ano da Safra</Label>
                        <Input 
                          type="number"
                          value={component.component_harvest_year} 
                          onChange={e => updateComponent(index, 'component_harvest_year', e.target.value)} 
                          placeholder="Ex: 2024" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>

                      {/* Origem */}
                      <div className="md:col-span-2 space-y-2">
                        <Label className="font-black text-slate-700 ml-1 text-xs">Origem / Região Específica</Label>
                        <Input 
                          value={component.component_origin} 
                          onChange={e => updateComponent(index, 'component_origin', e.target.value)} 
                          placeholder="Ex: Talhão 04 - Região da Cachoeira" 
                          className="h-12 bg-slate-50 border-0 rounded-xl font-bold focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
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

const Separator = ({ className }: { className?: string }) => <div className={`h-px w-full ${className}`} />;
