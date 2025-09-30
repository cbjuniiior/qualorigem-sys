import { useState, useEffect, useRef } from "react";
import { Plus, MagnifyingGlass, PencilSimple, Trash, Calendar, MapPin, Medal, Package, Eye, Funnel, DownloadSimple, Image, QrCode, ArrowUpRight, Quotes, PlusCircle, X, ToggleLeft, ToggleRight, CaretLeft, CaretRight, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { productLotsApi, producersApi } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { QRCodeSVG } from "qrcode.react";

interface ProductLot {
  id: string;
  code: string;
  name: string;
  category: string | null;
  variety: string | null;
  harvest_year: string | null;
  quantity: number | null;
  unit: string | null;
  image_url: string | null;
  producer_id: string;
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
  created_at: string;
  producers: {
    id: string;
    name: string;
    property_name: string;
    city: string;
    state: string;
  };
}

interface Producer {
  id: string;
  name: string;
  property_name: string;
}

const Lotes = () => {
  const navigate = useNavigate();
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
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
    }>,
  });

  // Blend mode state
  const [isBlendMode, setIsBlendMode] = useState(false);
  
  // Steps state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lotsData, producersData] = await Promise.all([
        productLotsApi.getAll(),
        producersApi.getAll(),
      ]);
      setLots(lotsData);
      setProducers(producersData);
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
      
      if (!formData.name || !formData.category || !formData.producer_id) {
        toast.error("Preencha todos os campos obrigatórios!");
        return;
      }

      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        fragrance_score: formData.fragrance_score,
        flavor_score: formData.flavor_score,
        finish_score: formData.finish_score,
        acidity_score: formData.acidity_score,
        body_score: formData.body_score,
      };

      // Remove components do lotData principal
      const { components, ...lotDataWithoutComponents } = lotData;
      
      const newLot = await productLotsApi.create(lotDataWithoutComponents);
      
      // Criar componentes do blend se existirem
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
        fragrance_score: formData.fragrance_score,
        flavor_score: formData.flavor_score,
        finish_score: formData.finish_score,
        acidity_score: formData.acidity_score,
        body_score: formData.body_score,
      };

      // Remove components do lotData principal
      const { components, ...lotDataWithoutComponents } = lotData;
      
      await productLotsApi.update(editingLot.id, lotDataWithoutComponents);
      
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
    const components = (lot as any).components || [];
    setFormData({
      code: lot.code,
      name: lot.name,
      category: lot.category || "",
      variety: lot.variety || "",
      harvest_year: lot.harvest_year || "",
      quantity: lot.quantity?.toString() || "",
      unit: lot.unit || "",
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
    setIsBlendMode(components.length > 0);
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
      // Chamar função do Supabase para gerar código único
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
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  Criar Novo Lote
                </DialogTitle>
                <p className="text-gray-600 mt-2">Preencha as informações abaixo para criar um novo lote de produto</p>
              </DialogHeader>
              <LotForm
                formData={formData}
                setFormData={setFormData}
                producers={producers}
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
            <Card key={lot.id} className="group hover:shadow-2xl hover:-translate-y-1 transition-all rounded-2xl overflow-hidden border border-gray-100 bg-white flex flex-col">
              {/* Imagem do lote */}
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {lot.image_url ? (
                  <img src={lot.image_url} alt={lot.name} className="object-cover w-full h-full" />
                ) : (
                  <Image className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <CardHeader className="pb-2 pt-4 px-5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold truncate">{lot.name}</CardTitle>
                    <p className="text-xs text-gray-400 mt-1 truncate">Código: {lot.code}</p>
                  </div>
                            <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full p-2 text-blue-600 hover:text-blue-700" 
              onClick={() => navigate(`/lote/${lot.code}`)} 
              title="Ver Página Pública"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full p-2" onClick={() => openEditDialog(lot)} title="Editar">
              <PencilSimple className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full p-2 text-red-600 hover:text-red-700" title="Excluir">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Lote</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o lote "{lot.name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(lot.id)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
                </div>
                {/* Badges de categoria e variedade */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {lot.category && <Badge className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">{lot.category}</Badge>}
                  {lot.variety && <Badge className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">{lot.variety}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3 px-5 pb-5">
                {/* Informações principais */}
                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-700 mt-2">
                  <span className="flex items-center gap-1"><Package className="h-4 w-4" /> {lot.quantity} {lot.unit}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Safra {lot.harvest_year}</span>
                  <span className="flex items-center gap-1"><Medal className="h-4 w-4" /> {lot.producers.name}</span>
                </div>
                {/* Notas sensoriais */}
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-20">Fragrância</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${(lot.fragrance_score ?? 0) * 10}%` }} />
                    </div>
                    <span className="font-bold ml-2">{lot.fragrance_score?.toFixed(1) ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-20">Sabor</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(lot.flavor_score ?? 0) * 10}%` }} />
                    </div>
                    <span className="font-bold ml-2">{lot.flavor_score?.toFixed(1) ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-20">Finalização</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(lot.finish_score ?? 0) * 10}%` }} />
                    </div>
                    <span className="font-bold ml-2">{lot.finish_score?.toFixed(1) ?? '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-20">Acidez</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-pink-400 h-2 rounded-full" style={{ width: `${(lot.acidity_score ?? 0) * 10}%` }} />
                    </div>
                    <span className="font-bold ml-2">{lot.acidity_score?.toFixed(1) ?? '-'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <DialogHeader>
                <DialogTitle>Editar Lote</DialogTitle>
              </DialogHeader>
              <LotForm
                formData={formData}
                setFormData={setFormData}
                producers={producers}
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
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

// Componente do formulário
const LotForm = ({ 
  formData, 
  setFormData, 
  producers,
  isBlendMode,
  setIsBlendMode,
  currentStep,
  setCurrentStep,
  totalSteps,
  onSubmit, 
  onCancel 
}: {
  formData: any;
  setFormData: (data: any) => void;
  producers: Producer[];
  isBlendMode: boolean;
  setIsBlendMode: (mode: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  onSubmit: () => void;
  onCancel: () => void;
}) => {
  const averageScore = (
    formData.fragrance_score + 
    formData.flavor_score + 
    formData.finish_score + 
    formData.acidity_score + 
    formData.body_score
  ) / 5;

  // Upload único de imagem
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPG, PNG ou GIF.");
        return;
      }
      
      // Validar tamanho (máx. 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData({ ...formData, image_url: ev.target?.result });
        toast.success("Foto carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => setFormData({ ...formData, image_url: "" });

  // URL para QRCode
  const qrValue = `${window.location.origin}/produto/${formData.code}`;

  
  // Configuração das etapas
  const steps = [
    {
      id: 1,
      title: "Tipo de Lote",
      description: "Escolha entre produto único ou blend",
      icon: Package,
      color: "blue"
    },
    {
      id: 2,
      title: "Informações Básicas",
      description: "Dados fundamentais do lote",
      icon: QrCode,
      color: "green"
    },
    {
      id: 3,
      title: "Produção",
      description: "Produtor e quantidades",
      icon: Medal,
      color: "emerald"
    },
    {
      id: 4,
      title: "Análise Sensorial",
      description: "Características do produto",
      icon: Eye,
      color: "purple"
    },
    {
      id: 5,
      title: "Finalização",
      description: "Observações e componentes",
      icon: Check,
      color: "orange"
    }
  ];

  // Funções de navegação
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Verificar se a etapa atual está completa
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return true; // Sempre completa
      case 2:
        return formData.name && formData.category;
      case 3:
        return formData.producer_id && formData.quantity && formData.unit;
      case 4:
        return true; // Opcional
      case 5:
        return true; // Opcional
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Etapas */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Etapas do Processo</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {currentStep} de {totalSteps}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id || isStepComplete(step.id);
            const Icon = step.icon;
            
            return (
              <div key={step.id} className="flex flex-col items-center flex-1 relative">
                <button
                  onClick={() => goToStep(step.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isCompleted
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>
                <div className="text-center">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute left-1/2 top-6 w-full h-0.5 -z-10 ${
                    currentStep > step.id ? 'bg-blue-300' : 'bg-gray-200'
                  }`} style={{ width: 'calc(100% - 3rem)', marginLeft: '1.5rem' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo das Etapas */}
      {currentStep === 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Modo de Criação</h3>
              </div>
              <Badge variant={isBlendMode ? "default" : "secondary"} className={isBlendMode ? "bg-blue-600" : "bg-gray-200 text-gray-700"}>
                {isBlendMode ? "Blend" : "Produto Único"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${!isBlendMode ? 'text-gray-900' : 'text-gray-500'}`}>
                Produto Único
              </span>
              
              <button
                type="button"
                onClick={() => {
                  const newMode = !isBlendMode;
                  setIsBlendMode(newMode);
                  
                  if (!newMode) {
                    setFormData({ ...formData, components: [] });
                  }
                }}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span
                  className={`${
                    isBlendMode ? 'translate-x-6 bg-blue-600' : 'translate-x-1 bg-white'
                  } inline-block h-4 w-4 transform rounded-full transition-transform`}
                />
              </button>
              
              <span className={`text-sm font-medium ${isBlendMode ? 'text-gray-900' : 'text-gray-500'}`}>
                Blend
              </span>
            </div>
          </div>
          
          <div className="mt-3">
            <p className="text-sm text-gray-600">
              {isBlendMode 
                ? "Modo Blend: Este lote será composto por múltiplos componentes. Você poderá definir a composição detalhada de cada ingrediente."
                : "Modo Produto Único: Este lote representa um produto único com características específicas."
              }
            </p>
          </div>
        </div>
      )}

      {/* Etapa 2: Informações Básicas */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              Informações Básicas
            </h3>
            <p className="text-sm text-gray-600 mt-1">Dados fundamentais do lote</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="name" className="font-semibold text-gray-700 mb-2 block">Nome do Lote *</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Ex: Café Especial da Fazenda" 
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="font-semibold text-gray-700 mb-2 block">Categoria *</Label>
                  <Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Café">☕ Café</SelectItem>
                      <SelectItem value="Cacau">🍫 Cacau</SelectItem>
                      <SelectItem value="Açaí">🫐 Açaí</SelectItem>
                      <SelectItem value="Cupuaçu">🥭 Cupuaçu</SelectItem>
                      <SelectItem value="Outros">📦 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {!isBlendMode && (
                  <div>
                    <Label htmlFor="variety" className="font-semibold text-gray-700 mb-2 block">Variedade</Label>
                    <Input 
                      id="variety" 
                      value={formData.variety} 
                      onChange={e => setFormData({ ...formData, variety: e.target.value })} 
                      placeholder="Variedade do produto" 
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="harvest_year" className="font-semibold text-gray-700 mb-2 block">Ano da Safra</Label>
                  <Input 
                    id="harvest_year" 
                    type="number" 
                    value={formData.harvest_year} 
                    onChange={e => setFormData({ ...formData, harvest_year: e.target.value })} 
                    placeholder="2024" 
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="image" className="font-semibold text-gray-700 mb-2 block">
                    Foto do Lote *
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    {formData.image_url ? (
                      <div className="space-y-3">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Trocar Foto
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={removeImage}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Image className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Clique para adicionar uma foto do lote
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG ou GIF (máx. 5MB)
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Selecionar Foto
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      required
                    />
                  </div>
                  {!formData.image_url && (
                    <p className="text-red-500 text-xs mt-1">
                      * Foto do lote é obrigatória
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <Label className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-500" /> 
                  Preview do QR Code
                </Label>
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                  <QRCodeSVG value={qrValue} size={140} bgColor="#fff" fgColor="#222" />
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">
                      {qrValue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etapa 3: Produção */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Medal className="w-5 h-5 text-green-600" />
              Informações de Produção
            </h3>
            <p className="text-sm text-gray-600 mt-1">Dados do produtor e quantidades</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="producer_id" className="font-semibold text-gray-700 mb-2 block">Produtor *</Label>
                  <Select value={formData.producer_id} onValueChange={value => setFormData({ ...formData, producer_id: value })}>
                    <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
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
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity" className="font-semibold text-gray-700 mb-2 block">
                      {isBlendMode ? "Quantidade Total" : "Quantidade"}
                    </Label>
                    <Input 
                      id="quantity" 
                      type="number" 
                      step="0.01" 
                      value={formData.quantity} 
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })} 
                      placeholder={isBlendMode ? "Total do blend" : "500"} 
                      className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="unit" className="font-semibold text-gray-700 mb-2 block">Unidade</Label>
                    <Select value={formData.unit} onValueChange={value => setFormData({ ...formData, unit: value })}>
                      <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Selecione a unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kg">⚖️ Quilogramas (Kg)</SelectItem>
                        <SelectItem value="L">🥤 Litros (L)</SelectItem>
                        <SelectItem value="un">📦 Unidades</SelectItem>
                        <SelectItem value="g">⚖️ Gramas (g)</SelectItem>
                        <SelectItem value="ml">🥤 Mililitros (ml)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <Label className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-500" /> 
                  Preview do QR Code
                </Label>
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm">
                  <QRCodeSVG value={qrValue} size={140} bgColor="#fff" fgColor="#222" />
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">
                      {qrValue}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etapa 4: Análise Sensorial */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Análise Sensorial
            </h3>
            <p className="text-sm text-gray-600 mt-1">Avaliação das características sensoriais do produto</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Fragrância: {formData.fragrance_score}</Label>
                  <Slider value={[formData.fragrance_score]} onValueChange={([value]) => setFormData({ ...formData, fragrance_score: value })} max={10} min={0} step={0.1} className="mt-2" />
                </div>
                <div>
                  <Label>Sabor: {formData.flavor_score}</Label>
                  <Slider value={[formData.flavor_score]} onValueChange={([value]) => setFormData({ ...formData, flavor_score: value })} max={10} min={0} step={0.1} className="mt-2" />
                </div>
                <div>
                  <Label>Finalização: {formData.finish_score}</Label>
                  <Slider value={[formData.finish_score]} onValueChange={([value]) => setFormData({ ...formData, finish_score: value })} max={10} min={0} step={0.1} className="mt-2" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Acidez: {formData.acidity_score}</Label>
                  <Slider value={[formData.acidity_score]} onValueChange={([value]) => setFormData({ ...formData, acidity_score: value })} max={10} min={0} step={0.1} className="mt-2" />
                </div>
                <div>
                  <Label>Corpo: {formData.body_score}</Label>
                  <Slider value={[formData.body_score]} onValueChange={([value]) => setFormData({ ...formData, body_score: value })} max={10} min={0} step={0.1} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="sensory_notes">Notas Sensoriais</Label>
                  <Textarea 
                    id="sensory_notes" 
                    value={formData.sensory_notes} 
                    onChange={e => setFormData({ ...formData, sensory_notes: e.target.value })} 
                    placeholder="Descreva as características sensoriais..." 
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Etapa 5: Finalização */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Quotes className="w-5 h-5 text-orange-600" />
                Observações sobre o Lote
              </h3>
              <p className="text-sm text-gray-600 mt-1">Informações adicionais importantes sobre este lote</p>
            </div>
            <div className="p-6">
              <div>
                <Label htmlFor="lot_observations" className="font-semibold text-gray-700 mb-2 block">
                  Observações Gerais
                </Label>
                <Textarea 
                  id="lot_observations" 
                  value={formData.lot_observations} 
                  onChange={e => setFormData({ ...formData, lot_observations: e.target.value })} 
                  placeholder="Descreva observações importantes sobre este lote, como condições especiais de produção, características únicas, processo de beneficiamento, armazenamento, etc..." 
                  rows={4}
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Estas observações aparecerão na página pública do lote para consumidores
                </p>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="youtube_video_url" className="font-semibold text-gray-700 mb-2 block">
                  Link do Vídeo do YouTube (Opcional)
                </Label>
                <Input 
                  id="youtube_video_url" 
                  value={formData.youtube_video_url} 
                  onChange={e => setFormData({ ...formData, youtube_video_url: e.target.value })} 
                  placeholder="https://www.youtube.com/watch?v=..." 
                  className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🎥 Se informado, o vídeo será exibido na primeira seção da página pública
                </p>
              </div>
              
              {formData.youtube_video_url && (
                <div className="mt-4">
                  <Label htmlFor="video_delay_seconds" className="font-semibold text-gray-700 mb-2 block">
                    Delay para Mostrar Informações (segundos)
                  </Label>
                  <Input 
                    id="video_delay_seconds" 
                    type="number"
                    min="5"
                    max="60"
                    value={formData.video_delay_seconds} 
                    onChange={e => setFormData({ ...formData, video_delay_seconds: parseInt(e.target.value) || 10 })} 
                    className="border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⏱️ Tempo em segundos antes de mostrar o botão "Ver informações do lote"
                  </p>
                </div>
              )}
            </div>
          </div>

          {isBlendMode && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      Composição do Blend
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Defina os componentes que compõem este blend</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const newComponent = {
                        id: crypto.randomUUID(),
                        component_name: "",
                        component_variety: "",
                        component_percentage: 0,
                        component_quantity: 0,
                        component_unit: "g",
                        component_origin: ""
                      };
                      setFormData({
                        ...formData,
                        components: [...formData.components, newComponent]
                      });
                    }}
                    className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar Componente
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {formData.components.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum componente adicionado</h3>
                    <p className="text-gray-600 mb-6">Adicione os componentes que compõem este blend</p>
                    <Button
                      onClick={() => {
                        const newComponent = {
                          id: Date.now().toString(),
                          component_name: "",
                          component_variety: "",
                          component_percentage: 0,
                          component_quantity: 0,
                          component_unit: "g",
                          component_origin: ""
                        };
                        setFormData({
                          ...formData,
                          components: [...formData.components, newComponent]
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Componente
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.components.map((component, index) => (
                      <div key={component.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">Componente {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newComponents = formData.components.filter((_, i) => i !== index);
                              setFormData({ ...formData, components: newComponents });
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor={`component_name_${index}`} className="font-semibold text-gray-700 mb-2 block">
                              Nome do Componente *
                            </Label>
                            <Input
                              id={`component_name_${index}`}
                              value={component.component_name}
                              onChange={e => {
                                const newComponents = [...formData.components];
                                newComponents[index].component_name = e.target.value;
                                setFormData({ ...formData, components: newComponents });
                              }}
                              placeholder="Ex: Café Arábica"
                              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`component_variety_${index}`} className="font-semibold text-gray-700 mb-2 block">
                              Variedade
                            </Label>
                            <Input
                              id={`component_variety_${index}`}
                              value={component.component_variety}
                              onChange={e => {
                                const newComponents = [...formData.components];
                                newComponents[index].component_variety = e.target.value;
                                setFormData({ ...formData, components: newComponents });
                              }}
                              placeholder="Ex: Bourbon"
                              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`component_percentage_${index}`} className="font-semibold text-gray-700 mb-2 block">
                              Percentual (%)
                            </Label>
                            <Input
                              id={`component_percentage_${index}`}
                              type="number"
                              min="0"
                              max="100"
                              step="0.1"
                              value={component.component_percentage}
                              onChange={e => {
                                const newComponents = [...formData.components];
                                newComponents[index].component_percentage = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, components: newComponents });
                              }}
                              placeholder="50"
                              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`component_quantity_${index}`} className="font-semibold text-gray-700 mb-2 block">
                              Quantidade
                            </Label>
                            <Input
                              id={`component_quantity_${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={component.component_quantity}
                              onChange={e => {
                                const newComponents = [...formData.components];
                                newComponents[index].component_quantity = parseFloat(e.target.value) || 0;
                                setFormData({ ...formData, components: newComponents });
                              }}
                              placeholder="250"
                              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`component_unit_${index}`} className="font-semibold text-gray-700 mb-2 block">
                              Unidade
                            </Label>
                            <Select
                              value={component.component_unit}
                              onValueChange={value => {
                                const newComponents = [...formData.components];
                                newComponents[index].component_unit = value;
                                setFormData({ ...formData, components: newComponents });
                              }}
                            >
                              <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">⚖️ Gramas (g)</SelectItem>
                                <SelectItem value="Kg">⚖️ Quilogramas (Kg)</SelectItem>
                                <SelectItem value="ml">🥤 Mililitros (ml)</SelectItem>
                                <SelectItem value="L">🥤 Litros (L)</SelectItem>
                                <SelectItem value="un">📦 Unidades</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`component_origin_${index}`} className="font-semibold text-gray-700 mb-2 block">
                              Origem
                            </Label>
                            <Input
                              id={`component_origin_${index}`}
                              value={component.component_origin}
                              onChange={e => {
                                const newComponents = [...formData.components];
                                newComponents[index].component_origin = e.target.value;
                                setFormData({ ...formData, components: newComponents });
                              }}
                              placeholder="Ex: Região de origem"
                              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botões de navegação */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <CaretLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="px-6 py-3 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            
            {currentStep < totalSteps ? (
              <Button 
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                Próximo
                <CaretRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={onSubmit}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
              >
                <Check className="w-4 h-4 mr-2" />
                Criar Lote
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { LotForm };

export default Lotes;
