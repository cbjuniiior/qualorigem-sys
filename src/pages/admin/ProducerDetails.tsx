import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { brandsApi, producersApi, productLotsApi, associationsApi, systemConfigApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Phone, 
  Envelope, 
  ArrowLeft, 
  PencilSimple, 
  Buildings, 
  Package, 
  Users, 
  Plus, 
  X, 
  Tag, 
  Eye, 
  ArrowRight, 
  Calendar, 
  UserCircle, 
  CircleNotch, 
  DownloadSimple, 
  ShareNetwork, 
  MapPin, 
  Leaf, 
  Star, 
  Info, 
  Quotes,
  ArrowSquareOut,
  CheckCircle
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { ProducerForm } from "./Produtores";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/utils/slug-generator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStepIndicator } from "@/components/ui/step-indicator";
import { QRCodeSVG } from "qrcode.react";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";

const PRODUCER_STEPS = [
  { id: 1, title: "Responsável" },
  { id: 2, title: "Vínculos" },
  { id: 3, title: "Marcas" },
];

// Componente para visualizar mapa com pin (read-only)
const LocationMapViewer = ({ latitude, longitude, primaryColor }: { latitude: number; longitude: number; primaryColor: string }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    if (isNaN(latitude) || isNaN(longitude)) return;

    // Fix icon issue
    const DefaultIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Adicionar marcador customizado com cor primária
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 32px;
        height: 32px;
        background-color: ${primaryColor};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    markerRef.current = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, primaryColor]);

  return (
    <div 
      ref={mapContainerRef} 
      className="h-[280px] w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-lg bg-slate-100"
    />
  );
};

export default function ProducerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  const [producer, setProducer] = useState<any>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [allAssociations, setAllAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditSheetOpen, setIsSheetOpen] = useState(false);
  const [isAssocSheetOpen, setIsAssocSheetOpen] = useState(false);
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isLotSheetOpen, setIsLotSheetOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<any | null>(null);
  const [lotDetails, setLotDetails] = useState<any | null>(null);
  const [loadingLotDetails, setLoadingLotDetails] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [brandForm, setBrandForm] = useState({ name: "", slug: "" });
  const [savingBrand, setSavingBrand] = useState(false);
  const [branding, setBranding] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Função auxiliar para gerar variações da cor primária
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const loadData = async () => {
      if (!tenant || !id) return;
      try {
        const config = await systemConfigApi.getBrandingConfig(tenant.id);
        setBranding(config);
        setLoading(true);
        const [p, a, allA, b, l] = await Promise.all([
          producersApi.getById(id, tenant.id),
          associationsApi.getByProducer(id, tenant.id),
          associationsApi.getAll(tenant.id),
          brandsApi.getByProducer(id, tenant.id),
          productLotsApi.getByProducer(id, tenant.id)
        ]);
        setProducer(p);
        setAssociations(a);
        setAllAssociations(allA);
        setBrands(b);
        setLots(l);
      } catch (e) {
        toast.error("Erro ao carregar produtor");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, tenant]);


  const handleAssociationToggle = async (assocId: string, checked: boolean) => {
    if (!id || !tenant) return;
    try {
      if (checked) await associationsApi.addProducerToAssociation(id, assocId, tenant.id);
      else await associationsApi.removeProducerFromAssociation(id, assocId, tenant.id);
      const updated = await associationsApi.getByProducer(id, tenant.id);
      setAssociations(updated);
      toast.success("Associações atualizadas!");
    } catch (e) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleLotClick = async (lot: any) => {
    if (!tenant) return;
    setSelectedLot(lot);
    setIsLotSheetOpen(true);
    setLoadingLotDetails(true);
    
    try {
      const details = await productLotsApi.getById(lot.id, tenant.id);
      setLotDetails(details);
      
      // Gerar URL do QR Code
      try {
        const { generateQRCodeUrl } = await import("@/utils/qr-code-generator");
        const url = await generateQRCodeUrl(details.code, details.category);
        setQrCodeUrl(url);
      } catch (error) {
        setQrCodeUrl(`${window.location.origin}/${tenant.slug}/lote/${details.code}`);
      }
    } catch (error) {
      toast.error("Erro ao carregar detalhes do lote");
    } finally {
      setLoadingLotDetails(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!lotDetails) return;
    
    const svg = document.getElementById('qr-code-svg');
    if (!svg) {
      toast.error("QR Code não encontrado");
      return;
    }
    
    try {
      // Aumentar a resolução para alta qualidade (4x para melhor qualidade)
      const scale = 4;
      const baseSize = 180;
      const canvasSize = baseSize * scale;
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error("Erro ao criar canvas");
        return;
      }
      
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      
      // Configurar alta qualidade
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Converter SVG para imagem
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Desenhar o QR Code no canvas
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasSize, canvasSize);
          ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
          
          // Se houver logo, desenhá-la no centro
          if (branding?.logoUrl) {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            
            logoImg.onload = () => {
              try {
                // Tamanho da logo (proporcional ao QR code)
                const logoSize = (baseSize * 0.2) * scale; // 20% do tamanho do QR code
                const logoX = (canvasSize - logoSize) / 2;
                const logoY = (canvasSize - logoSize) / 2;
                
                // Desenhar fundo branco para a logo (garantir que não fique transparente)
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
                
                // Desenhar a logo
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                
                // Fazer o download
                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `qr-code-${lotDetails.code}.png`;
                    downloadLink.href = url;
                    downloadLink.click();
                    URL.revokeObjectURL(url);
                    URL.revokeObjectURL(svgUrl);
                    toast.success("QR Code baixado com sucesso!");
                  }
                }, 'image/png', 1.0); // Qualidade máxima
              } catch (error) {
                console.error("Erro ao desenhar logo:", error);
                // Se falhar ao carregar logo, baixar sem ela
                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `qr-code-${lotDetails.code}.png`;
                    downloadLink.href = url;
                    downloadLink.click();
                    URL.revokeObjectURL(url);
                    URL.revokeObjectURL(svgUrl);
                    toast.success("QR Code baixado com sucesso!");
                  }
                }, 'image/png', 1.0);
              }
            };
            
            logoImg.onerror = () => {
              // Se falhar ao carregar logo, baixar sem ela
              canvas.toBlob((blob) => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const downloadLink = document.createElement('a');
                  downloadLink.download = `qr-code-${lotDetails.code}.png`;
                  downloadLink.href = url;
                  downloadLink.click();
                  URL.revokeObjectURL(url);
                  URL.revokeObjectURL(svgUrl);
                  toast.success("QR Code baixado com sucesso!");
                }
              }, 'image/png', 1.0);
            };
            
            logoImg.src = branding.logoUrl;
          } else {
            // Sem logo, apenas fazer download
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');
                downloadLink.download = `qr-code-${lotDetails.code}.png`;
                downloadLink.href = url;
                downloadLink.click();
                URL.revokeObjectURL(url);
                URL.revokeObjectURL(svgUrl);
                toast.success("QR Code baixado com sucesso!");
              }
            }, 'image/png', 1.0);
          }
        } catch (error) {
          console.error("Erro ao processar QR Code:", error);
          toast.error("Erro ao processar QR Code");
          URL.revokeObjectURL(svgUrl);
        }
      };
      
      img.onerror = () => {
        toast.error("Erro ao carregar QR Code");
        URL.revokeObjectURL(svgUrl);
      };
      
      img.src = svgUrl;
    } catch (error) {
      console.error("Erro ao baixar QR Code:", error);
      toast.error("Erro ao baixar QR Code");
    }
  };

  const handleCopyQRUrl = () => {
    const url = qrCodeUrl || `${window.location.origin}/${tenant?.slug}/lote/${lotDetails?.code || ''}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex gap-6 items-center">
            <Skeleton className="h-24 w-24 rounded-3xl" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Profile Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 text-left">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 rounded-3xl border-4 border-white shadow-2xl ring-1 ring-slate-100">
              <AvatarImage src={producer.profile_picture_url} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary">
                <UserCircle size={64} weight="fill" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{producer.name}</h2>
                <Badge className="bg-primary/10 text-primary border-0 font-black text-[10px] uppercase rounded-md px-2">{labels.producer} Ativo</Badge>
              </div>
              <div className="flex items-center gap-4 pt-1">
                {producer.email && (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                    <Envelope size={16} weight="fill" className="text-slate-300" /> {producer.email}
                  </span>
                )}
                {producer.phone && (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                    <Phone size={16} weight="fill" className="text-slate-300" /> {producer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <ArrowLeft weight="bold" /> Voltar
            </Button>
            <Button onClick={() => { setCurrentStep(1); setIsSheetOpen(true); }} className="rounded-xl font-bold bg-white border-primary/20 hover:bg-primary/5 shadow-sm gap-2" style={{ color: primaryColor }}>
              <PencilSimple size={18} weight="bold" /> Editar Perfil
            </Button>
            <Button onClick={() => setIsAssocSheetOpen(true)} className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg shadow-primary/20 gap-2" style={{ backgroundColor: primaryColor }}>
              <Users size={18} weight="bold" /> Gerenciar {labels.associations}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 shadow-sm bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package size={24} weight="fill" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Lotes</p>
                  <p className="text-2xl font-black text-slate-900">{lots.length}</p>
                </div>
              </Card>
              <Card className="border-0 shadow-sm bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Eye size={24} weight="fill" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualizações</p>
                  <p className="text-2xl font-black text-slate-900">{lots.reduce((acc, l) => acc + (l.views || 0), 0)}</p>
                </div>
              </Card>
              <Card className="border-0 shadow-sm bg-white rounded-2xl p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} weight="fill" /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marcas</p>
                  <p className="text-2xl font-black text-slate-900">{brands.length}</p>
                </div>
              </Card>
            </div>

            {/* Associations Section */}
            {associations.length > 0 && (
              <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-50 p-8">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <Users size={24} style={{ color: primaryColor }} weight="fill" /> {labels.associations}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {associations.map(assoc => (
                      <div key={assoc.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                        <Avatar className="h-12 w-12 rounded-xl border border-slate-200 shadow-sm">
                          <AvatarImage src={assoc.logo_url} className="object-contain" />
                          <AvatarFallback className="bg-white text-slate-400">
                            <Buildings size={20} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-black text-slate-900">{assoc.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{assoc.city}, {assoc.state}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lots List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Package size={24} style={{ color: primaryColor }} weight="fill" /> Lotes Ativos
                </h3>
                <Button variant="ghost" className="font-bold hover:bg-primary/5 rounded-xl" style={{ color: primaryColor }}>Ver Todos</Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {lots.map(lot => (
                  <Card 
                    key={lot.id} 
                    className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-all overflow-hidden cursor-pointer"
                    onClick={() => handleLotClick(lot)}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-left flex-1">
                        <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Package size={24} className="text-slate-400" weight="duotone" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{lot.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lot.code}</p>
                            {lot.harvest_year && (
                              <>
                                <span className="h-1 w-1 bg-slate-300 rounded-full" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Safra {lot.harvest_year}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl text-slate-300 group-hover:text-primary transition-all">
                        <ArrowRight size={20} weight="bold" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            {/* Contact Card */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8 bg-slate-50/30">
                <CardTitle className="text-lg font-black">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-sm ring-1 ring-slate-100" style={{ color: primaryColor }}>
                    <Phone size={20} weight="fill" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase">WhatsApp / Tel</p>
                    <p className="text-sm font-black text-slate-700">{producer.phone || "Não informado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shadow-sm ring-1 ring-slate-100" style={{ color: primaryColor }}>
                    <Envelope size={20} weight="fill" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[10px] font-black text-slate-300 uppercase">E-mail Direto</p>
                    <p className="text-sm font-black text-slate-700 truncate">{producer.email || "Não informado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brands Section */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8 flex flex-row items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-lg font-black">Marcas Próprias</CardTitle>
                  <CardDescription className="text-[10px] font-bold uppercase">Identidade no PDV</CardDescription>
                </div>
                <Button size="icon" variant="ghost" className="rounded-xl text-primary" onClick={() => setIsBrandDialogOpen(true)} style={{ color: primaryColor }}>
                  <Plus size={20} weight="bold" />
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {brands.length === 0 ? (
                  <div className="py-12 text-center">
                    <Tag size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-400 font-bold">Nenhuma marca cadastrada.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {brands.map(brand => (
                      <div key={brand.id} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4 group hover:bg-slate-100 transition-all">
                        {brand.logo_url ? (
                          <img src={brand.logo_url} alt={brand.name} className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                            <Tag size={20} className="text-slate-400" weight="fill" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-black text-slate-900">{brand.name}</p>
                          <p className="text-xs text-slate-400 font-mono">/{brand.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sheets & Dialogs */}
        <Sheet open={isEditSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <UserCircle size={32} weight="fill" />
                    </div>
                    <div>
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">Editar {labels.producer}</SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold">Atualize as informações cadastrais.</SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={PRODUCER_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              <div className="flex-1 relative flex flex-col min-h-0">
                <ProducerForm 
                  initialData={producer} 
                  branding={branding}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  onSubmit={() => { setIsSheetOpen(false); window.location.reload(); }} 
                  onCancel={() => setIsSheetOpen(false)} 
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={isAssocSheetOpen} onOpenChange={setIsAssocSheetOpen}>
          <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30 text-left">
                <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight">Vínculos de {labels.association}</SheetTitle>
                <SheetDescription className="text-slate-500 font-bold uppercase text-xs">Entidades que este {labels.producer.toLowerCase()} faz parte.</SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-8 space-y-4 min-h-0 text-left">
                {allAssociations.map(assoc => {
                  const isChecked = associations.some(a => a.id === assoc.id);
                  return (
                    <div 
                      key={assoc.id} 
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isChecked ? 'shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                      }`}
                      style={isChecked ? { backgroundColor: `${primaryColor}05`, borderColor: primaryColor } : {}}
                      onClick={() => handleAssociationToggle(assoc.id, !isChecked)}
                    >
                      <Checkbox 
                        id={assoc.id} 
                        checked={isChecked} 
                        onCheckedChange={c => handleAssociationToggle(assoc.id, !!c)}
                        style={{ '--primary': primaryColor } as any}
                      />
                      <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                        <AvatarImage src={assoc.logo_url} className="object-contain" />
                        <AvatarFallback className="bg-white text-slate-400">
                          <Buildings size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor={assoc.id} 
                        className={`flex-1 font-black text-sm cursor-pointer transition-colors ${isChecked ? '' : 'text-slate-700'}`}
                        style={isChecked ? { color: primaryColor } : {}}
                      >
                        {assoc.name}
                      </label>
                      {isChecked && <CheckCircle size={20} weight="fill" style={{ color: primaryColor }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sheet de Detalhes do Lote */}
        <Sheet open={isLotSheetOpen} onOpenChange={setIsLotSheetOpen}>
          <SheetContent className="w-full sm:max-w-[85vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl [&>button]:hidden">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLotSheetOpen(false)}
                  className="absolute right-6 top-6 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={20} weight="bold" />
                </Button>
                <SheetTitle className="text-2xl font-black text-slate-900 tracking-tight pr-12">Detalhes do Lote</SheetTitle>
                <SheetDescription className="text-slate-500 font-bold uppercase text-xs mt-1">
                  {lotDetails?.code || selectedLot?.code}
                </SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-0">
                {loadingLotDetails ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center space-y-4">
                      <CircleNotch size={48} className="animate-spin mx-auto" style={{ color: primaryColor }} />
                      <p className="text-slate-400 font-bold">Carregando detalhes...</p>
                    </div>
                  </div>
                ) : lotDetails ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Header Principal */}
                    <div className="mb-8">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-widest">
                              {lotDetails.code}
                            </span>
                            <Separator orientation="vertical" className="h-4" />
                            <span className="text-xs font-bold text-slate-400">
                              Criado em {new Date(lotDetails.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{lotDetails.name}</h2>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              className="text-white border-0 font-black px-4 py-1.5 rounded-full shadow-sm hover:opacity-90 transition-all"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {lotDetails.category || "N/A"}
                            </Badge>
                            {lotDetails.harvest_year && (
                              <Badge 
                                className="text-white border-0 font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"
                                style={{ backgroundColor: hexToRgba(primaryColor, 0.8) }}
                              >
                                <Calendar size={14} weight="fill" />
                                Safra {lotDetails.harvest_year}
                              </Badge>
                            )}
                            <Badge 
                              className="bg-white border border-slate-200 font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm pointer-events-none"
                              style={{ color: primaryColor }}
                            >
                              <Eye size={14} weight="fill" />
                              {lotDetails.views || 0} visualizações
                            </Badge>
                            {(lotDetails.components || lotDetails.lot_components) && (lotDetails.components?.length > 0 || lotDetails.lot_components?.length > 0) && (
                              <Badge 
                                className="text-white border-0 font-black px-4 py-1.5 rounded-full shadow-sm"
                                style={{ backgroundColor: hexToRgba(primaryColor, 0.9) }}
                              >
                                BLEND
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            variant="outline" 
                            className="rounded-full h-12 px-6 font-black gap-2 shadow-sm hover:opacity-90 transition-all"
                            style={{ 
                              borderColor: primaryColor,
                              color: primaryColor,
                              backgroundColor: hexToRgba(primaryColor, 0.05)
                            }}
                            asChild
                          >
                            <a href={`/${tenant?.slug}/lote/${lotDetails.code}`} target="_blank" rel="noopener noreferrer">
                              <ArrowSquareOut size={20} weight="bold" />
                              Visualizar Página
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Grid Principal: QR Code e Informações */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                      {/* QR Code - Destaque Lateral */}
                      <div className="lg:col-span-1">
                        <Card 
                          className="border-0 shadow-xl rounded-[2.5rem] overflow-hidden sticky top-4"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <CardContent className="p-8 space-y-6">
                            <div className="text-center space-y-1">
                              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">QR Code de Rastreabilidade</p>
                              <h3 className="text-white font-black text-lg">Escaneie para Rastrear</h3>
                            </div>
                            
                            <div className="flex justify-center bg-white p-6 rounded-[2rem] shadow-2xl">
                              <div id="qr-code-container" className="p-2">
                                <QRCodeSVG 
                                  id="qr-code-svg"
                                  value={qrCodeUrl || `${window.location.origin}/${tenant?.slug}/lote/${lotDetails.code}`}
                                  size={180}
                                  level="H"
                                  includeMargin={false}
                                  imageSettings={branding?.logoUrl ? {
                                    src: branding.logoUrl,
                                    height: 36,
                                    width: 36,
                                    excavate: true,
                                  } : undefined}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-3 pt-2">
                              <Button
                                onClick={handleDownloadQR}
                                className="w-full rounded-2xl h-14 font-black text-white hover:opacity-90 shadow-xl gap-3 text-base group border-2 border-white/20"
                                style={{ backgroundColor: '#ffffff', color: primaryColor }}
                              >
                                <DownloadSimple size={22} weight="bold" className="group-hover:bounce" />
                                Baixar QR Code
                              </Button>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  variant="secondary"
                                  onClick={handleCopyQRUrl}
                                  className="rounded-2xl h-12 font-black text-white hover:opacity-90 border-0 gap-2 text-xs"
                                  style={{ backgroundColor: hexToRgba(primaryColor, 0.3) }}
                                >
                                  <ShareNetwork size={18} weight="bold" />
                                  Copiar Link
                                </Button>
                                <Button
                                  variant="secondary"
                                  className="rounded-2xl h-12 font-black text-white hover:opacity-90 border-0 gap-2 text-xs"
                                  style={{ backgroundColor: hexToRgba(primaryColor, 0.3) }}
                                  onClick={() => window.open(`/${tenant?.slug}/lote/${lotDetails.code}`, '_blank')}
                                >
                                  <Eye size={18} weight="bold" />
                                  Testar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Informações Detalhadas */}
                      <div className="lg:col-span-2 space-y-8">
                        {/* Seção: Dados Gerais */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 px-1">
                            <div 
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
                            >
                              <Package size={18} weight="fill" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Especificações Técnicas</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificação do Lote</p>
                              <p className="text-base font-black text-slate-900">{lotDetails.name}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variedade / Cultivar</p>
                              <p className="text-base font-black text-slate-900">{lotDetails.variety || "Não informada"}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Total</p>
                              <p className="text-base font-black text-slate-900">
                                {lotDetails.quantity || 0} {lotDetails.unit || "Kg"}
                              </p>
                            </div>
                            <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controle de Selos</p>
                              <p className="text-base font-black text-slate-900">{lotDetails.seals_quantity || 0} unidades geradas</p>
                            </div>
                          </div>
                        </div>

                        {/* Características e Análise Sensorial */}
                        <div className="grid grid-cols-1 gap-6">
                          {/* Características */}
                          {lotDetails.characteristics && lotDetails.characteristics.length > 0 && (
                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"
                                  style={{ color: primaryColor }}
                                >
                                  <Leaf size={18} weight="fill" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Atributos do Produto</h3>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {lotDetails.characteristics.map((char: any) => (
                                  <div key={char.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-500">{char.characteristics.name}</span>
                                    <span className="text-sm font-black text-slate-900">{char.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Análise Sensorial */}
                          {lotDetails.sensory_analysis && lotDetails.sensory_analysis.length > 0 && (() => {
                            const sensoryData = lotDetails.sensory_analysis;
                            const quantitativeData = sensoryData.filter((item: any) => 
                              item.sensory_attributes?.type === 'quantitative'
                            );
                            const qualitativeData = sensoryData.filter((item: any) => 
                              item.sensory_attributes?.type === 'qualitative'
                            );
                            const averageScore = quantitativeData.length > 0
                              ? (quantitativeData.reduce((sum: number, item: any) => sum + Number(item.value || 0), 0) / quantitativeData.length).toFixed(1)
                              : null;

                            return (
                              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white to-slate-50/50 border border-slate-100 shadow-sm space-y-8">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                      style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
                                    >
                                      <Star size={20} weight="fill" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-black text-slate-900">Avaliação Sensorial</h3>
                                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                                        {quantitativeData.length} {quantitativeData.length === 1 ? 'atributo quantitativo' : 'atributos quantitativos'}
                                        {qualitativeData.length > 0 && ` • ${qualitativeData.length} ${qualitativeData.length === 1 ? 'qualitativo' : 'qualitativos'}`}
                                      </p>
                                    </div>
                                  </div>
                                  {averageScore && (
                                    <div className="text-right">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Média Geral</p>
                                      <p className="text-3xl font-black" style={{ color: primaryColor }}>
                                        {averageScore}
                                      </p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">/ 10</p>
                                    </div>
                                  )}
                                </div>

                                {/* Atributos Quantitativos */}
                                {quantitativeData.length > 0 && (
                                  <div className="space-y-5">
                                    {quantitativeData.map((item: any) => {
                                      const attribute = item.sensory_attributes;
                                      const value = Number(item.value || 0);
                                      const maxValue = 10; // Assumindo escala de 0-10
                                      
                                      return (
                                        <div key={item.id} className="space-y-2.5">
                                          <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-black text-slate-700 uppercase tracking-wider text-[12px]">
                                                {attribute?.name || 'Atributo'}
                                              </span>
                                              {attribute?.description && (
                                                <span className="text-[10px] font-medium text-slate-400 italic">
                                                  ({attribute.description})
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-sm font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                              {value.toFixed(1)}/{maxValue}
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-100 rounded-full h-2.5 p-0.5 border border-slate-200 overflow-hidden shadow-inner">
                                            <div 
                                              className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                                              style={{ 
                                                width: `${(value / maxValue) * 100}%`,
                                                backgroundColor: primaryColor
                                              }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Atributos Qualitativos */}
                                {qualitativeData.length > 0 && (
                                  <div className="pt-4 border-t border-slate-200 space-y-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div 
                                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor }}
                                      >
                                        <Info size={14} weight="fill" />
                                      </div>
                                      <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Avaliações Qualitativas</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {qualitativeData.map((item: any) => {
                                        const attribute = item.sensory_attributes;
                                        const value = Number(item.value || 0);
                                        
                                        return (
                                          <div key={item.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-sm font-black text-slate-700">
                                                {attribute?.name || 'Atributo'}
                                              </span>
                                              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                                                {value}/10
                                              </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                              <div 
                                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                                style={{ 
                                                  width: `${(value / 10) * 100}%`,
                                                  backgroundColor: hexToRgba(primaryColor, 0.6)
                                                }}
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Notas Sensoriais */}
                                {lotDetails.sensory_notes && (
                                  <div className="pt-6 border-t border-slate-200 space-y-4">
                                    <div className="flex items-center gap-2">
                                      <Quotes size={20} weight="fill" className="text-slate-300" />
                                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Observações do Especialista</h4>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200 relative overflow-hidden group">
                                      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Quotes size={48} weight="fill" style={{ color: primaryColor }} />
                                      </div>
                                      <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10 italic">
                                        "{lotDetails.sensory_notes}"
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Observações e Composição */}
                        <div className="space-y-6">
                          {lotDetails.lot_observations && (
                            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center"
                                  style={{ color: primaryColor }}
                                >
                                  <Info size={18} weight="fill" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Notas Adicionais</h3>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line px-1">
                                {lotDetails.lot_observations}
                              </p>
                            </div>
                          )}

                          {/* Composição do Blend */}
                          {(lotDetails.components || lotDetails.lot_components) && (lotDetails.components?.length > 0 || lotDetails.lot_components?.length > 0) && (
                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-6">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm"
                                  style={{ color: primaryColor }}
                                >
                                  <Users size={18} weight="fill" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Composição (Blend)</h3>
                              </div>
                              <div className="grid grid-cols-1 gap-4">
                                {(lotDetails.components || lotDetails.lot_components || []).map((component: any, index: number) => (
                                  <div key={component.id || index} className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-slate-200 transition-all hover:shadow-md group">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-4">
                                        <div 
                                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-lg group-hover:rotate-3 transition-transform"
                                          style={{ backgroundColor: primaryColor }}
                                        >
                                          {index + 1}
                                        </div>
                                        <div>
                                          <h4 className="font-black text-slate-900 text-base">{component.component_name || component.name || "Componente"}</h4>
                                          <p className="text-xs text-slate-400 font-bold">{component.component_variety || "Variedade não informada"}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-2xl font-black text-slate-900">{component.component_percentage || component.percentage || 0}%</span>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participação</p>
                                      </div>
                                    </div>
                                    
                                    {component.producers && (
                                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <UserCircle size={20} className="text-slate-300" />
                                          <span className="text-xs font-black text-slate-600 truncate max-w-[150px]">{component.producers.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                          <MapPin size={14} />
                                          <span className="text-[10px] font-bold">{component.producers.city || "Região não inf."}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Dados da Propriedade */}
                          {(lotDetails.property_name || lotDetails.city || lotDetails.state || lotDetails.altitude || lotDetails.average_temperature || (lotDetails.latitude && lotDetails.longitude)) && (
                            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-6">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center"
                                  style={{ color: primaryColor }}
                                >
                                  <Buildings size={18} weight="fill" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Localização da Propriedade</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Informações Textuais */}
                                <div className="space-y-4">
                                  {lotDetails.property_name && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade Produtiva</p>
                                      <p className="text-base font-black text-slate-900">{lotDetails.property_name}</p>
                                    </div>
                                  )}
                                  {(lotDetails.city || lotDetails.state) && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade e Estado</p>
                                      <p className="text-base font-black text-slate-900 flex items-center gap-2">
                                        <MapPin size={16} weight="fill" style={{ color: primaryColor }} />
                                        {lotDetails.city}{lotDetails.city && lotDetails.state ? ", " : ""}{lotDetails.state}
                                      </p>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-2 gap-4">
                                    {lotDetails.altitude && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Altitude</p>
                                        <p className="text-base font-black text-slate-900">{lotDetails.altitude}m</p>
                                      </div>
                                    )}
                                    {lotDetails.average_temperature && (
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperatura Média</p>
                                        <p className="text-base font-black text-slate-900">{lotDetails.average_temperature}°C</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Mapa com Pin */}
                                {(lotDetails.latitude && lotDetails.longitude) && (
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização Exata</p>
                                    <LocationMapViewer 
                                      latitude={Number(lotDetails.latitude)} 
                                      longitude={Number(lotDetails.longitude)}
                                      primaryColor={primaryColor}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Package size={48} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Erro ao carregar detalhes do lote</p>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
          <DialogContent className="rounded-3xl border-0 shadow-2xl">
            <DialogHeader className="text-left">
              <DialogTitle className="text-xl font-black">Nova Marca Própria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-left">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 ml-1">Nome da Marca</Label>
                <Input 
                  value={brandForm.name} 
                  onChange={e => { setBrandForm({...brandForm, name: e.target.value, slug: generateSlug(e.target.value)}); }} 
                  className="rounded-xl bg-slate-50 border-0 h-12 font-bold focus-visible:ring-primary" 
                  placeholder="Ex: Reserva da Família" 
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 ml-1">Slug da URL</Label>
                <Input value={brandForm.slug} readOnly className="rounded-xl bg-slate-100 border-0 h-12 font-mono text-xs opacity-60" />
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button onClick={() => setIsBrandDialogOpen(false)} variant="ghost" className="rounded-xl font-bold">Cancelar</Button>
              <Button 
                onClick={async () => {
                  if (!tenant) return;
                  setSavingBrand(true);
                  try {
                    await brandsApi.create({ producer_id: id!, name: brandForm.name, slug: brandForm.slug, tenant_id: tenant.id });
                    toast.success("Marca criada!");
                    setIsBrandDialogOpen(false);
                    const updated = await brandsApi.getByProducer(id!, tenant.id);
                    setBrands(updated);
                  } catch (e) {
                    toast.error("Erro ao criar marca");
                  } finally {
                    setSavingBrand(false);
                  }
                }} 
                disabled={savingBrand}
                className="rounded-xl font-bold text-white h-12 px-8 hover:opacity-90 transition-all shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {savingBrand ? <CircleNotch className="animate-spin" /> : "Criar Marca"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
