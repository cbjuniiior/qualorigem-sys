import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Calendar, Scales, Thermometer, Mountains, Medal, ShareNetwork, Copy, Tag, Leaf, Quotes, Package, Percent } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { VideoPopup } from "@/components/VideoPopup";
import { productLotsApi, producersApi, systemConfigApi } from "@/services/api";
import type { ProductLot, LotComponent } from "@/services/api";
import { SlideshowLightbox } from 'lightbox.js-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "@/components/ui/radar-chart";

// Interface para compatibilidade com dados do Supabase
interface LoteData {
  id: string;
  code: string;
  name: string;
  image_url: string | null;
  variety?: string;
  harvest_year: string;
  quantity: number | null;
  unit: string | null;
  lot_observations?: string | null;
  components?: LotComponent[];
  producers: {
    id: string;
    name: string;
    property_name: string;
    property_description: string | null;
    city: string;
    state: string;
    altitude: number | null;
    average_temperature: number | null;
  };
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
}

const LoteDetails = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [loteData, setLoteData] = useState<LoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [producer, setProducer] = useState<any | null>(null);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoPopupOpen, setVideoPopupOpen] = useState(false);
  const [videoConfig, setVideoConfig] = useState({ enabled: true, show_after_seconds: 3 });
  const productDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLoteData = async () => {
      if (!codigo) return;
      
      try {
        const data = await productLotsApi.getByCode(codigo);
        setLoteData(data);
        productLotsApi.incrementViews(codigo).catch(() => {});
        
        // Carregar configurações do vídeo
        try {
          const config = await systemConfigApi.getVideoConfig();
          setVideoConfig(config);
          
          // Mostrar popup de vídeo se habilitado (com delay para evitar problemas)
          if (config.enabled) {
            setTimeout(() => {
              setVideoPopupOpen(true);
            }, 1000);
          }
        } catch (error) {
          console.error("Erro ao carregar configurações do vídeo:", error);
          // Fallback: mostrar vídeo mesmo com erro nas configurações
          setVideoPopupOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do lote:", error);
        toast.error("Erro ao carregar dados do lote");
      } finally {
        setLoading(false);
      }
    };

    fetchLoteData();
  }, [codigo]);

  useEffect(() => {
    if (loteData?.producers?.id) {
      producersApi.getById(loteData.producers.id).then(setProducer);
    }
  }, [loteData]);

  useEffect(() => {
    if (!producer) return;
    if (producer.latitude && producer.longitude) {
      setMapCoords({ lat: producer.latitude, lon: producer.longitude });
    } else if (producer.address || producer.city || producer.state) {
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
        .catch(() => setMapCoords(null));
    } else {
      setMapCoords(null);
    }
  }, [producer]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${loteData?.name} - Lote ${codigo}`,
        text: `Conheça a origem e qualidade deste produto com Indicação Geográfica`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  const handleSkipToContent = () => {
    setVideoPopupOpen(false);
    // Scroll suave para os detalhes do produto
    setTimeout(() => {
      if (productDetailsRef.current) {
        productDetailsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Definir sensorialData e notaGeral antes do return
  const sensorialData = {
    fragrancia: loteData?.fragrance_score ?? 0,
    sabor: loteData?.flavor_score ?? 0,
    finalizacao: loteData?.finish_score ?? 0,
    acidez: loteData?.acidity_score ?? 0,
    corpo: loteData?.body_score ?? 0,
  };
  const notaGeral = (
    sensorialData.fragrancia +
    sensorialData.sabor +
    sensorialData.finalizacao +
    sensorialData.acidez +
    sensorialData.corpo
  ) / 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do lote...</p>
        </div>
      </div>
    );
  }

  if (!loteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lote não encontrado</h2>
          <p className="text-gray-600 mb-6">O código "{codigo}" não foi encontrado em nossa base de dados.</p>
          <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à busca
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Video Popup */}
      <VideoPopup
        isOpen={videoPopupOpen}
        onClose={() => setVideoPopupOpen(false)}
        onSkipToContent={handleSkipToContent}
        showAfterSeconds={videoConfig.show_after_seconds}
      />
      {/* Hero com imagem de fundo desfocada e overlay */}
      <div className="relative w-full h-96 overflow-hidden">
        {/* Imagem de fundo desfocada */}
                 <div 
           className="absolute inset-0 w-full h-full bg-cover bg-center"
           style={{
             backgroundImage: `url(${loteData?.image_url || '/placeholder.svg'})`,
             filter: 'blur(8px) brightness(0.3)',
             transform: 'scale(1.1)'
           }}
         />
         
         {/* Overlay com gradiente mais sutil */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
         
         {/* Conteúdo sobreposto */}
         <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4">
           <Tag className="w-10 h-10 text-white mb-4 drop-shadow-lg" />
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
             {loteData?.name}
           </h1>
           <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-lg">
             {producer?.property_name}
           </p>
         </div>
      </div>
      
      {/* Faixa de ações */}
      <div className="bg-white border-b border-gray-100 shadow-sm -mt-2">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Compartilhe este lote
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-700 hover:text-green-700 border-gray-200 hover:border-green-300"
              >
                <ShareNetwork className="h-4 w-4" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("URL copiada para a área de transferência!");
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-green-700 border-gray-200 hover:border-green-300"
              >
                <Copy className="h-4 w-4" />
                Copiar URL
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Referência para scroll */}
        <div ref={productDetailsRef}></div>
        
        {/* Box de dados do produto/lote - 100% largura */}
        <Card className="border-green-100 shadow-lg mb-10 w-full">
          <CardContent className="p-8 w-full">
            <div className="flex flex-col md:flex-row gap-8 items-center w-full h-full">
              {/* Foto do produto à esquerda */}
              <div className="flex-shrink-0 flex items-stretch justify-center w-full md:w-64 h-full">
                <img
                  src={loteData.image_url || "/placeholder.svg"}
                  alt={loteData.name}
                  className="rounded-2xl shadow border bg-white object-cover w-full h-full"
                  style={{ aspectRatio: '1/1', height: '100%', width: '100%', display: 'block' }}
                />
              </div>
              {/* Cards de dados à direita */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {/* Card Lote */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-2xl shadow p-6 w-full h-full">
                  <Tag className="h-10 w-10 text-green-600 mb-2" />
                  <div className="text-lg font-bold text-gray-900">Lote</div>
                  <div className="text-base text-green-700 mt-1 font-mono">#{codigo}</div>
                </div>
                {/* Card Variedade */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-2xl shadow p-6 w-full h-full">
                  <Leaf className="h-10 w-10 text-green-600 mb-2" />
                  <div className="text-lg font-bold text-gray-900">Variedade</div>
                  <div className="text-base text-gray-700 mt-1">{loteData.variety || '-'}</div>
                </div>
                {/* Card Safra */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-2xl shadow p-6 w-full h-full">
                  <Calendar className="h-10 w-10 text-green-600 mb-2" />
                  <div className="text-lg font-bold text-gray-900">Safra</div>
                  <div className="text-base text-gray-700 mt-1">{loteData.harvest_year || '-'}</div>
                </div>
                {/* Card Quantidade */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-2xl shadow p-6 w-full h-full">
                  <Scales className="h-10 w-10 text-green-600 mb-2" />
                  <div className="text-lg font-bold text-gray-900">Quantidade</div>
                  <div className="text-base text-gray-700 mt-1">{loteData.quantity} {loteData.unit}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Observações do Lote */}
        {loteData?.lot_observations && (
          <Card className="border-green-100 shadow-lg mb-10 w-full">
            <CardContent className="p-8 w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Quotes className="h-6 w-6 text-green-600 mr-2" />
                Observações sobre o Lote
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {loteData.lot_observations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Seção de Componentes do Blend */}
        {loteData?.components && loteData.components.length > 0 && (
          <Card className="border-green-100 shadow-lg mb-10 w-full">
            <CardContent className="p-8 w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="h-6 w-6 text-green-600 mr-2" />
                Composição do Blend
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loteData.components.map((component, index) => (
                  <div key={component.id} className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{component.component_name}</h3>
                      {component.component_percentage && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Percent className="h-3 w-3 mr-1" />
                          {component.component_percentage}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {component.component_variety && (
                        <div>
                          <span className="font-medium">Variedade:</span> {component.component_variety}
                        </div>
                      )}
                      {component.component_quantity && component.component_unit && (
                        <div>
                          <span className="font-medium">Quantidade:</span> {component.component_quantity} {component.component_unit}
                        </div>
                      )}
                      {component.component_origin && (
                        <div>
                          <span className="font-medium">Origem:</span> {component.component_origin}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resumo do blend */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Resumo da Composição</h4>
                <p className="text-blue-800 text-sm">
                  Este produto é um blend especial composto por {loteData.components.length} componente(s) cuidadosamente selecionado(s), 
                  cada um contribuindo com suas características únicas para criar um perfil sensorial excepcional.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Box sobre a fazenda - 100% largura, inclui carrossel de imagens */}
        <Card className="border-green-100 shadow-lg mb-10 w-full">
          <CardContent className="p-8 w-full">
            {/* Título e subtítulo */}
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sobre a Fazenda</h2>
            <div className="text-xl font-semibold text-green-800 mb-1">{producer?.property_name}</div>
            {/* Badges em linha */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 flex items-center gap-1"><MapPin className="w-4 h-4 mr-1" />{producer?.city}, {producer?.state}</Badge>
              {producer?.altitude && <Badge variant="secondary" className="bg-orange-100 text-orange-700 flex items-center gap-1"><Mountains className="w-4 h-4 mr-1" />{producer.altitude}m</Badge>}
              {producer?.average_temperature && <Badge variant="secondary" className="bg-pink-100 text-pink-700 flex items-center gap-1"><Thermometer className="w-4 h-4 mr-1" />{producer.average_temperature}°C</Badge>}
            </div>
            {/* Descrição */}
            <div className="text-gray-700 text-lg mb-8 whitespace-pre-line">{producer?.property_description}</div>
            {/* Carrossel e Mapa em duas colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Carrossel de imagens - Coluna esquerda */}
              {producer?.photos?.length > 0 && (
                <div className="flex flex-col items-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 w-full">Galeria de Fotos</h3>
                  <div className="relative w-full aspect-video flex items-center justify-center rounded-3xl shadow-lg bg-white overflow-hidden group">
                    <img
                      src={producer.photos[lightboxIndex]}
                      alt={`Foto ${lightboxIndex + 1}`}
                      className="object-cover w-full h-full cursor-zoom-in transition-transform duration-200 hover:scale-105 rounded-3xl"
                      onClick={() => setLightboxOpen(true)}
                      loading="lazy"
                    />
                    {/* Setas de navegação */}
                    {producer.photos.length > 1 && (
                      <>
                        <button
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow transition z-10 opacity-0 group-hover:opacity-100"
                          onClick={() => setLightboxIndex((prev) => prev === 0 ? producer.photos.length - 1 : prev - 1)}
                          aria-label="Anterior"
                        >
                          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow transition z-10 opacity-0 group-hover:opacity-100"
                          onClick={() => setLightboxIndex((prev) => prev === producer.photos.length - 1 ? 0 : prev + 1)}
                          aria-label="Próxima"
                        >
                          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Miniaturas */}
                  <div className="flex gap-2 mt-4">
                    {producer.photos.map((photo: string, idx: number) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Miniatura ${idx + 1}`}
                        className={`h-12 w-20 object-cover rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-sm ${lightboxIndex === idx ? 'border-primary ring-2 ring-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        onClick={() => setLightboxIndex(idx)}
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
                      {producer.photos.map((photo: string, idx: number) => (
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
              )}
              
              {/* Mapa - Coluna direita */}
              <div className="flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Localização no Mapa</h3>
                <div className="w-full h-full min-h-[300px] relative rounded-2xl overflow-hidden shadow-lg">
                  {mapCoords ? (
                    <iframe
                      title="Mapa"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, minHeight: '300px' }}
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
                      className="absolute bottom-4 right-4 bg-green-700 text-white px-4 py-2 rounded shadow text-base font-semibold transition hover:bg-green-800 z-20"
                    >
                      Ver no Google Maps
                    </a>
                  )}
                  {/* Tooltip com endereço completo */}
                  {mapCoords && (
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs z-20">
                      <div className="text-sm font-semibold text-gray-900 mb-1">Endereço da Fazenda</div>
                      <div className="text-xs text-gray-700">
                        {producer?.property_name}<br />
                        {producer?.address}<br />
                        {producer?.city}, {producer?.state} - {producer?.zip_code}<br />
                        {producer?.country}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Análise Sensorial */}
        <Card className="rounded-3xl shadow-xl bg-white p-8 md:p-12 flex flex-col items-center gap-8 mt-12">
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg font-semibold text-green-700">Análise Premium</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Análise Sensorial</h2>
            <p className="text-gray-500 text-base mb-1">Veja como este lote se destaca nos principais atributos sensoriais</p>
            <span className="bg-green-600 text-white px-8 py-3 rounded-full text-4xl font-extrabold shadow-lg mb-0 animate-fade-in">{notaGeral.toFixed(1)}</span>
            <div className="text-xs text-center text-green-700 font-semibold mb-2">Média geral</div>
          </div>
          <div className="w-full flex justify-center items-center mb-2 mt-2">
            <div className="w-full max-w-xl">
              <SensorialRadarChart data={sensorialData} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 w-full animate-fade-in mt-2">
            <div className="flex flex-col items-center bg-green-50 rounded-2xl p-4 shadow group hover:bg-green-100 transition">
              <Medal className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-sm text-gray-700" title="Fragrância">Fragrância</span>
              <span className="text-2xl font-bold text-green-700">{loteData?.fragrance_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-2xl p-4 shadow group hover:bg-green-100 transition">
              <Leaf className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-sm text-gray-700" title="Sabor">Sabor</span>
              <span className="text-2xl font-bold text-green-700">{loteData?.flavor_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-2xl p-4 shadow group hover:bg-green-100 transition">
              <Calendar className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-sm text-gray-700" title="Finalização">Finalização</span>
              <span className="text-2xl font-bold text-green-700">{loteData?.finish_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-2xl p-4 shadow group hover:bg-green-100 transition">
              <Thermometer className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-sm text-gray-700" title="Acidez">Acidez</span>
              <span className="text-2xl font-bold text-green-700">{loteData?.acidity_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-2xl p-4 shadow group hover:bg-green-100 transition">
              <Scales className="h-6 w-6 text-green-600 mb-1" />
              <span className="text-sm text-gray-700" title="Corpo">Corpo</span>
              <span className="text-2xl font-bold text-green-700">{loteData?.body_score?.toFixed(1) ?? '-'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoteDetails;
