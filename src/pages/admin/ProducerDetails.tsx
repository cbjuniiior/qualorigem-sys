import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Phone, Mail, Mountain, Thermometer, ArrowLeft, Edit, Copy } from "lucide-react";
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
}

export default function ProducerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producer, setProducer] = useState<Producer | null>(null);
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    producersApi.getById(id)
      .then(setProducer)
      .catch(() => toast.error("Erro ao carregar produtor"))
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
          </DialogContent>
        </Dialog>
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10 animate-fade-in">
          {/* Carrossel de fotos com miniaturas e lightbox */}
          <div className="mb-8 flex flex-col items-center">
            {/* Carrossel principal */}
            <div className="relative w-full max-w-xs aspect-square flex items-center justify-center rounded-3xl shadow-lg bg-white overflow-hidden">
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow transition z-10"
                    onClick={() => setCarouselIndex((prev) => prev === 0 ? producer.photos.length - 1 : prev - 1)}
                    aria-label="Anterior"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow transition z-10"
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
                  className={`h-8 w-8 object-cover rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-sm ${carouselIndex === idx ? 'border-primary ring-2 ring-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
          {/* Dados principais */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">{producer.name}</h1>
              <Button size="icon" variant="ghost" onClick={() => navigate(-1)} title="Voltar">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => setEditing(true)} title="Editar">
                <Edit className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline" onClick={() => {navigator.clipboard.writeText(producer.id); toast.success('ID copiado!')}} title="Copiar ID">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <div className="text-lg text-gray-700 font-semibold">{producer.property_name}</div>
            <div className="text-gray-500 text-base">{producer.property_description}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700"><MapPin className="w-4 h-4 mr-1" />{producer.city}, {producer.state}</Badge>
              {producer.phone && <Badge variant="secondary" className="bg-green-100 text-green-700"><Phone className="w-4 h-4 mr-1" />{producer.phone}</Badge>}
              {producer.email && <Badge variant="secondary" className="bg-blue-100 text-blue-700"><Mail className="w-4 h-4 mr-1" />{producer.email}</Badge>}
              {producer.altitude && <Badge variant="secondary" className="bg-orange-100 text-orange-700"><Mountain className="w-4 h-4 mr-1" />{producer.altitude}m</Badge>}
              {producer.average_temperature && <Badge variant="secondary" className="bg-pink-100 text-pink-700"><Thermometer className="w-4 h-4 mr-1" />{producer.average_temperature}°C</Badge>}
            </div>
          </div>
        </div>
        {/* Cards de dados e mapa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in-up">
          <Card className="col-span-2 p-6 rounded-3xl shadow-md border bg-white flex flex-col gap-4">
            <div className="font-bold text-lg text-gray-900 mb-2">Sobre a Fazenda</div>
            <div className="text-gray-700 whitespace-pre-line">{producer.property_description || 'Sem descrição.'}</div>
            <div className="text-gray-600 text-sm mt-2">Cadastrado em: {new Date(producer.created_at).toLocaleDateString()}</div>
          </Card>
          <Card className="p-0 rounded-3xl shadow-md border bg-white flex flex-col overflow-hidden">
            <div className="font-bold text-lg text-gray-900 px-6 pt-6 pb-2">Localização</div>
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
                <div className="w-full h-full flex items-center justify-center text-gray-400">Localização não disponível</div>
              )}
              {mapCoords && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded shadow text-xs font-medium transition hover:bg-primary/90"
                >
                  Ver no Google Maps
                </a>
              )}
            </div>
          </Card>
        </div>
        {/* Lotes do produtor */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Lotes do Produtor</h2>
            {lots.length > 0 && <Badge variant="secondary" className="bg-blue-100 text-blue-700">{lots.length}</Badge>}
          </div>
          {lots.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Nenhum lote cadastrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {lots.map((lote) => (
                <Card key={lote.id} className="rounded-2xl p-6 shadow-sm border bg-white flex flex-col gap-2 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-2">
                    {lote.image_url && <img src={lote.image_url} alt={lote.name} className="w-16 h-16 object-cover rounded-xl border" />}
                    <div>
                      <div className="font-semibold text-lg text-gray-900">{lote.name}</div>
                      <div className="text-xs text-gray-500">Código: {lote.code} | Safra: {lote.harvest_year}</div>
                      <div className="text-xs text-gray-500">Categoria: {lote.category} | Variedade: {lote.variety}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    <Badge variant="outline" className="text-xs bg-white text-gray-700 border-gray-200">{lote.quantity} {lote.unit}</Badge>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">{lote.flavor_score?.toFixed(1) ?? "-"} Sabor</Badge>
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">{lote.fragrance_score?.toFixed(1) ?? "-"} Fragrância</Badge>
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">{lote.finish_score?.toFixed(1) ?? "-"} Finalização</Badge>
                    <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">{lote.acidity_score?.toFixed(1) ?? "-"} Acidez</Badge>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">{lote.body_score?.toFixed(1) ?? "-"} Corpo</Badge>
                  </div>
                  <div className="text-xs text-gray-400">ID: {lote.id}</div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 