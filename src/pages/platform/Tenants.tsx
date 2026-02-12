import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, MagnifyingGlass, Buildings, PencilSimple, Trash, ArrowSquareOut,
  Eye, Power, CheckCircle, XCircle, FunnelSimple, User, LockKey,
} from "@phosphor-icons/react";
import { platformApi } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPE_LABELS: Record<string, string> = { ig: "IG", marca_coletiva: "Marca Coletiva", privado: "Privado" };

const getTypeColor = (type: string) => {
  switch (type) {
    case "ig": return "bg-indigo-100 text-indigo-600";
    case "marca_coletiva": return "bg-emerald-100 text-emerald-600";
    case "privado": return "bg-slate-100 text-slate-600";
    default: return "bg-slate-100 text-slate-600";
  }
};

export const PlatformTenants = () => {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deletingTenant, setDeletingTenant] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "", slug: "", type: "ig", status: "active",
    admin_email: "", admin_password: "", admin_name: "",
  });

  useEffect(() => { loadTenants(); }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await platformApi.getAllTenants();
      setTenants(data || []);
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingTenant(null);
    setFormData({ name: "", slug: "", type: "ig", status: "active", admin_email: "", admin_password: "", admin_name: "" });
    setIsModalOpen(true);
  };

  const openEdit = (tenant: any) => {
    setEditingTenant(tenant);
    setFormData({ name: tenant.name, slug: tenant.slug, type: tenant.type, status: tenant.status, admin_email: "", admin_password: "", admin_name: "" });
    setIsModalOpen(true);
  };

  const autoSlug = (name: string) => {
    return name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) { toast.error("Nome e slug são obrigatórios"); return; }

    try {
      setSaving(true);
      if (editingTenant) {
        await platformApi.updateTenant(editingTenant.id, {
          name: formData.name,
          type: formData.type,
          status: formData.status,
        } as any);
        toast.success("Cliente atualizado!");
      } else {
        // Validar campos do admin
        if (!formData.admin_email || !formData.admin_password) {
          toast.error("Email e senha do administrador são obrigatórios");
          return;
        }
        if (formData.admin_password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
          return;
        }

        await platformApi.createTenantWithAdmin(
          { name: formData.name, slug: formData.slug, type: formData.type, status: formData.status },
          formData.admin_email,
          formData.admin_password,
          formData.admin_name || formData.admin_email.split("@")[0]
        );
        toast.success("Cliente criado com administrador!");
      }
      setIsModalOpen(false);
      loadTenants();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (tenant: any) => {
    try {
      if (tenant.status === "active") {
        await platformApi.suspendTenant(tenant.id);
        toast.success(`${tenant.name} suspenso`);
      } else {
        await platformApi.activateTenant(tenant.id);
        toast.success(`${tenant.name} ativado`);
      }
      loadTenants();
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar status");
    }
  };

  const handleDelete = async () => {
    if (!deletingTenant) return;
    try {
      await platformApi.deleteTenant(deletingTenant.id);
      toast.success("Cliente excluído");
      setDeletingTenant(null);
      loadTenants();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir");
    }
  };

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <PlatformLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clientes</h2>
            <p className="text-slate-500 font-medium">Gerencie os clientes da plataforma.</p>
          </div>
          <Button onClick={openNew} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
            <Plus size={20} weight="bold" className="mr-2" /> Novo Cliente
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input placeholder="Buscar por nome ou slug..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-11 bg-slate-50 border-0 rounded-xl font-medium shadow-sm focus-visible:ring-indigo-500 focus-visible:ring-2" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl bg-slate-50 border-0 shadow-sm">
                <FunnelSimple size={16} className="mr-2 text-slate-400" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="ig">Indicação Geográfica</SelectItem>
                <SelectItem value="marca_coletiva">Marca Coletiva</SelectItem>
                <SelectItem value="privado">Empresa Privada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px] h-11 rounded-xl bg-slate-50 border-0 shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-600 border-0">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-12 text-center">
              <Buildings size={56} className="mx-auto text-slate-200 mb-4" weight="duotone" />
              <p className="font-bold text-slate-500 text-lg mb-1">Nenhum cliente encontrado</p>
              <p className="text-sm text-slate-400">Tente ajustar os filtros ou criar um novo cliente.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((tenant) => (
              <Card key={tenant.id} className="group border-0 shadow-sm bg-white rounded-2xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                <CardContent className="p-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-5 min-w-0 cursor-pointer" onClick={() => navigate(`/platform/tenants/${tenant.id}`)}>
                    <div className={`h-14 w-14 rounded-2xl ${getTypeColor(tenant.type)} flex items-center justify-center shrink-0 transition-colors`}>
                      <Buildings size={28} weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-slate-900 truncate">{tenant.name}</h3>
                        <Badge className={`border-0 font-bold text-xs ${tenant.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {tenant.status === "active" ? "Ativo" : "Suspenso"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                        <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono text-xs">/{tenant.slug}</span>
                        <Badge variant="secondary" className="text-xs">{TYPE_LABELS[tenant.type] || tenant.type}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Separator orientation="vertical" className="h-6 mr-1" />
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600" title="Ver detalhes" onClick={() => navigate(`/platform/tenants/${tenant.id}`)}>
                      <Eye size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-slate-400 hover:text-indigo-600" title="Abrir painel">
                      <a href={`/${tenant.slug}/admin`} target="_blank" rel="noreferrer"><ArrowSquareOut size={18} /></a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-indigo-600" title="Editar" onClick={() => openEdit(tenant)}>
                      <PencilSimple size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className={`h-9 w-9 ${tenant.status === "active" ? "text-slate-400 hover:text-amber-600" : "text-slate-400 hover:text-emerald-600"}`} title={tenant.status === "active" ? "Suspender" : "Ativar"} onClick={() => handleToggleStatus(tenant)}>
                      <Power size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-600" title="Excluir" onClick={() => setDeletingTenant(tenant)}>
                      <Trash size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black text-slate-900">
              {editingTenant ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
            <DialogDescription>
              {editingTenant ? "Atualize os dados do cliente." : "Preencha os dados do cliente e do primeiro administrador."}
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Tenant fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Buildings size={16} className="text-indigo-600" />
                </div>
                <div className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  Dados do Cliente
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, ...(!editingTenant ? { slug: autoSlug(e.target.value) } : {}) })} placeholder="Ex: Raiz do Acre" className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL) *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} placeholder="raiz-do-acre" className="h-11 rounded-xl bg-slate-50 border-0 font-mono text-sm focus-visible:ring-indigo-500 focus-visible:ring-2" disabled={!!editingTenant} />
                <p className="text-xs text-slate-400">Identificador na URL. Não pode ser alterado após criação.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ig">Indicação Geográfica</SelectItem>
                      <SelectItem value="marca_coletiva">Marca Coletiva</SelectItem>
                      <SelectItem value="privado">Empresa Privada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-0"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Admin fields (only for new) */}
            {!editingTenant && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <User size={16} className="text-emerald-600" />
                    </div>
                    <div className="text-sm font-black text-slate-500 uppercase tracking-widest">
                      Primeiro Administrador
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Este usuário será criado como administrador do cliente e poderá acessar o painel admin.</p>
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input value={formData.admin_name} onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })} placeholder="Nome do administrador" className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input type="email" value={formData.admin_email} onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })} placeholder="admin@email.com" className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2" />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha temporária *</Label>
                    <div className="relative">
                      <Input type="text" value={formData.admin_password} onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })} placeholder="Mínimo 6 caracteres" className="h-11 rounded-xl bg-slate-50 border-0 font-medium pr-10 focus-visible:ring-indigo-500 focus-visible:ring-2" />
                      <LockKey size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400">O administrador deverá alterar a senha no primeiro acesso.</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="p-8 pt-0">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-slate-500">Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8">
              {saving ? "Salvando..." : editingTenant ? "Atualizar" : "Criar Cliente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingTenant} onOpenChange={() => setDeletingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente "{deletingTenant?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os dados do cliente (produtores, lotes, usuários vinculados) serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Excluir permanentemente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PlatformLayout>
  );
};

export default PlatformTenants;
