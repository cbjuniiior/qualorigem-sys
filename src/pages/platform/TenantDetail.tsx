import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Buildings, Users, Package, Certificate, Eye, Fingerprint, ChartBar, UserCircle,
  Gear, Plus, Trash, ArrowSquareOut, CheckCircle, PencilSimple, Power, LockKey, Palette, Clock,
  HardDrives, CreditCard, CalendarBlank, Info, Cube, UsersFour, SlidersHorizontal, ChartPieSlice,
  PaintBrush, Lightning, CurrencyDollar, Leaf, FileText,
} from "@phosphor-icons/react";
import {
  platformApi, tenantModulesApi, tenantMembershipsApi, fieldSettingsApi,
  AVAILABLE_MODULES, platformUsersApi, tenantSubscriptionsApi,
} from "@/services/api";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = { ig: "IG", marca_coletiva: "Marca Coletiva", privado: "Privado" };

const FIELD_SETTINGS = [
  { key: "seal", label: "Selos de Rastreabilidade", description: "Controle de selos no lote" },
  { key: "weight", label: "Peso/Volume", description: "Campo de peso no formulário de lote" },
  { key: "sensory_attributes", label: "Análise Sensorial", description: "Avaliação sensorial detalhada" },
  { key: "radar_chart", label: "Gráfico Radar", description: "Exibição do radar sensorial na página pública" },
  { key: "certifications", label: "Certificações", description: "Vinculação de certificações ao lote" },
  { key: "internal_producers", label: "Produtores Internos", description: "Produtores associados por cooperativa" },
  { key: "youtube_video", label: "Vídeo YouTube", description: "Vídeo de apresentação no lote" },
  { key: "lot_observations", label: "Relato do Produtor", description: "Observações e história do lote" },
];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-slate-100 text-slate-700" },
  starter: { label: "Starter", color: "bg-blue-100 text-blue-700" },
  pro: { label: "Pro", color: "bg-indigo-100 text-indigo-700" },
  enterprise: { label: "Enterprise", color: "bg-amber-100 text-amber-700" },
};

const MODULE_ICONS: Record<string, any> = {
  Package, Certificate, Users, Eye, Fingerprint, ChartBar, UserCircle,
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return new Date(date).toLocaleDateString("pt-BR");
}

const PlatformTenantDetail = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const [modules, setModules] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(false);

  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: "", password: "", name: "", role: "viewer" });
  const [addingMember, setAddingMember] = useState(false);
  const [removingMember, setRemovingMember] = useState<any>(null);

  const [fieldSettings, setFieldSettings] = useState<Record<string, { enabled: boolean; required: boolean }>>({});
  const [fieldsLoading, setFieldsLoading] = useState(false);

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: "", type: "", status: "" });
  const [savingInfo, setSavingInfo] = useState(false);

  const [branding, setBranding] = useState<any>(null);
  const [brandingLoading, setBrandingLoading] = useState(false);

  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [editSubscription, setEditSubscription] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    plan: "free",
    started_at: "",
    expires_at: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (tenantId) loadAll();
  }, [tenantId]);

  const loadAll = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const tenants = await platformApi.getAllTenants();
      const t = tenants?.find((x: any) => x.id === tenantId);
      if (!t) {
        toast.error("Cliente não encontrado");
        navigate("/platform/tenants");
        return;
      }
      setTenant(t);
      setInfoForm({ name: t.name, type: t.type, status: t.status });

      await Promise.all([
        loadStats(),
        loadModules(),
        loadMembers(),
        loadFieldSettings(),
        loadBranding(),
        loadActivity(),
        loadSubscription(),
      ]);
    } catch (error) {
      toast.error("Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await platformApi.getTenantStats(tenantId!).catch(() => null);
      setStats(s);
    } catch { /* ignore */ }
  };

  const loadModules = async () => {
    setModulesLoading(true);
    try {
      const m = await tenantModulesApi.getAll(tenantId!);
      setModules(m || []);
    } catch { /* ignore */ }
    finally { setModulesLoading(false); }
  };

  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const m = await tenantMembershipsApi.getAll(tenantId!);
      setMembers(m || []);
    } catch { /* ignore */ }
    finally { setMembersLoading(false); }
  };

  const loadFieldSettings = async () => {
    setFieldsLoading(true);
    try {
      const data = await fieldSettingsApi.getAll(tenantId!);
      const map: Record<string, { enabled: boolean; required: boolean }> = {};
      (data || []).forEach((s: any) => { map[s.field_key] = { enabled: s.enabled, required: s.required }; });
      setFieldSettings(map);
    } catch { /* ignore */ }
    finally { setFieldsLoading(false); }
  };

  const loadBranding = async () => {
    setBrandingLoading(true);
    try {
      const b = await platformApi.getTenantBranding(tenantId!);
      setBranding(b);
    } catch { /* ignore */ }
    finally { setBrandingLoading(false); }
  };

  const loadActivity = async () => {
    setActivityLoading(true);
    try {
      const a = await platformApi.getTenantActivity(tenantId!);
      setActivity(a || []);
    } catch { /* ignore */ }
    finally { setActivityLoading(false); }
  };

  const loadSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const s = await tenantSubscriptionsApi.getByTenant(tenantId!);
      setSubscription(s);
      if (s) {
        setSubscriptionForm({
          plan: s.plan || "free",
          started_at: s.started_at ? s.started_at.slice(0, 10) : "",
          expires_at: s.expires_at ? s.expires_at.slice(0, 10) : "",
          status: s.status || "active",
          notes: s.notes || "",
        });
      } else {
        setSubscriptionForm({
          plan: "free",
          started_at: new Date().toISOString().slice(0, 10),
          expires_at: "",
          status: "active",
          notes: "",
        });
      }
    } catch { /* ignore */ }
    finally { setSubscriptionLoading(false); }
  };

  const toggleModule = async (moduleKey: string, enabled: boolean) => {
    try {
      await tenantModulesApi.upsert(tenantId!, moduleKey, enabled);
      setModules((prev) => {
        const idx = prev.findIndex((m) => m.module_key === moduleKey);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = { ...copy[idx], enabled }; return copy; }
        return [...prev, { tenant_id: tenantId, module_key: moduleKey, enabled, config: {} }];
      });
      toast.success(`Módulo ${enabled ? "ativado" : "desativado"}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar módulo");
    }
  };

  const isModuleEnabled = (key: string) => modules.find((m) => m.module_key === key)?.enabled ?? false;

  const toggleField = async (fieldKey: string, field: "enabled" | "required", value: boolean) => {
    const current = fieldSettings[fieldKey] || { enabled: true, required: false };
    const updated = { ...current, [field]: value };
    try {
      await fieldSettingsApi.upsert({ tenant_id: tenantId!, field_key: fieldKey, enabled: updated.enabled, required: updated.required });
      setFieldSettings((prev) => ({ ...prev, [fieldKey]: updated }));
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar configuração");
    }
  };

  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);
      await platformApi.updateTenant(tenantId!, { name: infoForm.name, type: infoForm.type, status: infoForm.status } as any);
      setTenant((prev: any) => ({ ...prev, ...infoForm }));
      setEditingInfo(false);
      toast.success("Dados atualizados!");
    } catch (err: any) {
      toast.error(err.message || "Erro");
    } finally { setSavingInfo(false); }
  };

  const handleAddMember = async () => {
    if (!memberForm.email || !memberForm.password) { toast.error("Email e senha são obrigatórios"); return; }
    try {
      setAddingMember(true);
      await platformUsersApi.createForTenant(memberForm.email, memberForm.password, memberForm.name || memberForm.email.split("@")[0], tenantId!, memberForm.role);
      toast.success("Membro adicionado!");
      setAddMemberOpen(false);
      setMemberForm({ email: "", password: "", name: "", role: "viewer" });
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar membro");
    } finally { setAddingMember(false); }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await tenantMembershipsApi.updateRole(tenantId!, userId, newRole);
      setMembers((prev) => prev.map((m) => m.user_id === userId ? { ...m, role: newRole } : m));
      toast.success("Papel atualizado!");
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      await tenantMembershipsApi.delete(tenantId!, removingMember.user_id);
      toast.success("Membro removido");
      setRemovingMember(null);
      loadMembers();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
  };

  const handleSaveSubscription = async () => {
    try {
      await tenantSubscriptionsApi.upsert({
        tenant_id: tenantId!,
        plan: subscriptionForm.plan,
        started_at: subscriptionForm.started_at || undefined,
        expires_at: subscriptionForm.expires_at || null,
        status: subscriptionForm.status,
        notes: subscriptionForm.notes || undefined,
      });
      toast.success("Assinatura atualizada!");
      setEditSubscription(false);
      loadSubscription();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar assinatura");
    }
  };

  if (loading) {
    return (
      <PlatformLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-12 w-96 rounded-xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </PlatformLayout>
    );
  }

  if (!tenant) return null;

  const ROLE_LABELS: Record<string, string> = { tenant_admin: "Admin", producer: "Produtor", viewer: "Visualizador" };

  return (
    <PlatformLayout>
      <div className="space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className={`h-1.5 ${tenant.status === "active" ? "bg-emerald-500" : "bg-red-400"}`} />
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/platform/tenants")} className="shrink-0 rounded-xl hover:bg-slate-100 transition-all duration-200">
                <ArrowLeft size={20} />
              </Button>
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <Buildings size={28} weight="duotone" className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-900 truncate">{tenant.name}</h2>
                  <span
                    className={`w-2.5 h-2.5 rounded-full animate-pulse shrink-0 ${
                      tenant.status === "active" ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  <Badge className={`border-0 font-bold text-xs ${tenant.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {tenant.status === "active" ? "Ativo" : "Suspenso"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-bold">{TYPE_LABELS[tenant.type] || tenant.type}</Badge>
                </div>
                <p className="text-sm text-slate-400 font-mono mt-0.5">/{tenant.slug}</p>
              </div>
              <Button variant="outline" size="sm" asChild className="rounded-xl font-bold shrink-0 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all duration-200">
                <a href={`/${tenant.slug}/admin`} target="_blank" rel="noreferrer">
                  <ArrowSquareOut size={16} className="mr-2" /> Abrir Painel
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="bg-white shadow-sm rounded-xl p-1.5 h-auto flex-wrap gap-1">
            <TabsTrigger value="info" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <Info size={16} className="mr-2" weight="bold" /> Informações
            </TabsTrigger>
            <TabsTrigger value="modules" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <Cube size={16} className="mr-2" weight="bold" /> Módulos
            </TabsTrigger>
            <TabsTrigger value="members" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <UsersFour size={16} className="mr-2" weight="bold" /> Membros
            </TabsTrigger>
            <TabsTrigger value="fields" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <SlidersHorizontal size={16} className="mr-2" weight="bold" /> Campos
            </TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <ChartPieSlice size={16} className="mr-2" weight="bold" /> Estatísticas
            </TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <PaintBrush size={16} className="mr-2" weight="bold" /> Branding
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <Lightning size={16} className="mr-2" weight="bold" /> Atividade
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2.5 transition-all duration-200">
              <CurrencyDollar size={16} className="mr-2" weight="bold" /> Assinatura
            </TabsTrigger>
          </TabsList>

          {/* TAB: Informações */}
          <TabsContent value="info">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black">Informações Gerais</CardTitle>
                  <CardDescription>Dados principais do cliente.</CardDescription>
                </div>
                {!editingInfo && (
                  <Button variant="outline" size="sm" onClick={() => setEditingInfo(true)} className="rounded-xl font-bold">
                    <PencilSimple size={16} className="mr-2" /> Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingInfo ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome</Label>
                      <Input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo</Label>
                        <Select value={infoForm.type} onValueChange={(v) => setInfoForm({ ...infoForm, type: v })}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0 font-medium"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ig">Indicação Geográfica</SelectItem>
                            <SelectItem value="marca_coletiva">Marca Coletiva</SelectItem>
                            <SelectItem value="privado">Empresa Privada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</Label>
                        <Select value={infoForm.status} onValueChange={(v) => setInfoForm({ ...infoForm, status: v })}>
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0 font-medium"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="suspended">Suspenso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setEditingInfo(false)} className="rounded-xl">Cancelar</Button>
                      <Button onClick={handleSaveInfo} disabled={savingInfo} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                        {savingInfo ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors duration-200">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome</p>
                      <p className="font-bold text-slate-900">{tenant.name}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors duration-200">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Slug</p>
                      <p className="font-mono text-slate-700">/{tenant.slug}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors duration-200">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Tipo</p>
                      <p className="font-bold text-slate-900">{TYPE_LABELS[tenant.type] || tenant.type}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-colors duration-200">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Criado em</p>
                      <p className="text-slate-700">{new Date(tenant.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Módulos */}
          <TabsContent value="modules">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black">Módulos</CardTitle>
                <CardDescription>Ative ou desative funcionalidades para este cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                {modulesLoading ? (
                  <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_MODULES.map((mod) => {
                      const enabled = isModuleEnabled(mod.key);
                      const Icon = MODULE_ICONS[mod.icon] || Package;
                      return (
                        <div key={mod.key} className={`group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 hover:shadow-sm ${enabled ? "border-indigo-200 bg-indigo-50/50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl transition-colors duration-300 ${enabled ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                              <Icon size={20} weight="fill" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900">{mod.name}</p>
                              <p className="text-xs text-slate-500">{mod.description}</p>
                            </div>
                          </div>
                          <Switch checked={enabled} onCheckedChange={(v) => toggleModule(mod.key, v)} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Membros */}
          <TabsContent value="members">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black">Membros</CardTitle>
                  <CardDescription>Usuários vinculados a este cliente.</CardDescription>
                </div>
                <Button onClick={() => { setMemberForm({ email: "", password: "", name: "", role: "viewer" }); setAddMemberOpen(true); }} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
                  <Plus size={16} className="mr-2" /> Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                ) : members.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Users size={56} className="mx-auto mb-4 text-slate-200" weight="duotone" />
                    <p className="font-bold text-slate-500 mb-1">Nenhum membro vinculado</p>
                    <p className="text-sm text-slate-400">Adicione membros para este cliente.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((m: any) => (
                      <div key={m.user_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100/80 transition-all duration-200">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-indigo-500 shrink-0">
                            {(m.full_name || m.email || "?").substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{m.full_name || "Sem nome"}</p>
                            <p className="text-xs text-slate-500 truncate">{m.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Select value={m.role} onValueChange={(v) => handleChangeRole(m.user_id, v)}>
                            <SelectTrigger className="w-[140px] h-10 rounded-xl text-xs font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tenant_admin">Admin</SelectItem>
                              <SelectItem value="producer">Produtor</SelectItem>
                              <SelectItem value="viewer">Visualizador</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => setRemovingMember(m)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Campos */}
          <TabsContent value="fields">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black">Configuração de Campos</CardTitle>
                <CardDescription>Controle quais campos aparecem no formulário de lote deste cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                {fieldsLoading ? (
                  <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                ) : (
                  <div className="space-y-3">
                    {FIELD_SETTINGS.map((field) => {
                      const setting = fieldSettings[field.key] || { enabled: true, required: false };
                      return (
                        <div key={field.key} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${setting.enabled ? "bg-slate-50 border-slate-100" : "bg-slate-50/50 border-slate-50 opacity-60"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-8 rounded-full shrink-0 transition-colors duration-300 ${setting.enabled ? "bg-indigo-500" : "bg-slate-200"}`} />
                            <div>
                              <p className={`font-bold text-sm transition-colors duration-200 ${setting.enabled ? "text-slate-900" : "text-slate-400"}`}>{field.label}</p>
                              <p className="text-xs text-slate-500">{field.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">Obrigatório</span>
                              <Switch checked={setting.required} onCheckedChange={(v) => toggleField(field.key, "required", v)} disabled={!setting.enabled} />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">Ativo</span>
                              <Switch checked={setting.enabled} onCheckedChange={(v) => toggleField(field.key, "enabled", v)} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Estatísticas */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Produtores", value: stats?.producers_count ?? "...", color: "#4f46e5", icon: Leaf },
                { label: "Lotes", value: stats?.lots_count ?? "...", color: "#10b981", icon: Package },
                { label: "Membros", value: stats?.members_count ?? "...", color: "#f59e0b", icon: Users },
                { label: "Certificações", value: stats?.certifications_count ?? "...", color: "#8b5cf6", icon: Certificate },
              ].map((s) => (
                <Card key={s.label} className="border-0 shadow-sm bg-white rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="h-1.5" style={{ backgroundColor: s.color }} />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                        <s.icon size={22} weight="fill" />
                      </div>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-3xl font-black text-slate-900">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* TAB: Branding */}
          <TabsContent value="branding">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black">Branding</CardTitle>
                <CardDescription>Personalização visual configurada pelo cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                {brandingLoading ? (
                  <div className="space-y-3"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
                ) : !branding || (typeof branding === "object" && Object.keys(branding).length === 0) ? (
                  <div className="p-12 text-center text-slate-400">
                    <Palette size={56} className="mx-auto mb-4 text-slate-200" weight="duotone" />
                    <p className="font-bold text-slate-500 mb-1">Nenhuma personalização configurada</p>
                    <p className="text-sm text-slate-400">O cliente ainda não configurou sua identidade visual.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(branding?.logo_url || branding?.logoUrl) && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Logo</p>
                        <div className="p-4 bg-white rounded-lg border border-slate-100 inline-block">
                          <img src={branding.logo_url || branding.logoUrl} alt="Logo" className="h-16 object-contain" />
                        </div>
                      </div>
                    )}
                    {((branding?.primary_color || branding?.primaryColor) || (branding?.secondary_color || branding?.secondaryColor)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(branding.primary_color || branding.primaryColor) && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cor primária</p>
                            <div className="flex items-center gap-3">
                              <span className="w-12 h-12 rounded-xl border-2 border-white shadow-sm" style={{ backgroundColor: branding.primary_color || branding.primaryColor }} />
                              <span className="text-sm font-mono font-bold text-slate-700">{branding.primary_color || branding.primaryColor}</span>
                            </div>
                          </div>
                        )}
                        {(branding.secondary_color || branding.secondaryColor) && (
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Cor secundária</p>
                            <div className="flex items-center gap-3">
                              <span className="w-12 h-12 rounded-xl border-2 border-white shadow-sm" style={{ backgroundColor: branding.secondary_color || branding.secondaryColor }} />
                              <span className="text-sm font-mono font-bold text-slate-700">{branding.secondary_color || branding.secondaryColor}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {(branding?.display_name || branding?.displayName) && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome de exibição</p>
                        <p className="font-bold text-slate-900 text-lg">{branding.display_name || branding.displayName}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Atividade */}
          <TabsContent value="activity">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-black">Atividade</CardTitle>
                <CardDescription>Últimas ações do cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                ) : activity.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Lightning size={56} className="mx-auto mb-4 text-slate-200" weight="duotone" />
                    <p className="font-bold text-slate-500 mb-1">Nenhuma atividade recente</p>
                    <p className="text-sm text-slate-400">As ações do cliente aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100" />
                    <div className="space-y-3">
                      {activity.map((item: any, i: number) => {
                        const isLot = item.activity_type === "lot";
                        const Icon = isLot ? Package : Users;
                        const iconBg = isLot ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600";
                        return (
                          <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl relative hover:bg-slate-100/80 transition-colors duration-200">
                            <div className={`p-2 rounded-lg ${iconBg} shrink-0 relative z-10`}>
                              <Icon size={18} weight="fill" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-slate-900">{item.title || "-"}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                              <p className="text-xs text-slate-400 mt-1.5 font-medium">{timeAgo(item.created_at)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Assinatura */}
          <TabsContent value="subscription">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black">Assinatura</CardTitle>
                  <CardDescription>Plano e vigência do cliente.</CardDescription>
                </div>
                {!editSubscription && (
                  <Button variant="outline" size="sm" onClick={() => setEditSubscription(true)} className="rounded-xl font-bold">
                    <PencilSimple size={16} className="mr-2" /> {subscription ? "Editar" : "Configurar Plano"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="space-y-3"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-16 rounded-xl" /></div>
                ) : editSubscription ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Plano</Label>
                      <Select value={subscriptionForm.plan} onValueChange={(v) => setSubscriptionForm({ ...subscriptionForm, plan: v })}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Início</Label>
                        <Input type="date" value={subscriptionForm.started_at} onChange={(e) => setSubscriptionForm({ ...subscriptionForm, started_at: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Expira em</Label>
                        <Input type="date" value={subscriptionForm.expires_at} onChange={(e) => setSubscriptionForm({ ...subscriptionForm, expires_at: e.target.value })} className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</Label>
                      <Select value={subscriptionForm.status} onValueChange={(v) => setSubscriptionForm({ ...subscriptionForm, status: v })}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="expired">Expirado</SelectItem>
                          <SelectItem value="canceled">Cancelado</SelectItem>
                          <SelectItem value="trial">Trial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Notas</Label>
                      <textarea className="w-full h-24 rounded-xl bg-slate-50 border-0 font-medium p-3 text-sm resize-none" value={subscriptionForm.notes} onChange={(e) => setSubscriptionForm({ ...subscriptionForm, notes: e.target.value })} placeholder="Notas internas..." />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" onClick={() => setEditSubscription(false)} className="rounded-xl">Cancelar</Button>
                      <Button onClick={handleSaveSubscription} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : !subscription ? (
                  <div className="p-12 text-center text-slate-400">
                    <CreditCard size={56} className="mx-auto mb-4 text-slate-200" weight="duotone" />
                    <p className="font-bold text-slate-500 mb-1">Nenhum plano configurado</p>
                    <p className="text-sm text-slate-400 mb-4">Configure o plano de assinatura deste cliente.</p>
                    <Button onClick={() => setEditSubscription(true)} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                      Configurar Plano
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Plano</p>
                      <Badge className={`border-0 font-bold text-sm px-3 py-1 ${PLAN_LABELS[subscription.plan]?.color || "bg-slate-100 text-slate-700"}`}>
                        {PLAN_LABELS[subscription.plan]?.label || subscription.plan}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Início</p>
                        <p className="font-medium text-slate-700">{subscription.started_at ? new Date(subscription.started_at).toLocaleDateString("pt-BR") : "-"}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Expira em</p>
                        <p className="font-medium text-slate-700">{subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString("pt-BR") : "Sem data"}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                      <Badge variant="secondary" className="font-bold">{subscription.status}</Badge>
                    </div>
                    {subscription.notes && (
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Notas</p>
                        <p className="text-sm text-slate-600">{subscription.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">Adicionar Membro</DialogTitle>
            <DialogDescription>Crie um novo usuário ou vincule um existente a este cliente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome completo</Label>
              <Input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="Nome do usuário" className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email *</Label>
              <Input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="usuario@email.com" className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Senha *</Label>
              <Input type="text" value={memberForm.password} onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} placeholder="Senha temporária (min. 6 chars)" className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">Papel</Label>
              <Select value={memberForm.role} onValueChange={(v) => setMemberForm({ ...memberForm, role: v })}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_admin">Admin</SelectItem>
                  <SelectItem value="producer">Produtor</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddMemberOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleAddMember} disabled={addingMember} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
              {addingMember ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <AlertDialog open={!!removingMember} onOpenChange={() => setRemovingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro?</AlertDialogTitle>
            <AlertDialogDescription>
              {removingMember?.email} será removido deste cliente. O usuário continuará existindo na plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember} className="bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PlatformLayout>
  );
};

export default PlatformTenantDetail;
