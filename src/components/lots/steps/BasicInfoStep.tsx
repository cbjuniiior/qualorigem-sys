import { Package, QrCode, Image as ImageIcon, Calendar, Tag, CheckCircle, IdentificationCard, XCircle, WarningCircle, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@/components/ui/separator";

interface BasicInfoStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode: boolean;
  setIsBlendMode: (mode: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  qrValue: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string | null;
  } | null;
}

export const BasicInfoStep = ({
  formData,
  setFormData,
  isBlendMode,
  setIsBlendMode,
  fileInputRef,
  handleImageUpload,
  removeImage,
  qrValue,
  branding
}: BasicInfoStepProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Seletor de Tipo de Lote - Visual Premium com Cores Dinâmicas */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Estrutura de Produção</Label>
        <div className="flex bg-slate-100/80 p-1.5 rounded-[1.5rem] shadow-inner ring-1 ring-slate-200/50 w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              setIsBlendMode(false);
              setFormData({ ...formData, components: [] });
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
              !isBlendMode 
                ? "bg-white shadow-lg scale-105" 
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={!isBlendMode ? { color: primaryColor } : {}}
          >
            <Package size={20} weight={!isBlendMode ? "fill" : "bold"} />
            Produto Único
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBlendMode(true);
              if (formData.components.length === 0) {
                const initialComponent = {
                  id: crypto.randomUUID(),
                  component_name: "",
                  component_variety: "",
                  component_percentage: 0,
                  component_quantity: 0,
                  component_unit: "g",
                  component_origin: "",
                  producer_id: undefined,
                  component_harvest_year: "",
                  association_id: undefined
                };
                setFormData({ ...formData, components: [initialComponent] });
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all duration-300 ${
              isBlendMode 
                ? "bg-white shadow-lg scale-105" 
                : "text-slate-400 hover:text-slate-600"
            }`}
            style={isBlendMode ? { color: primaryColor } : {}}
          >
            <Tag size={20} weight={isBlendMode ? "fill" : "bold"} />
            Blend / Mistura
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Formulário Principal */}
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div 
                className="p-2.5 rounded-xl border shadow-sm"
                style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
              >
                <IdentificationCard size={24} weight="duotone" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Identificação do Produto</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Essas informações serão o primeiro contato do consumidor com seu produto.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 text-left">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Tag size={16} style={{ color: primaryColor }} /> Nome do Lote *
                  </Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Ex: Café Especial da Fazenda" 
                    className="h-12 bg-slate-50 border-0 rounded-xl focus-visible:ring-primary"
                    style={{ '--primary': primaryColor } as any}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Package size={16} style={{ color: primaryColor }} /> Categoria *
                  </Label>
                  <Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}>
                    <SelectTrigger 
                      className="h-12 rounded-xl bg-slate-50 border-0 font-bold px-6 focus:ring-primary"
                      style={{ '--primary': primaryColor } as any}
                    >
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="Café">☕ Café</SelectItem>
                      <SelectItem value="Erva-Mate">🌿 Erva-Mate</SelectItem>
                      <SelectItem value="Cacau">🍫 Cacau</SelectItem>
                      <SelectItem value="Açaí">🫐 Açaí</SelectItem>
                      <SelectItem value="Outros">📦 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isBlendMode && (
                  <div className="space-y-2 animate-in slide-in-from-left-4 duration-300">
                    <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                      <IdentificationCard size={16} style={{ color: primaryColor }} /> Variedade / Tipo
                    </Label>
                    <Input 
                      value={formData.variety} 
                      onChange={e => setFormData({ ...formData, variety: e.target.value })} 
                      placeholder="Ex: Torra Média, Suave, Em pó..." 
                      className="h-12 bg-slate-50 border-0 rounded-xl focus-visible:ring-primary"
                      style={{ '--primary': primaryColor } as any}
                    />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Ex: Tradicional, torra média, suave, em pó, etc.</p>
                  </div>
                )}
              </div>

              {/* Upload de Imagem Premium */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <ImageIcon size={16} style={{ color: primaryColor }} /> Imagem de Capa *
                </Label>
                <div 
                  className={`relative group h-[320px] w-full rounded-[2.5rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-4 overflow-hidden ${
                    formData.image_url ? 'border-primary/20 bg-primary/5' : 'border-slate-100 bg-slate-50/50 hover:border-primary/30 hover:bg-slate-50'
                  }`}
                  style={formData.image_url ? { borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}05` } : {}}
                >
                  {formData.image_url ? (
                    <>
                      <img src={formData.image_url} alt="Lote" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Button type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="rounded-2xl font-black gap-2 shadow-2xl h-12 px-6">
                          <ImageIcon size={20} weight="bold" /> Trocar Foto
                        </Button>
                        <Button type="button" onClick={removeImage} variant="destructive" className="rounded-2xl font-black gap-2 shadow-2xl h-12 px-6">
                          <Trash size={20} weight="bold" /> Remover
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-6 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 text-slate-300 group-hover:text-primary transition-all group-hover:scale-110 duration-500">
                        <ImageIcon size={56} weight="fill" />
                      </div>
                      <div className="text-center space-y-1 px-8">
                        <p className="text-sm font-black text-slate-600">Arraste a foto do produto ou clique</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">JPG, PNG • Máx: 5MB</p>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        className="rounded-2xl font-black px-10 h-12 shadow-xl shadow-primary/20 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Selecionar Arquivo
                      </Button>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                {!formData.image_url && (
                  <div className="flex items-center gap-1.5 text-rose-500 ml-1 mt-2">
                    <WarningCircle size={14} weight="fill" />
                    <span className="text-[10px] font-black uppercase tracking-wider">A foto do lote é obrigatória para o selo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar de Preview do QR Code - Integrado com as Cores da Marca */}
        <div className="xl:col-span-4 space-y-6">
          <Card 
            className="border-0 shadow-2xl rounded-[3rem] overflow-hidden"
            style={{ backgroundColor: `${primaryColor}08`, ring: `1px solid ${primaryColor}20` }}
          >
            <div className="p-10 space-y-10 flex flex-col items-center">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2" style={{ color: primaryColor }}>
                  <div className="w-8 h-px opacity-20" style={{ backgroundColor: primaryColor }} />
                  <QrCode size={24} weight="bold" />
                  <div className="w-8 h-px opacity-20" style={{ backgroundColor: primaryColor }} />
                </div>
                <h4 className="font-black text-2xl tracking-tight text-slate-800">QR Code Único</h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed px-2">Identificação digital exclusiva que garante a origem e qualidade do seu lote.</p>
              </div>

              <div className="relative group">
                <div 
                  className="absolute -inset-6 rounded-full blur-3xl transition-all duration-700 opacity-20" 
                  style={{ backgroundColor: primaryColor }}
                />
                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl transition-transform duration-500 group-hover:scale-105 ring-8 ring-slate-100/50">
                  <QRCodeSVG 
                    value={qrValue} 
                    size={160} 
                    level="H" 
                    includeMargin={false}
                    imageSettings={branding?.logoUrl ? {
                      src: branding.logoUrl,
                      height: 35,
                      width: 35,
                      excavate: true,
                    } : undefined}
                  />
                </div>
              </div>

              <div className="w-full bg-white rounded-2xl p-5 border border-slate-100 shadow-inner space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <span>Ponto de Acesso</span>
                  <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                </div>
                <p className="text-[11px] font-mono text-slate-400 break-all leading-tight text-center">
                  {qrValue}
                </p>
              </div>

              <div 
                className="px-6 py-2.5 rounded-full border flex items-center gap-2"
                style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20`, color: accentColor }}
              >
                <CheckCircle size={18} weight="fill" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Link Validado</span>
              </div>
            </div>
          </Card>

          <div 
            className="p-6 rounded-[2rem] border flex gap-4 ring-1 ring-white/50 text-left"
            style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
          >
            <div 
              className="p-3 h-fit bg-white rounded-2xl shadow-sm border"
              style={{ color: primaryColor, borderColor: `${primaryColor}10` }}
            >
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className="space-y-1">
              <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight">Transparência</h5>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Este primeiro passo define como seu produto será listado na prateleira digital do consumidor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
