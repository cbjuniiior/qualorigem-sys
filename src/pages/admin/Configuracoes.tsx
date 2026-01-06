import { useState, useEffect } from "react";
import { FloppyDisk, Gear, Hash, QrCode, Video, Spinner, User, Eye, EyeSlash, CheckCircle, Lock, UserCircle, Info } from "@phosphor-icons/react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LotIdConfig {
  mode: 'auto' | 'manual';
  prefix: string;
  auto_increment: boolean;
  current_number?: number;
}

interface QRCodeConfig {
  mode: 'individual' | 'generic';
  generic_categories: string[];
}

interface VideoConfig {
  enabled: boolean;
  auto_play: boolean;
  show_after_seconds: number;
}

const Configuracoes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);
  
  // Estados do perfil do usuário
  const [userProfile, setUserProfile] = useState({
    full_name: "",
  });
  
  // Estados da senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';
  
  // Configurações
  const [lotIdConfig, setLotIdConfig] = useState<LotIdConfig>({
    mode: 'auto',
    prefix: 'GT',
    auto_increment: true,
    current_number: 1
  });
  
  const [qrCodeConfig, setQrCodeConfig] = useState<QRCodeConfig>({
    mode: 'individual',
    generic_categories: []
  });
  
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    enabled: true,
    auto_play: true,
    show_after_seconds: 3
  });

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
      } catch (error) {
        console.error("Erro ao carregar branding:", error);
      }
    };
    loadBranding();
    loadConfigurations();
    loadUserProfile();
  }, [user]);

  const loadUserProfile = () => {
    if (user) {
      setUserProfile({
        full_name: user.user_metadata?.full_name || "",
      });
    }
  };

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      
      const [lotId, qrCode, video] = await Promise.all([
        systemConfigApi.getLotIdConfig().catch(() => ({ mode: 'auto', prefix: 'GT', auto_increment: true, current_number: 1 })),
        systemConfigApi.getQRCodeConfig().catch(() => ({ mode: 'individual', generic_categories: [] })),
        systemConfigApi.getVideoConfig().catch(() => ({ enabled: true, auto_play: true, show_after_seconds: 3 }))
      ]);
      
      setLotIdConfig({
        mode: lotId.mode || 'auto',
        prefix: lotId.prefix || 'GT',
        auto_increment: lotId.auto_increment !== undefined ? lotId.auto_increment : true,
        current_number: lotId.current_number || 1
      });
      setQrCodeConfig({
        mode: qrCode.mode || 'individual',
        generic_categories: qrCode.generic_categories || []
      });
      setVideoConfig({
        enabled: video.enabled !== undefined ? video.enabled : true,
        auto_play: video.auto_play !== undefined ? video.auto_play : true,
        show_after_seconds: video.show_after_seconds || 3
      });
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const saveConfigurations = async () => {
    try {
      setSaving(true);
      
      // Validações
      if (lotIdConfig.mode === 'auto' && !lotIdConfig.prefix.trim()) {
        toast.error("O prefixo é obrigatório quando o modo é automático");
        return;
      }
      
      if (lotIdConfig.mode === 'auto' && lotIdConfig.auto_increment && (!lotIdConfig.current_number || lotIdConfig.current_number < 1)) {
        toast.error("O número atual deve ser maior que zero");
        return;
      }
      
      if (videoConfig.show_after_seconds < 1 || videoConfig.show_after_seconds > 10) {
        toast.error("O tempo para mostrar o botão deve estar entre 1 e 10 segundos");
        return;
      }
      
      await Promise.all([
        systemConfigApi.upsert({
          config_key: 'lot_id_mode',
          config_value: lotIdConfig,
          description: 'Configuração de geração de ID de lotes'
        }),
        systemConfigApi.upsert({
          config_key: 'qrcode_mode',
          config_value: qrCodeConfig,
          description: 'Configuração de QRCode'
        }),
        systemConfigApi.upsert({
          config_key: 'video_settings',
          config_value: videoConfig,
          description: 'Configurações do vídeo de apresentação'
        })
      ]);
      
      toast.success("Configurações salvas com sucesso!", {
        description: "Todas as alterações foram aplicadas ao sistema.",
        duration: 3000,
      });
      
      // Recarregar configurações para garantir sincronização
      await loadConfigurations();
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      toast.error(error.message || "Erro ao salvar configurações", {
        description: "Verifique os dados e tente novamente.",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      toast.error("Digite o nome da categoria");
      return;
    }
    
    if (qrCodeConfig.generic_categories.includes(trimmedCategory)) {
      toast.error("Esta categoria já foi adicionada");
      return;
    }
    
    setQrCodeConfig(prev => ({
      ...prev,
      generic_categories: [...prev.generic_categories, trimmedCategory]
    }));
    
    setNewCategory("");
    setShowCategoryInput(false);
    toast.success("Categoria adicionada com sucesso!");
  };

  const handleCancelAddCategory = () => {
    setNewCategory("");
    setShowCategoryInput(false);
  };

  const removeGenericCategory = (category: string) => {
    setQrCodeConfig(prev => ({
      ...prev,
      generic_categories: prev.generic_categories.filter(c => c !== category)
    }));
  };

  const handleSaveProfile = async () => {
    if (!userProfile.full_name.trim()) {
      toast.error("Preencha o nome completo");
      return;
    }

    try {
      setSavingProfile(true);
      await authApi.updateProfile({
        full_name: userProfile.full_name.trim(),
      });
      
      toast.success("Nome atualizado com sucesso!", {
        description: "Seu perfil foi atualizado.",
      });
      
      loadUserProfile();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setSavingProfile(false);
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
        currentPassword: "",
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">Gerencie suas preferências e configurações do sistema</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 mb-6">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Segurança</span>
            </TabsTrigger>
            <TabsTrigger value="sistema" className="flex items-center gap-2">
              <Gear className="h-4 w-4" />
              <span className="hidden sm:inline">Sistema</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2 hidden lg:flex">
              <Info className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" style={{ color: primaryColor }} weight="duotone" />
                  Informações do Perfil
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="text-sm font-medium">
                      Nome Completo
                    </Label>
                    <Input
                      id="user-name"
                      value={userProfile.full_name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-email-display" className="text-sm font-medium">
                      E-mail
                    </Label>
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
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={savingProfile || !userProfile.full_name.trim()}
                    className="text-white hover:opacity-90 min-w-[140px]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {savingProfile ? (
                      <Spinner className="h-4 w-4 mr-2 animate-spin" />
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
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-5 w-5" style={{ color: primaryColor }} weight="duotone" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Mantenha sua conta segura com uma senha forte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">
                      Nova Senha
                    </Label>
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
                    <Label htmlFor="confirm-password" className="text-sm font-medium">
                      Confirmar Nova Senha
                    </Label>
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
                        : 'text-white hover:opacity-90'
                    }`}
                    style={{ 
                      backgroundColor: passwordSuccess ? undefined : primaryColor 
                    }}
                  >
                    {savingPassword ? (
                      <Spinner className="h-4 w-4 mr-2 animate-spin" />
                    ) : passwordSuccess ? (
                      <CheckCircle className="h-4 w-4 mr-2" weight="fill" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    {passwordSuccess ? "Senha Alterada!" : "Alterar Senha"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Sistema */}
          <TabsContent value="sistema" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Configuração de ID de Lotes */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="h-5 w-5" style={{ color: primaryColor }} weight="duotone" />
                    Geração de ID de Lotes
                  </CardTitle>
                  <CardDescription>
                    Configure como os IDs dos lotes são gerados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lot-mode" className="text-sm font-medium">Modo de Geração</Label>
                    <Select 
                      value={lotIdConfig.mode} 
                      onValueChange={(value: 'auto' | 'manual') => 
                        setLotIdConfig(prev => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automático</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {lotIdConfig.mode === 'auto' 
                        ? 'IDs serão gerados automaticamente com prefixo e numeração sequencial'
                        : 'Usuários poderão inserir IDs personalizados'
                      }
                    </p>
                  </div>

                  {lotIdConfig.mode === 'auto' && (
                    <div className="space-y-4 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="prefix" className="text-sm font-medium">Prefixo *</Label>
                        <Input
                          id="prefix"
                          value={lotIdConfig.prefix}
                          onChange={(e) => setLotIdConfig(prev => ({ ...prev, prefix: e.target.value.toUpperCase().trim() }))}
                          placeholder="GT"
                          maxLength={10}
                          className="h-11"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Máximo 10 caracteres. Será convertido para maiúsculas.
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <Label htmlFor="auto-increment" className="text-sm font-medium cursor-pointer">
                          Numeração automática
                        </Label>
                        <Switch
                          id="auto-increment"
                          checked={lotIdConfig.auto_increment}
                          onCheckedChange={(checked) => 
                            setLotIdConfig(prev => ({ ...prev, auto_increment: checked }))
                          }
                          style={{ backgroundColor: lotIdConfig.auto_increment ? primaryColor : undefined }}
                        />
                      </div>

                      {lotIdConfig.auto_increment && (
                        <div className="space-y-2">
                          <Label htmlFor="current-number" className="text-sm font-medium">Número atual *</Label>
                          <Input
                            id="current-number"
                            type="number"
                            value={lotIdConfig.current_number || 1}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 1) {
                                setLotIdConfig(prev => ({ 
                                  ...prev, 
                                  current_number: value 
                                }));
                              }
                            }}
                            min="1"
                            className="h-11"
                            required
                          />
                          <div className="p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs text-gray-600 mb-1">
                              <strong>Próximo ID gerado:</strong>
                            </p>
                            <p className="text-sm font-mono font-semibold" style={{ color: primaryColor }}>
                              {lotIdConfig.prefix || 'GT'}-{(lotIdConfig.current_number || 1).toString().padStart(4, '0')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuração de QR Code */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="h-5 w-5" style={{ color: primaryColor }} weight="duotone" />
                    Configuração de QR Code
                  </CardTitle>
                  <CardDescription>
                    Configure o comportamento dos QR Codes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-mode" className="text-sm font-medium">Modo de QR Code</Label>
                    <Select 
                      value={qrCodeConfig.mode} 
                      onValueChange={(value: 'individual' | 'generic') => 
                        setQrCodeConfig(prev => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Selecione o modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual por Lote</SelectItem>
                        <SelectItem value="generic">Genérico por Categoria</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {qrCodeConfig.mode === 'individual' 
                        ? 'Cada lote terá seu próprio QR Code único'
                        : 'QR Codes genéricos levarão para busca por categoria'
                      }
                    </p>
                  </div>

                  {qrCodeConfig.mode === 'generic' && (
                    <div className="space-y-3 pt-2 border-t">
                      <Label className="text-sm font-medium">Categorias com QR Genérico</Label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {qrCodeConfig.generic_categories.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhuma categoria adicionada</p>
                        ) : (
                          qrCodeConfig.generic_categories.map((category, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <span className="text-sm font-medium">{category}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGenericCategory(category)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Remover categoria"
                              >
                                ×
                              </Button>
                            </div>
                          ))
                        )}
                        
                        {showCategoryInput ? (
                          <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <Input
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Nome da categoria"
                              className="h-9"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddCategory();
                                } else if (e.key === 'Escape') {
                                  handleCancelAddCategory();
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleAddCategory}
                                className="flex-1 text-white"
                                style={{ backgroundColor: primaryColor }}
                              >
                                Adicionar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelAddCategory}
                                className="flex-1"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCategoryInput(true)}
                            className="w-full border-dashed hover:border-solid transition-all"
                            style={{ borderColor: `${primaryColor}40` }}
                          >
                            + Adicionar Categoria
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Configuração de Vídeo */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="h-5 w-5" style={{ color: primaryColor }} weight="duotone" />
                  Configurações do Vídeo de Apresentação
                </CardTitle>
                <CardDescription>
                  Configure o comportamento do vídeo na página pública
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="video-enabled" className="text-sm font-medium cursor-pointer">
                        Vídeo habilitado
                      </Label>
                      <p className="text-xs text-gray-500">Exibir vídeo na página pública</p>
                    </div>
                    <Switch
                      id="video-enabled"
                      checked={videoConfig.enabled}
                      onCheckedChange={(checked) => 
                        setVideoConfig(prev => ({ ...prev, enabled: checked }))
                      }
                      style={{ backgroundColor: videoConfig.enabled ? primaryColor : undefined }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="video-autoplay" className="text-sm font-medium cursor-pointer">
                        Reprodução automática
                      </Label>
                      <p className="text-xs text-gray-500">Iniciar vídeo automaticamente</p>
                    </div>
                    <Switch
                      id="video-autoplay"
                      checked={videoConfig.auto_play}
                      onCheckedChange={(checked) => 
                        setVideoConfig(prev => ({ ...prev, auto_play: checked }))
                      }
                      style={{ backgroundColor: videoConfig.auto_play ? primaryColor : undefined }}
                    />
                  </div>

                  <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                    <Label htmlFor="video-delay" className="text-sm font-medium">
                      Mostrar botão após (segundos)
                    </Label>
                    <Input
                      id="video-delay"
                      type="number"
                      value={videoConfig.show_after_seconds}
                      onChange={(e) => setVideoConfig(prev => ({ 
                        ...prev, 
                        show_after_seconds: parseInt(e.target.value) || 3 
                      }))}
                      min="1"
                      max="10"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}30` }}>
                  <h4 className="font-medium mb-2 text-sm" style={{ color: primaryColor }}>Como funciona:</h4>
                  <ul className="text-sm space-y-1.5" style={{ color: `${primaryColor}CC` }}>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>O vídeo aparece automaticamente ao consultar um lote</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>Após {videoConfig.show_after_seconds} segundos, aparece o botão "Pular para Produto"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>O usuário pode assistir o vídeo completo ou pular diretamente</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Botão Salvar Configurações */}
            <div className="flex justify-end">
              <Button 
                onClick={saveConfigurations} 
                disabled={saving}
                className="text-white hover:opacity-90 min-w-[180px]"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? (
                  <Spinner className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FloppyDisk className="h-4 w-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>

          {/* Tab: Preview */}
          <TabsContent value="preview" className="space-y-6">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="h-5 w-5" style={{ color: primaryColor }} weight="duotone" />
                  Preview das Configurações
                </CardTitle>
                <CardDescription>
                  Visualize como as configurações aparecerão no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-sm text-gray-700">ID de Lote</h4>
                    </div>
                    <Badge variant="secondary" className="bg-white border shadow-sm text-gray-700 font-mono">
                      {lotIdConfig.mode === 'auto' 
                        ? `${lotIdConfig.prefix}-${(lotIdConfig.current_number || 1).toString().padStart(4, '0')}`
                        : 'Manual'
                      }
                    </Badge>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-sm text-gray-700">QR Code</h4>
                    </div>
                    <Badge variant="secondary" className="bg-white border shadow-sm text-gray-700">
                      {qrCodeConfig.mode === 'individual' ? 'Individual' : 'Genérico'}
                    </Badge>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-sm text-gray-700">Vídeo</h4>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`border shadow-sm ${
                        videoConfig.enabled 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {videoConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Configuracoes;
