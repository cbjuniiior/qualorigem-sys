import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  MagnifyingGlass, 
  FunnelSimple, 
  Package, 
  Eye, 
  PencilSimple, 
  Trash, 
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  DotsThreeOutlineVertical,
  Export,
  Users,
  X,
  DownloadSimple,
  ShareNetwork,
  ArrowSquareOut,
  Leaf,
  Star,
  Buildings,
  CircleNotch,
  Info,
  Quotes
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { productLotsApi, producersApi, associationsApi, industriesApi, systemConfigApi, productLotCharacteristicsApi, productLotSensoryApi, brandsApi, lotIndustriesApi, certificationsApi, internalProducersApi } from "@/services/api";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from "qrcode.react";
import { useBranding } from "@/hooks/use-branding";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LotForm, LOT_STEPS } from "@/components/lots/LotForm";
import { ProductLot } from "@/types/lot";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FormStepIndicator } from "@/components/ui/step-indicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

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

const Lotes = () => {
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);
  
  // Estados para offcanvas de detalhes do lote
  const [isLotSheetOpen, setIsLotSheetOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ProductLot | null>(null);
  const [lotDetails, setLotDetails] = useState<any | null>(null);
  const [loadingLotDetails, setLoadingLotDetails] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  
  const { branding: brandingConfig } = useBranding();
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  const primaryColor = branding?.primaryColor || brandingConfig?.primaryColor || '#16a34a';
  
  // Helper para converter hex para rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    harvest_year: "",
    quantity: "",
    unit: "Kg",
    seals_quantity: "",
    producer_id: "",
    brand_id: "",
    industry_id: "",
    industry_ids: [] as string[],
    certification_ids: [] as string[],
    internal_producer_ids: [] as string[],
    association_id: "",
    sensory_type: "nota",
    fragrance_score: 5,
    flavor_score: 5,
    finish_score: 5,
    acidity_score: 5,
    body_score: 5,
    sensory_notes: "",
    lot_observations: "",
    youtube_video_url: "",
    video_delay_seconds: 10,
    video_description: "",
    latitude: "",
    longitude: "",
    property_name: "",
    property_description: "",
    altitude: "",
    average_temperature: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    address_internal_only: false,
    photos: [] as string[],
    components: [] as any[],
    characteristics: [] as { characteristic_id: string; value: string }[],
    sensory_analysis: [] as { sensory_attribute_id: string; value: number }[],
  });

  const [isBlendMode, setIsBlendMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      if (!tenant) return;
      try {
        const config = await systemConfigApi.getBrandingConfig(tenant.id);
        setBranding(config);
        await fetchData();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, [tenant]);

  const fetchData = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const [lotsData, producersData, associationsData, industriesData] = await Promise.all([
        productLotsApi.getAll(tenant.id),
        producersApi.getAll(tenant.id),
        associationsApi.getAll(tenant.id),
        industriesApi.getAll(tenant.id),
      ]);
      setLots(lotsData);
      setProducers(producersData);
      setAssociations(associationsData || []);
      setIndustries(industriesData || []);
    } catch (error) {
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "",
      harvest_year: new Date().getFullYear().toString(),
      quantity: "",
      unit: "Kg",
      seals_quantity: "",
      producer_id: "",
      brand_id: "",
      industry_id: "",
      industry_ids: [],
      certification_ids: [],
      internal_producer_ids: [],
      association_id: "",
      sensory_type: "nota",
      fragrance_score: 5,
      flavor_score: 5,
      finish_score: 5,
      acidity_score: 5,
      body_score: 5,
      sensory_notes: "",
      lot_observations: "",
      youtube_video_url: "",
      video_delay_seconds: 10,
      video_description: "",
      latitude: "",
      longitude: "",
      property_name: "",
      property_description: "",
      altitude: "",
      average_temperature: "",
      address: "",
      city: "",
      state: "",
      cep: "",
      address_internal_only: false,
      photos: [],
      components: [],
      characteristics: [],
      sensory_analysis: [],
    });
    setIsBlendMode(false);
    setCurrentStep(1);
    setEditingLot(null);
  };

  const handleOpenSheet = async () => {
    resetForm();
    setIsSheetOpen(true);
    if (!tenant?.id) return;
    try {
      const { generateLotCode } = await import("@/utils/lot-code-generator");
      const newCode = await generateLotCode(tenant.id);
      if (newCode) setFormData(prev => ({ ...prev, code: newCode }));
    } catch (e) {}
  };

  const handleEdit = async (lot: ProductLot) => {
    setEditingLot(lot);
    const rawComponents = (lot as any).components || (lot as any).lot_components || [];
    const rawCharacteristics = (lot as any).characteristics || [];
    const rawSensory = (lot as any).sensory_analysis || [];

    // Load industries linked to this lot
    let lotIndustryIds: string[] = [];
    try {
      if (tenant?.id) {
        const lotIndustries = await lotIndustriesApi.getByLot(lot.id, tenant.id);
        lotIndustryIds = lotIndustries.map((ind: any) => ind.id);
      }
    } catch (e) {
      console.error("Erro ao carregar indústrias do lote:", e);
    }
    // Fallback: if no industries from junction table, use legacy industry_id
    if (lotIndustryIds.length === 0 && (lot as any).industry_id) {
      lotIndustryIds = [(lot as any).industry_id];
    }

    // Load certifications linked to this lot
    let lotCertificationIds: string[] = [];
    try {
      if (tenant?.id) {
        const lotCerts = await certificationsApi.getPublicByLot(lot.id);
        lotCertificationIds = (lotCerts || []).map((c: any) => c.id);
      }
    } catch (e) {
      console.error("Erro ao carregar certificações do lote:", e);
    }

    // Load internal producers linked to this lot
    let lotInternalProducerIds: string[] = [];
    try {
      if (tenant?.id) {
        const lotIps = await internalProducersApi.getByLot(lot.id, tenant.id);
        lotInternalProducerIds = (lotIps || []).map((ip: any) => ip.id);
      }
    } catch (e) {
      console.error("Erro ao carregar produtores internos do lote:", e);
    }

    setFormData({
      code: lot.code,
      name: lot.name,
      category: lot.category || "",
      harvest_year: lot.harvest_year || "",
      quantity: lot.quantity?.toString() || "",
      unit: lot.unit || "",
      seals_quantity: (lot as any).seals_quantity?.toString() || "",
      producer_id: lot.producer_id || "",
      brand_id: (lot as any).brand_id || "",
      industry_id: (lot as any).industry_id || "",
      industry_ids: lotIndustryIds,
      certification_ids: lotCertificationIds,
      internal_producer_ids: lotInternalProducerIds,
      association_id: (lot as any).association_id || "",
      sensory_type: (lot as any).sensory_type || "nota",
      fragrance_score: Number(lot.fragrance_score) || 5,
      flavor_score: Number(lot.flavor_score) || 5,
      finish_score: Number(lot.finish_score) || 5,
      acidity_score: Number(lot.acidity_score) || 5,
      body_score: Number(lot.body_score) || 5,
      sensory_notes: lot.sensory_notes || "",
      lot_observations: (lot as any).lot_observations || "",
      youtube_video_url: (lot as any).youtube_video_url || "",
      video_delay_seconds: (lot as any).video_delay_seconds || 10,
      video_description: (lot as any).video_description || "",
      latitude: (lot as any).latitude?.toString() || "",
      longitude: (lot as any).longitude?.toString() || "",
      property_name: (lot as any).property_name || "",
      property_description: (lot as any).property_description || "",
      altitude: (lot as any).altitude?.toString() || "",
      average_temperature: (lot as any).average_temperature?.toString() || "",
      address: (lot as any).address || "",
      city: (lot as any).city || "",
      state: (lot as any).state || "",
      cep: (lot as any).cep || "",
      address_internal_only: (lot as any).address_internal_only || false,
      photos: (lot as any).photos || [],
      characteristics: rawCharacteristics.map((c: any) => ({
        characteristic_id: c.characteristic_id,
        value: c.value
      })),
      sensory_analysis: rawSensory.map((s: any) => ({
        sensory_attribute_id: s.sensory_attribute_id,
        value: Number(s.value)
      })),
      components: rawComponents.map((c: any) => ({
        id: c.id,
        component_name: c.component_name || "",
        component_variety: c.component_variety || "",
        component_percentage: c.component_percentage || 0,
        component_quantity: c.component_quantity || 0,
        component_unit: c.component_unit || "g",
        component_origin: c.component_origin || "",
        producer_id: c.producer_id,
        component_harvest_year: c.component_harvest_year || "",
        association_id: c.association_id,
        latitude: c.latitude,
        longitude: c.longitude,
        altitude: c.altitude,
        property_name: c.property_name,
        property_description: c.property_description,
        photos: c.photos || [],
        address: c.address,
        city: c.city,
        state: c.state,
        cep: c.cep
      })),
    });
    setIsBlendMode(rawComponents.length > 0);
    setCurrentStep(1);
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!tenant) return;
    try {
      // Validações obrigatórias
      if (!formData.name || !formData.category) {
        toast.error("Preencha os campos obrigatórios (Nome e Categoria)!");
        return;
      }

      if (!isBlendMode && !formData.producer_id) {
        toast.error(`Selecione um(a) ${labels.producer.toLowerCase()}!`);
        return;
      }

      if (!formData.code) {
        toast.error("O código do lote é obrigatório!");
        return;
      }

      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        seals_quantity: formData.seals_quantity ? parseInt(formData.seals_quantity) : null,
        latitude: formData.latitude ? (typeof formData.latitude === 'string' ? parseFloat(formData.latitude) : formData.latitude) : null,
        longitude: formData.longitude ? (typeof formData.longitude === 'string' ? parseFloat(formData.longitude) : formData.longitude) : null,
        altitude: formData.altitude ? (typeof formData.altitude === 'string' ? parseInt(formData.altitude) : formData.altitude) : null,
        average_temperature: formData.average_temperature ? (typeof formData.average_temperature === 'string' ? parseFloat(formData.average_temperature) : formData.average_temperature) : null,
        producer_id: isBlendMode ? null : formData.producer_id,
        harvest_year: formData.harvest_year || null,
        unit: formData.unit || null,
        variety: formData.variety || null,
        tenant_id: tenant.id
      };

      // Remover campos que não existem na tabela product_lots
      const { 
        components, characteristics, sensory_analysis, industry_ids,
        certification_ids, internal_producer_ids,
        selectedPropertyId, user_has_set_coordinates, location_reference,
        ...cleanLotData 
      } = lotData;
      
      // Garantir que campos obrigatórios estão presentes
      if (!cleanLotData.code) {
        toast.error("Código do lote é obrigatório!");
        return;
      }
      
      if (!cleanLotData.name) {
        toast.error("Nome do lote é obrigatório!");
        return;
      }

      // Garantir que campos numéricos são números ou null
      if (cleanLotData.quantity !== null && cleanLotData.quantity !== undefined && isNaN(Number(cleanLotData.quantity))) {
        cleanLotData.quantity = null;
      }
      if (cleanLotData.seals_quantity !== null && cleanLotData.seals_quantity !== undefined && isNaN(Number(cleanLotData.seals_quantity))) {
        cleanLotData.seals_quantity = null;
      }
      if (cleanLotData.latitude !== null && cleanLotData.latitude !== undefined && isNaN(Number(cleanLotData.latitude))) {
        cleanLotData.latitude = null;
      }
      if (cleanLotData.longitude !== null && cleanLotData.longitude !== undefined && isNaN(Number(cleanLotData.longitude))) {
        cleanLotData.longitude = null;
      }
      if (cleanLotData.altitude !== null && cleanLotData.altitude !== undefined && isNaN(Number(cleanLotData.altitude))) {
        cleanLotData.altitude = null;
      }
      if (cleanLotData.average_temperature !== null && cleanLotData.average_temperature !== undefined && isNaN(Number(cleanLotData.average_temperature))) {
        cleanLotData.average_temperature = null;
      }

      if (editingLot) {
        await productLotsApi.update(editingLot.id, tenant.id, cleanLotData as any);
        if (editingLot.id) {
          // Atualizar componentes
          await productLotsApi.deleteComponentsByLot(editingLot.id, tenant.id);
          if (isBlendMode && components.length > 0) {
            await Promise.all(components.map(c => productLotsApi.createComponent({ ...c, lot_id: editingLot.id, tenant_id: tenant.id })));
          }

          // Atualizar características
          await productLotCharacteristicsApi.deleteByLot(editingLot.id, tenant.id);
          if (characteristics && characteristics.length > 0) {
            await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: editingLot.id, tenant_id: tenant.id })));
          }

          // Atualizar análise sensorial
          await productLotSensoryApi.deleteByLot(editingLot.id, tenant.id);
          if (sensory_analysis && sensory_analysis.length > 0) {
            await Promise.all(sensory_analysis.map(s => productLotSensoryApi.create({ ...s, lot_id: editingLot.id, tenant_id: tenant.id })));
          }

          // Sincronizar indústrias vinculadas
          if (industry_ids && industry_ids.length > 0) {
            await lotIndustriesApi.syncLotIndustries(editingLot.id, industry_ids, tenant.id);
          } else {
            await lotIndustriesApi.syncLotIndustries(editingLot.id, [], tenant.id);
          }

          // Sincronizar certificações vinculadas
          await certificationsApi.syncLotCertifications(
            editingLot.id, 
            certification_ids || [], 
            tenant.id
          );

          // Sincronizar produtores internos vinculados
          await internalProducersApi.syncLotProducers(
            editingLot.id,
            internal_producer_ids || [],
            tenant.id
          );
        }
        toast.success("Lote atualizado com sucesso!");
      } else {
        // NEW LOT
        let finalCode = formData.code;
        const config = await systemConfigApi.getLotIdConfig(tenant.id);
        
        // Se estiver em modo automático ou produtor/marca, e o código atual parecer ser o sugerido (não alterado manualmente)
        // ou se o usuário simplesmente quer usar o próximo disponível
        if (config.mode !== 'manual' && formData.code) {
          const { generateLotCode } = await import("@/utils/lot-code-generator");
          let prefix = "";
          if (config.mode === 'producer_brand') {
            const producer = producers.find(p => p.id === formData.producer_id);
            if (producer) {
              if (formData.brand_id && formData.brand_id !== "none") {
                const brand = (await brandsApi.getByProducer(formData.producer_id, tenant.id)).find(b => b.id === formData.brand_id);
                if (brand) {
                  const { generateSlug } = await import("@/utils/slug-generator");
                  prefix = generateSlug(brand.name).toUpperCase();
                }
              } else {
                const { generateSlug } = await import("@/utils/slug-generator");
                prefix = generateSlug(producer.name).toUpperCase();
              }
            }
          }
          // Gera o código final e incrementa no banco
          finalCode = await generateLotCode(tenant.id, prefix || undefined, true);
        }

        const newLot = await productLotsApi.create({ ...cleanLotData, code: finalCode } as any);
        // Criar componentes
        if (isBlendMode && components.length > 0) {
          await Promise.all(components.map(c => productLotsApi.createComponent({ ...c, lot_id: newLot.id, tenant_id: tenant.id })));
        }
        // Criar características
        if (characteristics && characteristics.length > 0) {
          await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: newLot.id, tenant_id: tenant.id })));
        }
        // Criar análise sensorial
        if (sensory_analysis && sensory_analysis.length > 0) {
          await Promise.all(sensory_analysis.map(s => productLotSensoryApi.create({ ...s, lot_id: newLot.id, tenant_id: tenant.id })));
        }
        // Sincronizar indústrias vinculadas
        if (industry_ids && industry_ids.length > 0) {
          await lotIndustriesApi.syncLotIndustries(newLot.id, industry_ids, tenant.id);
        }
        // Sincronizar certificações vinculadas
        if (certification_ids && certification_ids.length > 0) {
          await certificationsApi.syncLotCertifications(newLot.id, certification_ids, tenant.id);
        }
        // Sincronizar produtores internos vinculados
        if (internal_producer_ids && internal_producer_ids.length > 0) {
          await internalProducersApi.syncLotProducers(newLot.id, internal_producer_ids, tenant.id);
        }
        toast.success("Lote registrado com sucesso!");
      }

      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Erro ao salvar lote:", error);
      const errorMessage = error?.message || error?.error?.message || "Erro desconhecido ao salvar lote";
      toast.error(`Erro ao salvar lote: ${errorMessage}`);
    }
  };

  const confirmDelete = async () => {
    if (!lotToDelete || !tenant) return;
    try {
      await productLotsApi.deleteComponentsByLot(lotToDelete, tenant.id);
      await productLotsApi.delete(lotToDelete, tenant.id);
      toast.success("Lote removido!");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover lote");
    } finally {
      setLotToDelete(null);
    }
  };

  // Handlers para offcanvas de detalhes do lote
  const handleLotClick = async (lot: ProductLot) => {
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
        const url = await generateQRCodeUrl(details.code, details.category, tenant?.slug);
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
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      
      img.onload = async () => {
        try {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasSize, canvasSize);
          ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
          
          if (brandingConfig?.logoUrl) {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            
            logoImg.onload = () => {
              try {
                const logoSize = (baseSize * 0.2) * scale;
                const logoX = (canvasSize - logoSize) / 2;
                const logoY = (canvasSize - logoSize) / 2;
                
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                
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
              } catch (error) {
                console.error("Erro ao desenhar logo:", error);
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
            
            logoImg.src = brandingConfig.logoUrl;
          } else {
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

  const filteredLots = lots.filter(lot => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      lot.name.toLowerCase().includes(search) ||
      lot.code.toLowerCase().includes(search) ||
      lot.producers?.name.toLowerCase().includes(search);
    const matchesCategory = categoryFilter === "todas" || lot.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(lots.map(l => l.category).filter(Boolean)));

  const TableSkeleton = () => (
    <div className="space-y-4">
      {Array(6).fill(0).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-50">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Package size={32} style={{ color: primaryColor }} weight="fill" />
              Gestão de Lotes
            </h2>
            <p className="text-slate-500 font-medium text-sm">Controle e rastreabilidade total da produção.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold gap-2 text-slate-600 border-slate-200">
              <Export size={18} weight="bold" /> Exportar
            </Button>
            <Button 
              onClick={handleOpenSheet} 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg transition-all gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Novo Lote
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome, código ou produtor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-0 rounded-xl font-medium focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger 
                    className="w-full sm:w-56 h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 focus:ring-primary"
                    style={{ '--primary': primaryColor } as any}
                  >
                    <div className="flex items-center gap-2">
                      <FunnelSimple size={18} weight="bold" style={{ color: primaryColor }} />
                      <SelectValue placeholder="Categoria" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="todas" className="font-bold">Todas Categorias</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat!} className="font-medium">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main List */}
        <div className="space-y-4">
          {loading ? (
            <TableSkeleton />
          ) : filteredLots.length === 0 ? (
            <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package size={48} className="text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum lote encontrado</h3>
              <p className="text-slate-400 font-medium">Não há registros para los filtros selecionados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLots.map((lot) => (
                <Card 
                  key={lot.id} 
                  className="group border-0 shadow-sm bg-white rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => handleLotClick(lot)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">
                      <div className="flex flex-1 items-center gap-5 text-left">
                        <div className="relative flex-shrink-0">
                          <div 
                            className="h-20 w-20 rounded-2xl flex items-center justify-center border-2 border-slate-200 bg-slate-50 group-hover:border-slate-300 group-hover:bg-slate-100 transition-all duration-300"
                          >
                            <Package 
                              size={36} 
                              weight="regular" 
                              className="text-slate-400"
                            />
                          </div>
                          <div 
                            className="absolute -top-2 -left-2 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-tighter"
                            style={{ backgroundColor: (lot as any).lot_components?.length > 0 ? '#7c3aed' : primaryColor }}
                          >
                            {(lot as any).lot_components?.length > 0 ? 'BLEND' : 'UNICO'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-black text-slate-900 leading-none transition-colors group-hover:text-primary">{lot.name}</h4>
                            <Badge 
                              className="border-0 font-black text-[10px] uppercase rounded-md"
                              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                            >
                              {lot.category}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                            <Users size={16} weight="fill" className="text-slate-300" />
                            {lot.producers?.name || `${labels.producer} não vinculado(a)`}
                          </p>
                          <div className="flex items-center gap-4 pt-1 flex-wrap">
                            <span className="bg-slate-50 text-slate-500 text-[10px] font-black px-2 py-1 rounded-md border border-slate-100 uppercase tracking-widest font-mono">
                              {lot.code}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                              <MapPin size={14} weight="fill" className="text-slate-300" />
                              {lot.city && lot.state ? `${lot.city}, ${lot.state}` : lot.city || lot.state || "Local não inf."}
                            </span>
                            {lot.created_at && (
                              <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                                <Calendar size={14} weight="fill" className="text-slate-300" />
                                {new Date(lot.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-10 px-6 border-l border-slate-50 hidden xl:flex">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Volume</p>
                          <p className="text-sm font-black text-slate-700">{lot.quantity} {lot.unit}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Views</p>
                          <div className="flex items-center gap-1 justify-center">
                            <Eye size={14} weight="bold" className="text-blue-500" />
                            <p className="text-sm font-black text-slate-700">{lot.views || 0}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Selos</p>
                          <div className="flex items-center gap-1 justify-center">
                            <Tag size={14} weight="bold" className="text-amber-500" />
                            <p className="text-sm font-black text-slate-700">{(lot as any).seals_quantity || 0}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-l border-slate-50 pl-6" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="h-11 w-11 rounded-xl text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <a href={`/${tenant?.slug}/lote/${lot.code}`} target="_blank" rel="noreferrer">
                            <ArrowRight size={20} weight="bold" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400">
                              <DotsThreeOutlineVertical size={20} weight="fill" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-slate-100 shadow-xl p-1">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(lot);
                              }} 
                              className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer focus:bg-slate-50"
                            >
                              <PencilSimple size={18} weight="bold" style={{ color: primaryColor }} className="mr-2" /> Editar Lote
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setLotToDelete(lot.id);
                              }}
                              className="rounded-lg py-2.5 font-bold text-rose-600 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                            >
                              <Trash size={18} weight="bold" className="mr-2" /> Excluir Lote
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col bg-white">
              <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Package size={32} weight="fill" />
                    </div>
                    <div>
                      <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">
                        {editingLot ? "Editar Lote" : "Registrar Lote"}
                      </SheetTitle>
                      <SheetDescription className="text-slate-500 font-bold text-base">
                        {editingLot ? `Código: ${editingLot.code}` : "Configure os dados técnicos do produto."}
                      </SheetDescription>
                    </div>
                  </div>

                  <FormStepIndicator steps={LOT_STEPS} currentStep={currentStep} primaryColor={primaryColor} />
                </div>
              </SheetHeader>
              <div className="flex-1 relative flex flex-col min-h-0">
                <LotForm
                  tenantId={tenant?.id ?? ''}
                  formData={formData}
                  setFormData={setFormData}
                  producers={producers}
                  associations={associations}
                  industries={industries}
                  isBlendMode={isBlendMode}
                  setIsBlendMode={setIsBlendMode}
                  currentStep={currentStep}
                  setCurrentStep={setCurrentStep}
                  totalSteps={5}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsSheetOpen(false)}
                  isEditing={!!editingLot}
                  branding={branding}
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <AlertDialog open={!!lotToDelete} onOpenChange={() => setLotToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-slate-900">Confirmar Exclusão?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium">
                Esta ação não pode ser desfeita. O lote e seus componentes serão permanentemente removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 mt-4">
              <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="rounded-xl font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200">
                Sim, Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Offcanvas de Detalhes do Lote */}
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
                                  imageSettings={brandingConfig?.logoUrl ? {
                                    src: brandingConfig.logoUrl,
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
                                    <span className="text-sm font-bold text-slate-500">{char.characteristics?.name || char.name}</span>
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
                                          <Users size={20} className="text-slate-300" />
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
      </div>
    </AdminLayout>
  );
};

export default Lotes;
