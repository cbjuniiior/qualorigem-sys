import { useState, useEffect } from "react";
import { FloppyDisk, Gear, Hash, QrCode, Video, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { systemConfigApi } from "@/services/api";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);

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
  }, []);

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
