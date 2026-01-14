import { useState, useEffect } from "react";
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  MapPin, 
  Phone, 
  Envelope, 
  Mountains, 
  Thermometer, 
  Copy, 
  Users, 
  Eye, 
  ArrowRight,
  DotsThreeOutlineVertical,
  Export,
  Buildings,
  Image as ImageIcon,
  UserCircle,
  CaretRight,
  CheckCircle,
  IdentificationCard,
  At,
  Globe,
  Tag,
  ChatCircleText,
  Camera,
  WarningCircle,
  MapTrifold,
  Lock,
  LockOpen,
  ArrowLeft,
  CircleNotch
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, associationsApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, FormProvider } from "react-hook-form";
import { uploadImageToSupabase } from "@/services/upload";
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
  AlertDialogTitle as AlertDialogTitleBase,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

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
  lot_prefix_mode: 'auto' | 'manual';
  custom_prefix: string | null;
  profile_picture_url: string | null;
  address_internal_only: boolean;
}

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const PRODUCER_STEPS = [
  { id: 1, title: "Responsável" },
  { id: 2, title: "Vínculos" },
];

const Produtores = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [producerToDelete, setProducerToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
        await fetchProducers();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      const data = await producersApi.getAll();
      setProducers(data as Producer[]);
    } catch (error) {
      toast.error("Erro ao carregar produtores");
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
    if (!producerToDelete) return;
    try {
      await producersApi.delete(producerToDelete);
      toast.success("Produtor removido!");
      fetchProducers();
    } catch (error) {
      toast.error("Erro ao remover produtor");
    } finally {
      setProducerToDelete(null);
    }
  };

  const filteredProducers = producers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const primaryColor = branding?.primaryColor || '#16a34a';

  const TableSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array(4).fill(0).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="flex h-40">
            <Skeleton className="w-1/3 h-full rounded-none" />
            <div className="w-2/3 p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
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
              Produtores Parceiros
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
              <Plus size={20} weight="bold" /> Novo Produtor
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome, propriedade ou cidade..."
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
            <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum produtor encontrado</h3>
            <p className="text-slate-400 font-medium">Cadastre seu primeiro parceiro para começar o rastreamento.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {filteredProducers.map((prod) => (
              <Card 
                key={prod.id} 
                className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/admin/produtores/${prod.id}`)}
              >
                <CardContent className="p-0">
                  <div className="flex h-full min-h-[180px]">
                    <div className="w-1/3 relative overflow-hidden">
                      <img 
                        src={prod.photos?.[0] || "/placeholder.svg"} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        alt={prod.name} 
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="w-2/3 p-6 flex flex-col justify-between">
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
                        <p className="font-bold text-sm mb-3 flex items-center gap-1.5" style={{ color: primaryColor }}>
                          <Buildings size={16} weight="fill" /> {prod.property_name}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <MapPin size={14} weight="fill" className="text-slate-300" /> {prod.city}, {prod.state}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Phone size={14} weight="fill" className="text-slate-300" /> {prod.phone || "Sem telefone"}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        {prod.altitude && (
                          <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-0 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            <Mountains size={12} className="mr-1" /> {prod.altitude}m
                          </Badge>
                        )}
                        {prod.average_temperature && (
                          <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-0 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            <Thermometer size={12} className="mr-1" /> {prod.average_temperature}°C
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
                        {editingProducer ? "Editar Produtor" : "Novo Produtor"}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold text-base">
                        {editingProducer ? `Perfil de ${editingProducer.name}` : "Cadastre as informações do produtor e sua propriedade."}
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
                Esta ação removerá permanentemente o produtor e todos os seus vínculos. Os lotes existentes desse produtor poderão ficar órfãos.
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
  const [photoPreviews, setPhotoPreviews] = useState<any[]>(() => {
    if (initialData?.photos) return initialData.photos.map((url: string) => ({ url, uploaded: true }));
    return [];
  });

  const primaryColor = branding?.primaryColor || '#16a34a';

  const methods = useForm({
    defaultValues: initialData || {
      name: "",
      document_number: "",
      email: "",
      phone: "",
      profile_picture_url: "",
      property_name: "",
      property_description: "",
      photos: [],
      altitude: "",
      average_temperature: "",
      cep: "",
      address: "",
      city: "",
      state: "",
      address_internal_only: false,
      latitude: "",
      longitude: "",
      lot_prefix_mode: "auto",
      custom_prefix: "",
      associations: [],
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = methods;

  useEffect(() => {
    associationsApi.getAll().then(setAllAssociations);
    if (initialData?.id) {
      associationsApi.getByProducer(initialData.id).then(assocs => {
        setValue("associations", assocs.map(a => a.id));
      });
    }
  }, [initialData, setValue]);

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
          setPhotoPreviews(prev => [...prev, { url, uploaded: true }]);
        }
      }
      toast.success("Imagens carregadas!");
    } catch (error) {
      toast.error("Erro no upload");
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { associations, ...rest } = data;
      if (initialData) {
        await producersApi.update(initialData.id, rest);
        const currentAssocs = await associationsApi.getByProducer(initialData.id);
        const currentIds = currentAssocs.map(a => a.id);
        for (const id of currentIds) if (!associations.includes(id)) await associationsApi.removeProducerFromAssociation(initialData.id, id);
        for (const id of associations) if (!currentIds.includes(id)) await associationsApi.addProducerToAssociation(initialData.id, id);
      } else {
        const newProd = await producersApi.create(rest);
        for (const id of associations) await associationsApi.addProducerToAssociation(newProd.id, id);
      }
      toast.success("Dados salvos!");
      onSubmit(data);
    } catch (error) {
      toast.error("Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  const FormSection = ({ title, icon: Icon, children, description, active }: any) => {
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
      <form onSubmit={handleSubmit(onFormSubmit)} className="h-full flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-10">
          <FormSection 
            title="Dados do Responsável" 
            icon={IdentificationCard} 
            description="Informações de contato e identificação"
            active={currentStep === 1}
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
                  <Input {...register("document_number")} placeholder="000.000.000-00" className="h-12 focus-visible:ring-primary" style={{ '--primary': primaryColor } as any} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Phone size={16} style={{ color: primaryColor }} /> Telefone/WhatsApp
                  </Label>
                  <Input {...register("phone")} placeholder="(00) 00000-0000" className="h-12 focus-visible:ring-primary" style={{ '--primary': primaryColor } as any} />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Tag size={16} style={{ color: primaryColor }} /> Prefixo de Lote
                </Label>
                <Select value={watch("lot_prefix_mode")} onValueChange={v => setValue("lot_prefix_mode", v as any)}>
                  <SelectTrigger className="rounded-xl bg-slate-50 border-0 h-12 focus:ring-primary" style={{ '--primary': primaryColor } as any}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático (3 letras nome)</SelectItem>
                    <SelectItem value="manual">Manual (Personalizado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {watch("lot_prefix_mode") === "manual" && (
                <div className="space-y-2 animate-in slide-in-from-left-4 duration-300">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <IdentificationCard size={16} style={{ color: primaryColor }} /> Prefixo Personalizado
                  </Label>
                  <Input {...register("custom_prefix")} className="uppercase font-mono h-12 focus-visible:ring-primary" style={{ '--primary': primaryColor } as any} placeholder="EX: FZDA" maxLength={5} />
                </div>
              )}
            </div>
          </FormSection>

          <FormSection 
            title="Vínculos Institucionais" 
            icon={Users} 
            description="Associações e cooperativas parceiras"
            active={currentStep === 2}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {allAssociations.map(assoc => {
                const isSelected = watch("associations")?.includes(assoc.id);
                return (
                  <div 
                    key={assoc.id} 
                    onClick={() => {
                      const current = watch("associations") || [];
                      const next = current.includes(assoc.id) ? current.filter((id: string) => id !== assoc.id) : [...current, assoc.id];
                      setValue("associations", next);
                    }}
                    className={`flex items-center gap-5 p-5 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${
                      isSelected ? "shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                    style={isSelected ? { backgroundColor: `${primaryColor}05`, borderColor: primaryColor } : {}}
                  >
                    <div className={`p-1 rounded-xl border ${isSelected ? 'bg-white' : 'bg-slate-50 border-slate-100'}`} style={isSelected ? { borderColor: `${primaryColor}20` } : {}}>
                      <Checkbox checked={isSelected} className="rounded-md" style={{ '--primary': primaryColor } as any} />
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
        </div>

        {/* Rodapé de Navegação Fixo */}
        <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
          <div className="max-w-5xl mx-auto flex gap-4">
            {currentStep === 1 ? (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">Descartar</Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)} className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-700 hover:bg-slate-50 transition-all gap-2"><ArrowLeft size={20} weight="bold" /> Voltar</Button>
            )}

            {currentStep < 2 ? (
              <Button 
                type="button" 
                onClick={() => validateCurrentStep() && setCurrentStep(currentStep + 1)} 
                className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                style={{ backgroundColor: primaryColor }}
              >
                Próxima Etapa <ArrowRight size={24} weight="bold" />
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
