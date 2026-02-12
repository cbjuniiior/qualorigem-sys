import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { maskPhone, maskCEP } from "@/utils/masks";
import { useCEP } from "@/hooks/use-cep";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { associationsApi, systemConfigApi } from "@/services/api";
import { uploadImageToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { 
  Plus, 
  PencilSimple, 
  MagnifyingGlass, 
  FunnelSimple, 
  MapPin, 
  Phone, 
  Globe, 
  Trash, 
  Buildings, 
  Users, 
  DotsThreeOutlineVertical,
  Export,
  IdentificationCard,
  At,
  ChatCircleText,
  CheckCircle,
  Camera,
  Tag,
  ArrowRight,
  ArrowLeft,
  WarningCircle
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormStepIndicator } from "@/components/ui/step-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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

interface AssociationFormData {
  id?: string;
  name: string;
  type: string;
  city: string;
  state: string;
  cep: string;
  description: string;
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  logo_url?: string;
}

const defaultForm: AssociationFormData = {
  name: "",
  type: "associacao",
  city: "",
  state: "",
  cep: "",
  description: "",
  contact_info: {
    email: "",
    phone: "",
    website: "",
    address: "",
  },
  logo_url: "",
};

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const ASSOCIATION_STEPS = [
  { id: 1, title: "Identificação" },
  { id: 2, title: "Endereço & Contato" }
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

export default function Associacoes() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<AssociationFormData>(defaultForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [assocToDelete, setAssocToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);
  const { tenant } = useTenant();

  const { searchCEP } = useCEP((data) => {
    setForm((prev: any) => ({
      ...prev,
      city: data.localidade,
      state: data.uf,
      contact_info: {
        ...prev.contact_info,
        address: data.logradouro || prev.contact_info.address,
      },
    }));
  });

  useEffect(() => {
    const loadData = async () => {
      if (!tenant) return;
      try {
        const config = await systemConfigApi.getBrandingConfig(tenant.id);
        setBranding(config);
        await fetchAll();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, [tenant]);

  const fetchAll = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const data = await associationsApi.getAll(tenant.id);
      const dataWithCounts = await Promise.all(
        (data || []).map(async (association) => {
          try {
            const count = await associationsApi.getProducerCount(association.id, tenant.id);
            return { ...association, producer_count: count };
          } catch (e) {
            return { ...association, producer_count: 0 };
          }
        })
      );
      setItems(dataWithCounts);
    } catch (e) {
      toast.error("Erro ao carregar associações");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    const contactInfo = item.contact_info || {};
    setForm({
      id: item.id,
      name: item.name || "",
      type: item.type || "associacao",
      city: item.city || "",
      state: item.state || "",
      cep: contactInfo.cep || item.cep || "",
      description: item.description || "",
      contact_info: {
        email: contactInfo.email || "",
        phone: contactInfo.phone || "",
        website: contactInfo.website || "",
        address: contactInfo.address || "",
      },
      logo_url: item.logo_url || "",
    });
    setCurrentStep(1);
    setIsSheetOpen(true);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      const url = await uploadImageToSupabase(file);
      setForm(prev => ({ ...prev, logo_url: url }));
      toast.success("Logo atualizado!");
    } catch (e) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim()) {
      toast.error("Nome da organização é obrigatório");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!tenant) return;
    try {
      if (!form.name.trim()) {
        toast.error("Nome é obrigatório");
        return;
      }
      
      // Preparar dados para envio - mover cep para contact_info
      const dataToSend = {
        name: form.name,
        type: form.type,
        city: form.city,
        state: form.state,
        description: form.description || null,
        logo_url: form.logo_url || null,
        contact_info: {
          ...form.contact_info,
          cep: form.cep || undefined,
          address: form.contact_info.address || undefined,
          email: form.contact_info.email || undefined,
          phone: form.contact_info.phone || undefined,
          website: form.contact_info.website || undefined,
        },
        tenant_id: tenant.id
      };
      
      if (editing) {
        await associationsApi.update(editing.id, tenant.id, dataToSend as any);
        toast.success("Associação atualizada!");
      } else {
        await associationsApi.create(dataToSend as any);
        toast.success("Associação criada!");
      }
      setIsSheetOpen(false);
      fetchAll();
    } catch (e: any) {
      console.error("Erro ao salvar associação:", e);
      toast.error(e?.message || "Erro ao salvar");
    }
  };

  const confirmDelete = async () => {
    if (!assocToDelete || !tenant) return;
    try {
      await associationsApi.delete(assocToDelete, tenant.id);
      toast.success("Associação removida!");
      fetchAll();
    } catch (error) {
      toast.error("Erro ao remover");
    } finally {
      setAssocToDelete(null);
    }
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(search) || item.city?.toLowerCase().includes(search);
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const primaryColor = branding?.primaryColor || '#16a34a';

  const TableSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6).fill(0).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Buildings size={32} style={{ color: primaryColor }} weight="fill" />
              Associações & Cooperativas
            </h2>
            <p className="text-slate-500 font-medium text-sm">Entidades que organizam e apoiam os produtores.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <Export size={18} weight="bold" /> Exportar
            </Button>
            <Button 
              onClick={() => { setEditing(null); setForm(defaultForm); setCurrentStep(1); setIsSheetOpen(true); }} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Nova Entidade
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-0 rounded-xl focus-visible:ring-primary font-medium"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger 
                  className="w-full sm:w-56 h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 focus:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                >
                  <div className="flex items-center gap-2">
                    <FunnelSimple size={18} weight="bold" style={{ color: primaryColor }} />
                    <SelectValue placeholder="Tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all" className="font-bold">Todos os Tipos</SelectItem>
                  <SelectItem value="associacao" className="font-medium">Associação</SelectItem>
                  <SelectItem value="cooperativa" className="font-medium">Cooperativa</SelectItem>
                  <SelectItem value="outros" className="font-medium">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <TableSkeleton />
        ) : filteredItems.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Buildings size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Nenhuma entidade encontrada</h3>
            <p className="text-slate-400 font-medium">Cadastre associações para organizar seus produtores.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 rounded-xl border border-slate-100 shadow-sm bg-white p-1">
                        <AvatarImage src={item.logo_url} className="object-contain" />
                        <AvatarFallback className="bg-slate-50 text-slate-300 rounded-xl">
                          <Buildings size={32} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 line-clamp-1">{item.name}</h4>
                        <Badge className={`${
                          item.type === 'cooperativa' 
                            ? 'bg-purple-50 text-purple-600' 
                            : item.type === 'associacao'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                        } border-0 font-black text-[10px] uppercase rounded-md mt-1`}>
                          {item.type}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400">
                          <DotsThreeOutlineVertical size={18} weight="fill" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-slate-100">
                        <DropdownMenuItem onClick={() => handleEdit(item)} className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer focus:bg-slate-50">
                          <PencilSimple size={18} weight="bold" className="mr-2" style={{ color: primaryColor }} /> Editar Perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setAssocToDelete(item.id)}
                          className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                        >
                          <Trash size={18} weight="bold" className="mr-2" /> Excluir Registro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 min-h-[40px]">
                      {item.description || "Sem descrição disponível para esta organização."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                        <Users size={16} weight="fill" className="text-slate-300" />
                        {item.producer_count || 0} Produtores
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <MapPin size={14} weight="fill" className="text-slate-300" />
                        {item.city}, {item.state}
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
            <div className="h-full flex flex-col bg-slate-50/50">
              <SheetHeader className="p-8 border-b border-slate-100 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Buildings size={32} weight="fill" />
                    </div>
                    <div>
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        {editing ? "Editar Entidade" : "Nova Entidade"}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold text-base">
                        {editing ? `Gestão de ${editing.name}` : "Configure os dados da associação ou cooperativa."}
                      </SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={ASSOCIATION_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-10 min-h-0">
                <FormSection 
                  title="Identificação da Entidade" 
                  icon={IdentificationCard} 
                  description="Dados básicos e visuais"
                  active={currentStep === 1}
                  primaryColor={primaryColor}
                >
                  <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-left">
                    <div className="relative group">
                      <Avatar className="w-40 h-40 border-[6px] border-slate-50 shadow-2xl transition-transform group-hover:scale-105 duration-500 rounded-[2.5rem]">
                        <AvatarImage src={form.logo_url} className="object-contain p-2" />
                        <AvatarFallback 
                          className="ring-1 ring-slate-100"
                          style={{ backgroundColor: `${primaryColor}05`, color: primaryColor }}
                        >
                          <Buildings size={80} weight="fill" />
                        </AvatarFallback>
                      </Avatar>
                      <button 
                        type="button"
                        disabled={uploadingLogo}
                        onClick={() => document.getElementById('logo-up')?.click()}
                        className="absolute -bottom-2 -right-2 p-3 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {uploadingLogo ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={20} weight="fill" />}
                      </button>
                      <input id="logo-up" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 lg:col-span-2">
                        <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                          <IdentificationCard size={16} style={{ color: primaryColor }} /> Nome da Organização *
                        </Label>
                        <Input 
                          value={form.name} 
                          onChange={e => setForm((prev: any) => ({...prev, name: e.target.value}))} 
                          placeholder="Ex: Cooperativa dos Produtores..." 
                          className="focus-visible:ring-primary h-12"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                          <Tag size={16} style={{ color: primaryColor }} /> Tipo de Entidade
                        </Label>
                        <Select value={form.type} onValueChange={v => setForm((prev: any) => ({...prev, type: v}))}>
                          <SelectTrigger 
                            className="rounded-xl bg-slate-50 border-0 h-12 focus:ring-primary"
                            style={{ '--primary': primaryColor } as any}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="associacao">Associação</SelectItem>
                            <SelectItem value="cooperativa">Cooperativa</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                        <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                          <ChatCircleText size={16} style={{ color: primaryColor }} /> Sobre a Organização
                        </Label>
                        <Textarea 
                          value={form.description} 
                          onChange={e => setForm((prev: any) => ({...prev, description: e.target.value}))} 
                          placeholder="Breve história da entidade, missão e valores..." 
                          className="min-h-[150px] focus-visible:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                    </div>
                  </div>
                </FormSection>

                <FormSection 
                  title="Endereço & Contato" 
                  icon={MapPin} 
                  description="Localização e meios de comunicação"
                  active={currentStep === 2}
                  primaryColor={primaryColor}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1 mb-1">CEP</Label>
                      <Input 
                        value={form.cep} 
                        onChange={e => {
                          const masked = maskCEP(e.target.value);
                          setForm((prev: any) => ({...prev, cep: masked}));
                        }}
                        onBlur={(e) => {
                          const cleanCEP = e.target.value.replace(/\D/g, '');
                          if (cleanCEP.length === 8) {
                            searchCEP(e.target.value);
                          }
                        }}
                        placeholder="00000-000" 
                        maxLength={9}
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-black text-slate-700 ml-1 mb-1">Cidade *</Label>
                      <Input 
                        value={form.city} 
                        onChange={e => setForm((prev: any) => ({...prev, city: e.target.value}))} 
                        placeholder="Cidade" 
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1 mb-1">Estado *</Label>
                      <Select value={form.state} onValueChange={v => setForm((prev: any) => ({...prev, state: v}))}>
                        <SelectTrigger 
                          className="rounded-xl bg-slate-50 border-0 h-12 focus:ring-primary"
                          style={{ '--primary': primaryColor } as any}
                        >
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {stateOptions.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <Label className="font-black text-slate-700 ml-1 mb-1 text-xs uppercase">Endereço Completo</Label>
                      <Input 
                        value={form.contact_info.address} 
                        onChange={e => setForm((prev: any) => ({...prev, contact_info: {...prev.contact_info, address: e.target.value}}))} 
                        placeholder="Rua, número, bairro..." 
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <At size={16} style={{ color: primaryColor }} /> E-mail Oficial
                      </Label>
                      <Input 
                        value={form.contact_info.email} 
                        onChange={e => setForm((prev: any) => ({...prev, contact_info: {...prev.contact_info, email: e.target.value}}))} 
                        placeholder="contato@..." 
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Phone size={16} style={{ color: primaryColor }} /> Telefone / WhatsApp
                      </Label>
                      <Input 
                        value={form.contact_info.phone} 
                        onChange={e => {
                          const masked = maskPhone(e.target.value);
                          setForm((prev: any) => ({...prev, contact_info: {...prev.contact_info, phone: masked}}));
                        }}
                        placeholder="(00) 00000-0000" 
                        maxLength={15}
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Globe size={16} style={{ color: primaryColor }} /> Website
                      </Label>
                      <Input 
                        value={form.contact_info.website} 
                        onChange={e => setForm((prev: any) => ({...prev, contact_info: {...prev.contact_info, website: e.target.value}}))} 
                        placeholder="www.entidade.com.br" 
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </div>
                </FormSection>
              </div>

              {/* Rodapé Fixo */}
              <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
                <div className="max-w-5xl mx-auto flex gap-4">
                  {currentStep === 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setIsSheetOpen(false)} 
                      className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      Descartar
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)} 
                      className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:bg-slate-50 transition-all gap-2"
                    >
                      <ArrowLeft size={20} weight="bold" /> Voltar
                    </Button>
                  )}

                  {currentStep === 1 ? (
                    <Button 
                      onClick={() => validateStep1() && setCurrentStep(2)} 
                      className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Próxima Etapa
                      <ArrowRight size={24} weight="bold" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <CheckCircle size={24} weight="bold" />
                      {editing ? "Salvar Alterações" : "Concluir Cadastro"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={!!assocToDelete} onOpenChange={() => setAssocToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar Exclusão?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                A entidade será removida. Os produtores vinculados continuarão no sistema, mas sem o vínculo com esta associação.
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
}
