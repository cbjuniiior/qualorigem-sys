import { useState, useEffect } from "react";
import { Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { productLotsApi, producersApi, associationsApi } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LotForm } from "@/components/lots/LotForm";
import { LotCard } from "@/components/lots/LotCard";
import { ProductLot } from "@/types/lot";


interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

const Lotes = () => {
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    variety: "",
    harvest_year: "",
    quantity: "",
    unit: "",
    seals_quantity: "",
    image_url: "",
    producer_id: "",
    fragrance_score: 5,
    flavor_score: 5,
    finish_score: 5,
    acidity_score: 5,
    body_score: 5,
    sensory_notes: "",
    lot_observations: "",
    youtube_video_url: "",
    video_delay_seconds: 10,
    components: [] as Array<{
      id: string;
      component_name: string;
      component_variety: string;
      component_percentage: number;
      component_quantity: number;
      component_unit: string;
      component_origin: string;
      producer_id?: string;
      component_harvest_year?: string;
      association_id?: string;
    }>,
  });

  // Blend mode state
  const [isBlendMode, setIsBlendMode] = useState(false);
  
  // Steps state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lotsData, producersData, associationsData] = await Promise.all([
        productLotsApi.getAll(),
        producersApi.getAll(),
        associationsApi.getAll(),
      ]);
      
      // Debug: verificar estrutura dos dados
      console.log("Dados dos lotes:", lotsData);
      console.log("Primeiro lote:", lotsData[0]);
      if (lotsData[0]) {
        console.log("Componentes do primeiro lote:", lotsData[0].lot_components);
        console.log("Estrutura detalhada dos componentes do primeiro lote:", lotsData[0].lot_components?.map((c: any) => ({
          id: c.id,
          component_name: c.component_name,
          component_percentage: c.component_percentage,
          producers: c.producers,
          associations: c.associations
        })));
      }
      
      setLots(lotsData);
      setProducers(producersData);
      setAssociations(associationsData || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      // Validações obrigatórias
      if (!formData.image_url) {
        toast.error("Foto do lote é obrigatória!");
        return;
      }
      
      if (!formData.name || !formData.category) {
        toast.error("Preencha todos os campos obrigatórios!");
        return;
      }

      // Validação específica para blend
      if (isBlendMode) {
        if (!formData.components || formData.components.length === 0) {
          toast.error("Adicione pelo menos um componente ao blend!");
          return;
        }
        
        // Validar se todos os componentes têm os campos obrigatórios
        for (let i = 0; i < formData.components.length; i++) {
          const component = formData.components[i];
          if (!component.producer_id) {
            toast.error(`Selecione um produtor para o componente ${i + 1}!`);
            return;
          }
          if (!component.component_name || component.component_name.trim() === "") {
            toast.error(`Digite o nome do componente ${i + 1}!`);
            return;
          }
          if (!component.component_percentage || component.component_percentage <= 0) {
            toast.error(`Digite um percentual válido para o componente ${i + 1}!`);
            return;
          }
        }
      } else {
        // Validação para lote normal
        if (!formData.producer_id) {
          toast.error("Selecione um produtor!");
          return;
        }
      }

      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        seals_quantity: formData.seals_quantity ? parseInt(formData.seals_quantity) : null,
        fragrance_score: formData.fragrance_score || null,
        flavor_score: formData.flavor_score || null,
        finish_score: formData.finish_score || null,
        acidity_score: formData.acidity_score || null,
        body_score: formData.body_score || null,
        variety: formData.variety && formData.variety.trim() !== "" ? formData.variety : null,
        harvest_year: formData.harvest_year && formData.harvest_year.trim() !== "" ? formData.harvest_year : null,
        sensory_notes: formData.sensory_notes && formData.sensory_notes.trim() !== "" ? formData.sensory_notes : null,
        lot_observations: formData.lot_observations && formData.lot_observations.trim() !== "" ? formData.lot_observations : null,
        youtube_video_url: formData.youtube_video_url && formData.youtube_video_url.trim() !== "" ? formData.youtube_video_url : null,
        video_delay_seconds: formData.video_delay_seconds || null,
        // Para blends, producer_id pode ser null
        producer_id: isBlendMode ? null : formData.producer_id,
      };

      // Remove components do lotData principal
      const { components, ...lotDataWithoutComponents } = lotData;
      
      // Debug: log dos dados antes de enviar
      console.log("Dados do lote a serem enviados:", lotDataWithoutComponents);
      
      // Verificar se há campos string vazios que podem causar erro de UUID
      const problematicFields = Object.entries(lotDataWithoutComponents).filter(([key, value]) => 
        typeof value === 'string' && value === ''
      );
      if (problematicFields.length > 0) {
        console.error("Campos com string vazia encontrados:", problematicFields);
        // Converter strings vazias para null
        problematicFields.forEach(([key]) => {
          lotDataWithoutComponents[key] = null;
        });
        console.log("Campos corrigidos para null:", problematicFields.map(([key]) => key));
      }
      
      const newLot = await productLotsApi.create(lotDataWithoutComponents);
      
      // Criar componentes do blend se existirem
      if (components && components.length > 0) {
        await Promise.all(
          components.map(component => 
            productLotsApi.createComponent({
              component_name: component.component_name,
              component_variety: component.component_variety || null,
              component_percentage: component.component_percentage,
              component_quantity: component.component_quantity,
              component_unit: component.component_unit,
              component_origin: component.component_origin || null,
              producer_id: component.producer_id,
              component_harvest_year: component.component_harvest_year && component.component_harvest_year.trim() !== "" ? component.component_harvest_year : null,
              association_id: component.association_id && component.association_id.trim() !== "" ? component.association_id : null,
              lot_id: newLot.id
            })
          )
        );
      }

      toast.success("Lote criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Erro ao criar lote:", error);
      
      // Se for erro de código duplicado, regenerar código e tentar novamente
      if (error?.code === '23505' && error?.message?.includes('product_lots_code_key')) {
        try {
          const newCode = await generateProductCode();
          setFormData({ ...formData, code: newCode });
          toast.error("Código duplicado detectado. Novo código gerado automaticamente. Tente novamente.");
        } catch (regenerateError) {
          toast.error("Erro ao gerar novo código. Tente novamente.");
        }
      } else {
        toast.error("Erro ao criar lote");
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingLot) return;

    try {
      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        seals_quantity: formData.seals_quantity ? parseInt(formData.seals_quantity) : null,
        fragrance_score: formData.fragrance_score,
        flavor_score: formData.flavor_score,
        finish_score: formData.finish_score,
        acidity_score: formData.acidity_score,
        body_score: formData.body_score,
      };

      // Remove components do lotData principal
      const { components, ...lotDataWithoutComponents } = lotData;
      
      // Remover campos que não existem na tabela
      const cleanLotData = {
        code: lotDataWithoutComponents.code,
        name: lotDataWithoutComponents.name,
        category: lotDataWithoutComponents.category,
        variety: lotDataWithoutComponents.variety,
        harvest_year: lotDataWithoutComponents.harvest_year,
        quantity: lotDataWithoutComponents.quantity,
        unit: lotDataWithoutComponents.unit,
        seals_quantity: lotDataWithoutComponents.seals_quantity,
        image_url: lotDataWithoutComponents.image_url,
        producer_id: lotDataWithoutComponents.producer_id,
        fragrance_score: lotDataWithoutComponents.fragrance_score,
        flavor_score: lotDataWithoutComponents.flavor_score,
        finish_score: lotDataWithoutComponents.finish_score,
        acidity_score: lotDataWithoutComponents.acidity_score,
        body_score: lotDataWithoutComponents.body_score,
        sensory_notes: lotDataWithoutComponents.sensory_notes,
        lot_observations: lotDataWithoutComponents.lot_observations,
        youtube_video_url: lotDataWithoutComponents.youtube_video_url,
        video_delay_seconds: lotDataWithoutComponents.video_delay_seconds,
      };
      
      // Debug: verificar exatamente o que está sendo enviado
      console.log("Dados sendo enviados para atualização:", cleanLotData);
      console.log("Campos do formData:", Object.keys(formData));
      
      await productLotsApi.update(editingLot.id, cleanLotData);
      
      // Atualizar componentes do blend
      if (editingLot.id) {
        // Deletar componentes existentes
        await productLotsApi.deleteComponentsByLot(editingLot.id);
        
        // Criar novos componentes se existirem
        if (components && components.length > 0) {
          await Promise.all(
            components.map(component => 
              productLotsApi.createComponent({
                component_name: component.component_name,
                component_variety: component.component_variety,
                component_percentage: component.component_percentage,
                component_quantity: component.component_quantity,
                component_unit: component.component_unit,
                component_origin: component.component_origin,
                producer_id: component.producer_id || null,
                component_harvest_year: component.component_harvest_year || null,
                association_id: component.association_id || null,
                lot_id: editingLot.id
              })
            )
          );
        }
      }

      toast.success("Lote atualizado com sucesso!");
      setEditingLot(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar lote:", error);
      toast.error("Erro ao atualizar lote");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Primeiro, deletar componentes do blend se existirem
      await productLotsApi.deleteComponentsByLot(id);
      
      // Depois deletar o lote principal
      await productLotsApi.delete(id);
      
      toast.success("Lote excluído com sucesso!");
      fetchData();
    } catch (error: any) {
      console.error("Erro ao excluir lote:", error);
      
      // Tratamento específico de erros
      if (error?.code === '42501') {
        toast.error("Sem permissão para excluir este lote");
      } else if (error?.code === '23503') {
        toast.error("Não é possível excluir: lote possui dependências");
      } else {
        toast.error("Erro ao excluir lote: " + (error?.message || "Erro desconhecido"));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "",
      variety: "",
      harvest_year: "",
      quantity: "",
      unit: "",
      seals_quantity: "",
      image_url: "",
      producer_id: "",
      fragrance_score: 5,
      flavor_score: 5,
      finish_score: 5,
      acidity_score: 5,
      body_score: 5,
      sensory_notes: "",
      lot_observations: "",
      youtube_video_url: "",
      video_delay_seconds: 10,
      components: [],
    });
    setIsBlendMode(false);
    setCurrentStep(1);
  };

  const openEditDialog = (lot: ProductLot) => {
    setEditingLot(lot);
    // Buscar componentes tanto em 'components' quanto em 'lot_components'
    const rawComponents = (lot as any).components || (lot as any).lot_components || [];
    
    console.log("Editando lote:", lot);
    console.log("Componentes brutos encontrados:", rawComponents);
    console.log("Estrutura detalhada dos componentes brutos:", rawComponents.map((c: any) => ({
      id: c.id,
      component_name: c.component_name,
      producer_id: c.producer_id,
      producer_id_type: typeof c.producer_id,
      producer_id_value: c.producer_id,
      producers: c.producers,
      association_id: c.association_id,
      associations: c.associations
    })));
    
    // Mapear os componentes para o formato esperado pelo formulário
    const components = rawComponents.map((component: any) => ({
      id: component.id,
      component_name: component.component_name || "",
      component_variety: component.component_variety || "",
      component_percentage: component.component_percentage || 0,
      component_quantity: component.component_quantity || 0,
      component_unit: component.component_unit || "g",
      component_origin: component.component_origin || "",
      producer_id: component.producer_id || null, // Manter null em vez de string vazia
      component_harvest_year: component.component_harvest_year || "",
      association_id: component.association_id || null, // Manter null em vez de string vazia
      // Manter dados relacionados para debug
      _producers: component.producers,
      _associations: component.associations
    }));
    
    console.log("Componentes mapeados:", components);
    console.log("Estrutura dos componentes:", components.map((c: any) => ({
      id: c.id,
      component_name: c.component_name,
      producer_id: c.producer_id,
      producer_id_type: typeof c.producer_id,
      producer_id_value: c.producer_id,
      _producers: c._producers,
      association_id: c.association_id,
      association_id_type: typeof c.association_id,
      association_id_value: c.association_id,
      _associations: c._associations
    })));
    
    setFormData({
      code: lot.code,
      name: lot.name,
      category: lot.category || "",
      variety: lot.variety || "",
      harvest_year: lot.harvest_year || "",
      quantity: lot.quantity?.toString() || "",
      unit: lot.unit || "",
      seals_quantity: (lot as any).seals_quantity?.toString() || "",
      image_url: lot.image_url || "",
      producer_id: lot.producer_id,
      fragrance_score: lot.fragrance_score || 5,
      flavor_score: lot.flavor_score || 5,
      finish_score: lot.finish_score || 5,
      acidity_score: lot.acidity_score || 5,
      body_score: lot.body_score || 5,
      sensory_notes: lot.sensory_notes || "",
      lot_observations: (lot as any).lot_observations || "",
      youtube_video_url: (lot as any).youtube_video_url || "",
      video_delay_seconds: (lot as any).video_delay_seconds || 10,
      components: components,
    });
    
    // Ativar modo blend se já existem componentes
    const hasComponents = components.length > 0;
    console.log("Ativando modo blend:", hasComponents);
    setIsBlendMode(hasComponents);
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = 
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.producers.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "todas" || lot.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(lots.map(lot => lot.category).filter(Boolean)));

  // Função para gerar código do produto único
  const generateProductCode = async () => {
    try {
      // @ts-ignore - função não está nos tipos gerados
      const { data, error } = await supabase.rpc('generate_unique_lot_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao gerar código único:', error);
      // Fallback: usar timestamp + random para garantir unicidade
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `PROD-${year}-${timestamp}-${rand}`;
    }
  };

  // Código do produto gerado automaticamente (apenas uma vez)
  useEffect(() => {
    const generateCode = async () => {
      if (!formData.code) {
        const newCode = await generateProductCode();
        setFormData({ ...formData, code: newCode });
      }
    };
    generateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando lotes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lotes</h1>
            <p className="text-gray-600">Gerencie os lotes de produtos cadastrados</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
              {/* Header Simples */}
              <div className="border-b px-6 py-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Criar Novo Lote</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Passo {currentStep} de {totalSteps}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content Area com scroll */}
              <div className="flex-1 overflow-y-auto p-6">
                <LotForm
                  formData={formData}
                  setFormData={setFormData}
                  producers={producers}
                  associations={associations}
                  isBlendMode={isBlendMode}
                  setIsBlendMode={setIsBlendMode}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  totalSteps={totalSteps}
                  onSubmit={handleCreate}
                  onCancel={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar lotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category!}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredLots.map((lot) => (
            <LotCard
              key={lot.id}
              lot={lot}
              onEdit={openEditDialog}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredLots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum lote encontrado.</p>
          </div>
        )}

        {/* Edit Dialog */}
        {editingLot && (
          <Dialog open={!!editingLot} onOpenChange={() => setEditingLot(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <LotForm
                formData={formData}
                setFormData={setFormData}
                producers={producers}
                associations={associations}
                isBlendMode={isBlendMode}
                setIsBlendMode={setIsBlendMode}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                totalSteps={totalSteps}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setEditingLot(null);
                  resetForm();
                }}
                isEditing={true}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default Lotes;