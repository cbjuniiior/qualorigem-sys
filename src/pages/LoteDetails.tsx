import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShareNetwork, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productLotsApi, producersApi, systemConfigApi } from "@/services/api";
import type { ProductLot, LotComponent } from "@/services/api";

// Componentes refatorados
import { HeroSection } from "@/components/lote-details/HeroSection";
import { LotInfoSection } from "@/components/lote-details/LotInfoSection";
import { LotObservations } from "@/components/lote-details/LotObservations";
import { BlendComposition } from "@/components/lote-details/BlendComposition";
import { SensoryAnalysis } from "@/components/lote-details/SensoryAnalysis";
import { ProducersSection } from "@/components/lote-details/ProducersSection";

// Interface para compatibilidade com dados do Supabase
interface LoteData {
  id: string;
  code: string;
  name: string;
  category: string;
  image_url: string | null;
  variety?: string;
  harvest_year: string;
  quantity: number | null;
  unit: string | null;
  seals_quantity?: number | null;
  lot_observations?: string | null;
  youtube_video_url?: string | null;
  video_delay_seconds?: number | null;
  components?: LotComponent[];
  lot_components?: LotComponent[];
  producers?: {
    id: string;
    name: string;
    property_name: string;
    property_description: string | null;
    city: string;
    state: string;
    altitude: number | null;
    average_temperature: number | null;
    latitude?: string;
    longitude?: string;
    photos?: string[];
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
  const [videoConfig, setVideoConfig] = useState({ enabled: true, show_after_seconds: 3 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
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
        
        // Buscar dados do produtor se não for blend
        if (data.producer_id) {
          const producerData = await producersApi.getById(data.producer_id);
          setProducer(producerData);
        }
        
        // Buscar configuração de vídeo
        try {
          const config = await systemConfigApi.getVideoConfig();
          setVideoConfig(config);
        } catch (error) {
          console.log("Configuração de vídeo não encontrada, usando padrão");
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do lote:", error);
        setLoading(false);
      }
    };

    fetchLoteData();
  }, [codigo]);

  useEffect(() => {
    if (!producer) return;
    if (producer.latitude && producer.longitude) {
      setMapCoords({ lat: producer.latitude, lon: producer.longitude });
    }
  }, [producer]);

  // Timer para mostrar o botão de informações
  useEffect(() => {
    if (!loteData?.youtube_video_url || !videoConfig.enabled) return;

    const timer = setTimeout(() => {
      setShowInfoButton(true);
    }, videoConfig.show_after_seconds * 1000);

    return () => clearTimeout(timer);
  }, [loteData?.youtube_video_url, videoConfig]);

  // Timer para alternar para modo vídeo apenas
  useEffect(() => {
    if (!loteData?.youtube_video_url || !videoConfig.enabled) return;

    const timer = setTimeout(() => {
      setShowVideoOnly(true);
    }, (videoConfig.show_after_seconds + videoDelay) * 1000);

    return () => clearTimeout(timer);
  }, [loteData?.youtube_video_url, videoConfig, videoDelay]);

  // Countdown dinâmico
  useEffect(() => {
    if (!loteData?.youtube_video_url || !videoConfig.enabled || showVideoOnly) return;

    setCountdown(videoConfig.show_after_seconds);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowOverlay(true); // Mostrar overlay após o timer
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loteData?.youtube_video_url, videoConfig.enabled, showVideoOnly]);

  // Função para compartilhar
  const handleShare = async () => {
    if (navigator.share) {
    try {
      await navigator.share({
          title: loteData?.name || "Lote",
          text: `Confira este lote: ${loteData?.name}`,
        url: window.location.href,
      });
    } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  // Detectar se é um blend (precisa estar antes de qualquer return)
  const isBlend = loteData && ((loteData.components && loteData.components.length > 0) || (loteData.lot_components && loteData.lot_components.length > 0));
  const blendComponents = loteData ? (loteData.components || loteData.lot_components || []) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do lote...</p>
        </div>
      </div>
    );
  }

  if (!loteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lote não encontrado</h2>
          <p className="text-gray-600 mb-6">O código "{codigo}" não foi encontrado em nossa base de dados.</p>
          <Button onClick={() => navigate("/")} className="bg-gray-600 hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à busca
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Vídeo do YouTube - Seção em tela cheia */}
      {loteData.youtube_video_url && (
        <div className="w-full h-screen bg-black relative">
          {/* Vídeo principal com aspect ratio correto */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-6xl aspect-video">
              <iframe
                id="youtube-player"
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(loteData.youtube_video_url)}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&controls=1&enablejsapi=1&origin=${window.location.origin}`}
                title="Vídeo do Lote"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-2xl"
              ></iframe>
            </div>
          </div>
              
          {/* Overlay inicial com countdown compacto */}
          {!showVideoOnly && !showOverlay && (
            <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-20">
              <div className="text-center text-white">
                <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                  <p className="text-white/90 text-sm mb-2">
                    INFORMAÇÕES DISPONÍVEIS EM
                  </p>
                  <div className="text-4xl font-bold text-white mb-2">
                    {countdown}
                  </div>
                  <p className="text-white/80 text-xs uppercase tracking-wide">
                    SEGUNDOS
                  </p>
                  <div className="w-32 bg-white/20 rounded-full h-1 mt-3 mx-auto">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${((videoConfig.show_after_seconds - countdown) / videoConfig.show_after_seconds) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
                </div>
              )}
              
          {/* Overlay com informações do lote após o timer */}
          {!showVideoOnly && showOverlay && (
            <div className="absolute inset-0 flex flex-col">
              {/* Seção superior com elementos centralizados */}
              <div className="flex-1 relative flex items-center justify-center">
                {/* Botão "Ativar Som" centralizado */}
                <div className="text-center">
                  <button className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2">
                    <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[6px] border-l-black border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
                    </div>
                    Ativar Som
                  </button>
                  <p className="text-white text-sm mt-2">Clique para reproduzir com áudio</p>
                </div>
              </div>

              {/* Seção inferior com fundo preto - Tudo centralizado */}
              <div className="bg-black p-8 text-center">
                {/* Informações do produto centralizadas */}
                <div className="mb-8">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/20 inline-block">
                    <h2 className="text-white text-2xl font-bold mb-2">{loteData.name}</h2>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                        {loteData.category.toUpperCase()}
                      </span>
                      <span className="text-gray-300 text-sm">•</span>
                      <span className="text-gray-300 text-sm">Safra {loteData.harvest_year}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-white text-xl font-semibold mb-6 uppercase tracking-wide">
                  INFORMAÇÕES DISPONÍVEIS
                </h3>
                
                <Button
                  onClick={showLotInfo}
                  className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto mb-4"
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className="w-3 h-3 border-2 border-black rounded-sm"></div>
                    <div className="w-1 h-3 bg-black ml-0.5"></div>
                  </div>
                  Ver Informações do Lote
                </Button>
                
                <p className="text-gray-400 text-sm">
                  Explore detalhes técnicos, composição e características únicas deste lote
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Conteúdo principal da página - Oculto durante exibição do vídeo */}
      <div className={`transition-all duration-1000 ${showVideoOnly ? 'opacity-0 pointer-events-none overflow-hidden' : 'opacity-100'}`}>
        {/* Hero Section */}
        <HeroSection 
          loteData={loteData}
          isBlend={isBlend}
          blendComponentsCount={blendComponents.length}
          producerName={producer?.name}
        />
      
        {/* Faixa de ações */}
        <div className="bg-white border-b border-gray-100 -mt-2">
          <div className="container mx-auto px-6 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
              Compartilhe este lote
            </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="text-sm text-gray-400">
                  {loteData?.category}
                </div>
              </div>
              <div className="flex gap-2">
              <Button
                  variant="ghost"
                size="sm"
                onClick={handleShare}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm px-3 py-2 rounded-lg"
              >
                  <ShareNetwork className="h-4 w-4" />
                  <span>Compartilhar</span>
              </Button>
              <Button
                  variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("URL copiada para a área de transferência!");
                }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm px-3 py-2 rounded-lg"
              >
                  <Copy className="h-4 w-4" />
                  <span>Copiar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
        <div className={`container mx-auto px-4 py-8 max-w-6xl transition-all duration-1000 ${
        showVideoOnly && loteData.youtube_video_url 
          ? 'opacity-0 pointer-events-none overflow-hidden' 
          : 'opacity-100'
      }`}>
        {/* Referência para scroll - Seção de informações do produto */}
        <div ref={productDetailsRef} className="scroll-mt-4">
        
            {/* Seção Principal - Informações do Lote */}
            <LotInfoSection 
              loteData={loteData}
              isBlend={isBlend}
              blendComponents={blendComponents}
              producerName={producer?.name}
            />

            {/* Seção de Observações */}
            <LotObservations lotObservations={loteData.lot_observations} />

            {/* Seção de Composição do Blend */}
            {isBlend && (
              <BlendComposition 
                blendComponents={blendComponents}
                harvestYear={loteData.harvest_year}
                quantity={loteData.quantity}
                unit={loteData.unit}
              />
            )}

            {/* Seção de Produtores */}
            <ProducersSection 
              isBlend={isBlend}
              blendComponents={blendComponents}
              producer={producer}
            />

        {/* Análise Sensorial */}
            <SensoryAnalysis loteData={loteData} />
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoteDetails;