import { useState, useEffect, useRef } from "react";
import { 
  Gear, 
  Tag, 
  ListBullets, 
  Plus, 
  Trash, 
  PencilSimple, 
  FloppyDisk, 
  X,
  CircleNotch,
  MagnifyingGlass,
  Info,
  PaintBrush,
  Palette,
  Image as ImageIcon,
  CheckCircle,
  Desktop,
  Browser,
  Hash,
  Video,
  SelectionAll,
  ChartPieSlice,
  Sliders,
  ChartBar,
  Eye,
  Quotes,
  Selection,
  WarningCircle
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { categoriesApi, characteristicsApi, systemConfigApi, sensoryAttributesApi } from "@/services/api";
import { useBranding } from "@/hooks/use-branding";
import { uploadLogoToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
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

const COLOR_PRESETS = {
  default: { name: 'Padrão', primaryColor: '#16a34a', secondaryColor: '#22c55e', accentColor: '#10b981' },
  cafe: { name: 'Café Premium', primaryColor: '#92400e', secondaryColor: '#a16207', accentColor: '#d97706' },
  vinho: { name: 'Vinho & Uva', primaryColor: '#7f1d1d', secondaryColor: '#991b1b', accentColor: '#dc2626' },
  acai: { name: 'Açaí Natural', primaryColor: '#581c87', secondaryColor: '#6b21a8', accentColor: '#9333ea' },
};

const GestaoPlataforma = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categorias");
  const { branding: currentBranding, refreshBranding } = useBranding();
  const [branding, setBranding] = useState<any>(currentBranding);
  
  // Categorias
  const [categories, setCategories] = useState<any[]>([]);
  const [searchCategory, setSearchCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);

  // Características
  const [characteristics, setCharacteristics] = useState<any[]>([]);
  const [searchCharacteristic, setSearchCharacteristic] = useState("");
  const [isCharacteristicModalOpen, setIsCharacteristicModalOpen] = useState(false);
  const [editingCharacteristic, setEditingCharacteristic] = useState<any>(null);
  const [characteristicForm, setCharacteristicForm] = useState({ name: "", description: "" });
  const [isDeletingCharacteristic, setIsDeletingCharacteristic] = useState<string | null>(null);

  // Atributos Sensoriais
  const [sensoryAttributes, setSensoryAttributes] = useState<any[]>([]);
  const [searchSensory, setSearchSensory] = useState("");
  const [isSensoryModalOpen, setIsSensoryModalOpen] = useState(false);
  const [editingSensory, setEditingSensory] = useState<any>(null);
  const [sensoryForm, setSensoryForm] = useState({ 
    name: "", 
    description: "", 
    type: "quantitative" as "quantitative" | "qualitative",
    show_radar: true,
    show_average: true
  });
  const [isDeletingSensory, setIsDeletingSensory] = useState<string | null>(null);

  // Configurações do Sistema
  const [lotIdConfig, setLotIdConfig] = useState({ mode: 'auto', prefix: 'GT', auto_increment: true, current_number: 1 });
  const [qrCodeConfig, setQrCodeConfig] = useState({ mode: 'individual', generic_categories: [] });
  const [videoConfig, setVideoConfig] = useState({ enabled: true, auto_play: true, show_after_seconds: 3 });

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, chars, sensory, lotId, qrCode, video] = await Promise.all([
        categoriesApi.getAll(),
        characteristicsApi.getAll(),
        sensoryAttributesApi.getAll(),
        systemConfigApi.getLotIdConfig().catch(() => null),
        systemConfigApi.getQRCodeConfig().catch(() => null),
        systemConfigApi.getVideoConfig().catch(() => null)
      ]);
      setCategories(cats);
      setCharacteristics(chars);
      setSensoryAttributes(sensory);
      if (lotId) setLotIdConfig(lotId);
      if (qrCode) setQrCodeConfig(qrCode);
      if (video) setVideoConfig(video);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

  // Handlers para Categorias
  const handleSaveCategory = async () => {
    if (!categoryForm.name) {
      toast.error("O nome da categoria é obrigatório");
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, categoryForm);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await categoriesApi.create(categoryForm);
        toast.success("Categoria criada com sucesso!");
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!isDeletingCategory) return;
    try {
      await categoriesApi.delete(isDeletingCategory);
      toast.success("Categoria removida com sucesso!");
      setIsDeletingCategory(null);
      loadData();
    } catch (error) {
      toast.error("Erro ao remover categoria");
    }
  };

  // Handlers para Características
  const handleSaveCharacteristic = async () => {
    if (!characteristicForm.name) {
      toast.error("O nome da característica é obrigatório");
      return;
    }

    try {
      setSaving(true);
      if (editingCharacteristic) {
        await characteristicsApi.update(editingCharacteristic.id, characteristicForm);
        toast.success("Característica atualizada com sucesso!");
      } else {
        await characteristicsApi.create(characteristicForm);
        toast.success("Característica criada com sucesso!");
      }
      setIsCharacteristicModalOpen(false);
      setEditingCharacteristic(null);
      setCharacteristicForm({ name: "", description: "" });
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar característica");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCharacteristic = async () => {
    if (!isDeletingCharacteristic) return;
    try {
      await characteristicsApi.delete(isDeletingCharacteristic);
      toast.success("Característica removida com sucesso!");
      setIsDeletingCharacteristic(null);
      loadData();
    } catch (error) {
      toast.error("Erro ao remover característica");
    }
  };

  // Handlers para Atributos Sensoriais
  const handleSaveSensory = async () => {
    if (!sensoryForm.name) {
      toast.error("O nome do atributo é obrigatório");
      return;
    }

    try {
      setSaving(true);
      if (editingSensory) {
        await sensoryAttributesApi.update(editingSensory.id, sensoryForm);
        toast.success("Atributo sensorial atualizado!");
      } else {
        await sensoryAttributesApi.create(sensoryForm);
        toast.success("Atributo sensorial criado!");
      }
      setIsSensoryModalOpen(false);
      setEditingSensory(null);
      setSensoryForm({ 
        name: "", 
        description: "", 
        type: "quantitative",
        show_radar: true,
        show_average: true
      });
      loadData();
    } catch (error) {
      toast.error("Erro ao salvar atributo sensorial");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSensory = async () => {
    if (!isDeletingSensory) return;
    try {
      await sensoryAttributesApi.delete(isDeletingSensory);
      toast.success("Atributo sensorial removido!");
      setIsDeletingSensory(null);
      loadData();
    } catch (error) {
      toast.error("Erro ao remover atributo");
    }
  };

  // Handlers para Personalização
  const handleSaveBranding = async () => {
    try {
      setSaving(true);
      await systemConfigApi.upsert({
        config_key: 'branding_settings',
        config_value: branding as any,
        description: 'Configurações de personalização e branding'
      });
      
      await refreshBranding();
      toast.success("Configurações de personalização atualizadas!");
    } catch (error) {
      toast.error("Erro ao salvar personalização");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSystem = async () => {
    try {
      setSaving(true);
      await Promise.all([
        systemConfigApi.upsert({ config_key: 'lot_id_mode', config_value: lotIdConfig, description: 'ID de lotes' }),
        systemConfigApi.upsert({ config_key: 'qrcode_mode', config_value: qrCodeConfig, description: 'QR Code' }),
        systemConfigApi.upsert({ config_key: 'video_settings', config_value: videoConfig, description: 'Vídeo' })
      ]);
      toast.success("Configurações do sistema atualizadas!");
    } catch (e) {
      toast.error("Erro ao salvar configurações do sistema");
    } finally {
      setSaving(false);
    }
  };

  const handlePresetChange = (preset: any) => {
    if (preset !== 'custom') {
      const p = (COLOR_PRESETS as any)[preset];
      setBranding({ ...branding, preset, ...p });
    } else {
      setBranding({ ...branding, preset: 'custom' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const logoUrl = await uploadLogoToSupabase(file);
      setBranding({ ...branding, logoUrl });
      toast.success("Logo atualizado!");
    } catch (error) {
      toast.error("Erro no upload do logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const filteredCharacteristics = characteristics.filter(char => 
    char.name.toLowerCase().includes(searchCharacteristic.toLowerCase())
  );

  const filteredSensory = sensoryAttributes.filter(s => 
    s.name.toLowerCase().includes(searchSensory.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Gear size={32} style={{ color: primaryColor }} weight="fill" />
              Gestão da Plataforma
            </h2>
            <p className="text-slate-500 font-medium text-sm">Configure as entidades e regras de negócio do sistema.</p>
          </div>
          
          {activeTab === "personalizacao" ? (
            <Button 
              onClick={handleSaveBranding} 
              disabled={saving}
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-8 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? <CircleNotch className="h-5 w-5 mr-2 animate-spin" /> : <FloppyDisk className="h-5 w-5 mr-2" weight="bold" />}
              Salvar Identidade
            </Button>
          ) : activeTab === "sistema" ? (
            <Button 
              onClick={handleSaveSystem} 
              disabled={saving}
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-8 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? <CircleNotch className="h-5 w-5 mr-2 animate-spin" /> : <FloppyDisk className="h-5 w-5 mr-2" weight="bold" />}
              Salvar Funcionalidades
            </Button>
          ) : (
            <Button 
              onClick={() => {
                if (activeTab === "categorias") {
                  setEditingCategory(null);
                  setCategoryForm({ name: "", description: "" });
                  setIsCategoryModalOpen(true);
                } else if (activeTab === "caracteristicas") {
                  setEditingCharacteristic(null);
                  setCharacteristicForm({ name: "", description: "" });
                  setIsCharacteristicModalOpen(true);
                } else {
                  setEditingSensory(null);
                  setSensoryForm({ name: "", description: "", type: "quantitative", show_radar: true, show_average: true });
                  setIsSensoryModalOpen(true);
                }
              }}
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-8"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} className="mr-2" weight="bold" />
              Nova {activeTab === "categorias" ? "Categoria" : activeTab === "caracteristicas" ? "Característica" : "Análise"}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-100 p-1.5 mb-8">
            <TabsTrigger 
              value="categorias" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'categorias' ? primaryColor : undefined }}
            >
              <Tag size={18} className="mr-2" weight="bold" /> Categorias
            </TabsTrigger>
            <TabsTrigger 
              value="caracteristicas" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'caracteristicas' ? primaryColor : undefined }}
            >
              <ListBullets size={18} className="mr-2" weight="bold" /> Características
            </TabsTrigger>
            <TabsTrigger 
              value="sensorial" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'sensorial' ? primaryColor : undefined }}
            >
              <ChartPieSlice size={18} className="mr-2" weight="bold" /> Análise Sensorial
            </TabsTrigger>
            <TabsTrigger 
              value="personalizacao" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'personalizacao' ? primaryColor : undefined }}
            >
              <PaintBrush size={18} className="mr-2" weight="bold" /> Personalização
            </TabsTrigger>
            <TabsTrigger 
              value="sistema" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'sistema' ? primaryColor : undefined }}
            >
              <Desktop size={18} className="mr-2" weight="bold" /> Funcionalidades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias" className="animate-in fade-in slide-in-from-bottom-4 outline-none">
            {/* Categorias Content (same as before) */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black">Categorias de Produtos</CardTitle>
                    <CardDescription className="font-medium tracking-tight">Gerencie as categorias disponíveis para classificação dos lotes.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Buscar categoria..." 
                      value={searchCategory}
                      onChange={e => setSearchCategory(e.target.value)}
                      className="pl-11 rounded-xl bg-slate-50 border-0 h-11 font-medium" 
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                        <tr key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-black text-slate-700">{cat.name}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-slate-500 font-medium">{cat.description || "-"}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({ name: cat.name, description: cat.description || "" });
                                  setIsCategoryModalOpen(true);
                                }}
                                className="rounded-lg hover:bg-white hover:shadow-sm"
                              >
                                <PencilSimple size={18} weight="bold" className="text-slate-400 group-hover:text-primary" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsDeletingCategory(cat.id)}
                                className="rounded-lg hover:bg-white hover:shadow-sm text-rose-500"
                              >
                                <Trash size={18} weight="bold" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-8 py-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <Tag size={40} weight="thin" />
                              <p className="font-bold tracking-tight">Nenhuma categoria encontrada</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caracteristicas" className="animate-in fade-in slide-in-from-bottom-4 outline-none">
            {/* Caracteristicas Content (same as before) */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black">Características de Produtos</CardTitle>
                    <CardDescription className="font-medium tracking-tight">Gerencie os atributos técnicos que podem ser atribuídos aos lotes.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Buscar característica..." 
                      value={searchCharacteristic}
                      onChange={e => setSearchCharacteristic(e.target.value)}
                      className="pl-11 rounded-xl bg-slate-50 border-0 h-11 font-medium focus-visible:ring-primary" 
                      style={{ '--primary': primaryColor } as any}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Descrição</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredCharacteristics.length > 0 ? filteredCharacteristics.map((char) => (
                        <tr key={char.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <span className="font-black text-slate-700">{char.name}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm text-slate-500 font-medium">{char.description || "-"}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setEditingCharacteristic(char);
                                  setCharacteristicForm({ name: char.name, description: char.description || "" });
                                  setIsCharacteristicModalOpen(true);
                                }}
                                className="rounded-lg hover:bg-white hover:shadow-sm"
                              >
                                <PencilSimple size={18} weight="bold" className="text-slate-400 group-hover:text-primary" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsDeletingCharacteristic(char.id)}
                                className="rounded-lg hover:bg-white hover:shadow-sm text-rose-500"
                              >
                                <Trash size={18} weight="bold" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-8 py-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <ListBullets size={40} weight="thin" />
                              <p className="font-bold tracking-tight">Nenhuma característica encontrada</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sensorial" className="animate-in fade-in slide-in-from-bottom-4 outline-none">
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black">Atributos de Análise Sensorial</CardTitle>
                    <CardDescription className="font-medium tracking-tight">Gerencie os critérios de avaliação de qualidade e perfil sensorial.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-72">
                    <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Buscar atributo..." 
                      value={searchSensory}
                      onChange={e => setSearchSensory(e.target.value)}
                      className="pl-11 rounded-xl bg-slate-50 border-0 h-11 font-medium focus-visible:ring-primary" 
                      style={{ '--primary': primaryColor } as any}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Configurações</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSensory.length > 0 ? filteredSensory.map((s) => (
                        <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-700">{s.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{s.description || "Sem descrição"}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <Badge 
                              className="border-0 font-black text-[10px] uppercase rounded-md"
                              style={{ 
                                backgroundColor: s.type === 'quantitative' ? `${primaryColor}10` : 'rgb(241 245 249)', 
                                color: s.type === 'quantitative' ? primaryColor : 'rgb(71 85 105)' 
                              }}
                            >
                              {s.type === 'quantitative' ? 'Quantitativa' : 'Sensorial'}
                            </Badge>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex gap-2">
                              {s.type === 'quantitative' && (
                                <>
                                  {s.show_radar && <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-500">Radar</Badge>}
                                  {s.show_average && <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-500">Média</Badge>}
                                </>
                              )}
                              {s.type === 'qualitative' && (
                                <Badge variant="outline" className="text-[9px] font-bold border-slate-200 text-slate-500 italic">Escala (Menos/Mais)</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => {
                                  setEditingSensory(s);
                                  setSensoryForm({ 
                                    name: s.name, 
                                    description: s.description || "", 
                                    type: s.type,
                                    show_radar: s.show_radar,
                                    show_average: s.show_average
                                  });
                                  setIsSensoryModalOpen(true);
                                }}
                                className="rounded-lg hover:bg-white hover:shadow-sm"
                              >
                                <PencilSimple size={18} weight="bold" className="text-slate-400 group-hover:text-primary" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsDeletingSensory(s.id)}
                                className="rounded-lg hover:bg-white hover:shadow-sm text-rose-500"
                              >
                                <Trash size={18} weight="bold" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <ChartPieSlice size={40} weight="thin" />
                              <p className="font-bold tracking-tight">Nenhum atributo sensorial encontrado</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personalizacao" className="animate-in fade-in slide-in-from-bottom-4 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Configurações de Branding e SEO */}
              <div className="lg:col-span-7 space-y-8">
                {/* Informações do Site */}
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 px-8 py-6">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <Browser size={24} weight="fill" style={{ color: primaryColor }} />
                      Informações do Site
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-400 text-sm">Configure como o sistema aparece no navegador e motores de busca.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">Título do Site (Navegador) *</Label>
                      <Input 
                        value={branding.siteTitle}
                        onChange={e => setBranding({ ...branding, siteTitle: e.target.value })}
                        placeholder="Ex: Nome da sua Marca - Rastreabilidade" 
                        className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary"
                        style={{ '--primary': primaryColor } as any}
                      />
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Este título aparecerá na aba do navegador.</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700 ml-1">Descrição do Site</Label>
                      <Textarea 
                        value={branding.siteDescription}
                        onChange={e => setBranding({ ...branding, siteDescription: e.target.value })}
                        placeholder="Breve descrição sobre o portal..." 
                        className="rounded-2xl bg-slate-50 border-0 min-h-[100px] font-medium focus-visible:ring-primary"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Preset de Cores */}
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 px-8 py-6">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <Palette size={24} weight="fill" style={{ color: primaryColor }} />
                      Paleta de Cores
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-400 text-sm text-sm">Escolha a identidade visual predominante do sistema.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(COLOR_PRESETS).map(([key, preset]) => {
                        const isSelected = branding.preset === key;
                        return (
                          <button
                            key={key}
                            onClick={() => handlePresetChange(key)}
                            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                              isSelected ? "shadow-md" : "border-slate-100 hover:border-slate-200 bg-white"
                            }`}
                            style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}05` } : {}}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2" style={{ color: primaryColor }}>
                                <CheckCircle size={20} weight="fill" />
                              </div>
                            )}
                            <div className="flex gap-1.5 mb-3">
                              <div className="w-6 h-6 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: preset.primaryColor }} />
                              <div className="w-6 h-6 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: preset.secondaryColor }} />
                              <div className="w-6 h-6 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: preset.accentColor }} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-tight" style={{ color: isSelected ? primaryColor : '#475569' }}>
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePresetChange('custom')}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                          branding.preset === 'custom' ? "shadow-md" : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                        style={branding.preset === 'custom' ? { borderColor: primaryColor, backgroundColor: `${primaryColor}05` } : {}}
                      >
                        <div className="w-10 h-6 flex items-center justify-center mb-3 text-slate-300">
                          <Palette size={24} weight="bold" style={branding.preset === 'custom' ? { color: primaryColor } : {}} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-tight" style={{ color: branding.preset === 'custom' ? primaryColor : '#475569' }}>
                          Personalizado
                        </span>
                      </button>
                    </div>

                    {branding.preset === 'custom' && (
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Primária</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer border-0 rounded-lg" />
                            <Input type="text" value={branding.primaryColor} onChange={e => setBranding({...branding, primaryColor: e.target.value})} className="flex-1 bg-white border-0 h-10 rounded-lg font-mono text-xs font-bold uppercase" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Secundária</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={branding.secondaryColor} onChange={e => setBranding({...branding, secondaryColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer border-0 rounded-lg" />
                            <Input type="text" value={branding.secondaryColor} onChange={e => setBranding({...branding, secondaryColor: e.target.value})} className="flex-1 bg-white border-0 h-10 rounded-lg font-mono text-xs font-bold uppercase" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Destaque</Label>
                          <div className="flex gap-2">
                            <Input type="color" value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer border-0 rounded-lg" />
                            <Input type="text" value={branding.accentColor} onChange={e => setBranding({...branding, accentColor: e.target.value})} className="flex-1 bg-white border-0 h-10 rounded-lg font-mono text-xs font-bold uppercase" />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Logotipo */}
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 px-8 py-6">
                    <CardTitle className="text-xl font-black flex items-center gap-2">
                      <ImageIcon size={24} weight="fill" style={{ color: primaryColor }} />
                      Logotipo e Favicon
                    </CardTitle>
                    <CardDescription className="font-medium text-slate-400 text-sm">O logo também será usado como ícone do site no navegador.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      {branding.logoUrl ? (
                        <div className="relative group">
                          <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center p-4 shadow-xl ring-1 ring-slate-100">
                            <img src={branding.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                          </div>
                          <button onClick={() => setBranding({...branding, logoUrl: null})} className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors">
                            <X size={16} weight="bold" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-white rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-100 text-slate-200">
                          <ImageIcon size={48} weight="fill" />
                          <span className="text-[10px] font-black uppercase mt-2">Sem Logo</span>
                        </div>
                      )}
                      <div className="flex-1 text-center sm:text-left space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-700">Carregar Novo Logo</h4>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">Formatos: SVG ou PNG transparente.<br/>Este arquivo será o Favicon do sistema.</p>
                        </div>
                        <Button 
                          onClick={() => logoInputRef.current?.click()} 
                          disabled={uploadingLogo} 
                          variant="outline" 
                          className="rounded-xl font-bold bg-white border-slate-200 hover:bg-slate-50 h-11 px-6 transition-all"
                          style={{ color: primaryColor }}
                        >
                          {uploadingLogo ? <CircleNotch className="animate-spin mr-2" size={18} /> : <ImageIcon size={18} weight="bold" className="mr-2" />}
                          {branding.logoUrl ? "Trocar Logotipo" : "Selecionar Arquivo"}
                        </Button>
                        <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview e Dicas */}
              <div className="lg:col-span-5">
                <div className="sticky top-28 space-y-6">
                  <Card className="border-0 shadow-2xl bg-slate-900 rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
                      <CardTitle className="text-white flex items-center justify-between text-base font-black uppercase tracking-tight">
                        <span>Live Preview</span>
                        <Badge variant="outline" className="border-white/20 text-white/60 text-[10px] font-black uppercase tracking-widest">Dashboard Admin</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 bg-[#F8FAFC]">
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: branding.primaryColor, color: '#fff' }}>
                            {branding.logoUrl ? (
                              <img src={branding.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                            ) : (
                              <ImageIcon size={24} weight="fill" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-sm font-black text-slate-800">{branding.siteTitle || "GeoTrace"}</h5>
                            <div className="h-2 w-20 rounded bg-slate-200" />
                          </div>
                        </div>
                        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="h-5 w-24 rounded bg-slate-100" />
                            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: `${branding.primaryColor}15`, color: branding.primaryColor }}>
                              Lote Ativo
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: branding.primaryColor }} />
                            </div>
                          </div>
                          <Button className="w-full rounded-xl font-bold text-white shadow-md" style={{ backgroundColor: branding.primaryColor }}>
                            Ver Detalhes
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center" style={{ color: branding.secondaryColor }}>
                            <Palette size={20} weight="fill" />
                          </div>
                          <div className="flex-1 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center" style={{ color: branding.accentColor }}>
                            <PaintBrush size={20} weight="fill" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="p-8 rounded-3xl border space-y-4 shadow-sm bg-blue-50 border-blue-100">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                      <Info size={24} weight="fill" />
                    </div>
                    <h4 className="font-black uppercase text-xs tracking-widest text-blue-700">Dica SEO</h4>
                    <p className="text-sm font-medium leading-relaxed text-blue-600/80">
                      O título do site é fundamental para o ranqueamento no Google. Utilize palavras-chave relacionadas ao seu produto e região.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Hash size={24} style={{ color: primaryColor }} weight="fill" /> IDs de Lote
                  </CardTitle>
                  <CardDescription className="font-medium">Regras de geração do código de rastreabilidade.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Modo de Geração</Label>
                    <Select value={lotIdConfig.mode} onValueChange={(v: any) => setLotIdConfig({...lotIdConfig, mode: v})}>
                      <SelectTrigger className="rounded-xl bg-slate-50 border-0 h-12 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        <SelectItem value="auto">Automático (Sequencial)</SelectItem>
                        <SelectItem value="manual">Manual (Livre)</SelectItem>
                        <SelectItem value="producer_brand">Produtor / Marca + Lote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {lotIdConfig.mode === 'producer_brand' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <div className="flex gap-3">
                          <Info size={20} className="text-blue-500 shrink-0" weight="fill" />
                          <div className="space-y-1">
                            <p className="text-xs font-black text-blue-700 uppercase tracking-wider">Como funciona:</p>
                            <p className="text-xs text-blue-600 font-medium leading-relaxed">
                              O sistema usará o nome (ou marca) do produtor como prefixo. Na hora do cadastro, você poderá escolher se o restante do código será automático ou manual.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exemplo de Link Gerado:</span>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{window.location.host}/lote/</span>
                            <Badge className="bg-primary/10 text-primary border-0 font-black font-mono text-[10px] py-0 px-1.5" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                              NOMEPRODUTOR-0001
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{window.location.host}/lote/</span>
                            <Badge className="bg-primary/10 text-primary border-0 font-black font-mono text-[10px] py-0 px-1.5" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                              NOMEMARCA-LOTE01
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {lotIdConfig.mode === 'auto' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Prefixo Global</Label>
                        <Input 
                          value={lotIdConfig.prefix} 
                          onChange={e => setLotIdConfig({...lotIdConfig, prefix: e.target.value.toUpperCase()})} 
                          className="rounded-xl bg-slate-50 border-0 h-12 font-black uppercase focus-visible:ring-primary" 
                          maxLength={5} 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exemplo de Link Gerado:</span>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">{window.location.host}/lote/</span>
                          <Badge className="bg-primary/10 text-primary border-0 font-black font-mono text-[10px] py-0 px-1.5" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            {lotIdConfig.prefix}-{String(lotIdConfig.current_number).padStart(4, '0')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {lotIdConfig.mode === 'manual' && (
                    <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exemplo de Link Gerado:</span>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{window.location.host}/lote/</span>
                        <Badge className="bg-slate-100 text-slate-500 border-0 font-black font-mono text-[10px] py-0 px-1.5">
                          CODIGO-DIGITADO-LIVRE
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Video size={24} style={{ color: primaryColor }} weight="fill" /> Experiência de Vídeo
                  </CardTitle>
                  <CardDescription className="font-medium">Configuração de apresentação para o consumidor.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="space-y-0.5">
                      <Label className="font-black text-slate-700">Habilitar Vídeos</Label>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Mostrar na página do QR Code</p>
                    </div>
                    <Switch 
                      checked={videoConfig.enabled} 
                      onCheckedChange={v => setVideoConfig({...videoConfig, enabled: v})} 
                      className="data-[state=checked]:bg-emerald-500 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Pular Vídeo após (segundos)</Label>
                    <Input 
                      type="number" 
                      value={videoConfig.show_after_seconds} 
                      onChange={e => setVideoConfig({...videoConfig, show_after_seconds: parseInt(e.target.value)})} 
                      className="rounded-xl bg-slate-50 border-0 h-12 font-bold" 
                      style={{ '--primary': primaryColor } as any}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais e Alertas (same as before) */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription className="font-medium tracking-tight">Defina um nome e descrição para a categoria de produtos.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Nome da Categoria *</Label>
              <Input 
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Ex: Cafés Especiais" 
                className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Descrição</Label>
              <Input 
                value={categoryForm.description}
                onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Breve descrição da categoria" 
                className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="rounded-xl h-12 font-bold px-6">Cancelar</Button>
            <Button 
              onClick={handleSaveCategory} 
              disabled={saving}
              className="rounded-xl h-12 font-bold px-8 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? <CircleNotch className="animate-spin mr-2" size={20} /> : <FloppyDisk size={20} className="mr-2" weight="bold" />}
              Salvar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCharacteristicModalOpen} onOpenChange={setIsCharacteristicModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingCharacteristic ? "Editar Característica" : "Nova Característica"}</DialogTitle>
            <DialogDescription className="font-medium tracking-tight">Defina um nome e descrição para o atributo técnico.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Nome da Característica *</Label>
              <Input 
                value={characteristicForm.name}
                onChange={e => setCharacteristicForm({ ...characteristicForm, name: e.target.value })}
                placeholder="Ex: Tipo de Torra" 
                className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Descrição</Label>
              <Input 
                value={characteristicForm.description}
                onChange={e => setCharacteristicForm({ ...characteristicForm, description: e.target.value })}
                placeholder="Ex: Define o nível de tostagem dos grãos" 
                className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setIsCharacteristicModalOpen(false)} className="rounded-xl h-12 font-bold px-6">Cancelar</Button>
            <Button 
              onClick={handleSaveCharacteristic} 
              disabled={saving}
              className="rounded-xl h-12 font-bold px-8 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? <CircleNotch className="animate-spin mr-2" size={20} /> : <FloppyDisk size={20} className="mr-2" weight="bold" />}
              Salvar Característica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!isDeletingCategory} onOpenChange={() => setIsDeletingCategory(null)}>
        <AlertDialogContent className="rounded-[2rem] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar exclusão?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl h-12 font-bold border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700 text-white">Excluir Categoria</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!isDeletingCharacteristic} onOpenChange={() => setIsDeletingCharacteristic(null)}>
        <AlertDialogContent className="rounded-[2rem] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar exclusão?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl h-12 font-bold border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCharacteristic} className="rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700 text-white">Excluir Característica</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSensoryModalOpen} onOpenChange={setIsSensoryModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingSensory ? "Editar Atributo" : "Novo Atributo Sensorial"}</DialogTitle>
            <DialogDescription className="font-medium tracking-tight">Configure como este atributo será avaliado no lote.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Nome do Atributo *</Label>
              <Input 
                value={sensoryForm.name}
                onChange={e => setSensoryForm({ ...sensoryForm, name: e.target.value })}
                placeholder="Ex: Doçura, Acidez, Corpo..." 
                className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Tipo de Avaliação</Label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSensoryForm({ ...sensoryForm, type: 'quantitative' })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sensoryForm.type === 'quantitative' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Quantitativa (Nota)
                </button>
                <button
                  type="button"
                  onClick={() => setSensoryForm({ ...sensoryForm, type: 'qualitative' })}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${sensoryForm.type === 'qualitative' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Sensorial (Escala)
                </button>
              </div>
            </div>

            {sensoryForm.type === 'quantitative' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Mostrar Radar</Label>
                  <Switch 
                    checked={sensoryForm.show_radar}
                    onCheckedChange={v => setSensoryForm({ ...sensoryForm, show_radar: v })}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Exibir Média</Label>
                  <Switch 
                    checked={sensoryForm.show_average}
                    onCheckedChange={v => setSensoryForm({ ...sensoryForm, show_average: v })}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-black text-slate-700 ml-1">Descrição / Ajuda</Label>
              <Input 
                value={sensoryForm.description}
                onChange={e => setSensoryForm({ ...sensoryForm, description: e.target.value })}
                placeholder="Breve explicação para o produtor" 
                className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <button 
              onClick={() => setIsSensoryModalOpen(false)} 
              className="px-6 h-12 rounded-xl font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <Button 
              onClick={handleSaveSensory} 
              disabled={saving}
              className="flex-1 rounded-xl h-12 font-bold text-white shadow-lg shadow-primary/20"
              style={{ backgroundColor: primaryColor }}
            >
              {saving ? <CircleNotch className="animate-spin mr-2" size={20} /> : <FloppyDisk size={20} className="mr-2" weight="bold" />}
              Salvar Atributo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!isDeletingSensory} onOpenChange={() => setIsDeletingSensory(null)}>
        <AlertDialogContent className="rounded-[2rem] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900">Remover Atributo?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">Esta ação não pode ser desfeita. Isso removerá as notas deste atributo em todos os lotes que o utilizam.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-xl h-12 font-bold border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSensory} className="rounded-xl h-12 font-bold bg-rose-600 hover:bg-rose-700 text-white">Remover Permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default GestaoPlataforma;
