import { useState, useEffect } from "react";
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  Phone, 
  Envelope, 
  Users, 
  DotsThreeOutlineVertical,
  Export,
  Buildings,
  UserCircle,
  CheckCircle,
  IdentificationCard,
  At,
  Tag,
  Camera,
  WarningCircle,
  ArrowLeft,
  ArrowRight,
  CircleNotch
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, associationsApi, systemConfigApi, brandsApi } from "@/services/api";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm, FormProvider } from "react-hook-form";
import { maskPhone, maskCPFCNPJ } from "@/utils/masks";
import { uploadImageToSupabase } from "@/services/upload";
import { generateSlug } from "@/utils/slug-generator";
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
  AlertDialogTitle as AlertDialogTitleBase,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";

interface Producer {
  id: string;
  name: string;
  document_number: string | null;
  phone: string | null;
  email: string | null;
  property_name: string;
  property_description: string | null;
  address: string | null;
  city: string;
  state: string;
  altitude: number | null;
  average_temperature: number | null;
  created_at: string;
  photos: string[];
  latitude: string | null;
  longitude: string | null;
  profile_picture_url: string | null;
  address_internal_only: boolean;
}

const PRODUCER_STEPS = [
  { id: 1, title: "Responsável" },
  { id: 2, title: "Vínculos" },
  { id: 3, title: "Marcas" },
];

const FormSection = ({ title, icon: Icon, children, description, active, primaryColor }: any) => {
  if (!active) return null;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
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
      <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm space-y-8">
        {children}
      </div>
    </div>
  );
};

const Produtores = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [producersBrands, setProducersBrands] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [producerToDelete, setProducerToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const labels = useTenantLabels();

  useEffect(() => {
    const loadData = async () => {
      if (!tenant) return;
      try {
        const config = await systemConfigApi.getBrandingConfig(tenant.id);
        setBranding(config);
        await fetchProducers();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, [tenant]);

  const fetchProducers = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const data = await producersApi.getAll(tenant.id);
      setProducers(data as Producer[]);
      
      // Buscar marcas de todos os produtores
      const brandsMap: Record<string, any[]> = {};
      for (const producer of data) {
        try {
          const brands = await brandsApi.getByProducer(producer.id, tenant.id);
          brandsMap[producer.id] = brands || [];
        } catch (error) {
          brandsMap[producer.id] = [];
        }
      }
      setProducersBrands(brandsMap);
    } catch (error) {
      toast.error(`Erro ao carregar ${labels.producers.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (producer: Producer) => {
    setEditingProducer(producer);
    setCurrentStep(1);
    setIsSheetOpen(true);
  };

  const confirmDelete = async () => {
    if (!producerToDelete || !tenant) return;
    try {
      await producersApi.delete(producerToDelete, tenant.id);
      toast.success(`${labels.producer} removido!`);
      fetchProducers();
    } catch (error) {
      toast.error(`Erro ao remover ${labels.producer.toLowerCase()}`);
    } finally {
      setProducerToDelete(null);
    }
  };

  const filteredProducers = producers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const primaryColor = branding?.primaryColor || '#16a34a';

  const TableSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="flex h-40">
            <Skeleton className="w-1/3 h-full rounded-none" />
            <div className="w-2/3 p-6 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users size={32} style={{ color: primaryColor }} weight="fill" />
              {labels.producers} Parceiros
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gerencie as propriedades e responsáveis pela produção.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <Export size={18} weight="bold" /> Exportar
            </Button>
            <Button 
              onClick={() => { setEditingProducer(null); setCurrentStep(1); setIsSheetOpen(true); }} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Novo {labels.producer}
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-50 border-0 rounded-xl focus-visible:ring-primary font-medium"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <TableSkeleton />
        ) : filteredProducers.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum {labels.producer.toLowerCase()} encontrado</h3>
            <p className="text-slate-400 font-medium">Cadastre seu primeiro parceiro para começar o rastreamento.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {filteredProducers.map((prod) => (
              <Card 
                key={prod.id} 
                className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/${tenant?.slug}/admin/produtores/${prod.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex h-full min-h-[180px]">
                    <div className="w-1/3 relative overflow-hidden bg-slate-100 flex-shrink-0">
                      {prod.profile_picture_url ? (
                        <img 
                          src={prod.profile_picture_url} 
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110" 
                          alt={prod.name}
                          style={{ minHeight: '180px', maxHeight: '180px' }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200" style={{ minHeight: '180px', maxHeight: '180px' }}>
                          <UserCircle size={48} className="text-slate-400" weight="duotone" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="w-2/3 p-6 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xl font-black text-slate-900 line-clamp-1">{prod.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 shrink-0">
                                <DotsThreeOutlineVertical size={18} weight="fill" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-slate-100">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(prod); }} className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer">
                                <PencilSimple size={18} weight="bold" className="mr-2" style={{ color: primaryColor }} /> Editar Perfil
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); setProducerToDelete(prod.id); }}
                                className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                              >
                                <Trash size={18} weight="bold" className="mr-2" /> Excluir Registro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2 mt-3">
                          {prod.email && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                              <Envelope size={14} weight="fill" className="text-slate-300" /> {prod.email}
                            </div>
                          )}
                          {prod.phone && (
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                              <Phone size={14} weight="fill" className="text-slate-300" /> {prod.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-4">
                        {producersBrands[prod.id] && producersBrands[prod.id].length > 0 ? (
                          producersBrands[prod.id].slice(0, 3).map((brand: any) => (
                            <Badge 
                              key={brand.id} 
                              variant="secondary" 
                              className="bg-slate-50 text-slate-500 border-0 font-bold px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1"
                            >
                              {brand.logo_url && (
                                <img src={brand.logo_url} alt={brand.name} className="w-3 h-3 rounded object-cover" />
                              )}
                              {brand.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-0 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            Sem marcas
                          </Badge>
                        )}
                        {producersBrands[prod.id] && producersBrands[prod.id].length > 3 && (
                          <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-0 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            +{producersBrands[prod.id].length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
                      <UserCircle size={32} weight="fill" />
                    </div>
                    <div>
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        {editingProducer ? `Editar ${labels.producer}` : `Novo ${labels.producer}`}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold text-base">
                        {editingProducer ? `Perfil de ${editingProducer.name}` : `Cadastre as informações do ${labels.producer.toLowerCase()} e sua propriedade.`}
                      </SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={PRODUCER_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              <div className="flex-1 relative flex flex-col min-h-0">
                <ProducerForm 
                  initialData={editingProducer} 
                  branding={branding}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  onSubmit={() => {
                    setIsSheetOpen(false);
                    fetchProducers();
                  }} 
                  onCancel={() => setIsSheetOpen(false)} 
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={!!producerToDelete} onOpenChange={() => setProducerToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitleBase className="text-2xl font-black text-slate-900">Confirmar Exclusão?</AlertDialogTitleBase>
              <AlertDialogDescription className="text-slate-500 font-medium">
                Esta ação removerá permanentemente o {labels.producer.toLowerCase()} e todos os seus vínculos. Os lotes existentes desse {labels.producer.toLowerCase()} poderão ficar órfãos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-4">
              <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200">
                Sim, Excluir Registro
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

const ProducerForm = ({ initialData, onSubmit, onCancel, branding, currentStep, setCurrentStep }: { initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; branding?: any; currentStep: number; setCurrentStep: (step: number) => void; }) => {
  const [loading, setLoading] = useState(false);
  const [allAssociations, setAllAssociations] = useState<any[]>([]);
  const [selectedAssociations, setSelectedAssociations] = useState<string[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [brandForm, setBrandForm] = useState({ name: "", logo_url: "" });
  const [producerId, setProducerId] = useState<string | null>(initialData?.id || null);
  const { tenant } = useTenant();
  const labels = useTenantLabels();

  const primaryColor = branding?.primaryColor || '#16a34a';

  const methods = useForm({
    defaultValues: initialData || {
      name: "",
      document_number: "",
      email: "",
      phone: "",
      profile_picture_url: "",
      associations: [],
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  useEffect(() => {
    if (!tenant) return;
    associationsApi.getAll(tenant.id).then(setAllAssociations);
    const id = producerId || initialData?.id;
    if (id) {
      associationsApi.getByProducer(id, tenant.id).then(assocs => {
        const assocIds = assocs.map(a => a.id);
        setSelectedAssociations(assocIds);
        setValue("associations", assocIds);
      });
      brandsApi.getByProducer(id, tenant.id).then(setBrands);
    }
  }, [producerId, initialData, setValue, tenant]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "property") => {
    const files = Array.from(e.target.files || []);
    setLoading(true);
    try {
      for (const file of files) {
        const url = await uploadImageToSupabase(file);
        if (type === "profile") {
          setValue("profile_picture_url", url);
        } else {
          const currentPhotos = watch("photos") || [];
          setValue("photos", [...currentPhotos, url]);
        }
      }
      toast.success("Imagens carregadas!");
    } catch (error) {
      toast.error("Erro no upload");
    } finally {
      setLoading(false);
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await uploadImageToSupabase(file, "brands");
      setBrandForm((prev) => ({ ...prev, logo_url: url }));
      toast.success("Logo enviada!");
    } catch (error) {
      toast.error("Erro ao enviar logo");
    }
  };

  const handleSaveBrand = async () => {
    if (!tenant) return;
    const id = producerId || initialData?.id;
    if (!id) {
      toast.error(`Salve o ${labels.producer.toLowerCase()} primeiro`);
      return;
    }

    try {
      if (editingBrand) {
        await brandsApi.update(editingBrand.id, tenant.id, {
          logo_url: brandForm.logo_url || null,
        });
        toast.success("Logo da marca atualizada!");
      } else {
        if (!brandForm.name.trim()) {
          toast.error("Nome da marca é obrigatório");
          return;
        }
        const slug = generateSlug(brandForm.name);
        await brandsApi.create({
          producer_id: id,
          name: brandForm.name,
          slug,
          logo_url: brandForm.logo_url || null,
          tenant_id: tenant.id
        });
        toast.success("Marca criada!");
      }
      
      const updatedBrands = await brandsApi.getByProducer(id, tenant.id);
      setBrands(updatedBrands);
      setBrandForm({ name: "", logo_url: "" });
      setEditingBrand(null);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar marca");
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!tenant) return;
    if (!confirm("Deseja realmente excluir esta marca?")) return;
    
    try {
      await brandsApi.delete(brandId, tenant.id);
      toast.success("Marca excluída!");
      const id = producerId || initialData!.id;
      const updatedBrands = await brandsApi.getByProducer(id, tenant.id);
      setBrands(updatedBrands);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir marca");
    }
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setBrandForm({ name: brand.name, logo_url: brand.logo_url || "" });
  };

  const onFormSubmit = async (data: any) => {
    if (!tenant) return;
    if (currentStep !== 3) {
      return;
    }
    
    setLoading(true);
    try {
      const associations = selectedAssociations.length > 0 ? selectedAssociations : (data.associations || []);
      const { associations: _, ...rest } = data;
      
      const producerData: any = {
        name: rest.name,
        document_number: rest.document_number || null,
        email: rest.email || null,
        phone: rest.phone || null,
        profile_picture_url: rest.profile_picture_url || null,
        city: "N/A", 
        state: "N/A", 
        property_name: "N/A", 
        tenant_id: tenant.id
      };
      
      const id = producerId || initialData?.id;
      
      if (id) {
        await producersApi.update(id, tenant.id, producerData);
        
        const currentAssocs = await associationsApi.getByProducer(id, tenant.id);
        const currentIds = currentAssocs.map(a => a.id);
        for (const idToRemove of currentIds) {
          if (!associations.includes(idToRemove)) {
            await associationsApi.removeProducerFromAssociation(id, idToRemove, tenant.id);
          }
        }
        for (const idToAdd of associations) {
          if (!currentIds.includes(idToAdd)) {
            await associationsApi.addProducerToAssociation(id, idToAdd, tenant.id);
          }
        }
      } else {
        const newProd = await producersApi.create(producerData);
        setProducerId(newProd.id);
        for (const idToAdd of associations) {
          await associationsApi.addProducerToAssociation(newProd.id, idToAdd, tenant.id);
        }
      }
      
      toast.success(initialData ? `${labels.producer} atualizado com sucesso!` : `${labels.producer} cadastrado com sucesso!`);
      onSubmit(data);
    } catch (error: any) {
      console.error("Erro ao salvar produtor:", error);
      toast.error(error?.message || "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };


  const validateCurrentStep = () => {
    if (currentStep === 1) {
      const name = watch("name");
      const email = watch("email");
      if (!name || !email) {
        toast.error("Preencha nome e e-mail");
        return false;
      }
    }
    return true;
  };

  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (currentStep === 3) {
            handleSubmit(onFormSubmit)(e);
          }
        }} 
        className="h-full flex flex-col min-h-0"
      >
        <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-10">
          <FormSection 
            title="Dados do Responsável" 
            icon={IdentificationCard} 
            description="Informações de contato e identificação"
            active={currentStep === 1}
            primaryColor={primaryColor}
          >
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-left">
              <div className="relative group">
                <Avatar className="w-40 h-40 border-[6px] border-slate-50 shadow-2xl transition-transform group-hover:scale-105 duration-500 rounded-[2.5rem]">
                  <AvatarImage src={watch("profile_picture_url")} className="object-cover" />
                  <AvatarFallback 
                    className="ring-1 ring-slate-100"
                    style={{ backgroundColor: `${primaryColor}05`, color: primaryColor }}
                  >
                    <UserCircle size={80} weight="fill" />
                  </AvatarFallback>
                </Avatar>
                <button 
                  type="button"
                  onClick={() => document.getElementById('profile-up')?.click()}
                  className="absolute -bottom-2 -right-2 p-3 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Camera size={20} weight="fill" />
                </button>
                <input id="profile-up" type="file" className="hidden" accept="image/*" onChange={e => handlePhotoUpload(e, "profile")} />
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <IdentificationCard size={16} style={{ color: primaryColor }} /> Nome Completo *
                  </Label>
                  <Input {...register("name")} placeholder="Ex: João da Silva" className="h-12 focus-visible:ring-primary" style={{ '--primary': primaryColor } as any} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <At size={16} style={{ color: primaryColor }} /> E-mail de Contato *
                  </Label>
                  <Input {...register("email")} placeholder="joao@fazenda.com" className="h-12 focus-visible:ring-primary" style={{ '--primary': primaryColor } as any} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <IdentificationCard size={16} style={{ color: primaryColor }} /> CPF/CNPJ
                  </Label>
                  <Input 
                    {...register("document_number")} 
                    onChange={(e) => {
                      const masked = maskCPFCNPJ(e.target.value);
                      setValue("document_number", masked);
                    }}
                    placeholder="000.000.000-00" 
                    maxLength={18}
                    className="h-12 focus-visible:ring-primary" 
                    style={{ '--primary': primaryColor } as any} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Phone size={16} style={{ color: primaryColor }} /> Telefone/WhatsApp
                  </Label>
                  <Input 
                    {...register("phone")} 
                    onChange={(e) => {
                      const masked = maskPhone(e.target.value);
                      setValue("phone", masked);
                    }}
                    placeholder="(00) 00000-0000" 
                    maxLength={15}
                    className="h-12 focus-visible:ring-primary" 
                    style={{ '--primary': primaryColor } as any} 
                  />
                </div>
              </div>
            </div>

          </FormSection>

          <FormSection 
            title="Vínculos Institucionais" 
            icon={Users} 
            description="Associações e cooperativas parceiras"
            active={currentStep === 2}
            primaryColor={primaryColor}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {allAssociations.map(assoc => {
                const isSelected = selectedAssociations.includes(assoc.id);
                return (
                  <div 
                    key={assoc.id} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const next = isSelected
                        ? selectedAssociations.filter((id: string) => id !== assoc.id)
                        : [...selectedAssociations, assoc.id];
                      setSelectedAssociations(next);
                      setValue("associations", next, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                    }}
                    className={`flex items-center gap-5 p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${
                      isSelected ? "shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                    style={isSelected ? { backgroundColor: `${primaryColor}05`, borderColor: primaryColor } : {}}
                  >
                    <div 
                      className={`p-1 rounded-xl border-2 flex items-center justify-center w-6 h-6 transition-all ${
                        isSelected ? 'bg-white border-primary' : 'bg-slate-50 border-slate-200'
                      }`}
                      style={isSelected ? { borderColor: primaryColor } : {}}
                    >
                      {isSelected && (
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: primaryColor }}
                        />
                      )}
                    </div>
                    <Avatar className="h-12 w-12 rounded-xl shadow-sm border border-slate-100">
                      <AvatarImage src={assoc.logo_url} />
                      <AvatarFallback className="bg-slate-50 text-slate-400">
                        <Buildings size={20} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-black text-sm transition-colors" style={{ color: isSelected ? primaryColor : '#334155' }}>{assoc.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{assoc.city}, {assoc.state}</p>
                    </div>
                    {isSelected && <CheckCircle size={24} weight="fill" style={{ color: primaryColor }} className="animate-in zoom-in" />}
                  </div>
                );
              })}
              {allAssociations.length === 0 && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <WarningCircle size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold">Nenhuma associação cadastrada no sistema.</p>
                </div>
              )}
            </div>
          </FormSection>

          <FormSection 
            title={`Marcas do ${labels.producer}`} 
            icon={Tag} 
            description={`Gerencie as marcas associadas ao ${labels.producer.toLowerCase()}`}
            active={currentStep === 3}
            primaryColor={primaryColor}
          >
            {!producerId && !initialData?.id ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <WarningCircle size={40} className="text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold">Salve o {labels.producer.toLowerCase()} primeiro para adicionar marcas.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Formulário de Marca */}
                <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                  <h4 className="font-black text-slate-900 text-lg">{editingBrand ? "Editar Marca" : "Nova Marca"}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700">Nome da Marca *</Label>
                      {editingBrand ? (
                        <div className="space-y-2">
                          <Input
                            value={brandForm.name}
                            disabled
                            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                            className="h-12 bg-slate-100 text-slate-600 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-400 font-bold">O nome não pode ser alterado após a criação</p>
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-500">Slug (URL)</Label>
                            <Input
                              value={editingBrand.slug}
                              disabled
                              onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                              className="h-10 bg-slate-100 text-slate-500 text-xs font-mono cursor-not-allowed"
                            />
                          </div>
                        </div>
                      ) : (
                        <Input
                          value={brandForm.name}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, name: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                          placeholder="Ex: Café Premium"
                          className="h-12"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700">Logo da Marca</Label>
                      <div className="flex items-center gap-3">
                        {brandForm.logo_url && (
                          <img src={brandForm.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shadow-sm" />
                        )}
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBrandLogoUpload}
                            className="hidden"
                            id="brand-logo-input"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 rounded-xl font-bold border-slate-200"
                            onClick={() => {
                              const input = document.getElementById('brand-logo-input') as HTMLInputElement;
                              input?.click();
                            }}
                          >
                            <Camera size={18} className="mr-2" /> {brandForm.logo_url ? "Alterar Logo" : "Enviar Logo"}
                          </Button>
                        </label>
                      </div>
                      {editingBrand && !brandForm.logo_url && (
                        <p className="text-xs text-slate-400 font-bold">Nenhuma logo cadastrada</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleSaveBrand}
                      className="flex-1 rounded-xl h-12 font-black text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {editingBrand ? "Atualizar Logo" : "Adicionar Marca"}
                    </Button>
                    {editingBrand && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingBrand(null);
                          setBrandForm({ name: "", logo_url: "" });
                        }}
                        className="rounded-xl h-12 font-black border-slate-200"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Lista de Marcas */}
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900 text-lg">Marcas Cadastradas</h4>
                  {brands.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
                      <Tag size={32} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-400 font-bold">Nenhuma marca cadastrada</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {brands.map((brand) => (
                        <div
                          key={brand.id}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-all"
                        >
                          {brand.logo_url ? (
                            <img src={brand.logo_url} alt={brand.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                              <Tag size={20} className="text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-black text-slate-900">{brand.name}</p>
                            <p className="text-xs text-slate-400 font-bold">{brand.slug}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBrand(brand)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary"
                              style={{ '--primary': primaryColor } as any}
                            >
                              <PencilSimple size={16} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBrand(brand.id)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </FormSection>
        </div>

        {/* Rodapé de Navegação Fixo */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
          <div className="max-w-5xl mx-auto flex gap-4">
            {currentStep === 1 ? (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">Descartar</Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-700 hover:bg-slate-50 transition-all gap-2"><ArrowLeft size={20} weight="bold" /> Voltar</Button>
            )}

            {currentStep < 3 ? (
              <Button 
                type="button" 
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (validateCurrentStep()) {
                    // Se for novo produtor e estiver indo para etapa 3, salvar primeiro
                    if (!initialData?.id && currentStep === 2) {
                      if (!tenant) return;
                      try {
                        setLoading(true);
                        const formData = watch();
                        const associations = selectedAssociations;
                        const { associations: _, ...rest } = formData;
                        
                        const producerData: any = {
                          name: rest.name,
                          document_number: rest.document_number || null,
                          email: rest.email || null,
                          phone: rest.phone || null,
                          profile_picture_url: rest.profile_picture_url || null,
                          city: "N/A",
                          state: "N/A",
                          property_name: "N/A",
                          tenant_id: tenant.id
                        };
                        
                        const newProd = await producersApi.create(producerData);
                        for (const id of associations) await associationsApi.addProducerToAssociation(newProd.id, id, tenant.id);
                        
                        // Atualizar producerId para permitir adicionar marcas
                        setProducerId(newProd.id);
                        setCurrentStep(3);
                        toast.success(`${labels.producer} salvo! Agora você pode adicionar marcas.`);
                      } catch (error: any) {
                        toast.error(error?.message || `Erro ao salvar ${labels.producer.toLowerCase()}`);
                      } finally {
                        setLoading(false);
                      }
                    } else {
                      setCurrentStep(currentStep + 1);
                    }
                  }
                }} 
                className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                style={{ backgroundColor: primaryColor }}
                disabled={loading}
              >
                {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : <>Próxima Etapa <ArrowRight size={24} weight="bold" /></>}
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? <CircleNotch className="h-5 w-5 animate-spin" /> : <CheckCircle size={24} weight="bold" />}
                {initialData ? "Salvar Alterações" : "Concluir Cadastro"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export { ProducerForm };
export default Produtores;
