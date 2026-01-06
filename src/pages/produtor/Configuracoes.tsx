import { useState, useEffect } from "react";
import { Gear, User, Envelope, Phone, MapPin, FloppyDisk, Eye, EyeSlash, Bell, Shield, Palette, Globe, CheckCircle, UserCircle, Lock, Info, Building, Thermometer, Mountains } from "@phosphor-icons/react";
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
import { producersApi, Producer, authApi } from "@/services/api";
import { toast } from "sonner";

export const ProducerConfiguracoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [producer, setProducer] = useState<Producer | null>(null);
  
  // Estados da senha
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  
  // Estados do perfil do usuário (auth)
  const [userProfile, setUserProfile] = useState({
    full_name: "",
  });
  
  // Estados do formulário
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

  // Estados das configurações
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    darkMode: false,
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
  });

  useEffect(() => {
    fetchProducerData();
    loadUserProfile();
  }, [user]);

  const loadUserProfile = () => {
    if (user) {
      setUserProfile({
        full_name: user.user_metadata?.full_name || "",
      });
    }
  };

  const fetchProducerData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const data = await producersApi.getById(user.id);
        setProducer(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          property_name: data.property_name || "",
          property_description: data.property_description || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          altitude: data.altitude?.toString() || "",
          average_temperature: data.average_temperature?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do produtor:", error);
      toast.error("Erro ao carregar dados do perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (field: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      if (user?.id) {
        await producersApi.update(user.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          property_name: formData.property_name,
          property_description: formData.property_description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          altitude: formData.altitude ? parseFloat(formData.altitude) : null,
          average_temperature: formData.average_temperature ? parseFloat(formData.average_temperature) : null,
        });
        toast.success("Perfil atualizado com sucesso!", {
          description: "Suas informações foram salvas.",
        });
        fetchProducerData();
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      localStorage.setItem('producer-settings', JSON.stringify(settings));
      toast.success("Configurações salvas com sucesso!", {
        description: "Suas preferências foram atualizadas.",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUserProfile = async () => {
    if (!userProfile.full_name.trim()) {
      toast.error("Preencha o nome completo");
      return;
    }

    try {
      setSaving(true);
      await authApi.updateProfile({
        full_name: userProfile.full_name.trim(),
      });
      
      toast.success("Nome atualizado com sucesso!", {
        description: "Seu perfil foi atualizado.",
      });
      
      loadUserProfile();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil do usuário:", error);
      toast.error(error.message || "Erro ao atualizar perfil do usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (passwordData.newPassword.length > 72) {
      toast.error("A senha não pode ter mais de 72 caracteres");
      return;
    }

    try {
      setSavingPassword(true);
      await authApi.updatePassword(passwordData.newPassword);
      
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
      
      setPasswordSuccess(true);
      
      toast.success("Senha alterada com sucesso!", {
        duration: 4000,
        description: "Sua senha foi atualizada. Use a nova senha no próximo login.",
      });
      
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      
      let errorMessage = "Erro ao alterar senha";
      
      if (error.message) {
        if (error.message.includes("New password should be different from the old password")) {
          errorMessage = "A nova senha deve ser diferente da senha atual";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres";
        } else if (error.message.includes("Invalid password")) {
          errorMessage = "A senha não atende aos requisitos de segurança";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        description: "Por favor, verifique os requisitos e tente novamente.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  if (loading) {
    return (
      <ProducerLayout>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </ProducerLayout>
    );
  }

  return (
    <ProducerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">Gerencie seu perfil e preferências do sistema</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="propriedade" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Propriedade</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="flex items-center gap-2">
              <Gear className="h-4 w-4" />
              <span className="hidden sm:inline">Preferências</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Perfil do Usuário */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-green-600" weight="duotone" />
                    Perfil do Usuário
                  </CardTitle>
                  <CardDescription>
                    Informações da sua conta de acesso
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="text-sm font-medium">Nome Completo</Label>
                    <Input
                      id="user-name"
                      value={userProfile.full_name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-email-display" className="text-sm font-medium">E-mail</Label>
                    <Input
                      id="user-email-display"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="h-11 bg-gray-50 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <Button 
                    onClick={handleSaveUserProfile} 
                    disabled={saving || !userProfile.full_name.trim()}
                    className="w-full"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <FloppyDisk className="h-4 w-4 mr-2" />
                    )}
                    Salvar Nome
                  </Button>
                </CardContent>
              </Card>

              {/* Perfil do Produtor */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-green-600" weight="duotone" />
                    Dados Pessoais
                  </CardTitle>
                  <CardDescription>
                    Informações pessoais do produtor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Seu nome completo"
                      className="h-11"
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="seu@email.com"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <FloppyDisk className="h-4 w-4 mr-2" />
                    )}
                    Salvar Perfil
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Propriedade */}
          <TabsContent value="propriedade" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building className="h-5 w-5 text-green-600" weight="duotone" />
                  Informações da Propriedade
                </CardTitle>
                <CardDescription>
                  Dados sobre sua propriedade e localização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="property_name" className="text-sm font-medium">Nome da Propriedade</Label>
                  <Input
                    id="property_name"
                    value={formData.property_name}
                    onChange={(e) => handleInputChange("property_name", e.target.value)}
                    placeholder="Nome da sua propriedade"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_description" className="text-sm font-medium">Descrição da Propriedade</Label>
                  <Textarea
                    id="property_description"
                    value={formData.property_description}
                    onChange={(e) => handleInputChange("property_description", e.target.value)}
                    placeholder="Descreva sua propriedade..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Endereço completo"
                    className="h-11"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Sua cidade"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-medium">Estado</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map(estado => (
                          <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="altitude" className="text-sm font-medium flex items-center gap-2">
                      <Mountains className="h-4 w-4" />
                      Altitude (metros)
                    </Label>
                    <Input
                      id="altitude"
                      type="number"
                      value={formData.altitude}
                      onChange={(e) => handleInputChange("altitude", e.target.value)}
                      placeholder="800"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="average_temperature" className="text-sm font-medium flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperatura Média (°C)
                    </Label>
                    <Input
                      id="average_temperature"
                      type="number"
                      value={formData.average_temperature}
                      onChange={(e) => handleInputChange("average_temperature", e.target.value)}
                      placeholder="22"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="min-w-[140px]"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <FloppyDisk className="h-4 w-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="h-5 w-5 text-green-600" weight="duotone" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite a nova senha"
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeSlash className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme a nova senha"
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlash className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-700">
                    <strong>Requisitos da senha:</strong> A nova senha deve ser diferente da senha atual e ter pelo menos 6 caracteres (máximo 72 caracteres).
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleUpdatePassword} 
                    disabled={savingPassword || passwordSuccess || !passwordData.newPassword || !passwordData.confirmPassword}
                    className={`min-w-[160px] ${
                      passwordSuccess 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : ''
                    }`}
                  >
                    {savingPassword ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    ) : passwordSuccess ? (
                      <CheckCircle className="h-4 w-4 mr-2" weight="fill" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    {passwordSuccess ? "Senha Alterada!" : "Alterar Senha"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Preferências */}
          <TabsContent value="preferencias" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Notificações */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="h-5 w-5 text-green-600" weight="duotone" />
                    Notificações
                  </CardTitle>
                  <CardDescription>
                    Configure como você quer receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Notificações por E-mail</Label>
                      <p className="text-xs text-gray-500">
                        Receba atualizações por e-mail
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Notificações por SMS</Label>
                      <p className="text-xs text-gray-500">
                        Receba alertas por mensagem de texto
                      </p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Aparência */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="h-5 w-5 text-green-600" weight="duotone" />
                    Aparência
                  </CardTitle>
                  <CardDescription>
                    Personalize a aparência do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium cursor-pointer">Modo Escuro</Label>
                      <p className="text-xs text-gray-500">
                        Ativar tema escuro
                      </p>
                    </div>
                    <Switch
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-medium">Idioma</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Fuso Horário
                    </Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                        <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                        <SelectItem value="America/Belem">Belém (GMT-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botão Salvar Configurações */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveSettings} 
                disabled={saving}
                className="min-w-[180px]"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FloppyDisk className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProducerLayout>
  );
};
