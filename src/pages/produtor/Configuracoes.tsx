import { useState, useEffect } from "react";
import { 
  Gear, 
  User, 
  Envelope, 
  Phone, 
  MapPin, 
  FloppyDisk, 
  Eye, 
  EyeSlash, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CheckCircle, 
  UserCircle, 
  Lock, 
  Info, 
  Building, 
  Thermometer, 
  Mountains,
  UserGear,
  ShieldCheck,
  HouseGear,
  CircleNotch,
  CaretRight
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { producersApi, authApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const ProducerConfiguracoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [branding, setBranding] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    property_name: "",
    property_description: "",
    address: "",
    city: "",
    state: "",
    altitude: "",
    average_temperature: "",
  });

  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [brand, pData] = await Promise.all([
          systemConfigApi.getBrandingConfig(),
          user?.id ? producersApi.getById(user.id) : null
        ]);
        
        setBranding(brand);
        if (pData) {
          setFormData({
            name: pData.name || "",
            email: pData.email || "",
            phone: pData.phone || "",
            property_name: pData.property_name || "",
            property_description: pData.property_description || "",
            address: pData.address || "",
            city: pData.city || "",
            state: pData.state || "",
            altitude: pData.altitude?.toString() || "",
            average_temperature: pData.average_temperature?.toString() || "",
          });
        }
      } catch (error) {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (user?.id) {
        await producersApi.update(user.id, {
          ...formData,
          altitude: formData.altitude ? parseFloat(formData.altitude) : null,
          average_temperature: formData.average_temperature ? parseFloat(formData.average_temperature) : null,
        });
        toast.success("Configurações atualizadas!");
      }
    } catch (e) {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

  if (loading) {
    return (
      <ProducerLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 rounded-xl" />
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-3xl" />
        </div>
      </ProducerLayout>
    );
  }

  return (
    <ProducerLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Gear size={32} style={{ color: primaryColor }} weight="fill" />
              Configurações
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gerencie os dados da sua fazenda e sua conta {branding?.siteTitle?.split(' - ')[0] || "GeoTrace"}.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-8 transition-all"
            style={{ backgroundColor: primaryColor, shadowColor: `${primaryColor}30` } as any}
          >
            {saving ? <CircleNotch className="animate-spin mr-2" size={20} /> : <FloppyDisk size={20} className="mr-2" weight="bold" />}
            Salvar Alterações
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-slate-100 p-1.5 mb-8">
            <TabsTrigger 
              value="perfil" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'perfil' ? primaryColor : undefined }}
            >
              <UserGear size={18} className="mr-2" weight="bold" /> Perfil & Fazenda
            </TabsTrigger>
            <TabsTrigger 
              value="seguranca" 
              className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm h-full transition-all"
              style={{ color: activeTab === 'seguranca' ? primaryColor : undefined }}
            >
              <ShieldCheck size={18} className="mr-2" weight="bold" /> Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-8">
                    <CardTitle className="text-xl font-black">Dados do Responsável</CardTitle>
                    <CardDescription className="font-medium">Suas informações de contato e identificação.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Nome Completo</Label>
                        <Input 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Telefone/WhatsApp</Label>
                        <Input 
                          value={formData.phone} 
                          onChange={e => setFormData({...formData, phone: e.target.value})} 
                          className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="font-bold text-slate-700 ml-1">E-mail de Acesso</Label>
                        <Input value={formData.email} disabled className="rounded-xl bg-slate-100 border-0 h-12 font-medium opacity-60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-8">
                    <CardTitle className="text-xl font-black">Dados da Propriedade</CardTitle>
                    <CardDescription className="font-medium">Informações exibidas publicamente nos seus lotes.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Nome da Fazenda/Sítio</Label>
                        <Input 
                          value={formData.property_name} 
                          onChange={e => setFormData({...formData, property_name: e.target.value})} 
                          className="rounded-xl bg-slate-50 border-0 h-12 font-black" 
                          style={{ color: primaryColor, '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 ml-1">Descrição & História</Label>
                        <Textarea 
                          value={formData.property_description} 
                          onChange={e => setFormData({...formData, property_description: e.target.value})} 
                          className="rounded-xl bg-slate-50 border-0 min-h-[120px] font-medium focus-visible:ring-primary" 
                          style={{ '--primary': primaryColor } as any}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                        <div className="space-y-2">
                          <Label className="font-bold text-slate-700 ml-1 flex items-center gap-2">
                            <Mountains size={16} weight="fill" style={{ color: primaryColor }} /> Altitude (m)
                          </Label>
                          <Input 
                            type="number" 
                            value={formData.altitude} 
                            onChange={e => setFormData({...formData, altitude: e.target.value})} 
                            className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary" 
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-slate-700 ml-1 flex items-center gap-2"><Thermometer size={16} weight="fill" className="text-rose-500" /> Temperatura Média (°C)</Label>
                          <Input 
                            type="number" 
                            value={formData.average_temperature} 
                            onChange={e => setFormData({...formData, average_temperature: e.target.value})} 
                            className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary" 
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="border-b border-slate-50 p-8">
                    <CardTitle className="text-lg font-black">Localização</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">Cidade</Label>
                      <Input 
                        value={formData.city} 
                        onChange={e => setFormData({...formData, city: e.target.value})} 
                        className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 ml-1">Estado</Label>
                      <Input 
                        value={formData.state} 
                        onChange={e => setFormData({...formData, state: e.target.value})} 
                        className="rounded-xl bg-slate-50 border-0 h-12 font-medium focus-visible:ring-primary" 
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                    <div 
                      className="p-6 rounded-2xl border shadow-sm"
                      style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
                    >
                      <div className="flex gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm h-fit" style={{ color: primaryColor }}>
                          <MapPin weight="fill" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase" style={{ color: primaryColor }}>Visibilidade</p>
                          <p className="text-[11px] font-medium leading-relaxed" style={{ color: `${primaryColor}80` }}>
                            Sua localização exata é protegida e apenas Cidade/Estado aparecem para o consumidor final.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seguranca" className="animate-in fade-in slide-in-from-bottom-4">
            <Card className="max-w-2xl border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <CardTitle className="text-xl font-black flex items-center gap-2">
                  <Lock size={24} className="text-rose-500" weight="fill" /> Segurança da Conta
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
    </ProducerLayout>
  );
};

export default ProducerConfiguracoes;