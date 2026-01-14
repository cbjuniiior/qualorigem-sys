import { useState, useEffect } from "react";
import { 
  CircleNotch,
  UserPlus, 
  User, 
  Eye, 
  EyeSlash, 
  Trash, 
  DotsThreeOutlineVertical, 
  Envelope, 
  ShieldCheck, 
  Clock,
  UserCircle,
  MagnifyingGlass,
  CheckCircle,
  XCircle,
  Key,
  IdentificationCard,
  At,
  ShieldSlash
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
import { AdminLayout } from "@/components/layout/AdminLayout";
import { usersApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  email_confirmed_at?: string;
}

const Usuarios = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [branding, setBranding] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
        await loadUsers();
      } catch (e) {}
    };
    loadData();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error: any) {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSheet = () => {
    setFormData({ email: "", password: "", full_name: "", confirmPassword: "" });
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Preencha email e senha");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    try {
      setSaving(true);
      await usersApi.create({
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim() || undefined,
      });
      toast.success("Usuário criado com sucesso!");
      setIsSheetOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.delete(userToDelete.id);
      toast.success("Usuário removido!");
      setIsDeleteDialogOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error("Erro ao remover usuário");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const primaryColor = branding?.primaryColor || '#16a34a';

  const UserSkeleton = () => (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-50 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ShieldCheck size={32} style={{ color: primaryColor }} weight="fill" />
              Gestão de Acesso
            </h2>
            <p className="text-slate-500 font-medium text-sm">Administre os usuários que possuem acesso ao GeoTrace.</p>
          </div>
          <Button 
            onClick={handleOpenSheet} 
            className="rounded-xl font-bold hover:opacity-90 shadow-lg transition-all gap-2 h-12 px-6 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <UserPlus size={20} weight="bold" /> Adicionar Usuário
          </Button>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-50 border-0 rounded-xl font-medium focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <UserSkeleton />
          ) : filteredUsers.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <User size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-slate-400 font-medium">Refine sua busca ou adicione um novo administrador.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5 flex-1 text-left">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-1 ring-slate-100">
                          <AvatarFallback 
                            className="text-lg font-black uppercase"
                            style={{ backgroundColor: `${primaryColor}05`, color: primaryColor }}
                          >
                            {(user.full_name || user.email).substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-slate-900 leading-none">{user.full_name || "Sem nome informado"}</h4>
                          <p className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                            <At size={16} weight="fill" className="text-slate-300" />
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 px-6 border-l border-slate-50 hidden xl:flex">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</p>
                          {user.email_confirmed_at ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-0 font-black text-[10px] rounded-md gap-1">
                              <CheckCircle size={12} weight="fill" /> Confirmado
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-50 text-amber-600 border-0 font-black text-[10px] rounded-md gap-1">
                              <Clock size={12} weight="fill" /> Pendente
                            </Badge>
                          )}
                        </div>
                        <div className="text-center min-w-[120px]">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Desde</p>
                          <p className="text-xs font-black text-slate-700">{new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-50 pl-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
                              <DotsThreeOutlineVertical size={20} weight="fill" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-1">
                            <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer focus:bg-slate-50">
                              <UserCircle size={18} weight="bold" style={{ color: primaryColor }} className="mr-2" /> Detalhes Perfil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => { setUserToDelete(user); setIsDeleteDialogOpen(true); }}
                              className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                            >
                              <Trash size={18} weight="bold" className="mr-2" /> Remover Acesso
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
            <div className="h-full flex flex-col bg-slate-50/50">
              <SheetHeader className="p-8 border-b border-slate-100 bg-white">
                <div className="flex items-center gap-4 text-left">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <UserPlus size={32} weight="fill" />
                  </div>
                  <div>
                    <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">Novo Administrador</SheetTitle>
                    <SheetDescription className="text-slate-500 font-bold text-base">Crie um acesso para um novo colaborador do sistema.</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8 pb-10 min-h-0">
                <form onSubmit={handleSubmit} id="user-form" className="space-y-8 max-w-3xl mx-auto text-left">
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm space-y-10">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                        <IdentificationCard size={24} weight="duotone" style={{ color: primaryColor }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Identificação Pessoal</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nome e contato oficial</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Nome Completo</Label>
                        <Input 
                          value={formData.full_name} 
                          onChange={e => setFormData({...formData, full_name: e.target.value})}
                          className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary"
                          placeholder="Ex: Carlos Oliveira" 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1 text-sm">E-mail Corporativo *</Label>
                        <div className="relative">
                          <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="rounded-xl bg-slate-50 border-0 h-12 pl-12 font-medium focus-visible:ring-primary"
                            placeholder="email@empresa.com" 
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-50" />

                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
                        <Key size={24} weight="duotone" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-800 tracking-tight">Segurança da Conta</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Definição de credenciais de acesso</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1 text-sm">Senha Temporária *</Label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            className="rounded-xl bg-slate-50 border-0 h-12 pl-12 pr-12 font-medium focus-visible:ring-primary"
                            placeholder="Mínimo 6 caracteres" 
                            style={{ '--primary': primaryColor } as any}
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1 text-sm">Confirmar Senha *</Label>
                        <Input 
                          type="password" 
                          required
                          value={formData.confirmPassword}
                          onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                          className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary"
                          placeholder="Repita a senha acima" 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Rodapé fixo com Flexbox */}
              <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsSheetOpen(false)} 
                    className="rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Descartar
                  </Button>
                  <Button 
                    type="submit" 
                    form="user-form"
                    disabled={saving} 
                    className="flex-[2] rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {saving ? <CircleNotch className="h-6 w-6 animate-spin" /> : <CheckCircle size={24} weight="bold" />}
                    {saving ? "Criando Acesso..." : "Concluir Cadastro"}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar Remoção?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                O usuário <strong>{userToDelete?.email}</strong> perderá imediatamente o acesso ao painel administrativo. Esta ação é irreversível.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-4">
              <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200">
                Remover Acesso
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default Usuarios;
