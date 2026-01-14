import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { brandsApi, producersApi, productLotsApi, associationsApi, systemConfigApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  MapPin, 
  Phone, 
  Envelope, 
  Mountains, 
  Thermometer, 
  ArrowLeft, 
  PencilSimple, 
  Copy, 
  QrCode, 
  ArrowSquareOut, 
  Buildings, 
  Globe, 
  Compass, 
  MapTrifold, 
  Package, 
  Users, 
  Plus, 
  X, 
  Trash, 
  Tag,
  Eye,
  ArrowRight,
  DotsThreeCircle,
  Calendar,
  SealCheck,
  UserCircle,
  CircleNotch,
  CheckCircle
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { ProducerForm } from "./Produtores";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/utils/slug-generator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStepIndicator } from "@/components/ui/step-indicator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";

const PRODUCER_STEPS = [
  { id: 1, title: "Responsável" },
  { id: 2, title: "Propriedade" },
  { id: 3, title: "Localização" },
  { id: 4, title: "Vínculos" },
];

export default function ProducerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [allAssociations, setAllAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [isEditSheetOpen, setIsSheetOpen] = useState(false);
  const [isAssocSheetOpen, setIsAssocSheetOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [brandForm, setBrandForm] = useState({ name: "", slug: "" });
  const [savingBrand, setSavingBrand] = useState(false);
  const [branding, setBranding] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
        if (!id) return;
        setLoading(true);
        const [p, a, allA, b, l] = await Promise.all([
          producersApi.getById(id),
          associationsApi.getByProducer(id),
          associationsApi.getAll(),
          brandsApi.getByProducer(id),
          productLotsApi.getByProducer(id)
        ]);
        setProducer(p);
        setAssociations(a);
        setAllAssociations(allA);
        setBrands(b);
        setLots(l);
      } catch (e) {
        toast.error("Erro ao carregar produtor");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
    if (!producer) return;
    if (producer.latitude && producer.longitude) {
      setMapCoords({ lat: producer.latitude, lon: producer.longitude });
    } else {
      setLoadingMap(true);
      const query = `${producer.address || ''}, ${producer.city}, ${producer.state}`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.[0]) setMapCoords({ lat: data[0].lat, lon: data[0].lon });
        })
        .finally(() => setLoadingMap(false));
    }
  }, [producer]);

  const handleAssociationToggle = async (assocId: string, checked: boolean) => {
    if (!id) return;
    try {
      if (checked) await associationsApi.addProducerToAssociation(id, assocId);
      else await associationsApi.removeProducerFromAssociation(id, assocId);
      const updated = await associationsApi.getByProducer(id);
      setAssociations(updated);
      toast.success("Associações atualizadas!");
    } catch (e) {
      toast.error("Erro ao atualizar");
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex gap-6 items-center">
            <Skeleton className="h-24 w-24 rounded-3xl" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-left">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 rounded-3xl border-4 border-white shadow-2xl ring-1 ring-slate-100">
              <AvatarImage src={producer.profile_picture_url} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary">
                <UserCircle size={64} weight="fill" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{producer.name}</h2>
                <Badge className="bg-primary/10 text-primary border-0 font-black text-[10px] uppercase rounded-md px-2">Produtor Ativo</Badge>
              </div>
              <p className="font-black text-lg flex items-center gap-2" style={{ color: primaryColor }}>
                <Buildings size={20} weight="fill" /> {producer.property_name}
              </p>
              <div className="flex items-center gap-4 pt-1">
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                  <MapPin size={16} weight="fill" className="text-slate-300" /> {producer.city}, {producer.state}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <ArrowLeft weight="bold" /> Voltar
            </Button>
            <Button onClick={() => { setCurrentStep(1); setIsSheetOpen(true); }} className="rounded-xl font-bold bg-white border-primary/20 hover:bg-primary/5 shadow-sm gap-2" style={{ color: primaryColor }}>
              <PencilSimple size={18} weight="bold" /> Editar Perfil
            </Button>
            <Button onClick={() => setIsAssocSheetOpen(true)} className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg shadow-primary/20 gap-2" style={{ backgroundColor: primaryColor }}>
              <Users size={18} weight="bold" /> Gerenciar Associações
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} weight="fill" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Lotes</p>
                  <p className="text-2xl font-black text-slate-900">{lots.length}</p>
                </div>
              </Card>
              <Card className="border-0 shadow-sm bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Eye size={24} weight="fill" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualizações</p>
                  <p className="text-2xl font-black text-slate-900">{lots.reduce((acc, l) => acc + (l.views || 0), 0)}</p>
                </div>
              </Card>
              <Card className="border-0 shadow-sm bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} weight="fill" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marcas</p>
                  <p className="text-2xl font-black text-slate-900">{brands.length}</p>
                </div>
              </Card>
            </div>

            {/* Property Story */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Buildings size={24} style={{ color: primaryColor }} weight="fill" /> Sobre a Propriedade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-600 font-medium leading-relaxed text-lg whitespace-pre-line">
                  {producer.property_description || "Nenhuma descrição detalhada informada para esta propriedade."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                  {producer.photos?.map((p: string, i: number) => (
                    <img key={i} src={p} className="aspect-square rounded-2xl object-cover shadow-sm hover:scale-105 transition-transform cursor-pointer" />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lots List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Package size={24} style={{ color: primaryColor }} weight="fill" /> Lotes Ativos
                </h3>
                <Button variant="ghost" className="font-bold hover:bg-primary/5 rounded-xl" style={{ color: primaryColor }}>Ver Todos</Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {lots.map(lot => (
                  <Card key={lot.id} className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-all overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-left">
                        <img src={lot.image_url} className="h-14 w-14 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{lot.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lot.code} • Safra {lot.harvest_year}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 group-hover:text-primary transition-all">
                        <ArrowRight size={20} weight="bold" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Contact Card */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8 bg-slate-50/30">
                <CardTitle className="text-lg font-black">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-sm ring-1 ring-slate-100" style={{ color: primaryColor }}>
                    <Phone size={20} weight="fill" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase">WhatsApp / Tel</p>
                    <p className="text-sm font-black text-slate-700">{producer.phone || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-sm ring-1 ring-slate-100" style={{ color: primaryColor }}>
                    <Envelope size={20} weight="fill" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase">E-mail Direto</p>
                    <p className="text-sm font-black text-slate-700 truncate">{producer.email || "Não informado"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Localização</span>
                    <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[10px] font-black">Coordenadas OK</Badge>
                  </div>
                  <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-100 relative group">
                    {mapCoords ? (
                      <iframe
                        title="Mapa" width="100%" height="100%" frameBorder="0"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapCoords.lon) - 0.01}%2C${Number(mapCoords.lat) - 0.01}%2C${Number(mapCoords.lon) + 0.01}%2C${Number(mapCoords.lat) + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                      />
                    ) : <Skeleton className="h-full w-full" />}
                    <a href={`https://www.google.com/maps/search/?api=1&query=${mapCoords?.lat},${mapCoords?.lon}`} target="_blank" className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-lg shadow-xl text-[10px] font-black text-slate-900 border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <MapTrifold size={12} weight="bold" /> Abrir Maps
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brands Section */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8 flex flex-row items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-lg font-black">Marcas Próprias</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase">Identidade no PDV</CardDescription>
                </div>
                <Button size="icon" variant="ghost" className="rounded-xl text-primary" onClick={() => setIsBrandDialogOpen(true)} style={{ color: primaryColor }}>
                  <Plus size={20} weight="bold" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {brands.map(brand => (
                    <div key={brand.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Tag size={18} style={{ color: primaryColor }} weight="fill" />
                        <span className="font-bold text-slate-700">{brand.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-white border-slate-200 text-slate-400 font-mono text-[9px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">/{brand.slug}</Badge>
                    </div>
                  ))}
                  {brands.length === 0 && <p className="text-center text-xs text-slate-400 font-bold py-4">Nenhuma marca cadastrada.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sheets & Dialogs */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsSheetOpen}>
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
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">Editar Produtor</SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold">Atualize as informações cadastrais.</SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={PRODUCER_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              <div className="flex-1 relative flex flex-col min-h-0">
                <ProducerForm 
                  initialData={producer} 
                  branding={branding}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  onSubmit={() => { setIsSheetOpen(false); window.location.reload(); }} 
                  onCancel={() => setIsSheetOpen(false)} 
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={isAssocSheetOpen} onOpenChange={setIsAssocSheetOpen}>
          <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30 text-left">
                <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">Vínculos de Associação</SheetTitle>
                <SheetDescription className="text-slate-500 font-bold uppercase text-xs">Entidades que este produtor faz parte.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 min-h-0 text-left">
                {allAssociations.map(assoc => {
                  const isChecked = associations.some(a => a.id === assoc.id);
                  return (
                    <div 
                      key={assoc.id} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked ? 'shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                      }`}
                      style={isChecked ? { backgroundColor: `${primaryColor}05`, borderColor: primaryColor } : {}}
                      onClick={() => handleAssociationToggle(assoc.id, !isChecked)}
                    >
                      <Checkbox 
                        id={assoc.id} 
                        checked={isChecked} 
                        onCheckedChange={c => handleAssociationToggle(assoc.id, !!c)}
                        style={{ '--primary': primaryColor } as any}
                      />
                      <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                        <AvatarImage src={assoc.logo_url} className="object-contain" />
                        <AvatarFallback className="bg-white text-slate-400">
                          <Buildings size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor={assoc.id} 
                        className={`flex-1 font-black text-sm cursor-pointer transition-colors ${isChecked ? '' : 'text-slate-700'}`}
                        style={isChecked ? { color: primaryColor } : {}}
                      >
                        {assoc.name}
                      </label>
                      {isChecked && <CheckCircle size={20} weight="fill" style={{ color: primaryColor }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-black">Nova Marca Própria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-left">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 ml-1">Nome da Marca</Label>
                <Input 
                  value={brandForm.name} 
                  onChange={e => { setBrandForm({...brandForm, name: e.target.value, slug: generateSlug(e.target.value)}); }} 
                  className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary" 
                  placeholder="Ex: Reserva da Família" 
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 ml-1">Slug da URL</Label>
                <Input value={brandForm.slug} readOnly className="rounded-xl bg-slate-100 border-0 h-12 font-mono text-xs opacity-60" />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button onClick={() => setIsBrandDialogOpen(false)} variant="ghost" className="rounded-xl font-bold">Cancelar</Button>
              <Button 
                onClick={async () => {
                  setSavingBrand(true);
                  try {
                    await brandsApi.create({ producer_id: id!, name: brandForm.name, slug: brandForm.slug });
                    toast.success("Marca criada!");
                    setIsBrandDialogOpen(false);
                    const updated = await brandsApi.getByProducer(id!);
                    setBrands(updated);
                  } catch (e) {
                    toast.error("Erro ao criar marca");
                  } finally {
                    setSavingBrand(false);
                  }
                }} 
                disabled={savingBrand}
                className="rounded-xl font-bold text-white h-12 px-8 hover:opacity-90 transition-all shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {savingBrand ? <CircleNotch className="animate-spin" /> : "Criar Marca"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
