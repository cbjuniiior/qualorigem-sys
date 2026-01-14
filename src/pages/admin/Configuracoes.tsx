import { useState, useEffect } from "react";
import { 
  FloppyDisk, 
  Gear, 
  Hash, 
  QrCode, 
  Video, 
  CircleNotch, 
  User, 
  Eye, 
  EyeSlash, 
  CheckCircle, 
  Lock, 
  UserCircle, 
  Info,
  ShieldCheck,
  Desktop,
  CaretRight
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { systemConfigApi, authApi } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Configuracoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [branding, setBranding] = useState<any>(null);
  
  // Perfil e Senha
  const [userProfile, setUserProfile] = useState({ full_name: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Configurações do Sistema
  const [lotIdConfig, setLotIdConfig] = useState({ mode: 'auto', prefix: 'GT', auto_increment: true, current_number: 1 });
  const [qrCodeConfig, setQrCodeConfig] = useState({ mode: 'individual', generic_categories: [] });
  const [videoConfig, setVideoConfig] = useState({ enabled: true, auto_play: true, show_after_seconds: 3 });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [brand, lotId, qrCode, video] = await Promise.all([
          systemConfigApi.getBrandingConfig(),
          systemConfigApi.getLotIdConfig().catch(() => null),
          systemConfigApi.getQRCodeConfig().catch(() => null),
          systemConfigApi.getVideoConfig().catch(() => null)
        ]);
        
        setBranding(brand);
        if (lotId) setLotIdConfig(lotId);
        if (qrCode) setQrCodeConfig(qrCode);
        if (video) setVideoConfig(video);
        if (user) setUserProfile({ full_name: user.user_metadata?.full_name || "" });
        
      } catch (error) {
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const saveAll = async () => {
    try {
      setSaving(true);
      await Promise.all([
        systemConfigApi.upsert({ config_key: 'lot_id_mode', config_value: lotIdConfig, description: 'ID de lotes' }),
        systemConfigApi.upsert({ config_key: 'qrcode_mode', config_value: qrCodeConfig, description: 'QR Code' }),
        systemConfigApi.upsert({ config_key: 'video_settings', config_value: videoConfig, description: 'Vídeo' })
      ]);
      toast.success("Configurações do sistema atualizadas!");
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

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
              Configurações
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gerencie sua conta e as regras globais do portal.</p>
          </div>
          {activeTab === "sistema" && (
            <Button 
              onClick={saveAll} 
              disabled={saving} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-8"
              style={{ backgroundColor: primaryColor, shadowColor: `${primaryColor}30` } as any}
            >
              {saving ? <CircleNotch className="animate-spin mr-2" size={20} /> : <FloppyDisk size={20} className="mr-2" weight="bold" />}
              Salvar Alterações
            </Button>
          )}
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
              value="sistema" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'sistema' ? primaryColor : undefined }}
            >
              <Desktop size={18} className="mr-2" weight="bold" /> Sistema
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
                  <CardDescription className="font-medium">Como você é identificado no GeoTrace.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">Nome Completo</Label>
                      <Input 
                        value={userProfile.full_name} 
                        onChange={e => setUserProfile({...userProfile, full_name: e.target.value})} 
                        className="rounded-xl bg-slate-50 border-0 h-12 font-medium" 
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">E-mail (Login)</Label>
                      <Input value={user?.email || ""} disabled className="rounded-xl bg-slate-100 border-0 h-12 font-medium opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                  <Button 
                    className="rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 transition-all"
                    style={{ '--primary': primaryColor } as any}
                  >
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

          <TabsContent value="sistema" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
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
                      </SelectContent>
                    </Select>
                  </div>
                  {lotIdConfig.mode === 'auto' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Prefixo Global</Label>
                        <Input 
                          value={lotIdConfig.prefix} 
                          onChange={e => setLotIdConfig({...lotIdConfig, prefix: e.target.value.toUpperCase()})} 
                          className="rounded-xl bg-slate-50 border-0 h-12 font-black uppercase" 
                          maxLength={5} 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="text-sm font-bold text-slate-600">Exemplo do Próximo Código:</span>
                        <Badge 
                          className="bg-white border-slate-100 font-black font-mono shadow-sm"
                          style={{ color: primaryColor }}
                        >
                          {lotIdConfig.prefix}-{String(lotIdConfig.current_number).padStart(4, '0')}
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
                      <Label className="font-bold">Habilitar Vídeos</Label>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Mostrar na página do QR Code</p>
                    </div>
                    <Switch 
                      checked={videoConfig.enabled} 
                      onCheckedChange={v => setVideoConfig({...videoConfig, enabled: v})} 
                      style={{ '--primary': primaryColor } as any}
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
                      <Input type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="rounded-xl bg-slate-50 border-0 h-12 font-medium" />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Eye size={20} /></button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Confirmar Nova Senha</Label>
                    <Input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="rounded-xl bg-slate-50 border-0 h-12 font-medium" />
                  </div>
                </div>
                <Button className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white h-12 px-8 shadow-lg shadow-rose-100">Atualizar Senha</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Configuracoes;