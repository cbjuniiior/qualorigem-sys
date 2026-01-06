import { useState, useEffect } from "react";
import { 
  X, 
  Package, 
  Calendar, 
  MapPin, 
  Medal, 
  Eye, 
  Star, 
  Users, 
  QrCode,
  DownloadSimple,
  Share,
  PencilSimple,
  Trash,
  Quotes
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { productLotsApi } from "@/services/api";
import { toast } from "sonner";
import { ProductLot } from "@/types/lot";

interface ProductLot {
  id: string;
  code: string;
  name: string;
  category: string | null;
  variety: string | null;
  harvest_year: string | null;
  quantity: number | null;
  unit: string | null;
  seals_quantity?: number | null;
  image_url: string | null;
  producer_id: string;
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
  lot_observations: string | null;
  youtube_video_url: string | null;
  video_delay_seconds: number | null;
  created_at: string;
  producers: {
    id: string;
    name: string;
    property_name: string;
    city: string;
    state: string;
  };
  components?: Array<{
    id: string;
    component_name: string;
    component_variety: string;
    component_percentage: number;
    component_quantity: number;
    component_unit: string;
    component_origin: string;
    producer_id: string;
    component_harvest_year: string;
    association_id: string;
    producers: {
      id: string;
      name: string;
      property_name: string;
      city: string;
      state: string;
    };
    associations?: {
      id: string;
      name: string;
      type: string;
      city: string;
      state: string;
    };
  }>;
}

interface LotDetailsModalProps {
  lot: ProductLot | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (lot: ProductLot) => void;
  onDelete: (id: string) => void;
}

export const LotDetailsModal = ({ 
  lot, 
  isOpen, 
  onClose, 
  onEdit,
  onDelete 
}: LotDetailsModalProps) => {
  const [lotDetails, setLotDetails] = useState<ProductLot | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
  useEffect(() => {
    const loadQRUrl = async () => {
      if (lotDetails?.code) {
        try {
          const { generateQRCodeUrl } = await import("@/utils/qr-code-generator");
          const url = await generateQRCodeUrl(lotDetails.code, lotDetails.category);
          setQrCodeUrl(url);
        } catch (error) {
          console.error('Erro ao gerar URL do QR Code:', error);
          setQrCodeUrl(`${window.location.origin}/lote/${lotDetails.code}`);
        }
      }
    };
    
    if (lotDetails) {
      loadQRUrl();
    }
  }, [lotDetails]);

  useEffect(() => {
    if (lot && isOpen) {
      fetchLotDetails();
    }
  }, [lot, isOpen]);

  const fetchLotDetails = async () => {
    if (!lot) return;
    
    try {
      setLoading(true);
      const details = await productLotsApi.getById(lot.id);
      console.log("Detalhes do lote carregados:", details);
      console.log("Componentes encontrados:", details?.components);
      setLotDetails(details);
    } catch (error) {
      console.error("Erro ao buscar detalhes do lote:", error);
      toast.error("Erro ao carregar detalhes do lote");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!lotDetails) return;
    
    const url = qrCodeUrl || `${window.location.origin}/lote/${lotDetails.code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    } catch (error) {
      toast.error("Erro ao copiar link");
    }
  };

  const handleDownloadQR = () => {
    if (!lotDetails) return;
    
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${lotDetails.code}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!lot) return null;

  const averageScore = lotDetails ? (
    (lotDetails.fragrance_score || 0) + 
    (lotDetails.flavor_score || 0) + 
    (lotDetails.finish_score || 0) + 
    (lotDetails.acidity_score || 0) + 
    (lotDetails.body_score || 0)
  ) / 5 : 0;

  const isBlend = lotDetails?.components && lotDetails.components.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 z-50">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Detalhes do Lote
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes...</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header com imagem e informações principais */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Imagem e QR Code */}
              <div className="lg:col-span-1 space-y-4">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm">
                  {lotDetails?.image_url ? (
                    <img 
                      src={lotDetails.image_url} 
                      alt={lotDetails.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                
                {/* QR Code */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-white p-3 rounded-lg border">
                        <QRCodeSVG 
                          value={qrCodeUrl || `${window.location.origin}/lote/${lotDetails?.code || ''}`}
                          size={100}
                          bgColor="#fff"
                          fgColor="#222"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={handleDownloadQR} className="text-xs">
                          <DownloadSimple className="w-3 h-3 mr-1" />
                          Baixar
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleShare} className="text-xs">
                          <Share className="w-3 h-3 mr-1" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informações principais */}
              <div className="lg:col-span-3 space-y-6">
                {/* Título e badges */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{lotDetails?.name}</h1>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lotDetails?.category && (
                      <Badge className="bg-blue-100 text-blue-700 px-2 py-1 text-xs">
                        {lotDetails.category}
                      </Badge>
                    )}
                    {lotDetails?.variety && (
                      <Badge className="bg-gray-100 text-gray-700 px-2 py-1 text-xs">
                        {lotDetails.variety}
                      </Badge>
                    )}
                    {lotDetails?.harvest_year && (
                      <Badge className="bg-green-100 text-green-700 px-2 py-1 text-xs">
                        Safra {lotDetails.harvest_year}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Informações Gerais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quantidade:</span>
                        <span className="text-sm font-semibold">{lotDetails?.quantity} {lotDetails?.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Criado em:</span>
                        <span className="text-sm font-semibold">
                          {lotDetails?.created_at ? new Date(lotDetails.created_at).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Código:</span>
                        <span className="text-sm font-semibold font-mono">{lotDetails?.code}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        {isBlend ? <Users className="w-4 h-4" /> : <Medal className="w-4 h-4" />}
                        {isBlend ? 'Composição' : 'Produtor'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {isBlend ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Componentes:</span>
                            <span className="text-sm font-semibold">{lotDetails?.components?.length || 0} ingredientes</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Produtores:</span>
                            <span className="text-sm font-semibold">
                              {new Set(lotDetails?.components?.map(c => c.producer_id)).size || 0} únicos
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Tipo:</span>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">Blend Multi-produtor</Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Produtor:</span>
                            <span className="text-sm font-semibold">{lotDetails?.producers?.name || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Propriedade:</span>
                            <span className="text-sm font-semibold">{lotDetails?.producers?.property_name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Local:</span>
                            <span className="text-sm font-semibold">
                              {lotDetails?.producers?.city || 'N/A'}, {lotDetails?.producers?.state || 'N/A'}
                            </span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Score médio e análise sensorial */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Avaliação Geral */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Avaliação Geral
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {averageScore.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-32 bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${(averageScore / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {averageScore.toFixed(1)}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Baseado na análise sensorial
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Análise Sensorial */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Análise Sensorial
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {[
                          { label: 'Fragrância', score: lotDetails?.fragrance_score, color: 'purple' },
                          { label: 'Sabor', score: lotDetails?.flavor_score, color: 'green' },
                          { label: 'Finalização', score: lotDetails?.finish_score, color: 'yellow' },
                          { label: 'Acidez', score: lotDetails?.acidity_score, color: 'pink' },
                          { label: 'Corpo', score: lotDetails?.body_score, color: 'blue' },
                        ].map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-gray-700">{item.label}</span>
                              <span className="text-xs font-bold text-gray-900">
                                {item.score?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-${item.color}-400 transition-all duration-500`}
                                style={{ width: `${((item.score || 0) / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Notas Sensoriais */}
            {lotDetails?.sensory_notes && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Quotes className="w-4 h-4" />
                    Notas Sensoriais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {lotDetails.sensory_notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Resumo do Blend */}
            {isBlend && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Resumo do Blend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Produtores</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {new Set(lotDetails?.components?.map(c => c.producer_id)).size || 0}
                      </p>
                      <p className="text-xs text-blue-600">Produtores únicos</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Componentes</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {lotDetails?.components?.length || 0}
                      </p>
                      <p className="text-xs text-green-600">Ingredientes</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Medal className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Associações</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {new Set(lotDetails?.components?.map(c => c.association_id).filter(Boolean)).size || 0}
                      </p>
                      <p className="text-xs text-purple-600">Organizações</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Componentes do Blend */}
            {isBlend && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Composição do Blend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {lotDetails?.components?.map((component, index) => (
                      <div key={component.id} className="border border-gray-200 rounded-xl p-5 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{component.component_name}</h4>
                              {component.component_variety && (
                                <p className="text-sm text-gray-600">{component.component_variety}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium">
                              {component.component_percentage}%
                            </Badge>
                            <Badge className="bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                              {component.component_quantity} {component.component_unit}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Informações do Produtor</h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Medal className="w-4 h-4 text-gray-500" />
                                <div>
                                  <span className="text-sm text-gray-600">Produtor:</span>
                                  <p className="text-sm font-medium">{component.producers?.name || 'Produtor não informado'}</p>
                                </div>
                              </div>
                              {component.producers?.property_name && (
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm text-gray-600">Propriedade:</span>
                                    <p className="text-sm font-medium">{component.producers.property_name}</p>
                                  </div>
                                </div>
                              )}
                              {component.producers?.city && component.producers?.state && (
                                <div className="flex items-center gap-3">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm text-gray-600">Local:</span>
                                    <p className="text-sm font-medium">{component.producers.city}, {component.producers.state}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Detalhes do Componente</h5>
                            <div className="space-y-2">
                              {component.component_harvest_year && (
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm text-gray-600">Safra:</span>
                                    <p className="text-sm font-medium">{component.component_harvest_year}</p>
                                  </div>
                                </div>
                              )}
                              {component.component_origin && (
                                <div className="flex items-center gap-3">
                                  <Package className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm text-gray-600">Origem:</span>
                                    <p className="text-sm font-medium">{component.component_origin}</p>
                                  </div>
                                </div>
                              )}
                              {component.associations && (
                                <div className="flex items-center gap-3">
                                  <Users className="w-4 h-4 text-gray-500" />
                                  <div>
                                    <span className="text-sm text-gray-600">Associação:</span>
                                    <p className="text-sm font-medium">{component.associations.name}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {lotDetails?.lot_observations && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Observações</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">{lotDetails.lot_observations}</p>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={onClose} size="sm">
                Fechar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => lotDetails && onEdit(lotDetails)}
                size="sm"
              >
                <PencilSimple className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => lotDetails && onDelete(lotDetails.id)}
                size="sm"
              >
                <Trash className="w-3 h-3 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
