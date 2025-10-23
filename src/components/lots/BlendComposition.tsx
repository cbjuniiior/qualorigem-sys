import { Package, PlusCircle, X, Medal, Users, CaretDown, CaretRight, Calendar } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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
}

export const BlendComposition = ({ formData, setFormData, producers, associations }: BlendCompositionProps) => {
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());

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
  };

  const removeComponent = (index: number) => {
    const newComponents = formData.components.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, components: newComponents });
  };

  const updateComponent = (index: number, field: string, value: any) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setFormData({ ...formData, components: newComponents });
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
    <div className="space-y-4">
      {/* Header com botão de adicionar */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Componentes do Blend</h4>
          <p className="text-xs text-gray-500">Configure cada componente individualmente</p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addComponent}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adicionar Componente
        </Button>
      </div>

      {formData.components.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">Nenhum componente adicionado</h3>
          <p className="text-sm text-gray-500 mb-4">Adicione os componentes que compõem este blend.</p>
          <Button onClick={addComponent} size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Adicionar Primeiro Componente
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {formData.components.map((component: any, index: number) => {
            const isExpanded = expandedComponents.has(component.id);
            const selectedProducer = producers.find(p => p.id === component.producer_id);
            const selectedAssociation = associations.find(a => a.id === component.association_id);
            
            // Debug logs
            console.log(`Componente ${index + 1}:`, {
              component,
              producer_id: component.producer_id,
              producer_id_type: typeof component.producer_id,
              producer_id_length: component.producer_id?.length,
              selectedProducer,
              selectedProducer_id: selectedProducer?.id,
              producers_available: producers.length,
              producers_ids: producers.map(p => p.id),
              producers_ids_types: producers.map(p => ({ id: p.id, type: typeof p.id }))
            });
            
            return (
              <div key={component.id} className="border border-gray-200 rounded-lg bg-white">
                {/* Header da Sanfona */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleComponent(component.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      {/* Título Principal - Produtor + Produto */}
                      <div className="flex items-center gap-2 mb-1">
                        {selectedProducer && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Medal className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="font-semibold text-gray-900 text-sm">
                              {selectedProducer.name}
                            </span>
                          </div>
                        )}
                        
                        {selectedProducer && component.component_name && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <span className="text-xs">+</span>
                          </div>
                        )}
                        
                        {component.component_name && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <Package className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-700 text-sm">
                              {component.component_name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Informações Secundárias */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {component.component_percentage > 0 && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {component.component_percentage}%
                          </span>
                        )}
                        {selectedAssociation && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {selectedAssociation.name}
                          </span>
                        )}
                        {component.component_harvest_year && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Safra {component.component_harvest_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeComponent(index);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {isExpanded ? (
                      <CaretDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <CaretRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Conteúdo da Sanfona */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome do Componente */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Nome do Componente *
                        </Label>
                        <Input 
                          value={component.component_name} 
                          onChange={e => updateComponent(index, 'component_name', e.target.value)} 
                          placeholder="Ex: Café Arábica" 
                          className="h-9"
                        />
                      </div>

                      {/* Variedade */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Variedade
                        </Label>
                        <Input 
                          value={component.component_variety} 
                          onChange={e => updateComponent(index, 'component_variety', e.target.value)} 
                          placeholder="Variedade do componente" 
                          className="h-9"
                        />
                      </div>

                      {/* Produtor */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Produtor *
                        </Label>
                        <Select 
                          value={component.producer_id || undefined} 
                          onValueChange={value => updateComponent(index, 'producer_id', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione o produtor" />
                          </SelectTrigger>
                          <SelectContent>
                            {producers.map((producer) => (
                              <SelectItem key={producer.id} value={producer.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{producer.name}</span>
                                  <span className="text-sm text-gray-500">{producer.property_name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* Debug info */}
                        <div className="text-xs text-gray-400 mt-1">
                          Debug: producer_id = "{component.producer_id}", selectedProducer = {selectedProducer ? selectedProducer.name : "null"}
                        </div>
                      </div>

                      {/* Associação */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Associação
                        </Label>
                        <Select 
                          value={component.association_id || undefined} 
                          onValueChange={value => updateComponent(index, 'association_id', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione a associação" />
                          </SelectTrigger>
                          <SelectContent>
                            {associations.map((association) => (
                              <SelectItem key={association.id} value={association.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{association.name}</span>
                                  <span className="text-sm text-gray-500">{association.type}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Percentual */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Percentual (%) *
                        </Label>
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          step="0.1"
                          value={component.component_percentage} 
                          onChange={e => updateComponent(index, 'component_percentage', parseFloat(e.target.value) || 0)} 
                          placeholder="50" 
                          className="h-9"
                        />
                      </div>

                      {/* Quantidade */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Quantidade
                        </Label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={component.component_quantity} 
                          onChange={e => updateComponent(index, 'component_quantity', parseFloat(e.target.value) || 0)} 
                          placeholder="250" 
                          className="h-9"
                        />
                      </div>

                      {/* Unidade */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Unidade
                        </Label>
                        <Select 
                          value={component.component_unit} 
                          onValueChange={value => updateComponent(index, 'component_unit', value)}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Selecione a unidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Kg">Quilogramas (Kg)</SelectItem>
                            <SelectItem value="L">Litros (L)</SelectItem>
                            <SelectItem value="un">Unidades</SelectItem>
                            <SelectItem value="g">Gramas (g)</SelectItem>
                            <SelectItem value="ml">Mililitros (ml)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ano da Safra */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Ano da Safra
                        </Label>
                        <Input 
                          type="number"
                          value={component.component_harvest_year} 
                          onChange={e => updateComponent(index, 'component_harvest_year', e.target.value)} 
                          placeholder="2024" 
                          className="h-9"
                        />
                      </div>

                      {/* Origem */}
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium mb-2 block">
                          Origem
                        </Label>
                        <Input 
                          value={component.component_origin} 
                          onChange={e => updateComponent(index, 'component_origin', e.target.value)} 
                          placeholder="Região de origem do componente" 
                          className="h-9"
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