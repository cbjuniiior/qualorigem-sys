import { useState, useEffect } from "react";
import { FloppyDisk, Gear, Hash, QrCode, Video, Spinner, User, Eye, EyeSlash, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { systemConfigApi, authApi } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

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
        systemConfigApi.getLotIdConfig(),
        systemConfigApi.getQRCodeConfig(),
        systemConfigApi.getVideoConfig()
      ]);
      
      setLotIdConfig(lotId);
      setQrCodeConfig(qrCode);
      setVideoConfig(video);
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
      
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const addGenericCategory = () => {
    const category = prompt("Digite o nome da categoria:");
    if (category && !qrCodeConfig.generic_categories.includes(category)) {
      setQrCodeConfig(prev => ({
        ...prev,
        generic_categories: [...prev.generic_categories, category]
      }));
    }
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
      
      toast.success("Nome atualizado com sucesso!");
      
      // Recarregar dados do usuário
      loadUserProfile();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      const errorMessage = error.message || "Erro ao atualizar perfil";
      toast.error(errorMessage);
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

    // Validação adicional: verificar se a senha não é muito simples
    if (passwordData.newPassword.length > 72) {
      toast.error("A senha não pode ter mais de 72 caracteres");
      return;
    }

    try {
      setSavingPassword(true);
      await authApi.updatePassword(passwordData.newPassword);
      
      // Limpar campos imediatamente
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Mostrar estado de sucesso
      setPasswordSuccess(true);
      
      // Exibir toast de sucesso com duração maior
      toast.success("Senha alterada com sucesso!", {
        duration: 4000,
        description: "Sua senha foi atualizada com sucesso. Use a nova senha no próximo login.",
      });
      
      // Remover estado de sucesso após 3 segundos
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      
      // Tratamento específico para erros do Supabase
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
            <p className="text-gray-600">Configure as funcionalidades do GeoTrace</p>
          </div>
          <Button 
            onClick={saveConfigurations} 
            disabled={saving}
            className="text-white hover:opacity-90"
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

        {/* Seção de Perfil do Usuário */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Perfil do Usuário */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Perfil do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Nome Completo</Label>
                <Input
                  id="user-name"
                  value={userProfile.full_name}
                  onChange={(e) => setUserProfile(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Seu nome completo"
                  className="focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-email-display">E-mail</Label>
                <Input
                  id="user-email-display"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
                <p className="text-xs text-gray-500">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={savingProfile || !userProfile.full_name.trim()}
                className="w-full text-white hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {savingProfile ? (
                  <Spinner className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FloppyDisk className="h-4 w-4 mr-2" />
                )}
                Salvar Nome
              </Button>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gear className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha"
                    className="focus:ring-2 pr-10"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    className="focus:ring-2 pr-10"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Importante:</strong> A nova senha deve ser diferente da senha atual e ter pelo menos 6 caracteres.
                </p>
              </div>

              <Button 
                onClick={handleUpdatePassword} 
                disabled={savingPassword || passwordSuccess || !passwordData.newPassword || !passwordData.confirmPassword}
                className="w-full text-white hover:opacity-90"
                style={{ 
                  backgroundColor: passwordSuccess ? '#10b981' : primaryColor 
                }}
              >
                {savingPassword ? (
                  <Spinner className="h-4 w-4 mr-2 animate-spin" />
                ) : passwordSuccess ? (
                  <CheckCircle className="h-4 w-4 mr-2" weight="fill" />
                ) : (
                  <FloppyDisk className="h-4 w-4 mr-2" />
                )}
                {passwordSuccess ? "Senha Alterada!" : "Alterar Senha"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuração de ID de Lotes */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hash className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Geração de ID de Lotes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lot-mode">Modo de Geração</Label>
                <Select 
                  value={lotIdConfig.mode} 
                  onValueChange={(value: 'auto' | 'manual') => 
                    setLotIdConfig(prev => ({ ...prev, mode: value }))
                  }
                >
                  <SelectTrigger className="focus:ring-2" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}>
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automático</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {lotIdConfig.mode === 'auto' 
                    ? 'Os IDs serão gerados automaticamente com prefixo e numeração sequencial'
                    : 'Os usuários poderão inserir IDs personalizados'
                  }
                </p>
              </div>

              {lotIdConfig.mode === 'auto' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Prefixo</Label>
                    <Input
                      id="prefix"
                      value={lotIdConfig.prefix}
                      onChange={(e) => setLotIdConfig(prev => ({ ...prev, prefix: e.target.value }))}
                      placeholder="GT"
                      maxLength={10}
                      className="focus:ring-2" 
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-increment"
                      checked={lotIdConfig.auto_increment}
                      onCheckedChange={(checked) => 
                        setLotIdConfig(prev => ({ ...prev, auto_increment: checked }))
                      }
                      style={{ '--tw-ring-color': primaryColor, backgroundColor: lotIdConfig.auto_increment ? primaryColor : undefined } as React.CSSProperties}
                    />
                    <Label htmlFor="auto-increment">Numeração automática</Label>
                  </div>

                  {lotIdConfig.auto_increment && (
                    <div className="space-y-2">
                      <Label htmlFor="current-number">Número atual</Label>
                      <Input
                        id="current-number"
                        type="number"
                        value={lotIdConfig.current_number || 1}
                        onChange={(e) => setLotIdConfig(prev => ({ 
                          ...prev, 
                          current_number: parseInt(e.target.value) || 1 
                        }))}
                        min="1"
                        className="focus:ring-2" 
                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      />
                      <p className="text-xs text-gray-500">
                        Próximo ID será: {lotIdConfig.prefix}-{(lotIdConfig.current_number || 1).toString().padStart(4, '0')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Configuração de QR Code */}
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Configuração de QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-mode">Modo de QR Code</Label>
                <Select 
                  value={qrCodeConfig.mode} 
                  onValueChange={(value: 'individual' | 'generic') => 
                    setQrCodeConfig(prev => ({ ...prev, mode: value }))
                  }
                >
                  <SelectTrigger className="focus:ring-2" style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}>
                    <SelectValue placeholder="Selecione o modo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual por Lote</SelectItem>
                    <SelectItem value="generic">Genérico por Categoria</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {qrCodeConfig.mode === 'individual' 
                    ? 'Cada lote terá seu próprio QR Code único'
                    : 'QR Codes genéricos levarão para busca por categoria'
                  }
                </p>
              </div>

              {qrCodeConfig.mode === 'generic' && (
                <div className="space-y-3">
                  <Label>Categorias com QR Genérico</Label>
                  <div className="space-y-2">
                    {qrCodeConfig.generic_categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{category}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGenericCategory(category)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addGenericCategory}
                      className="w-full hover:text-white hover:border-transparent transition-colors"
                      style={{ 
                        color: primaryColor, 
                        borderColor: `${primaryColor}40` 
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = primaryColor;
                      }}
                    >
                      + Adicionar Categoria
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuração de Vídeo */}
          <Card className="lg:col-span-2 border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Configurações do Vídeo de Apresentação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="video-enabled"
                    checked={videoConfig.enabled}
                    onCheckedChange={(checked) => 
                      setVideoConfig(prev => ({ ...prev, enabled: checked }))
                    }
                    style={{ backgroundColor: videoConfig.enabled ? primaryColor : undefined } as React.CSSProperties}
                  />
                  <Label htmlFor="video-enabled">Vídeo habilitado</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="video-autoplay"
                    checked={videoConfig.auto_play}
                    onCheckedChange={(checked) => 
                      setVideoConfig(prev => ({ ...prev, auto_play: checked }))
                    }
                    style={{ backgroundColor: videoConfig.auto_play ? primaryColor : undefined } as React.CSSProperties}
                  />
                  <Label htmlFor="video-autoplay">Reprodução automática</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-delay">Mostrar botão após (segundos)</Label>
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
                    className="focus:ring-2" 
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                <h4 className="font-medium mb-2" style={{ color: primaryColor }}>Como funciona:</h4>
                <ul className="text-sm space-y-1" style={{ color: `${primaryColor}90` }}>
                  <li>• O vídeo aparece automaticamente ao consultar um lote</li>
                  <li>• Após X segundos, aparece o botão "Pular para Produto"</li>
                  <li>• O usuário pode assistir o vídeo completo ou pular diretamente</li>
                  <li>• O vídeo é reproduzido em tela cheia com controles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview das Configurações */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gear className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
              Preview das Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-gray-700">ID de Lote</h4>
                <Badge variant="secondary" className="bg-white border shadow-sm text-gray-600">
                  {lotIdConfig.mode === 'auto' 
                    ? `${lotIdConfig.prefix}-${(lotIdConfig.current_number || 1).toString().padStart(4, '0')}`
                    : 'Manual'
                  }
                </Badge>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-gray-700">QR Code</h4>
                <Badge variant="secondary" className="bg-white border shadow-sm text-gray-600">
                  {qrCodeConfig.mode === 'individual' ? 'Individual' : 'Genérico'}
                </Badge>
              </div>

              <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2 text-gray-700">Vídeo</h4>
                <Badge variant="secondary" className="bg-white border shadow-sm text-gray-600">
                  {videoConfig.enabled ? 'Habilitado' : 'Desabilitado'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Configuracoes;
