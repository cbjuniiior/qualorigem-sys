import { useState, useEffect, useRef } from "react";
import { FloppyDisk, Palette, Image as ImageIcon, X, CircleNotch, CheckCircle, PaintBrush } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { systemConfigApi } from "@/services/api";
import { uploadLogoToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface BrandingConfig {
  preset: 'default' | 'cafe' | 'vinho' | 'acai' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
}

const COLOR_PRESETS = {
  default: { name: 'Padrão', primaryColor: '#16a34a', secondaryColor: '#22c55e', accentColor: '#10b981' },
  cafe: { name: 'Café Premium', primaryColor: '#92400e', secondaryColor: '#a16207', accentColor: '#d97706' },
  vinho: { name: 'Vinho & Uva', primaryColor: '#7f1d1d', secondaryColor: '#991b1b', accentColor: '#dc2626' },
  acai: { name: 'Açaí Natural', primaryColor: '#581c87', secondaryColor: '#6b21a8', accentColor: '#9333ea' },
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
      toast.error("Erro ao carregar configurações");
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
      toast.success("Identidade visual atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar personalização");
    } finally {
      setSaving(false);
    }
  };

  const handlePresetChange = (preset: any) => {
    if (preset !== 'custom') {
      const p = (COLOR_PRESETS as any)[preset];
      setBrandingConfig({ ...brandingConfig, preset, ...p });
    } else {
      setBrandingConfig({ ...brandingConfig, preset: 'custom' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const logoUrl = await uploadLogoToSupabase(file);
      setBrandingConfig({ ...brandingConfig, logoUrl });
      toast.success("Logo atualizado!");
    } catch (error) {
      toast.error("Erro no upload do logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const primaryColor = brandingConfig.primaryColor || '#16a34a';

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-12 w-48 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
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
              <PaintBrush size={32} style={{ color: primaryColor }} weight="fill" />
              Identidade Visual
            </h2>
            <p className="text-slate-500 font-medium text-sm">Personalize as cores e a marca do seu sistema GeoTrace.</p>
          </div>
          <Button 
            onClick={saveBranding} 
            disabled={saving}
            className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-8 transition-all"
            style={{ backgroundColor: primaryColor, shadowColor: `${primaryColor}30` } as any}
          >
            {saving ? <CircleNotch className="h-5 w-5 mr-2 animate-spin" /> : <FloppyDisk className="h-5 w-5 mr-2" weight="bold" />}
            Salvar Alterações
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configurações */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">Preset de Cores</CardTitle>
                <CardDescription className="font-medium text-slate-400">Escolha uma paleta pronta ou crie a sua.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(COLOR_PRESETS).map(([key, preset]) => {
                    const isSelected = brandingConfig.preset === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handlePresetChange(key)}
                        className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                          isSelected ? "shadow-md" : "border-slate-100 hover:border-slate-200 bg-white"
                        }`}
                        style={isSelected ? { borderColor: primaryColor, backgroundColor: `${primaryColor}05` } : {}}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2" style={{ color: primaryColor }}>
                            <CheckCircle size={20} weight="fill" />
                          </div>
                        )}
                        <div className="flex gap-1.5 mb-3">
                          <div className="w-6 h-6 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: preset.primaryColor }} />
                          <div className="w-6 h-6 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: preset.secondaryColor }} />
                          <div className="w-6 h-6 rounded-full shadow-sm border-2 border-white" style={{ backgroundColor: preset.accentColor }} />
                        </div>
                        <span 
                          className="text-sm font-black uppercase tracking-tight transition-colors"
                          style={{ color: isSelected ? primaryColor : '#475569' }}
                        >
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePresetChange('custom')}
                    className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                      brandingConfig.preset === 'custom' ? "shadow-md" : "border-slate-100 hover:border-slate-200 bg-white"
                    }`}
                    style={brandingConfig.preset === 'custom' ? { borderColor: primaryColor, backgroundColor: `${primaryColor}05` } : {}}
                  >
                    <div className="w-10 h-6 flex items-center justify-center mb-3 text-slate-300 group-hover:text-primary transition-colors">
                      <Palette size={24} weight="bold" style={brandingConfig.preset === 'custom' ? { color: primaryColor } : {}} />
                    </div>
                    <span 
                      className="text-sm font-black uppercase tracking-tight"
                      style={{ color: brandingConfig.preset === 'custom' ? primaryColor : '#475569' }}
                    >
                      Personalizado
                    </span>
                  </button>
                </div>

                {brandingConfig.preset === 'custom' && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in zoom-in-95">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Primária</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={brandingConfig.primaryColor} onChange={e => setBrandingConfig({...brandingConfig, primaryColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer border-0 rounded-lg shadow-sm" />
                        <Input type="text" value={brandingConfig.primaryColor} onChange={e => setBrandingConfig({...brandingConfig, primaryColor: e.target.value})} className="flex-1 bg-white border-0 h-10 rounded-lg font-mono text-xs font-bold uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Secundária</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={brandingConfig.secondaryColor} onChange={e => setBrandingConfig({...brandingConfig, secondaryColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer border-0 rounded-lg shadow-sm" />
                        <Input type="text" value={brandingConfig.secondaryColor} onChange={e => setBrandingConfig({...brandingConfig, secondaryColor: e.target.value})} className="flex-1 bg-white border-0 h-10 rounded-lg font-mono text-xs font-bold uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400">Destaque</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={brandingConfig.accentColor} onChange={e => setBrandingConfig({...brandingConfig, accentColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer border-0 rounded-lg shadow-sm" />
                        <Input type="text" value={brandingConfig.accentColor} onChange={e => setBrandingConfig({...brandingConfig, accentColor: e.target.value})} className="flex-1 bg-white border-0 h-10 rounded-lg font-mono text-xs font-bold uppercase" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">Logotipo</CardTitle>
                <CardDescription className="font-medium text-slate-400">Upload do logo principal do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  {brandingConfig.logoUrl ? (
                    <div className="relative group">
                      <div className="w-40 h-40 bg-white rounded-2xl flex items-center justify-center p-4 shadow-xl ring-1 ring-slate-100">
                        <img src={brandingConfig.logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                      <button onClick={() => setBrandingConfig({...brandingConfig, logoUrl: null})} className="absolute -top-3 -right-3 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors">
                        <X size={16} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-white rounded-2xl flex flex-col items-center justify-center p-4 border border-slate-100 text-slate-200">
                      <ImageIcon size={48} weight="fill" />
                      <span className="text-[10px] font-black uppercase mt-2">Sem Logo</span>
                    </div>
                  )}
                  <div className="flex-1 text-center sm:text-left space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-700">Carregar Novo Logo</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">Formatos recomendados: SVG ou PNG transparente.<br/>Tamanho máximo sugerido: 500x200px.</p>
                    </div>
                    <Button 
                      onClick={() => logoInputRef.current?.click()} 
                      disabled={uploadingLogo} 
                      variant="outline" 
                      className="rounded-xl font-bold bg-white border-slate-200 hover:bg-slate-50 h-11 px-6 transition-all"
                      style={{ color: primaryColor }}
                    >
                      {uploadingLogo ? <CircleNotch className="animate-spin mr-2" size={18} /> : <ImageIcon size={18} weight="bold" className="mr-2" />}
                      {brandingConfig.logoUrl ? "Trocar Logotipo" : "Selecionar Arquivo"}
                    </Button>
                    <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <Card className="border-0 shadow-2xl bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 px-8 py-6">
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>Live Preview</span>
                    <Badge variant="outline" className="border-white/20 text-white/60 text-[10px] font-black uppercase tracking-widest">Página de Lotes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 bg-[#F8FAFC]">
                  {/* Mockup de um elemento da dashboard */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: brandingConfig.primaryColor, color: '#fff' }}>
                        <ImageIcon size={24} weight="fill" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-4 w-32 rounded bg-slate-200" />
                        <div className="h-3 w-20 rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-24 rounded bg-slate-100" />
                        <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: `${brandingConfig.primaryColor}15`, color: brandingConfig.primaryColor }}>
                          Em Trânsito
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: brandingConfig.primaryColor }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <Button className="w-full rounded-xl font-bold text-white shadow-md transition-all" style={{ backgroundColor: brandingConfig.primaryColor }}>
                        Ver Detalhes do Lote
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center" style={{ color: brandingConfig.secondaryColor }}>
                        <Palette size={20} weight="fill" />
                      </div>
                      <div className="flex-1 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center" style={{ color: brandingConfig.accentColor }}>
                        <PaintBrush size={20} weight="fill" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                <div className="p-2 h-fit bg-amber-100 text-amber-600 rounded-lg">
                  <Palette size={20} weight="fill" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-black text-amber-900 uppercase tracking-tight">Dica de Design</h5>
                  <p className="text-xs text-amber-700 font-medium leading-relaxed">Utilize cores primárias com bom contraste para garantir a acessibilidade e leitura do seu portal de rastreabilidade.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Personalizacao;