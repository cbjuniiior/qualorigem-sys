import { useState, useEffect, useRef } from "react";
import { FloppyDisk, Palette, Image, X, Spinner } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { systemConfigApi } from "@/services/api";
import { uploadLogoToSupabase } from "@/services/upload";
import { toast } from "sonner";

interface BrandingConfig {
  preset: 'default' | 'cafe' | 'vinho' | 'acai' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
}

// Presets de cores
const COLOR_PRESETS = {
  default: {
    name: 'Padrão',
    primaryColor: '#16a34a',
    secondaryColor: '#22c55e',
    accentColor: '#10b981',
  },
  cafe: {
    name: 'Café',
    primaryColor: '#92400e',
    secondaryColor: '#a16207',
    accentColor: '#d97706',
  },
  vinho: {
    name: 'Vinho',
    primaryColor: '#7f1d1d',
    secondaryColor: '#991b1b',
    accentColor: '#dc2626',
  },
  acai: {
    name: 'Açaí',
    primaryColor: '#581c87',
    secondaryColor: '#6b21a8',
    accentColor: '#9333ea',
  },
};

const Personalizacao = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    preset: 'default',
    primaryColor: '#16a34a',
    secondaryColor: '#22c55e',
    accentColor: '#10b981',
    logoUrl: null
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const branding = await systemConfigApi.getBrandingConfig();
      setBrandingConfig(branding);
    } catch (error) {
      console.error("Erro ao carregar configurações de branding:", error);
      toast.error("Erro ao carregar configurações de personalização");
    } finally {
      setLoading(false);
    }
  };

  const saveBranding = async () => {
    try {
      setSaving(true);
      await systemConfigApi.upsert({
        config_key: 'branding_settings',
        config_value: brandingConfig as any,
        description: 'Configurações de personalização e branding'
      });
      toast.success("Personalização salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar personalização:", error);
      toast.error("Erro ao salvar personalização");
    } finally {
      setSaving(false);
    }
  };

  const handlePresetChange = (preset: 'default' | 'cafe' | 'vinho' | 'acai' | 'custom') => {
    if (preset !== 'custom' && COLOR_PRESETS[preset]) {
      setBrandingConfig({
        ...brandingConfig,
        preset,
        primaryColor: COLOR_PRESETS[preset].primaryColor,
        secondaryColor: COLOR_PRESETS[preset].secondaryColor,
        accentColor: COLOR_PRESETS[preset].accentColor,
      });
    } else {
      setBrandingConfig({
        ...brandingConfig,
        preset: 'custom',
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use JPG, PNG ou SVG.");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Tamanho máximo: 2MB.");
      return;
    }

    try {
      setUploadingLogo(true);
      const logoUrl = await uploadLogoToSupabase(file);
      setBrandingConfig({
        ...brandingConfig,
        logoUrl,
      });
      toast.success("Logo enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
      toast.error("Erro ao fazer upload do logo");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  const removeLogo = () => {
    setBrandingConfig({
      ...brandingConfig,
      logoUrl: null,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando personalização...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Personalização</h1>
            <p className="text-gray-600">Personalize cores e logo da página de lotes</p>
          </div>
          <Button 
            onClick={saveBranding} 
            disabled={saving}
            className="text-white shadow-sm hover:opacity-90"
            style={{ backgroundColor: brandingConfig.primaryColor }}
          >
            {saving ? (
              <Spinner className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FloppyDisk className="h-4 w-4 mr-2" />
            )}
            Salvar Personalização
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Presets de Cores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" style={{ color: brandingConfig.primaryColor }} />
                Preset de Cores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handlePresetChange(key as any)}
                    className={`p-4 border-2 rounded-lg transition-all hover:scale-105 ${
                      brandingConfig.preset === key
                        ? 'bg-opacity-10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ 
                      borderColor: brandingConfig.preset === key ? brandingConfig.primaryColor : undefined,
                      backgroundColor: brandingConfig.preset === key ? `${brandingConfig.primaryColor}10` : undefined
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: preset.secondaryColor }}
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                      </div>
                      <span className="text-sm font-medium">{preset.name}</span>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => handlePresetChange('custom')}
                  className={`p-4 border-2 rounded-lg transition-all hover:scale-105 ${
                    brandingConfig.preset === 'custom'
                      ? 'bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ 
                    borderColor: brandingConfig.preset === 'custom' ? brandingConfig.primaryColor : undefined,
                    backgroundColor: brandingConfig.preset === 'custom' ? `${brandingConfig.primaryColor}10` : undefined
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium">Personalizado</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Cores Personalizadas */}
          {brandingConfig.preset === 'custom' && (
            <Card>
              <CardHeader>
                <CardTitle>Cores Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={brandingConfig.primaryColor}
                        onChange={(e) =>
                          setBrandingConfig({ ...brandingConfig, primaryColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandingConfig.primaryColor}
                        onChange={(e) =>
                          setBrandingConfig({ ...brandingConfig, primaryColor: e.target.value })
                        }
                        placeholder="#16a34a"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary-color"
                        type="color"
                        value={brandingConfig.secondaryColor}
                        onChange={(e) =>
                          setBrandingConfig({ ...brandingConfig, secondaryColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandingConfig.secondaryColor}
                        onChange={(e) =>
                          setBrandingConfig({ ...brandingConfig, secondaryColor: e.target.value })
                        }
                        placeholder="#22c55e"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={brandingConfig.accentColor}
                        onChange={(e) =>
                          setBrandingConfig({ ...brandingConfig, accentColor: e.target.value })
                        }
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={brandingConfig.accentColor}
                        onChange={(e) =>
                          setBrandingConfig({ ...brandingConfig, accentColor: e.target.value })
                        }
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload de Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="h-5 w-5 mr-2" style={{ color: brandingConfig.primaryColor }} />
                Logo do Site
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {brandingConfig.logoUrl ? (
                    <div className="relative">
                      <img
                        src={brandingConfig.logoUrl}
                        alt="Logo"
                        className="h-20 object-contain border rounded-lg p-2 bg-white"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Image className="h-4 w-4 mr-2" />
                          {brandingConfig.logoUrl ? 'Alterar Logo' : 'Enviar Logo'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos aceitos: JPG, PNG, SVG. Tamanho máximo: 2MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview das Cores */}
          <Card>
            <CardHeader>
              <CardTitle>Preview das Cores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-4 items-center">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: brandingConfig.primaryColor }}
                  >
                    P
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: brandingConfig.secondaryColor }}
                  >
                    S
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: brandingConfig.accentColor }}
                  >
                    A
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    As cores aparecerão de forma sutil em ícones e detalhes da página de lotes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Personalizacao;

