import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { maskPhone, maskCEP, maskCPFCNPJ } from "@/utils/masks";
import { useCEP } from "@/hooks/use-cep";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { industriesApi, systemConfigApi } from "@/services/api";
import { uploadImageToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { 
  Plus, 
  PencilSimple, 
  Trash, 
  Tag, 
  MapPin, 
  Phone, 
  Buildings, 
  MagnifyingGlass, 
  DotsThreeOutlineVertical,
  Export,
  IdentificationCard,
  At,
  ChatCircleText,
  Camera,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTenant } from "@/hooks/use-tenant";

interface IndustryFormData {
  id?: string;
  name: string;
  document_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  contact_phone: string;
  contact_email: string;
  logo_url: string;
  description: string;
}

const defaultForm: IndustryFormData = {
  name: "",
  document_number: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  contact_phone: "",
  contact_email: "",
  logo_url: "",
  description: "",
};

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const INDUSTRY_STEPS = [
  { id: 1, title: "Dados Industriais" },
  { id: 2, title: "Localização & Contato" }
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

export default function Industria() {
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingIndustry, setEditingIndustry] = useState<any | null>(null);
  const [form, setForm] = useState<IndustryFormData>(defaultForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [industryToDelete, setIndustryToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);
  const { tenant } = useTenant();

  const { searchCEP } = useCEP((data) => {
    setForm((prev: any) => ({
      ...prev,
      city: data.localidade,
      state: data.uf,
      address: data.logradouro || prev.address,
    }));
  });

  useEffect(() => {
    const loadData = async () => {
      if (!tenant) return;
      try {
        const config = await systemConfigApi.getBrandingConfig(tenant.id);
        setBranding(config);
        await fetchIndustries();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, [tenant]);

  const fetchIndustries = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const data = await industriesApi.getAll(tenant.id);
      setIndustries(data || []);
    } catch (e) {
      toast.error("Erro ao carregar indústrias");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (industry: any) => {
    setEditingIndustry(industry);
    setForm({
      id: industry.id,
      name: industry.name || "",
      document_number: industry.document_number || "",
      address: industry.address || "",
      city: industry.city || "",
      state: industry.state || "",
      zip_code: industry.zip_code || "",
      contact_phone: industry.contact_phone || "",
      contact_email: industry.contact_email || "",
      logo_url: industry.logo_url || "",
      description: industry.description || "",
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
      toast.error("Erro no upload");
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim()) {
      toast.error("Nome da indústria é obrigatório");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!tenant) return;
    try {
      if (!form.name.trim()) {
        toast.error("Nome é obrigatório");
        return;
      }
      
      const dataToSend = { ...form, tenant_id: tenant.id };
      
      if (editingIndustry) {
        await industriesApi.update(editingIndustry.id, tenant.id, dataToSend as any);
        toast.success("Indústria atualizada!");
      } else {
        await industriesApi.create(dataToSend as any);
        toast.success("Indústria cadastrada!");
      }
      setIsSheetOpen(false);
      fetchIndustries();
    } catch (e) {
      toast.error("Erro ao salvar");
    }
  };

  const confirmDelete = async () => {
    if (!industryToDelete || !tenant) return;
    try {
      await industriesApi.delete(industryToDelete, tenant.id);
      toast.success("Indústria removida!");
      fetchIndustries();
    } catch (error) {
      toast.error("Erro ao remover");
    } finally {
      setIndustryToDelete(null);
    }
  };

  const filteredIndustries = industries.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.document_number?.includes(searchTerm)
  );

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
          </CardContent>
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
              <Tag size={32} style={{ color: primaryColor }} weight="fill" />
              Indústria & Processamento
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gerencie os parceiros de industrialização e processamento.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <Export size={18} weight="bold" /> Exportar
            </Button>
            <Button 
              onClick={() => { setEditingIndustry(null); setForm(defaultForm); setCurrentStep(1); setIsSheetOpen(true); }} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Nova Indústria
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome, CNPJ ou cidade..."
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
        ) : filteredIndustries.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Buildings size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Nenhuma indústria encontrada</h3>
            <p className="text-slate-400 font-medium">Cadastre indústrias parceiras para vincular aos lotes.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredIndustries.map((item) => (
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                          {item.document_number || "Sem CNPJ"}
                        </p>
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
                        <DropdownMenuItem 
                          onClick={() => setIndustryToDelete(item.id)}
                          className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                        >
                          <Trash size={18} weight="bold" className="mr-2" /> Excluir Registro
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 min-h-[40px]">
                      {item.description || "Indústria parceira de processamento e embalagem."}
                    </p>
                    
                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <MapPin size={14} weight="fill" className="text-slate-300" />
                        {item.city}, {item.state}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Phone size={14} weight="fill" className="text-slate-300" />
                        {item.contact_phone || "Sem contato"}
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
                      <Tag size={32} weight="fill" />
                    </div>
                    <div>
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        {editingIndustry ? "Editar Indústria" : "Nova Indústria"}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold text-base">
                        {editingIndustry ? `Gestão de ${editingIndustry.name}` : "Configure os dados da indústria parceira."}
                      </SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={INDUSTRY_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-10 min-h-0">
                <FormSection
                  title="Dados da Indústria"
                  icon={IdentificationCard}
                  description="Identificação e imagem oficial"
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
                        onClick={() => document.getElementById('industry-logo-up')?.click()}
                        className="absolute -bottom-2 -right-2 p-3 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {uploadingLogo ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Camera size={20} weight="fill" />}
                      </button>
                      <input id="industry-logo-up" type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2 lg:col-span-2">
                        <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                          <IdentificationCard size={16} style={{ color: primaryColor }} /> Nome da Indústria *
                        </Label>
                        <Input 
                          value={form.name} 
                          onChange={e => setForm((prev: any) => ({...prev, name: e.target.value}))} 
                          placeholder="Ex: Processadora Vale Verde" 
                          className="focus-visible:ring-primary h-12"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                          <Tag size={16} style={{ color: primaryColor }} /> CNPJ
                        </Label>
                        <Input 
                          value={form.document_number} 
                          onChange={e => {
                            const masked = maskCPFCNPJ(e.target.value);
                            setForm((prev: any) => ({...prev, document_number: masked}));
                          }}
                          placeholder="00.000.000/0000-00" 
                          maxLength={18}
                          className="focus-visible:ring-primary h-12"
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                        <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                          <ChatCircleText size={16} style={{ color: primaryColor }} /> Descrição da Atividade
                        </Label>
                        <Textarea 
                          value={form.description} 
                          onChange={e => setForm((prev: any) => ({...prev, description: e.target.value}))} 
                          placeholder="Descreva os processos industriais realizados..." 
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
                  description="Localização da planta industrial"
                  active={currentStep === 2}
                  primaryColor={primaryColor}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1 mb-1">CEP</Label>
                      <Input 
                        value={form.zip_code} 
                        onChange={e => {
                          const masked = maskCEP(e.target.value);
                          setForm((prev: any) => ({...prev, zip_code: masked}));
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
                        value={form.address} 
                        onChange={e => setForm((prev: any) => ({...prev, address: e.target.value}))} 
                        placeholder="Rua, número, bairro..." 
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <At size={16} style={{ color: primaryColor }} /> E-mail de Contato
                      </Label>
                      <Input 
                        value={form.contact_email} 
                        onChange={e => setForm((prev: any) => ({...prev, contact_email: e.target.value}))} 
                        placeholder="industrial@..." 
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Phone size={16} style={{ color: primaryColor }} /> Telefone
                      </Label>
                      <Input 
                        value={form.contact_phone} 
                        onChange={e => {
                          const masked = maskPhone(e.target.value);
                          setForm((prev: any) => ({...prev, contact_phone: masked}));
                        }}
                        placeholder="(00) 00000-0000" 
                        maxLength={15}
                        className="focus-visible:ring-primary h-12"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </div>
                </FormSection>
              </div>

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
                      onClick={handleSave} 
                      className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <CheckCircle size={24} weight="bold" />
                      {editingIndustry ? "Salvar Alterações" : "Concluir Cadastro"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={!!industryToDelete} onOpenChange={() => setIndustryToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar Exclusão?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                A indústria será removida. Os lotes vinculados a ela continuarão no sistema, mas sem a referência de processamento industrial.
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
