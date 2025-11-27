import { Package, QrCode, Image, Calendar, Tag } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

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
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div className="space-y-6">
      {/* Tipo de Lote - Ultra Simplificado */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Tipo de Lote</span>
          </div>
          
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                const newMode = false;
                setIsBlendMode(newMode);
                if (!newMode) {
                  setFormData({ ...formData, components: [] });
                }
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                !isBlendMode 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={!isBlendMode ? { color: primaryColor } : {}}
            >
              Produto Único
            </button>
            
            <button
              type="button"
              onClick={() => {
                const newMode = true;
                setIsBlendMode(newMode);
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
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isBlendMode 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={isBlendMode ? { color: accentColor } : {}}
            >
              Blend
            </button>
          </div>
        </div>
      </div>

      {/* Informações Básicas - Layout Otimizado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                <Tag className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Identificação do Lote</h3>
                <p className="text-xs text-gray-500">Dados básicos de identificação</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campos do Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                    Nome do Lote *
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Ex: Café Especial da Fazenda" 
                    className="h-10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                    Categoria *
                  </Label>
                  <Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Café">Café</SelectItem>
                      <SelectItem value="Cacau">Cacau</SelectItem>
                      <SelectItem value="Açaí">Açaí</SelectItem>
                      <SelectItem value="Cupuaçu">Cupuaçu</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {!isBlendMode && (
                  <div>
                    <Label htmlFor="variety" className="text-sm font-medium mb-2 block">
                      Variedade
                    </Label>
                    <Input 
                      id="variety" 
                      value={formData.variety} 
                      onChange={e => setFormData({ ...formData, variety: e.target.value })} 
                      placeholder="Variedade do produto" 
                      className="h-10"
                    />
                  </div>
                )}
              </div>
              
              {/* Upload de Imagem Integrado */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Foto do Lote *
                  </Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-gray-300 transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = `${primaryColor}50`}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                  >
                    {formData.image_url ? (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="h-24 w-24 object-cover rounded-lg shadow-sm mx-auto"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity rounded-lg" />
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 text-xs"
                          >
                            Trocar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={removeImage}
                            className="h-7 text-xs"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                          <Image className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-900 mb-1">
                            Adicionar foto
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            JPG, PNG ou GIF (máx. 5MB)
                          </p>
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 text-xs hover:opacity-90 text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Selecionar
                          </Button>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      required
                    />
                  </div>
                  {!formData.image_url && (
                    <p className="text-red-500 text-xs mt-1">
                      * Foto do lote é obrigatória
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Preview do QR Code - Design Compacto */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <QrCode className="w-4 h-4" style={{ color: accentColor }} />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">QR Code</h3>
                <p className="text-xs text-gray-500">Preview</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-lg border border-gray-100 p-3 inline-block">
                <QRCodeSVG value={qrValue} size={80} bgColor="#fff" fgColor="#222" />
              </div>
              <div className="mt-3">
                <div className="bg-gray-50 rounded-md p-2">
                  <p className="text-xs text-gray-600 break-all font-mono leading-tight">
                    {qrValue}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
