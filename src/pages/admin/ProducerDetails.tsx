import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi, associationsApi, systemConfigApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Envelope, Mountains, Thermometer, ArrowLeft, PencilSimple, Copy, QrCode, ArrowSquareOut, Buildings, Globe, EnvelopeSimple, Compass, MapTrifold, Package, Users, Plus, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { ProducerForm } from "./Produtores";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { SlideshowLightbox } from 'lightbox.js-react';
import { Checkbox } from "@/components/ui/checkbox";
import { hexToHsl } from "@/lib/utils";

interface Producer {
  id: string;
  name: string;
  document_number: string | null;
  phone: string | null;
  email: string | null;
  property_name: string;
  property_description: string | null;
  address: string | null;
  city: string;
  state: string;
  altitude: number | null;
  average_temperature: number | null;
  created_at: string;
  photos: string[];
  latitude: string | null;
  longitude: string | null;
  cep: string | null;
}

export default function ProducerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [associations, setAssociations] = useState<any[]>([]);
  const [allAssociations, setAllAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingAssociations, setEditingAssociations] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  const cssVariables = {
    '--primary': hexToHsl(primaryColor),
    '--secondary': hexToHsl(secondaryColor),
    '--accent': hexToHsl(accentColor),
    '--ring': hexToHsl(primaryColor),
  } as React.CSSProperties;

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
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      producersApi.getById(id),
      associationsApi.getByProducer(id),
      associationsApi.getAll()
    ])
      .then(([producerData, associationsData, allAssociationsData]) => {
        setProducer(producerData);
        setAssociations(associationsData);
        setAllAssociations(allAssociationsData);
      })
      .catch(() => toast.error("Erro ao carregar dados do produtor"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    productLotsApi.getByProducer(id).then(setLots);
  }, [id]);

  useEffect(() => {
    if (!producer) return;
    if (producer.latitude && producer.longitude) {
      setMapCoords({ lat: producer.latitude, lon: producer.longitude });
    } else if (producer.address || producer.city || producer.state) {
      setLoadingMap(true);
      const query = `${producer.address ? producer.address + ', ' : ''}${producer.city ? producer.city + ', ' : ''}${producer.state || ''}`;
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setMapCoords({ lat: data[0].lat, lon: data[0].lon });
          } else {
            setMapCoords(null);
          }
        })
        .catch(() => setMapCoords(null))
        .finally(() => setLoadingMap(false));
    } else {
      setMapCoords(null);
    }
  }, [producer]);

  const handleUpdate = async (data: any) => {
    try {
      await producersApi.update(producer!.id, data);
      toast.success("Produtor atualizado com sucesso!");
      setEditing(false);
      // Atualiza dados na tela
      setProducer({ ...producer!, ...data });
    } catch (error) {
      toast.error("Erro ao atualizar produtor");
    }
  };

  const handleAssociationToggle = async (associationId: string, isChecked: boolean) => {
    if (!producer) return;
    
    try {
      if (isChecked) {
        await associationsApi.addProducerToAssociation(producer.id, associationId);
        // Atualiza a lista local
        const association = allAssociations.find(a => a.id === associationId);
        if (association) {
          setAssociations(prev => [...prev, association]);
        }
        toast.success("Produtor adicionado à associação!");
      } else {
        await associationsApi.removeProducerFromAssociation(producer.id, associationId);
        // Atualiza a lista local
        setAssociations(prev => prev.filter(a => a.id !== associationId));
        toast.success("Produtor removido da associação!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar associações");
    }
  };

  if (loading || !producer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
        {/* Header premium com carrossel de fotos */}
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogContent className="max-w-3xl p-0 rounded-2xl shadow-2xl border-0 bg-[#f7f8fa] animate-fade-in">
            <div style={cssVariables} className="h-full">
              <DialogHeader className="px-8 pt-8 pb-2">
                <DialogTitle className="text-2xl font-bold text-gray-900">Editar Produtor</DialogTitle>
              </DialogHeader>
              <div className="px-8 pb-8">
                <ProducerForm
                  initialData={producer}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(false)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de edição de associações */}
        <Dialog open={editingAssociations} onOpenChange={setEditingAssociations}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <div style={cssVariables}>
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: primaryColor }} />
                  Gerenciar Associações
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Selecione as associações das quais este produtor faz parte:
              </div>
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
                {allAssociations.map((association) => {
                  const isAssociated = associations.some(a => a.id === association.id);
                  return (
                    <div key={association.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id={association.id}
                        checked={isAssociated}
                        onCheckedChange={(checked) => handleAssociationToggle(association.id, checked as boolean)}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        {association.logo_url && (
                          <img 
                            src={association.logo_url} 
                            alt="Logo" 
                            className="w-8 h-8 object-contain rounded border bg-white"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <label htmlFor={association.id} className="font-medium text-gray-900 cursor-pointer text-sm">
                            {association.name}
                          </label>
                          <div className="text-xs text-gray-500">
                            {association.type} • {association.city}, {association.state}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {allAssociations.length === 0 && (
                <div className="text-center text-gray-500 py-6">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhuma associação cadastrada no sistema.</p>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-3">
              <Button size="sm" onClick={() => setEditingAssociations(false)}>
                Fechar
              </Button>
            </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="flex flex-col md:flex-row items-center gap-10 mb-12 animate-fade-in">
          {/* Carrossel de fotos com miniaturas e lightbox */}
          <div className="flex flex-col items-center w-full md:w-auto">
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-3xl shadow-lg bg-white overflow-hidden flex items-center justify-center">
              <img
                src={producer?.photos?.[carouselIndex]}
                alt={`Foto ${carouselIndex + 1}`}
                className="object-cover w-full h-full cursor-zoom-in transition-transform duration-200 hover:scale-105"
                onClick={() => { setLightboxIndex(carouselIndex); setLightboxOpen(true); }}
                loading="lazy"
              />
              {/* Setas */}
              {producer?.photos?.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow transition z-10"
                    onClick={() => setCarouselIndex((prev) => prev === 0 ? producer.photos.length - 1 : prev - 1)}
                    aria-label="Anterior"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow transition z-10"
                    onClick={() => setCarouselIndex((prev) => prev === producer.photos.length - 1 ? 0 : prev + 1)}
                    aria-label="Próxima"
                  >
                    <span className="sr-only">Próxima</span>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </button>
                </>
              )}
            </div>
            {/* Miniaturas */}
            <div className="flex gap-2 mt-4">
              {producer?.photos?.map((photo: string, idx: number) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Miniatura ${idx + 1}`}
                  className={`h-10 w-10 object-cover rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-sm ${carouselIndex === idx ? 'ring-2' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  style={{ 
                    borderColor: carouselIndex === idx ? primaryColor : 'transparent',
                    '--tw-ring-color': primaryColor 
                  } as React.CSSProperties}
                  onClick={() => setCarouselIndex(idx)}
                  loading="lazy"
                />
              ))}
            </div>
            {/* Lightbox */}
            {lightboxOpen && (
              <SlideshowLightbox
                open={lightboxOpen}
                startingSlideIndex={lightboxIndex}
                onClose={() => setLightboxOpen(false)}
                className="z-[9999]"
                showThumbnails
                animateThumbnails
                imgAnimation="fade"
                roundedImages
                theme="day"
              >
                {producer?.photos?.map((photo: string, idx: number) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    className="object-contain max-h-[80vh] mx-auto"
                    loading="lazy"
                  />
                ))}
              </SlideshowLightbox>
            )}
          </div>
          {/* Dados principais do produtor */}
          <div className="flex-1 flex flex-col gap-4 w-full md:w-auto">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{producer.name}</h1>
              {/* Badge de total de visualizações de lotes */}
              {lots.length > 0 && (
                <span className="flex items-center gap-2 bg-gray-100 text-gray-600 rounded-full px-4 py-2 text-base font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-bold">{lots.reduce((acc, lote) => acc + (lote.views ?? 0), 0)}</span>
                  <span className="ml-1">Visualizações dos lotes</span>
                </span>
              )}
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => navigate(-1)} title="Voltar" className="border border-gray-200 hover:bg-gray-50">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => setEditing(true)} 
                  title="Editar" 
                  className="border border-gray-200 hover:bg-gray-50"
                  style={{ color: primaryColor }}
                >
                  <PencilSimple className="w-5 h-5" />
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => setEditingAssociations(true)} 
                  title="Editar Associações" 
                  className="border border-gray-200 hover:bg-gray-50"
                  style={{ color: primaryColor }}
                >
                  <Users className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={() => {navigator.clipboard.writeText(producer.id); toast.success('ID copiado!')}} title="Copiar ID" className="border border-gray-200 hover:bg-gray-50">
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-1">{producer.property_name}</div>
            <div className="text-gray-500 text-base max-w-3xl leading-relaxed">
              {producer.property_description && producer.property_description.length > 220
                ? producer.property_description.slice(0, 220) + '...'
                : producer.property_description}
            </div>
            {/* Badges de informações principais */}
            <div className="flex flex-wrap gap-3 mt-2">
              {producer.phone && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-xl shadow-none border"
                  style={{ 
                    backgroundColor: `${primaryColor}10`, 
                    color: primaryColor,
                    borderColor: `${primaryColor}30`
                  }}
                >
                  <Phone className="w-5 h-5" weight="duotone" /> {producer.phone}
                </Badge>
              )}
              {producer.email && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-xl shadow-none border"
                  style={{ 
                    backgroundColor: `${primaryColor}10`, 
                    color: primaryColor,
                    borderColor: `${primaryColor}30`
                  }}
                >
                  <Envelope className="w-5 h-5" weight="duotone" /> {producer.email}
                </Badge>
              )}
              {producer.altitude && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-xl shadow-none border"
                  style={{ 
                    backgroundColor: `${secondaryColor}10`, 
                    color: secondaryColor,
                    borderColor: `${secondaryColor}30`
                  }}
                >
                  <Mountains className="w-5 h-5" weight="duotone" /> {producer.altitude}m
                </Badge>
              )}
              {producer.average_temperature && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-2 px-4 py-2 text-base font-medium rounded-xl shadow-none border"
                  style={{ 
                    backgroundColor: `${accentColor}10`, 
                    color: accentColor,
                    borderColor: `${accentColor}30`
                  }}
                >
                  <Thermometer className="w-5 h-5" weight="duotone" /> {producer.average_temperature}°C
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Seção de Associações */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" />
              Associações
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setEditingAssociations(true)}
              className="flex items-center gap-1 text-sm hover:bg-gray-50"
              style={{ color: primaryColor }}
            >
              <Plus className="w-4 h-4" />
              Gerenciar
            </Button>
          </div>
          {associations.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" weight="duotone" />
              <p className="text-sm text-gray-500">Nenhuma associação vinculada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {associations.map((association) => (
                <Card key={association.id} className="group hover:shadow-md transition-shadow border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {association.logo_url ? (
                        <div className="w-12 h-12 border border-gray-200 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                          <img src={association.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-50">
                          <Users className="w-6 h-6 text-gray-400" weight="duotone" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{association.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              association.type === 'Cooperativa' 
                                ? 'bg-blue-50 text-blue-600' 
                                : association.type === 'Associação'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-50 text-gray-600'
                            }`}
                          >
                            {association.type}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" weight="duotone" />
                            {association.city}, {association.state}
                          </span>
                        </div>
                      </div>
                    </div>
                    {association.description && (
                      <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {association.description}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">ID: {association.id.slice(0, 8)}...</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs hover:bg-gray-50 h-6 px-2"
                        style={{ color: primaryColor }}
                        onClick={() => {
                          toast.info("Funcionalidade de detalhes em desenvolvimento");
                        }}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Cards de dados e mapa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in-up">
          <Card className="col-span-2 p-6 rounded-3xl shadow-md border bg-white flex flex-col gap-4">
            <div className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
              <Buildings className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" />
              Sobre a Fazenda
            </div>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">{producer.property_description || 'Sem descrição.'}</div>
            <div className="text-gray-600 text-sm mt-2 pt-4 border-t border-gray-100">Cadastrado em: {new Date(producer.created_at).toLocaleDateString()}</div>
          </Card>
          <Card className="p-0 rounded-3xl shadow-md border bg-white flex flex-col overflow-hidden">
            <div className="font-bold text-lg text-gray-900 px-6 pt-6 pb-2 flex items-center gap-2">
              <MapTrifold className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" />
              Localização
            </div>
            <div className="w-full h-56 relative">
              {loadingMap ? (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Carregando mapa...</div>
              ) : mapCoords ? (
                <iframe
                  title="Mapa"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapCoords.lon) - 0.01}%2C${Number(mapCoords.lat) - 0.01}%2C${Number(mapCoords.lon) + 0.01}%2C${Number(mapCoords.lat) + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <MapPin className="w-8 h-8 text-gray-300 mb-2" weight="duotone" />
                    <span>Localização não disponível</span>
                  </div>
                </div>
              )}
              {mapCoords && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 text-white px-3 py-1 rounded shadow text-xs font-medium transition hover:opacity-90 flex items-center gap-1"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ArrowSquareOut className="w-3 h-3" />
                  Ver no Google Maps
                </a>
              )}
            </div>
            {/* Dados de endereço com ícones */}
            <div className="px-6 pb-4 pt-4 text-gray-700 text-sm space-y-3">
              {producer.address && (
                <div className="flex items-center gap-3"><MapTrifold className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" /><span className="font-semibold">Endereço:</span> {producer.address}</div>
              )}
              <div className="flex items-center gap-3"><Buildings className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" /><span className="font-semibold">Cidade:</span> {producer.city}</div>
              <div className="flex items-center gap-3"><Globe className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" /><span className="font-semibold">Estado:</span> {producer.state}</div>
              {producer.cep && (
                <div className="flex items-center gap-3"><EnvelopeSimple className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" /><span className="font-semibold">CEP:</span> {producer.cep}</div>
              )}
              {mapCoords && (
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500"><Compass className="w-5 h-5" style={{ color: primaryColor }} weight="duotone" /><span className="font-semibold">Coordenadas:</span> {mapCoords.lat}, {mapCoords.lon}</div>
              )}
            </div>
          </Card>
        </div>
        {/* Lotes do produtor */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6" style={{ color: primaryColor }} weight="duotone" />
              Lotes do Produtor
            </h2>
            {lots.length > 0 && <Badge variant="secondary" className="bg-blue-50 text-blue-700">{lots.length}</Badge>}
          </div>
          {lots.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" weight="duotone" />
              <p className="text-gray-500">Nenhum lote cadastrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lots.map((lote) => {
                const publicUrl = `${window.location.origin}/lote/${lote.code}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(publicUrl)}`;
                return (
                  <a
                    key={lote.id}
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                    style={{ textDecoration: 'none' }}
                  >
                    <Card className="rounded-2xl shadow-md border bg-white overflow-hidden flex flex-col hover:shadow-xl transition-all cursor-pointer h-full">
                      {/* Imagem do lote com ações sobrepostas */}
                      <div className="relative w-full h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {lote.image_url ? (
                          <img src={lote.image_url} alt={lote.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-300" weight="duotone" />
                          </div>
                        )}
                        {/* Botões de ação sobre a imagem */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            className="p-2 rounded-full bg-white shadow hover:bg-gray-100 border flex items-center justify-center"
                            title="Abrir página pública do lote"
                            onClick={e => {
                              e.stopPropagation();
                              window.open(publicUrl, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            <ArrowSquareOut className="w-5 h-5" style={{ color: primaryColor }} />
                          </button>
                          <button
                            className="p-2 rounded-full bg-white shadow hover:bg-gray-100 border flex items-center justify-center"
                            title="Baixar QRCode"
                            onClick={e => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = qrUrl;
                              link.download = `qrcode-lote-${lote.code}.png`;
                              link.target = '_blank';
                              link.rel = 'noopener noreferrer';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <QrCode className="w-5 h-5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                      {/* Conteúdo principal */}
                      <div className="flex-1 flex flex-col gap-2 px-6 py-5">
                        <div className="font-extrabold text-2xl text-gray-900 mb-1 truncate group-hover:text-primary transition-colors" style={{ color: 'inherit' }}>{lote.name}</div>
                        <div className="text-sm text-gray-500 mb-1 truncate">
                          Código: <span className="font-medium text-gray-700">{lote.code}</span> | Safra: {lote.harvest_year}
                        </div>
                        <div className="text-sm text-gray-500 mb-1 truncate">
                          Categoria: {lote.category} {lote.variety && `| Variedade: ${lote.variety}`}
                        </div>
                        {/* Badge de visualizações */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {lote.views ?? 0} visualizações
                          </span>
                        </div>
                        {/* Badges sensoriais em barras */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-gray-100 text-gray-700 rounded-full px-4 py-1 text-sm font-semibold">{lote.quantity} {lote.unit}</span>
                          {lote.flavor_score && (
                            <span className="bg-green-50 text-green-700 rounded-full px-4 py-1 text-sm font-semibold border border-green-100">{lote.flavor_score.toFixed(1)} Sabor</span>
                          )}
                          {lote.fragrance_score && (
                            <span className="bg-yellow-50 text-yellow-700 rounded-full px-4 py-1 text-sm font-semibold border border-yellow-100">{lote.fragrance_score.toFixed(1)} Fragrância</span>
                          )}
                          {lote.finish_score && (
                            <span className="bg-blue-50 text-blue-700 rounded-full px-4 py-1 text-sm font-semibold border border-blue-100">{lote.finish_score.toFixed(1)} Finalização</span>
                          )}
                          {lote.acidity_score && (
                            <span className="bg-pink-50 text-pink-700 rounded-full px-4 py-1 text-sm font-semibold border border-pink-100">{lote.acidity_score.toFixed(1)} Acidez</span>
                          )}
                          {lote.body_score && (
                            <span className="bg-purple-50 text-purple-700 rounded-full px-4 py-1 text-sm font-semibold border border-purple-100">{lote.body_score.toFixed(1)} Corpo</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">ID: {lote.id}</div>
                      </div>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 