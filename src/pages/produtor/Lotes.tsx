import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Plus, 
  MagnifyingGlass, 
  FunnelSimple, 
  PencilSimple, 
  Trash, 
  Eye, 
  QrCode, 
  Calendar, 
  MapPin, 
  Tag, 
  ArrowRight, 
  DotsThreeOutlineVertical, 
  Export, 
  Scales
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi, producersApi, associationsApi, industriesApi, systemConfigApi, productLotCharacteristicsApi, productLotSensoryApi, brandsApi } from "@/services/api";
import { toast } from "sonner";
import { LotForm, LOT_STEPS } from "@/components/lots/LotForm";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useTenant } from "@/hooks/use-tenant";

export const ProducerLotes = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [lotes, setLotes] = useState<any[]>([]);
  const [producers, setProducers] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<any | null>(null);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const tenantSlug = tenant?.slug ?? '';

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
      if (!tenant || !user) return;
      try {
        setLoading(true);
        const [brandingConfig, producersData, associationsData, industriesData] = await Promise.all([
          systemConfigApi.getBrandingConfig(tenant.id),
          producersApi.getAll(tenant.id),
          associationsApi.getAll(tenant.id),
          industriesApi.getAll(tenant.id),
        ]);
        setBranding(brandingConfig);
        setProducers(producersData);
        setAssociations(associationsData || []);
        setIndustries(industriesData || []);
        await fetchLotes();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, tenant]);

  const fetchLotes = async () => {
    if (!tenant || !user) return;
    try {
      const data = await productLotsApi.getByProducer(user.id, tenant.id);
      setLotes(data || []);
    } catch (error) {
      toast.error("Erro ao carregar lotes");
    }
  };

  const resetForm = async () => {
    if (!tenant) return;
    try {
      const { generateLotCode } = await import("@/utils/lot-code-generator");
      const producer = producers.find(p => p.id === user?.id);
      const prefix = producer ? producer.name.substring(0, 3).toUpperCase() : "PROD";
      const newCode = await generateLotCode(tenant.id, prefix);
      
      setFormData({
        code: newCode,
        name: "",
        category: "",
        harvest_year: new Date().getFullYear().toString(),
        quantity: "",
        unit: "Kg",
        seals_quantity: "",
        image_url: "",
        producer_id: user?.id || "",
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
        components: [] as any[],
        characteristics: [] as { characteristic_id: string; value: string }[],
        sensory_analysis: [] as { sensory_attribute_id: string; value: number }[],
      });
      setIsBlendMode(false);
      setCurrentStep(1);
      setEditingLot(null);
    } catch (e) {}
  };

  const handleOpenSheet = async () => {
    await resetForm();
    setIsSheetOpen(true);
  };

  const handleEdit = (lot: any) => {
    setEditingLot(lot);
    const rawCharacteristics = (lot as any).characteristics || [];
    const rawSensory = (lot as any).sensory_analysis || [];
    setFormData({
      ...lot,
      quantity: lot.quantity?.toString() || "",
      seals_quantity: lot.seals_quantity?.toString() || "",
      video_description: (lot as any).video_description || "",
      latitude: lot.latitude?.toString() || "",
      longitude: lot.longitude?.toString() || "",
      property_name: lot.property_name || "",
      property_description: lot.property_description || "",
      altitude: lot.altitude?.toString() || "",
      average_temperature: lot.average_temperature?.toString() || "",
      address: lot.address || "",
      city: lot.city || "",
      state: lot.state || "",
      cep: lot.cep || "",
      address_internal_only: lot.address_internal_only || false,
      photos: lot.photos || [],
      characteristics: rawCharacteristics.map((c: any) => ({
        characteristic_id: c.characteristic_id,
        value: c.value
      })),
      sensory_analysis: rawSensory.map((s: any) => ({
        sensory_attribute_id: s.sensory_attribute_id,
        value: Number(s.value)
      })),
      components: (lot.lot_components || []).map((c: any) => ({
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
    setIsBlendMode((lot.lot_components?.length || 0) > 0);
    setCurrentStep(1);
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!tenant) return;
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
        producer_id: user?.id,
        tenant_id: tenant.id
      };

      const { 
        components, characteristics, sensory_analysis, 
        selectedPropertyId, user_has_set_coordinates, location_reference,
        ...cleanLotData 
      } = lotData;

      if (editingLot) {
        await productLotsApi.update(editingLot.id, tenant.id, cleanLotData as any);
        if (editingLot.id) {
          // Atualizar componentes
          await productLotsApi.deleteComponentsByLot(editingLot.id, tenant.id);
          if (isBlendMode && components.length > 0) {
            await Promise.all(components.map(c => productLotsApi.createComponent({ ...c, lot_id: editingLot.id, tenant_id: tenant.id })));
          }

          // Atualizar características
          await productLotCharacteristicsApi.deleteByLot(editingLot.id, tenant.id);
          if (characteristics && characteristics.length > 0) {
            await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: editingLot.id, tenant_id: tenant.id })));
          }

          // Atualizar análise sensorial
          await productLotSensoryApi.deleteByLot(editingLot.id, tenant.id);
          if (sensory_analysis && sensory_analysis.length > 0) {
            await Promise.all(sensory_analysis.map(s => productLotSensoryApi.create({ ...s, lot_id: editingLot.id, tenant_id: tenant.id })));
          }
        }
        toast.success("Lote atualizado!");
      } else {
        // NEW LOT
        let finalCode = formData.code;
        const config = await systemConfigApi.getLotIdConfig(tenant.id);
        
        if (config.mode !== 'manual' && formData.code) {
          const { generateLotCode } = await import("@/utils/lot-code-generator");
          let prefix = "";
          if (config.mode === 'producer_brand') {
            const producer = producers.find(p => p.id === user?.id);
            if (producer) {
              if (formData.brand_id && formData.brand_id !== "none") {
                const brand = (await brandsApi.getByProducer(user?.id, tenant.id)).find(b => b.id === formData.brand_id);
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
          finalCode = await generateLotCode(tenant.id, prefix || undefined, true);
        }

        const newLot = await productLotsApi.create({ ...cleanLotData, code: finalCode } as any);
        // Criar componentes
        if (isBlendMode && components.length > 0) {
          await Promise.all(components.map(c => productLotsApi.createComponent({ ...c, lot_id: newLot.id, tenant_id: tenant.id })));
        }
        // Criar características
        if (characteristics && characteristics.length > 0) {
          await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: newLot.id, tenant_id: tenant.id })));
        }
        // Criar análise sensorial
        if (sensory_analysis && sensory_analysis.length > 0) {
          await Promise.all(sensory_analysis.map(s => productLotSensoryApi.create({ ...s, lot_id: newLot.id, tenant_id: tenant.id })));
        }
        toast.success("Lote registrado!");
      }

      setIsSheetOpen(false);
      fetchLotes();
    } catch (error) {
      toast.error("Erro ao salvar lote");
    }
  };

  const confirmDelete = async () => {
    if (!lotToDelete || !tenant) return;
    try {
      await productLotsApi.delete(lotToDelete, tenant.id);
      toast.success("Lote removido!");
      fetchLotes();
    } catch (error) {
      toast.error("Erro ao remover lote");
    } finally {
      setLotToDelete(null);
    }
  };

  const filteredLotes = lotes.filter(lote => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = lote.code.toLowerCase().includes(search) || lote.name.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "todos" || lote.category === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const TableSkeleton = () => (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ProducerLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package size={32} style={{ color: primaryColor }} weight="fill" />
              Meus Lotes
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gerencie sua produção e emita certificados de origem.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <Export size={18} weight="bold" /> Exportar
            </Button>
            <Button 
              onClick={handleOpenSheet} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-6 transition-all gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Novo Lote
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-0 rounded-xl font-medium focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="w-full sm:w-56 h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 focus:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                >
                  <div className="flex items-center gap-2">
                    <FunnelSimple size={18} weight="bold" style={{ color: primaryColor }} />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="todos" className="font-bold">Todos Status</SelectItem>
                  <SelectItem value="ativo" className="font-medium">Ativo</SelectItem>
                  <SelectItem value="vendido" className="font-medium">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <TableSkeleton />
          ) : filteredLotes.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum lote encontrado</h3>
              <p className="text-slate-400 font-medium">Você ainda não possui lotes registrados para estes filtros.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLotes.map((lote) => (
                <Card key={lote.id} className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5 flex-1 text-left">
                        <div className="relative flex-shrink-0">
                          <img src={lote.image_url || "/placeholder.svg"} className="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                          <div 
                            className="absolute -top-2 -left-2 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg uppercase"
                            style={{ backgroundColor: (lote.lot_components?.length || 0) > 0 ? '#7c3aed' : primaryColor }}
                          >
                            {(lote.lot_components?.length || 0) > 0 ? 'BLEND' : 'UNICO'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-slate-900 leading-none">{lote.name}</h4>
                            <Badge 
                              className="border-0 font-black text-[10px] uppercase rounded-md"
                              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                            >
                              {lote.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                            <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#{lote.code}</span>
                            <span className="flex items-center gap-1"><Scales size={14} /> {lote.quantity} {lote.unit}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-50 pl-6">
                        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl text-blue-600 hover:bg-blue-50">
                          <a href={tenantSlug ? `/${tenantSlug}/lote/${lote.code}` : '/'} target="_blank" rel="noreferrer"><Eye size={20} weight="bold" /></a>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl text-slate-600 hover:bg-slate-50">
                          <Link to={tenantSlug ? `/${tenantSlug}/produtor/qrcodes/${lote.id}` : '/'}><QrCode size={20} weight="bold" /></Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400"><DotsThreeOutlineVertical size={20} weight="fill" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-slate-100">
                            <DropdownMenuItem onClick={() => handleEdit(lote)} className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer focus:bg-slate-50">
                              <PencilSimple size={18} weight="bold" style={{ color: primaryColor }} className="mr-2" /> Editar Lote
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLotToDelete(lote.id)} className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600">
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
                      <SheetDescription className="text-slate-500 font-bold text-base">Configure a rastreabilidade do seu produto.</SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={LOT_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              <div className="flex-1 relative flex flex-col min-h-0">
                <LotForm
                  tenantId={tenant?.id ?? ''}
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
              <AlertDialogDescription className="text-slate-500 font-medium">Esta ação é irreversível. O lote será removido do sistema.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-4 text-left">
              <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200">Sim, Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProducerLayout>
  );
};
