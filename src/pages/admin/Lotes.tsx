import { useState, useEffect } from "react";
import { 
  Plus, 
  MagnifyingGlass, 
  FunnelSimple, 
  Package, 
  Eye, 
  PencilSimple, 
  Trash, 
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  DotsThreeOutlineVertical,
  Export,
  Users
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { productLotsApi, producersApi, associationsApi, industriesApi, systemConfigApi, productLotCharacteristicsApi, productLotSensoryApi } from "@/services/api";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LotForm, LOT_STEPS } from "@/components/lots/LotForm";
import { ProductLot } from "@/types/lot";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FormStepIndicator } from "@/components/ui/step-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);

  const primaryColor = branding?.primaryColor || '#16a34a';
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    harvest_year: "",
    quantity: "",
    unit: "Kg",
    seals_quantity: "",
    image_url: "",
    producer_id: "",
    brand_id: "",
    industry_id: "",
    association_id: "",
    sensory_type: "nota",
    fragrance_score: 5,
    flavor_score: 5,
    finish_score: 5,
    acidity_score: 5,
    body_score: 5,
    sensory_notes: "",
    lot_observations: "",
    youtube_video_url: "",
    video_delay_seconds: 10,
    video_description: "",
    latitude: "",
    longitude: "",
    property_name: "",
    property_description: "",
    altitude: "",
    average_temperature: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    address_internal_only: false,
    photos: [] as string[],
    components: [] as any[],
    characteristics: [] as { characteristic_id: string; value: string }[],
    sensory_analysis: [] as { sensory_attribute_id: string; value: number }[],
  });

  const [isBlendMode, setIsBlendMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
        await fetchData();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lotsData, producersData, associationsData, industriesData] = await Promise.all([
        productLotsApi.getAll(),
        producersApi.getAll(),
        associationsApi.getAll(),
        industriesApi.getAll(),
      ]);
      setLots(lotsData);
      setProducers(producersData);
      setAssociations(associationsData || []);
      setIndustries(industriesData || []);
    } catch (error) {
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "",
      harvest_year: new Date().getFullYear().toString(),
      quantity: "",
      unit: "Kg",
      seals_quantity: "",
      image_url: "",
      producer_id: "",
      brand_id: "",
      industry_id: "",
      association_id: "",
      sensory_type: "nota",
      fragrance_score: 5,
      flavor_score: 5,
      finish_score: 5,
      acidity_score: 5,
      body_score: 5,
      sensory_notes: "",
      lot_observations: "",
      youtube_video_url: "",
      video_delay_seconds: 10,
      video_description: "",
      latitude: "",
      longitude: "",
      property_name: "",
      property_description: "",
      altitude: "",
      average_temperature: "",
      address: "",
      city: "",
      state: "",
      cep: "",
      address_internal_only: false,
      photos: [],
      components: [],
      characteristics: [],
      sensory_analysis: [],
    });
    setIsBlendMode(false);
    setCurrentStep(1);
    setEditingLot(null);
  };

  const handleOpenSheet = async () => {
    resetForm();
    setIsSheetOpen(true);
    try {
      const { generateLotCode } = await import("@/utils/lot-code-generator");
      const newCode = await generateLotCode();
      if (newCode) setFormData(prev => ({ ...prev, code: newCode }));
    } catch (e) {}
  };

  const handleEdit = (lot: ProductLot) => {
    setEditingLot(lot);
    const rawComponents = (lot as any).components || (lot as any).lot_components || [];
    const rawCharacteristics = (lot as any).characteristics || [];
    const rawSensory = (lot as any).sensory_analysis || [];
    setFormData({
      code: lot.code,
      name: lot.name,
      category: lot.category || "",
      harvest_year: lot.harvest_year || "",
      quantity: lot.quantity?.toString() || "",
      unit: lot.unit || "",
      seals_quantity: (lot as any).seals_quantity?.toString() || "",
      image_url: lot.image_url || "",
      producer_id: lot.producer_id || "",
      brand_id: (lot as any).brand_id || "",
      industry_id: (lot as any).industry_id || "",
      association_id: (lot as any).association_id || "",
      sensory_type: (lot as any).sensory_type || "nota",
      fragrance_score: Number(lot.fragrance_score) || 5,
      flavor_score: Number(lot.flavor_score) || 5,
      finish_score: Number(lot.finish_score) || 5,
      acidity_score: Number(lot.acidity_score) || 5,
      body_score: Number(lot.body_score) || 5,
      sensory_notes: lot.sensory_notes || "",
      lot_observations: (lot as any).lot_observations || "",
      youtube_video_url: (lot as any).youtube_video_url || "",
      video_delay_seconds: (lot as any).video_delay_seconds || 10,
      latitude: (lot as any).latitude?.toString() || "",
      longitude: (lot as any).longitude?.toString() || "",
      property_name: (lot as any).property_name || "",
      property_description: (lot as any).property_description || "",
      altitude: (lot as any).altitude?.toString() || "",
      average_temperature: (lot as any).average_temperature?.toString() || "",
      address: (lot as any).address || "",
      city: (lot as any).city || "",
      state: (lot as any).state || "",
      cep: (lot as any).cep || "",
      address_internal_only: (lot as any).address_internal_only || false,
      photos: (lot as any).photos || [],
      characteristics: rawCharacteristics.map((c: any) => ({
        characteristic_id: c.characteristic_id,
        value: c.value
      })),
      sensory_analysis: rawSensory.map((s: any) => ({
        sensory_attribute_id: s.sensory_attribute_id,
        value: Number(s.value)
      })),
      components: rawComponents.map((c: any) => ({
        id: c.id,
        component_name: c.component_name || "",
        component_variety: c.component_variety || "",
        component_percentage: c.component_percentage || 0,
        component_quantity: c.component_quantity || 0,
        component_unit: c.component_unit || "g",
        component_origin: c.component_origin || "",
        producer_id: c.producer_id,
        component_harvest_year: c.component_harvest_year || "",
        association_id: c.association_id,
        latitude: c.latitude,
        longitude: c.longitude,
        altitude: c.altitude,
        property_name: c.property_name,
        property_description: c.property_description,
        photos: c.photos || [],
        address: c.address,
        city: c.city,
        state: c.state,
        cep: c.cep
      })),
    });
    setIsBlendMode(rawComponents.length > 0);
    setCurrentStep(1);
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.category) {
        toast.error("Preencha os campos obrigatórios!");
        return;
      }

      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        seals_quantity: formData.seals_quantity ? parseInt(formData.seals_quantity) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        altitude: formData.altitude ? parseInt(formData.altitude) : null,
        average_temperature: formData.average_temperature ? parseFloat(formData.average_temperature) : null,
        producer_id: isBlendMode ? null : formData.producer_id,
      };

      const { components, characteristics, sensory_analysis, ...cleanLotData } = lotData;

      if (editingLot) {
        await productLotsApi.update(editingLot.id, cleanLotData as any);
        if (editingLot.id) {
          // Atualizar componentes
          await productLotsApi.deleteComponentsByLot(editingLot.id);
          if (isBlendMode && components.length > 0) {
            await Promise.all(components.map(c => productLotsApi.createComponent({ ...c, lot_id: editingLot.id })));
          }

          // Atualizar características
          await productLotCharacteristicsApi.deleteByLot(editingLot.id);
          if (characteristics && characteristics.length > 0) {
            await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: editingLot.id })));
          }

          // Atualizar análise sensorial
          await productLotSensoryApi.deleteByLot(editingLot.id);
          if (sensory_analysis && sensory_analysis.length > 0) {
            await Promise.all(sensory_analysis.map(s => productLotSensoryApi.create({ ...s, lot_id: editingLot.id })));
          }
        }
        toast.success("Lote atualizado com sucesso!");
      } else {
        // NEW LOT
        let finalCode = formData.code;
        const config = await systemConfigApi.getLotIdConfig();
        
        // Se estiver em modo automático ou produtor/marca, e o código atual parecer ser o sugerido (não alterado manualmente)
        // ou se o usuário simplesmente quer usar o próximo disponível
        if (config.mode !== 'manual' && formData.code) {
          const { generateLotCode } = await import("@/utils/lot-code-generator");
          let prefix = "";
          if (config.mode === 'producer_brand') {
            const producer = producers.find(p => p.id === formData.producer_id);
            if (producer) {
              if (formData.brand_id && formData.brand_id !== "none") {
                const brand = (await brandsApi.getByProducer(formData.producer_id)).find(b => b.id === formData.brand_id);
                if (brand) {
                  const { generateSlug } = await import("@/utils/slug-generator");
                  prefix = generateSlug(brand.name).toUpperCase();
                }
              } else {
                const { generateSlug } = await import("@/utils/slug-generator");
                prefix = generateSlug(producer.name).toUpperCase();
              }
            }
          }
          // Gera o código final e incrementa no banco
          finalCode = await generateLotCode(prefix || undefined, true);
        }

        const newLot = await productLotsApi.create({ ...cleanLotData, code: finalCode } as any);
        // Criar componentes
        if (isBlendMode && components.length > 0) {
          await Promise.all(components.map(c => productLotsApi.createComponent({ ...c, lot_id: newLot.id })));
        }
        // Criar características
        if (characteristics && characteristics.length > 0) {
          await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: newLot.id })));
        }
        // Criar análise sensorial
        if (sensory_analysis && sensory_analysis.length > 0) {
          await Promise.all(sensory_analysis.map(s => productLotSensoryApi.create({ ...s, lot_id: newLot.id })));
        }
        toast.success("Lote registrado com sucesso!");
      }

      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Erro ao salvar lote");
    }
  };

  const confirmDelete = async () => {
    if (!lotToDelete) return;
    try {
      await productLotsApi.deleteComponentsByLot(lotToDelete);
      await productLotsApi.delete(lotToDelete);
      toast.success("Lote removido!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover lote");
    } finally {
      setLotToDelete(null);
    }
  };

  const filteredLots = lots.filter(lot => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      lot.name.toLowerCase().includes(search) ||
      lot.code.toLowerCase().includes(search) ||
      lot.producers?.name.toLowerCase().includes(search);
    const matchesCategory = categoryFilter === "todas" || lot.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(lots.map(l => l.category).filter(Boolean)));

  const TableSkeleton = () => (
    <div className="space-y-4">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package size={32} style={{ color: primaryColor }} weight="fill" />
              Gestão de Lotes
            </h2>
            <p className="text-slate-500 font-medium text-sm">Controle e rastreabilidade total da produção.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <Export size={18} weight="bold" /> Exportar
            </Button>
            <Button 
              onClick={handleOpenSheet} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg transition-all gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Novo Lote
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, código ou produtor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-0 rounded-xl font-medium focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger 
                    className="w-full sm:w-56 h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 focus:ring-primary"
                    style={{ '--primary': primaryColor } as any}
                  >
                    <div className="flex items-center gap-2">
                      <FunnelSimple size={18} weight="bold" style={{ color: primaryColor }} />
                      <SelectValue placeholder="Categoria" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="todas" className="font-bold">Todas Categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat!} className="font-medium">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main List */}
        <div className="space-y-4">
          {loading ? (
            <TableSkeleton />
          ) : filteredLots.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum lote encontrado</h3>
              <p className="text-slate-400 font-medium">Não há registros para los filtros selecionados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLots.map((lot) => (
                <Card 
                  key={lot.id} 
                  className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">
                      <div className="flex flex-1 items-center gap-5 text-left">
                        <div className="relative flex-shrink-0">
                          <img 
                            src={lot.image_url || "/placeholder.svg"} 
                            className="h-20 w-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-500" 
                            alt={lot.name} 
                          />
                          <div 
                            className="absolute -top-2 -left-2 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter"
                            style={{ backgroundColor: (lot as any).lot_components?.length > 0 ? '#7c3aed' : primaryColor }}
                          >
                            {(lot as any).lot_components?.length > 0 ? 'BLEND' : 'UNICO'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-slate-900 leading-none transition-colors group-hover:text-primary">{lot.name}</h4>
                            <Badge 
                              className="border-0 font-black text-[10px] uppercase rounded-md"
                              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                            >
                              {lot.category}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                            <Users size={16} weight="fill" className="text-slate-300" />
                            {lot.producers?.name || "Produtor não vinculado"}
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md border border-slate-100 uppercase tracking-widest font-mono">
                              {lot.code}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                              <MapPin size={14} weight="fill" className="text-slate-300" />
                              {lot.producers?.city || "Local não inf."}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-10 px-6 border-l border-slate-50 hidden xl:flex">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Volume</p>
                          <p className="text-sm font-black text-slate-700">{lot.quantity} {lot.unit}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Views</p>
                          <div className="flex items-center gap-1 justify-center">
                            <Eye size={14} weight="bold" className="text-blue-500" />
                            <p className="text-sm font-black text-slate-700">{lot.views || 0}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Selos</p>
                          <div className="flex items-center gap-1 justify-center">
                            <Tag size={14} weight="bold" className="text-amber-500" />
                            <p className="text-sm font-black text-slate-700">{(lot as any).seals_quantity || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-50 pl-6">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="h-11 w-11 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <a href={`/lote/${lot.code}`} target="_blank" rel="noreferrer">
                            <ArrowRight size={20} weight="bold" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400">
                              <DotsThreeOutlineVertical size={20} weight="fill" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-1">
                            <DropdownMenuItem onClick={() => handleEdit(lot)} className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer focus:bg-slate-50">
                              <PencilSimple size={18} weight="bold" style={{ color: primaryColor }} className="mr-2" /> Editar Lote
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setLotToDelete(lot.id)}
                              className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                            >
                              <Trash size={18} weight="bold" className="mr-2" /> Excluir Lote
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Package size={32} weight="fill" />
                    </div>
                    <div>
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        {editingLot ? "Editar Lote" : "Registrar Lote"}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold text-base">
                        {editingLot ? `Código: ${editingLot.code}` : "Configure os dados técnicos do produto."}
                      </SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={LOT_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              <div className="flex-1 relative flex flex-col min-h-0">
                <LotForm
                  formData={formData}
                  setFormData={setFormData}
                  producers={producers}
                  associations={associations}
                  industries={industries}
                  isBlendMode={isBlendMode}
                  setIsBlendMode={setIsBlendMode}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  totalSteps={5}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsSheetOpen(false)}
                  isEditing={!!editingLot}
                  branding={branding}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={!!lotToDelete} onOpenChange={() => setLotToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar Exclusão?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                Esta ação não pode ser desfeita. O lote e seus componentes serão permanentemente removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-4">
              <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200">
                Sim, Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Lotes;
