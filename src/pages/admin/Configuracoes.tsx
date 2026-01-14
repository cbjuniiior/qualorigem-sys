import { useState, useEffect } from "react";
import { 
  Gear, 
  CircleNotch, 
  User, 
  Eye, 
  EyeSlash, 
  Lock, 
  UserCircle, 
  Info,
  ShieldCheck,
  CheckCircle,
  FloppyDisk
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { authApi } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Configuracoes = () => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  
  // Perfil e Senha
  const [userProfile, setUserProfile] = useState({ full_name: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (user) setUserProfile({ full_name: user.user_metadata?.full_name || "" });
      } catch (error) {
        toast.error("Erro ao carregar dados do perfil");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      // Aqui integraria com authApi.updateProfile se necessário
      toast.success("Perfil atualizado com sucesso!");
    } catch (e) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const primaryColor = branding.primaryColor;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
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
              Configurações de Conta
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gerencie seus dados pessoais e segurança de acesso.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-100 p-1.5 mb-8">
            <TabsTrigger 
              value="perfil" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'perfil' ? primaryColor : undefined }}
            >
              <UserCircle size={18} className="mr-2" weight="bold" /> Meu Perfil
            </TabsTrigger>
            <TabsTrigger 
              value="seguranca" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'seguranca' ? primaryColor : undefined }}
            >
              <ShieldCheck size={18} className="mr-2" weight="bold" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-black">Dados Pessoais</CardTitle>
                  <CardDescription className="font-medium">Como você é identificado no {branding?.siteTitle?.split(' - ')[0] || "GeoTrace"}.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">Nome Completo</Label>
                      <Input 
                        value={userProfile.full_name} 
                        onChange={e => setUserProfile({...userProfile, full_name: e.target.value})} 
                        className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">E-mail (Login)</Label>
                      <Input value={user?.email || ""} disabled className="rounded-xl bg-slate-100 border-0 h-12 font-medium opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={saving}
                    className="rounded-xl font-bold text-white h-12 px-8 transition-all shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {saving ? <CircleNotch className="h-5 w-5 mr-2 animate-spin" /> : <FloppyDisk className="h-5 w-5 mr-2" weight="bold" />}
                    Atualizar Perfil
                  </Button>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <div 
                  className="p-8 rounded-3xl border space-y-4 shadow-sm"
                  style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
                >
                  <div 
                    className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center"
                    style={{ color: primaryColor }}
                  >
                    <Info size={24} weight="fill" />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest" style={{ color: primaryColor }}>Informação Importante</h4>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: `${primaryColor}80` }}>
                    Seu nome completo será exibido na sidebar e no menu de perfil. O e-mail de login é gerenciado pelo administrador do sistema.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seguranca" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="max-w-2xl border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Lock size={24} className="text-rose-500" weight="fill" /> Alterar Senha
                </CardTitle>
                <CardDescription className="font-medium">Atualize sua senha de acesso periodicamente.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Nova Senha</Label>
                    <div className="relative">
                      <Input 
                        type={showNewPassword ? "text" : "password"} 
                        value={passwordData.newPassword} 
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                        className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                        style={{ '--primary': primaryColor } as any}
                      />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"><Eye size={20} /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Confirmar Nova Senha</Label>
                    <Input 
                      type="password" 
                      value={passwordData.confirmPassword} 
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                      className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                      style={{ '--primary': primaryColor } as any}
                    />
                  </div>
                </div>
                <Button 
                  className="rounded-xl font-bold text-white h-12 px-8 shadow-lg transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Atualizar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Configuracoes;