import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Calendar, Scales, Thermometer, Mountains, Medal, ShareNetwork, Copy, Tag, Leaf, Quotes, Package, Percent } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SensorialRadarChart } from "@/components/SensorialRadarChart";
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
  youtube_video_url?: string | null;
  video_delay_seconds?: number | null;
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
  const [showVideoOnly, setShowVideoOnly] = useState(false);
  const [showInfoButton, setShowInfoButton] = useState(false);
  const [videoDelay, setVideoDelay] = useState(10);
  const [videoStarted, setVideoStarted] = useState(false);
  const [producer, setProducer] = useState<any | null>(null);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoConfig, setVideoConfig] = useState({ enabled: true, show_after_seconds: 3 });
  const productDetailsRef = useRef<HTMLDivElement>(null);

  // Função para extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função para mostrar informações do lote e fazer scroll
  const showLotInfo = () => {
    setShowVideoOnly(false);
    setShowInfoButton(false);
    
    // Aguardar um pouco para a transição de opacidade terminar
    setTimeout(() => {
      if (productDetailsRef.current) {
        productDetailsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  useEffect(() => {
    const fetchLoteData = async () => {
      if (!codigo) return;
      
      try {
        const data = await productLotsApi.getByCode(codigo);
        setLoteData(data);
        productLotsApi.incrementViews(codigo).catch(() => {});
        
        // Configurar vídeo se existir
        if (data.youtube_video_url) {
          setShowVideoOnly(true);
          setVideoDelay(data.video_delay_seconds || 10);
          setVideoStarted(false);
          
          // Iniciar countdown imediatamente
          const delaySeconds = data.video_delay_seconds || 10;
          let currentDelay = delaySeconds;
          
          const countdown = setInterval(() => {
            currentDelay--;
            setVideoDelay(currentDelay);
            
            if (currentDelay <= 0) {
              clearInterval(countdown);
              // Após o tempo, mostrar botão e sair do modo fixo
              setShowInfoButton(true);
              setShowVideoOnly(false);
            }
          }, 1000);
        }
        
        // Carregar configurações do vídeo (fallback)
        try {
          const config = await systemConfigApi.getVideoConfig();
          setVideoConfig(config);
        } catch (error) {
          console.error("Erro ao carregar configurações do vídeo:", error);
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

  // Reiniciar vídeo com som quando botão for clicado
  useEffect(() => {
    if (videoStarted && loteData?.youtube_video_url) {
      const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
      if (iframe) {
        // Reiniciar vídeo do zero com som
        const newSrc = `https://www.youtube.com/embed/${getYouTubeVideoId(loteData.youtube_video_url)}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1&controls=1&enablejsapi=1&origin=${window.location.origin}`;
        iframe.src = newSrc;
      }
    }
  }, [videoStarted, loteData?.youtube_video_url]);


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
      {/* Vídeo do YouTube - Primeira seção da página */}
      {loteData.youtube_video_url && (
        <div className={`w-full bg-black ${showVideoOnly ? 'h-screen fixed top-0 left-0 z-50 overflow-hidden' : 'py-6 sm:py-8'}`}>
          {/* Container principal */}
          <div className={`w-full flex flex-col items-center justify-center relative px-4 sm:px-6 ${showVideoOnly ? 'h-full' : ''}`}>
            {/* Vídeo principal */}
            <div className="w-full max-w-6xl relative flex-1 flex items-center justify-center">
              <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl w-full">
                <iframe
                  id="youtube-player"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(loteData.youtube_video_url)}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&controls=1&enablejsapi=1&origin=${window.location.origin}`}
                  title="Vídeo do Lote"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              
              {/* Overlay com botão "Ativar som" */}
              {!videoStarted && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center px-4">
                  <div className="text-center">
                    <Button
                      onClick={() => setVideoStarted(true)}
                      size="lg"
                      className="bg-white/95 text-black hover:bg-white px-6 sm:px-8 py-4 sm:py-6 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3l144.08,88.14A15.74,15.74,0,0,1,240,128Z"/>
                      </svg>
                      Ativar Som
                    </Button>
                    <p className="text-white text-xs sm:text-sm opacity-90 px-4">
                      Clique para reproduzir com áudio
                    </p>
                  </div>
                </div>
              )}

              {/* Overlay com informações do lote */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 sm:from-black/60 via-transparent to-transparent pointer-events-none">
                <div className="absolute bottom-2 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6">
                  <div className="bg-black/30 sm:bg-black/40 backdrop-blur-sm sm:backdrop-blur-md rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-white/10">
                    <div className="text-white">
                      <h2 className="text-lg sm:text-3xl font-light mb-1 sm:mb-3 tracking-wide leading-tight">
                        {loteData.name}
                      </h2>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-200 font-medium">
                        <span className="uppercase tracking-wider bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">
                          {loteData.category}
                        </span>
                        <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                        <span>Safra {loteData.harvest_year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Controles dentro da viewport */}
            <div className="w-full max-w-6xl py-4 sm:py-8">
              {/* Botão para ver informações do lote */}
              {showInfoButton && (
                <div className="flex flex-col items-center gap-4 sm:gap-6 px-4">
                  <div className="text-center mb-2">
                    <p className="text-gray-300 text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4">
                      Informações disponíveis
                    </p>
                    <Button
                      onClick={showLotInfo}
                      size="lg"
                      className="bg-white/95 text-black hover:bg-white px-6 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:scale-105 min-w-[280px] sm:min-w-[300px] backdrop-blur-sm border border-white/20"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM32,64H224V192H32ZM64,152a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H72A8,8,0,0,1,64,152Zm0-32a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H72A8,8,0,0,1,64,120ZM184,176H136a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Zm0-32H136a8,8,0,0,1,0-16h48a8,8,0,0,1,0,16Z"/>
                      </svg>
                      Ver Informações do Lote
                    </Button>
                  </div>
                  <div className="w-24 sm:w-32 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  <p className="text-gray-400 text-xs sm:text-sm text-center max-w-xs sm:max-w-sm leading-relaxed px-2">
                    Explore detalhes técnicos, composição e características únicas deste lote
                  </p>
                </div>
              )}
              
              {/* Contador regressivo - Discreto */}
              {!showInfoButton && showVideoOnly && (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">
                      Informações disponíveis em
                    </p>
                    
                    <div className="relative">
                      <div className="text-2xl sm:text-3xl font-light text-white mb-1 tracking-tight">
                        {videoDelay}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider">
                        segundos
                      </div>
                    </div>
                    
                    {/* Barra de progresso minimalista */}
                    <div className="mt-4 w-32 sm:w-48 bg-gray-800 h-px overflow-hidden">
                      <div 
                        className="bg-white h-px transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${((loteData.video_delay_seconds || 10) - videoDelay) / (loteData.video_delay_seconds || 10) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      
      {/* Conteúdo principal da página - Oculto durante exibição do vídeo */}
      <div className={`transition-all duration-1000 ${showVideoOnly ? 'opacity-0 pointer-events-none overflow-hidden' : 'opacity-100'}`}>
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
           <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
             {loteData?.name}
           </h1>
           <p className="text-base sm:text-lg md:text-xl text-white/90 font-medium drop-shadow-lg">
             {producer?.property_name}
           </p>
         </div>
      </div>
      
        {/* Faixa de ações */}
      <div className="bg-white border-b border-gray-100 shadow-sm -mt-2">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Compartilhe este lote
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-green-700 border-gray-200 hover:border-green-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <ShareNetwork className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
                <span className="sm:hidden">Compartilhar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("URL copiada para a área de transferência!");
                }}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-green-700 border-gray-200 hover:border-green-300 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Copiar URL</span>
                <span className="sm:hidden">Copiar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className={`container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-4xl transition-all duration-1000 ${
        showVideoOnly && loteData.youtube_video_url 
          ? 'opacity-0 pointer-events-none overflow-hidden' 
          : 'opacity-100'
      }`}>
        {/* Referência para scroll - Seção de informações do produto */}
        <div ref={productDetailsRef} className="scroll-mt-4">
        
        {/* Box de dados do produto/lote - 100% largura */}
        <Card className="border-green-100 shadow-lg mb-6 sm:mb-10 w-full">
          <CardContent className="p-4 sm:p-8 w-full">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-center w-full h-full">
              {/* Foto do produto à esquerda */}
              <div className="flex-shrink-0 flex items-stretch justify-center w-full md:w-64 h-full">
                <img
                  src={loteData.image_url || "/placeholder.svg"}
                  alt={loteData.name}
                  className="rounded-xl sm:rounded-2xl shadow border bg-white object-cover w-full h-full"
                  style={{ aspectRatio: '1/1', height: '100%', width: '100%', display: 'block' }}
                />
              </div>
              {/* Cards de dados à direita */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-6 w-full">
                {/* Card Lote */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl sm:rounded-2xl shadow p-3 sm:p-6 w-full h-full">
                  <Tag className="h-6 w-6 sm:h-10 sm:w-10 text-green-600 mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-gray-900">Lote</div>
                  <div className="text-xs sm:text-base text-green-700 mt-1 font-mono">#{codigo}</div>
                </div>
                {/* Card Variedade */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl sm:rounded-2xl shadow p-3 sm:p-6 w-full h-full">
                  <Leaf className="h-6 w-6 sm:h-10 sm:w-10 text-green-600 mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-gray-900">Variedade</div>
                  <div className="text-xs sm:text-base text-gray-700 mt-1 text-center">{loteData.variety || '-'}</div>
                </div>
                {/* Card Safra */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl sm:rounded-2xl shadow p-3 sm:p-6 w-full h-full">
                  <Calendar className="h-6 w-6 sm:h-10 sm:w-10 text-green-600 mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-gray-900">Safra</div>
                  <div className="text-xs sm:text-base text-gray-700 mt-1">{loteData.harvest_year || '-'}</div>
                </div>
                {/* Card Quantidade */}
                <div className="flex flex-col items-center justify-center bg-green-50 rounded-xl sm:rounded-2xl shadow p-3 sm:p-6 w-full h-full">
                  <Scales className="h-6 w-6 sm:h-10 sm:w-10 text-green-600 mb-1 sm:mb-2" />
                  <div className="text-sm sm:text-lg font-bold text-gray-900">Quantidade</div>
                  <div className="text-xs sm:text-base text-gray-700 mt-1 text-center">{loteData.quantity} {loteData.unit}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Observações do Lote */}
        {loteData?.lot_observations && (
          <Card className="border-green-100 shadow-lg mb-6 sm:mb-10 w-full">
            <CardContent className="p-4 sm:p-8 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                <Quotes className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mr-2" />
                Observações sobre o Lote
              </h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                {loteData.lot_observations}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Seção de Componentes do Blend - Design Premium */}
        {loteData?.components && loteData.components.length > 0 && (
          <Card className="border-green-100 shadow-xl mb-6 sm:mb-10 w-full overflow-hidden">
            <CardContent className="p-0 w-full">
              {/* Header com gradiente */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center">
                      <Package className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                Composição do Blend
              </h2>
                    <p className="text-green-100 text-sm sm:text-lg">
                      {loteData.components.length} componente{loteData.components.length > 1 ? 's' : ''} cuidadosamente selecionado{loteData.components.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-4xl font-bold">100%</div>
                    <div className="text-green-100 text-xs sm:text-sm">Composição Total</div>
                  </div>
                </div>
              </div>

              {/* Componentes com design premium */}
              <div className="p-4 sm:p-8">
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loteData.components.map((component, index) => (
                    <div key={component.id} className="group relative bg-gradient-to-br from-white to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      {/* Número do componente */}
                      <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      
                      {/* Header do componente */}
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{component.component_name}</h3>
                      {component.component_percentage && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${component.component_percentage}%` }}
                              ></div>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800 font-bold text-xs">
                          {component.component_percentage}%
                        </Badge>
                          </div>
                      )}
                    </div>
                    
                      {/* Detalhes do componente */}
                      <div className="space-y-2 sm:space-y-3">
                        {component.producer_id && (component as any).producers && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                            <Leaf className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Produtor</div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{(component as any).producers.name} — {(component as any).producers.property_name}</div>
                            </div>
                          </div>
                        )}
                        {component.association_id && (component as any).associations && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                            <Medal className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Associação/Cooperativa</div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{(component as any).associations.name}</div>
                            </div>
                          </div>
                        )}
                        {component.component_harvest_year && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Safra do Componente</div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{component.component_harvest_year}</div>
                            </div>
                          </div>
                        )}
                      {component.component_variety && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                            <Tag className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                        <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Variedade</div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{component.component_variety}</div>
                            </div>
                        </div>
                      )}
                        
                      {component.component_quantity && component.component_unit && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                            <Scales className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                        <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Quantidade</div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{component.component_quantity} {component.component_unit}</div>
                            </div>
                        </div>
                      )}
                        
                      {component.component_origin && (
                          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                        <div>
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Origem</div>
                              <div className="font-semibold text-gray-900 text-sm sm:text-base">{component.component_origin}</div>
                            </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
                {/* Resumo do blend com design premium */}
                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-blue-900 mb-2">Blend Artesanal</h4>
                      <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                        Este produto é um blend especial composto por <strong>{loteData.components.length} componente{loteData.components.length > 1 ? 's' : ''}</strong> cuidadosamente selecionado{loteData.components.length > 1 ? 's' : ''}, 
                        cada um contribuindo com suas características únicas para criar um perfil sensorial excepcional e uma experiência gastronômica inigualável.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estatísticas do blend */}
                <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg sm:rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-green-700">{loteData.components.length}</div>
                    <div className="text-xs sm:text-sm text-green-600 font-medium">Componentes</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-blue-700">100%</div>
                    <div className="text-xs sm:text-sm text-blue-600 font-medium">Composição</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-purple-700">{loteData.harvest_year}</div>
                    <div className="text-xs sm:text-sm text-purple-600 font-medium">Safra</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-orange-50 rounded-lg sm:rounded-xl">
                    <div className="text-xl sm:text-2xl font-bold text-orange-700">{loteData.quantity}</div>
                    <div className="text-xs sm:text-sm text-orange-600 font-medium">{loteData.unit}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Box sobre a fazenda - 100% largura, inclui carrossel de imagens */}
        <Card className="border-green-100 shadow-lg mb-6 sm:mb-10 w-full">
          <CardContent className="p-4 sm:p-8 w-full">
            {/* Título e subtítulo */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Sobre a Fazenda</h2>
            <div className="text-base sm:text-lg font-semibold text-green-800 mb-1">{producer?.property_name}</div>
            {/* Badges em linha */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 items-center">
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 flex items-center gap-1 text-xs sm:text-sm"><MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{producer?.city}, {producer?.state}</Badge>
              {producer?.altitude && <Badge variant="secondary" className="bg-orange-100 text-orange-700 flex items-center gap-1 text-xs sm:text-sm"><Mountains className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{producer.altitude}m</Badge>}
              {producer?.average_temperature && <Badge variant="secondary" className="bg-pink-100 text-pink-700 flex items-center gap-1 text-xs sm:text-sm"><Thermometer className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{producer.average_temperature}°C</Badge>}
            </div>
            {/* Descrição */}
            <div className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 whitespace-pre-line">{producer?.property_description}</div>
            {/* Carrossel e Mapa em duas colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-10">
              {/* Carrossel de imagens - Coluna esquerda */}
              {producer?.photos?.length > 0 && (
                <div className="flex flex-col items-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 w-full">Galeria de Fotos</h3>
                  <div className="relative w-full aspect-video flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-lg bg-white overflow-hidden group">
                    <img
                      src={producer.photos[lightboxIndex]}
                      alt={`Foto ${lightboxIndex + 1}`}
                      className="object-cover w-full h-full cursor-zoom-in transition-transform duration-200 hover:scale-105 rounded-2xl sm:rounded-3xl"
                      onClick={() => setLightboxOpen(true)}
                      loading="lazy"
                    />
                    {/* Setas de navegação */}
                    {producer.photos.length > 1 && (
                      <>
                        <button
                          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-1.5 sm:p-2 shadow transition z-10 opacity-0 group-hover:opacity-100"
                          onClick={() => setLightboxIndex((prev) => prev === 0 ? producer.photos.length - 1 : prev - 1)}
                          aria-label="Anterior"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full p-1.5 sm:p-2 shadow transition z-10 opacity-0 group-hover:opacity-100"
                          onClick={() => setLightboxIndex((prev) => prev === producer.photos.length - 1 ? 0 : prev + 1)}
                          aria-label="Próxima"
                        >
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Miniaturas */}
                  <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                    {producer.photos.map((photo: string, idx: number) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Miniatura ${idx + 1}`}
                        className={`h-10 w-16 sm:h-12 sm:w-20 object-cover rounded-md sm:rounded-lg border-2 transition-all duration-200 cursor-pointer shadow-sm ${lightboxIndex === idx ? 'border-primary ring-2 ring-primary' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Localização no Mapa</h3>
                <div className="w-full h-full min-h-[250px] sm:min-h-[300px] relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  {mapCoords ? (
                    <iframe
                      title="Mapa"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0, minHeight: '250px' }}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapCoords.lon) - 0.01}%2C${Number(mapCoords.lat) - 0.01}%2C${Number(mapCoords.lon) + 0.01}%2C${Number(mapCoords.lat) + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">Localização não disponível</div>
                  )}
                  {mapCoords && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-green-700 text-white px-2 py-1 sm:px-4 sm:py-2 rounded shadow text-xs sm:text-base font-semibold transition hover:bg-green-800 z-20"
                    >
                      Ver no Google Maps
                    </a>
                  )}
                  {/* Tooltip com endereço completo */}
                  {mapCoords && (
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 max-w-xs z-20">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-1">Endereço da Fazenda</div>
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
        <Card className="rounded-2xl sm:rounded-3xl shadow-xl bg-white p-4 sm:p-8 md:p-12 flex flex-col items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm sm:text-base font-semibold text-green-700">Análise Premium</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Análise Sensorial</h2>
            <p className="text-gray-500 text-sm sm:text-base text-center">Veja como este lote se destaca nos principais atributos sensoriais</p>
            <span className="bg-green-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-full text-xl sm:text-2xl font-extrabold shadow-lg animate-fade-in">{notaGeral.toFixed(1)}</span>
            <div className="text-xs text-center text-green-700 font-semibold">Média geral</div>
          </div>
          <div className="w-full flex justify-center items-center">
            <div className="w-full max-w-xl">
              <SensorialRadarChart data={sensorialData} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 w-full animate-fade-in">
            <div className="flex flex-col items-center bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow group hover:bg-green-100 transition">
              <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
              <span className="text-xs sm:text-sm text-gray-700" title="Fragrância">Fragrância</span>
              <span className="text-lg sm:text-xl font-bold text-green-700">{loteData?.fragrance_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow group hover:bg-green-100 transition">
              <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
              <span className="text-xs sm:text-sm text-gray-700" title="Sabor">Sabor</span>
              <span className="text-lg sm:text-xl font-bold text-green-700">{loteData?.flavor_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow group hover:bg-green-100 transition">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
              <span className="text-xs sm:text-sm text-gray-700" title="Finalização">Finalização</span>
              <span className="text-lg sm:text-xl font-bold text-green-700">{loteData?.finish_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow group hover:bg-green-100 transition">
              <Thermometer className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
              <span className="text-xs sm:text-sm text-gray-700" title="Acidez">Acidez</span>
              <span className="text-lg sm:text-xl font-bold text-green-700">{loteData?.acidity_score?.toFixed(1) ?? '-'}</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow group hover:bg-green-100 transition">
              <Scales className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mb-1" />
              <span className="text-xs sm:text-sm text-gray-700" title="Corpo">Corpo</span>
              <span className="text-lg sm:text-xl font-bold text-green-700">{loteData?.body_score?.toFixed(1) ?? '-'}</span>
            </div>
          </div>
        </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoteDetails;
