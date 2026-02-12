import { useState, useEffect } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  MagnifyingGlass,
  ShieldCheck,
  Plus,
  Trash,
  Buildings,
  Crown,
  Eye,
  LockKey,
  UserPlus,
} from "@phosphor-icons/react";
import { platformUsersApi, platformAdminsApi, tenantMembershipsApi } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// Generate deterministic color from string
const getAvatarColor = (str: string) => {
  const colors = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-teal-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const PlatformUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userTenants, setUserTenants] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Promote admin
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);

  // Create admin
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [creating, setCreating] = useState(false);

  // Demote admin
  const [demotingAdmin, setDemotingAdmin] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, a] = await Promise.all([
        platformUsersApi.getAll().catch(() => []),
        platformAdminsApi.getAll().catch(() => []),
      ]);
      setUsers(u || []);
      setAdmins(a || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const adminIds = new Set(admins.map((a: any) => a.user_id));

  const filteredUsers = users.filter(
    (u: any) =>
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openUserDetail = async (u: any) => {
    setSelectedUser(u);
    setDetailLoading(true);
    try {
      const memberships = await tenantMembershipsApi.getByUser(u.id);
      setUserTenants(memberships || []);
    } catch {
      setUserTenants([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!promoteEmail) {
      toast.error("Informe o email");
      return;
    }
    const target = users.find(
      (u: any) => (u.email || "").toLowerCase() === promoteEmail.toLowerCase()
    );
    if (!target) {
      toast.error("Usuário não encontrado. Verifique se o email está correto.");
      return;
    }
    if (adminIds.has(target.id)) {
      toast.error("Já é Super Admin");
      return;
    }
    try {
      setPromoting(true);
      await platformAdminsApi.add(target.id);
      toast.success(`${target.email} promovido a Super Admin!`);
      setPromoteOpen(false);
      setPromoteEmail("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao promover");
    } finally {
      setPromoting(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!createEmail || !createPassword) {
      toast.error("Preencha email e senha");
      return;
    }
    if (createPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    try {
      setCreating(true);
      await platformAdminsApi.createAdmin(createEmail, createPassword, createName || createEmail);
      toast.success("Super Admin criado com sucesso!");
      setCreateOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar admin");
    } finally {
      setCreating(false);
    }
  };

  const handleDemote = async () => {
    if (!demotingAdmin) return;
    if (demotingAdmin.user_id === currentUser?.id) {
      toast.error("Você não pode remover a si mesmo como admin");
      setDemotingAdmin(null);
      return;
    }
    try {
      await platformAdminsApi.remove(demotingAdmin.user_id);
      toast.success("Admin removido");
      setDemotingAdmin(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro");
    }
  };

  const isCurrentUser = (userId: string) => userId === currentUser?.id;

  return (
    <PlatformLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Usuários da Plataforma
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Gestão de todos os usuários e Super Admins da plataforma.
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white shadow-sm rounded-xl p-1 border-0">
            <TabsTrigger
              value="users"
              className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2.5 transition-all"
            >
              <Users size={16} className="mr-2" /> Todos os Usuários ({users.length})
            </TabsTrigger>
            <TabsTrigger
              value="admins"
              className="rounded-lg font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2.5 transition-all"
            >
              <ShieldCheck size={16} className="mr-2" /> Super Admins ({admins.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: All Users */}
          <TabsContent value="users">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader className="border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-black">Todos os Usuários</CardTitle>
                    <CardDescription>{users.length} usuários na plataforma.</CardDescription>
                  </div>
                </div>
                <div className="relative mt-4">
                  <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-11 h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-xl" />
                      ))}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users size={56} className="mx-auto mb-4 text-slate-300" weight="duotone" />
                    <p className="font-bold text-slate-500 mb-1 text-lg">Nenhum usuário encontrado</p>
                    <p className="text-sm text-slate-400">
                      {searchTerm
                        ? "Tente outro termo de busca."
                        : "Ainda não há usuários cadastrados."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {filteredUsers.map((u: any) => {
                      const avatarColor = getAvatarColor(u.email || u.id || "");
                      return (
                        <button
                          key={u.id}
                          onClick={() => openUserDetail(u)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-xl ${avatarColor} flex items-center justify-center font-black text-sm text-white shrink-0 ring-2 ring-transparent hover:ring-slate-200 transition-all`}>
                              {(u.full_name || u.email || "?").substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-sm text-slate-900 truncate">
                                  {u.full_name || "Sem nome"}
                                </p>
                                {adminIds.has(u.id) && (
                                  <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 text-[10px] font-black shadow-sm">
                                    <Crown size={10} className="mr-1" /> Super Admin
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-slate-400">
                              {u.created_at
                                ? new Date(u.created_at).toLocaleDateString("pt-BR")
                                : ""}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openUserDetail(u);
                              }}
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Super Admins */}
          <TabsContent value="admins">
            <Card className="border-0 shadow-sm bg-white rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                <div>
                  <CardTitle className="text-lg font-black">Super Admins</CardTitle>
                  <CardDescription>Administradores da plataforma com acesso total.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-bold"
                    onClick={() => setPromoteOpen(true)}
                  >
                    <Plus size={16} className="mr-2" /> Promover Existente
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => setCreateOpen(true)}
                  >
                    <UserPlus size={16} className="mr-2" /> Criar Super Admin
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-14 rounded-xl" />
                      ))}
                  </div>
                ) : admins.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShieldCheck size={56} className="mx-auto mb-4 text-slate-300" weight="duotone" />
                    <p className="font-bold text-slate-500 mb-1 text-lg">Nenhum Super Admin configurado</p>
                    <p className="text-sm text-slate-400 mb-4">
                      Promova um usuário existente ou crie um novo administrador.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold"
                        onClick={() => setPromoteOpen(true)}
                      >
                        Promover Existente
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={() => setCreateOpen(true)}
                      >
                        Criar Super Admin
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {admins.map((a: any) => (
                      <div
                        key={a.user_id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm ring-2 ring-indigo-100">
                            <Crown size={18} className="text-white" weight="fill" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900">
                              {a.full_name || "Sem nome"}
                            </p>
                            <p className="text-xs text-slate-500">{a.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">
                            Desde{" "}
                            {a.created_at
                              ? new Date(a.created_at).toLocaleDateString("pt-BR")
                              : ""}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setDemotingAdmin(a)}
                            disabled={isCurrentUser(a.user_id)}
                            title={
                              isCurrentUser(a.user_id)
                                ? "Você não pode remover a si mesmo"
                                : "Remover admin"
                            }
                          >
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
        </Tabs>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[520px] rounded-2xl border-0 shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-2">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className={`w-20 h-20 rounded-2xl ${getAvatarColor(selectedUser.email || selectedUser.id || "")} flex items-center justify-center font-black text-2xl text-white shrink-0 ring-2 ring-slate-100`}>
                  {(selectedUser.full_name || selectedUser.email || "?")
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-black text-slate-900 text-lg">
                    {selectedUser.full_name || "Sem nome"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{selectedUser.email}</p>
                  {adminIds.has(selectedUser.id) && (
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 text-xs font-bold mt-2 shadow-sm">
                      <Crown size={12} className="mr-1" /> Super Admin
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Clientes Vinculados
                </p>
                {detailLoading ? (
                  <div className="space-y-2">
                    {Array(2)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                      ))}
                  </div>
                ) : userTenants.length === 0 ? (
                  <p className="text-sm text-slate-400">Nenhum cliente vinculado.</p>
                ) : (
                  <div className="space-y-2">
                    {userTenants.map((tm: any) => (
                      <div
                        key={tm.tenant_id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Buildings size={16} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">
                            {tm.tenants?.name || tm.tenant_id}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs font-bold">
                          {tm.role === "tenant_admin"
                            ? "Admin"
                            : tm.role === "producer"
                              ? "Produtor"
                              : "Visualizador"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                Cadastrado em:{" "}
                {selectedUser.created_at
                  ? new Date(selectedUser.created_at).toLocaleDateString("pt-BR")
                  : "Desconhecido"}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote Admin Dialog */}
      <Dialog open={promoteOpen} onOpenChange={setPromoteOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-0 shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Promover a Super Admin</DialogTitle>
            <DialogDescription>
              Informe o email do usuário existente que deseja promover. O usuário deve estar
              cadastrado na plataforma.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Email do usuário
            </Label>
            <Input
              type="email"
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="usuario@email.com"
              className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPromoteOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handlePromote}
              disabled={promoting}
              className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {promoting ? "Promovendo..." : "Promover"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Super Admin Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-0 shadow-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Criar Super Admin</DialogTitle>
            <DialogDescription>
              Crie um novo usuário com privilégios de Super Admin. Informe os dados abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Nome completo
              </Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Nome do administrador"
                className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Email
              </Label>
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="admin@email.com"
                className="h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Senha temporária
              </Label>
              <div className="relative">
                <LockKey className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Senha temporária (mín. 6 caracteres)"
                  className="pl-11 h-11 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-indigo-500 focus-visible:ring-2"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAdmin}
              disabled={creating}
              className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {creating ? "Criando..." : "Criar Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Admin Alert Dialog */}
      <AlertDialog open={!!demotingAdmin} onOpenChange={() => setDemotingAdmin(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Super Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              {demotingAdmin?.email} perderá acesso de administrador da plataforma. Esta ação não
              remove o usuário, apenas remove os privilégios de Super Admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDemote}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remover Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PlatformLayout>
  );
};

export default PlatformUsers;
