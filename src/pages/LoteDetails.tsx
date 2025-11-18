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
  const [producer, setProducer] = useState<any | null>(null);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  } | null>(null);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const productDetailsRef = useRef<HTMLDivElement>(null);
  
  // Estados para controle do vídeo
  const [videoMuted, setVideoMuted] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [showTimer, setShowTimer] = useState(true);
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [isVideoFloating, setIsVideoFloating] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const floatingIframeRef = useRef<HTMLIFrameElement>(null);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const mainPlayerRef = useRef<any>(null);
  const floatingPlayerRef = useRef<any>(null);
  const isSyncingRef = useRef(false);
  const mainPlayerReadyRef = useRef(false);
  const floatingPlayerReadyRef = useRef(false);

  // Função para extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Função helper para verificar se o player está pronto e anexado ao DOM
  const isPlayerReady = (player: any, readyRef: React.MutableRefObject<boolean>): boolean => {
    if (!player || !readyRef.current) return false;
    
    try {
      // Verificar se o player tem os métodos necessários
      if (typeof player.getCurrentTime !== 'function') return false;
      
      // Tentar obter o tempo atual - se falhar, o player não está pronto
      const time = player.getCurrentTime();
      if (isNaN(time) && time !== 0) return false;
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // Função para ativar som e recomeçar o vídeo
  const handleActivateSound = () => {
    if (!loteData?.youtube_video_url) return;
    
    const videoId = getYouTubeVideoId(loteData.youtube_video_url);
    if (!videoId) return;
    
    // Atualizar o estado de mute primeiro (isso fará o overlay desaparecer)
    setVideoMuted(false);
    
    // Se a API do YouTube estiver disponível, usar ela para reiniciar
    if (isPlayerReady(mainPlayerRef.current, mainPlayerReadyRef)) {
      try {
        mainPlayerRef.current.seekTo(0, true);
        mainPlayerRef.current.unMute();
        mainPlayerRef.current.playVideo();
      } catch (error) {
        console.error('Erro ao reiniciar vídeo com API:', error);
      }
    } else if (iframeRef.current) {
      // Fallback: atualizar src do iframe
      const newSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1&controls=1&enablejsapi=1&origin=${window.location.origin}&start=0`;
      iframeRef.current.src = newSrc;
    }
  };

  // Função para fazer scroll até as informações do lote
  const showLotInfo = () => {
    if (productDetailsRef.current) {
      productDetailsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Carregar branding
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const brandingConfig = await systemConfigApi.getBrandingConfig();
        setBranding({
          primaryColor: brandingConfig.primaryColor,
          secondaryColor: brandingConfig.secondaryColor,
          accentColor: brandingConfig.accentColor,
          logoUrl: brandingConfig.logoUrl,
        });
      } catch (error) {
        console.error('Erro ao carregar branding:', error);
        // Usar cores padrão em caso de erro
        setBranding({
          primaryColor: '#16a34a',
          secondaryColor: '#22c55e',
          accentColor: '#10b981',
          logoUrl: null,
        });
      }
    };
    loadBranding();
  }, []);

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
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do lote:", error);
        setLoading(false);
      }
    };

    fetchLoteData();
  }, [codigo]);

  // Resetar countdown quando o vídeo é carregado
  useEffect(() => {
    if (loteData?.youtube_video_url && videoMuted) {
      setCountdown(10);
      setShowTimer(true);
      setShowInfoMessage(false);
    }
  }, [loteData?.youtube_video_url, videoMuted]);

  // Inicializar players do YouTube quando os divs estiverem prontos
  useEffect(() => {
    if (!loteData?.youtube_video_url) return;

    const videoId = getYouTubeVideoId(loteData.youtube_video_url);
    if (!videoId) return;

    // Resetar flags
    mainPlayerReadyRef.current = false;

    // Aguardar a API do YouTube estar disponível
    const initMainPlayer = () => {
      if (typeof (window as any).YT === 'undefined' || typeof (window as any).YT.Player === 'undefined') {
        setTimeout(initMainPlayer, 100);
        return;
      }

      // Destruir player anterior se existir
      if (mainPlayerRef.current) {
        try {
          if (typeof mainPlayerRef.current.destroy === 'function') {
            mainPlayerRef.current.destroy();
          }
        } catch (error) {
          console.error('Erro ao destruir player anterior:', error);
        }
        mainPlayerRef.current = null;
      }

      // Inicializar player principal
      if (iframeRef.current && document.getElementById('youtube-player-main')) {
        try {
          mainPlayerRef.current = new (window as any).YT.Player('youtube-player-main', {
            videoId: videoId,
            playerVars: {
              autoplay: 1,
              mute: videoMuted ? 1 : 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              controls: 1,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                // Player principal pronto
                mainPlayerReadyRef.current = true;
              },
              onError: (event: any) => {
                console.error('Erro no player principal:', event.data);
                mainPlayerReadyRef.current = false;
              },
            },
          });
        } catch (error) {
          console.error('Erro ao inicializar player principal:', error);
          mainPlayerReadyRef.current = false;
        }
      }
    };

    const timer = setTimeout(initMainPlayer, 500);
    return () => {
      clearTimeout(timer);
      if (mainPlayerRef.current) {
        try {
          if (typeof mainPlayerRef.current.destroy === 'function') {
            mainPlayerRef.current.destroy();
          }
        } catch (error) {
          // Ignorar erros ao destruir
        }
        mainPlayerRef.current = null;
        mainPlayerReadyRef.current = false;
      }
    };
  }, [loteData?.youtube_video_url, videoMuted]);

  // Inicializar player flutuante quando necessário
  useEffect(() => {
    if (!loteData?.youtube_video_url || !isVideoFloating || !showInfoMessage || videoMuted) {
      // Limpar player flutuante quando não estiver mais visível
      if (floatingPlayerRef.current) {
        try {
          if (typeof floatingPlayerRef.current.destroy === 'function') {
            floatingPlayerRef.current.destroy();
          }
        } catch (error) {
          // Ignorar erros ao destruir
        }
        floatingPlayerRef.current = null;
        floatingPlayerReadyRef.current = false;
      }
      return;
    }

    const videoId = getYouTubeVideoId(loteData.youtube_video_url);
    if (!videoId) return;

    // Resetar flag
    floatingPlayerReadyRef.current = false;

    const initFloatingPlayer = () => {
      if (typeof (window as any).YT === 'undefined' || typeof (window as any).YT.Player === 'undefined') {
        setTimeout(initFloatingPlayer, 100);
        return;
      }

      // Destruir player anterior se existir
      if (floatingPlayerRef.current) {
        try {
          if (typeof floatingPlayerRef.current.destroy === 'function') {
            floatingPlayerRef.current.destroy();
          }
        } catch (error) {
          console.error('Erro ao destruir player flutuante anterior:', error);
        }
        floatingPlayerRef.current = null;
      }

      if (floatingIframeRef.current && document.getElementById('youtube-player-floating')) {
        try {
          floatingPlayerRef.current = new (window as any).YT.Player('youtube-player-floating', {
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              mute: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              controls: 1,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                // Player flutuante pronto - sincronizar com o principal
                floatingPlayerReadyRef.current = true;
                
                // Aguardar um pouco para garantir que está totalmente anexado ao DOM
                setTimeout(() => {
                  if (isPlayerReady(mainPlayerRef.current, mainPlayerReadyRef)) {
                    try {
                      const currentTime = mainPlayerRef.current.getCurrentTime();
                      event.target.seekTo(currentTime, true);
                      event.target.playVideo();
                    } catch (error) {
                      console.error('Erro ao sincronizar player flutuante:', error);
                    }
                  }
                }, 200);
              },
              onError: (event: any) => {
                console.error('Erro no player flutuante:', event.data);
                floatingPlayerReadyRef.current = false;
              },
            },
          });
        } catch (error) {
          console.error('Erro ao inicializar player flutuante:', error);
          floatingPlayerReadyRef.current = false;
        }
      }
    };

    const timer = setTimeout(initFloatingPlayer, 300);
    return () => {
      clearTimeout(timer);
      if (floatingPlayerRef.current) {
        try {
          if (typeof floatingPlayerRef.current.destroy === 'function') {
            floatingPlayerRef.current.destroy();
          }
        } catch (error) {
          // Ignorar erros ao destruir
        }
        floatingPlayerRef.current = null;
        floatingPlayerReadyRef.current = false;
      }
    };
  }, [loteData?.youtube_video_url, isVideoFloating, showInfoMessage, videoMuted]);

  // Countdown de 10 segundos quando o vídeo está sendo exibido
  useEffect(() => {
    if (!loteData?.youtube_video_url || !showTimer) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowTimer(false);
          setShowInfoMessage(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loteData?.youtube_video_url, showTimer]);

  useEffect(() => {
    if (!producer) return;
    if (producer.latitude && producer.longitude) {
      setMapCoords({ lat: producer.latitude, lon: producer.longitude });
    }
  }, [producer]);

  // Controlar scroll do body - desabilitar enquanto aguarda os 10s
  useEffect(() => {
    if (loteData?.youtube_video_url && !showInfoMessage) {
      // Desabilitar scroll completamente no mobile
      const html = document.documentElement;
      const body = document.body;
      
      // Salvar a posição do scroll antes de fixar
      const scrollY = window.scrollY;
      
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.height = '100%';
      body.style.top = `-${scrollY}px`;
    } else {
      // Habilitar scroll
      const html = document.documentElement;
      const body = document.body;
      const scrollY = body.style.top;
      
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
      body.style.top = '';
      
      // Restaurar posição do scroll se necessário
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup ao desmontar
    return () => {
      const html = document.documentElement;
      const body = document.body;
      const scrollY = body.style.top;
      
      html.style.overflow = '';
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
      body.style.top = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [loteData?.youtube_video_url, showInfoMessage]);

  // Função para sincronizar vídeo principal -> flutuante
  const syncToFloating = () => {
    if (isSyncingRef.current) return;
    
    // Verificar se o player principal está pronto
    if (!isPlayerReady(mainPlayerRef.current, mainPlayerReadyRef)) {
      return;
    }
    
    try {
      isSyncingRef.current = true;
      
      const currentTime = mainPlayerRef.current.getCurrentTime();
      setCurrentVideoTime(currentTime);
      
      // Pausar o vídeo principal
      try {
        mainPlayerRef.current.pauseVideo();
      } catch (error) {
        console.error('Erro ao pausar vídeo principal:', error);
      }
      
      // Aguardar o player flutuante estar pronto
      const waitForFloating = () => {
        if (isPlayerReady(floatingPlayerRef.current, floatingPlayerReadyRef)) {
          try {
            floatingPlayerRef.current.seekTo(currentTime, true);
            floatingPlayerRef.current.playVideo();
            isSyncingRef.current = false;
          } catch (error) {
            console.error('Erro ao iniciar vídeo flutuante:', error);
            isSyncingRef.current = false;
          }
        } else {
          setTimeout(waitForFloating, 100);
        }
      };
      
      waitForFloating();
    } catch (error) {
      console.error('Erro ao sincronizar para vídeo flutuante:', error);
      isSyncingRef.current = false;
    }
  };

  // Função para sincronizar vídeo flutuante -> principal
  const syncToMain = () => {
    if (isSyncingRef.current) return;
    
    // Verificar se o player flutuante está pronto
    if (!isPlayerReady(floatingPlayerRef.current, floatingPlayerReadyRef)) {
      return;
    }
    
    try {
      isSyncingRef.current = true;
      
      const currentTime = floatingPlayerRef.current.getCurrentTime();
      setCurrentVideoTime(currentTime);
      
      // Pausar o vídeo flutuante
      try {
        floatingPlayerRef.current.pauseVideo();
      } catch (error) {
        console.error('Erro ao pausar vídeo flutuante:', error);
      }
      
      // Aguardar o player principal estar pronto
      const waitForMain = () => {
        if (isPlayerReady(mainPlayerRef.current, mainPlayerReadyRef)) {
          try {
            mainPlayerRef.current.seekTo(currentTime, true);
            mainPlayerRef.current.playVideo();
            isSyncingRef.current = false;
          } catch (error) {
            console.error('Erro ao continuar vídeo principal:', error);
            isSyncingRef.current = false;
          }
        } else {
          setTimeout(waitForMain, 100);
        }
      };
      
      waitForMain();
    } catch (error) {
      console.error('Erro ao sincronizar para vídeo principal:', error);
      isSyncingRef.current = false;
    }
  };

  // Detectar scroll para fazer o vídeo flutuar na lateral direita (apenas se o som foi ativado)
  useEffect(() => {
    if (!loteData?.youtube_video_url || !showInfoMessage || !videoSectionRef.current || videoMuted) {
      setIsVideoFloating(false);
      return;
    }

    const handleScroll = () => {
      if (!videoSectionRef.current) return;
      
      const videoSection = videoSectionRef.current;
      const rect = videoSection.getBoundingClientRect();
      
      // Se a seção do vídeo está saindo da viewport (topo da seção passou do topo da tela)
      if (rect.top < -50) {
        if (!isVideoFloating) {
          setIsVideoFloating(true);
          // Sincronizar quando o vídeo flutua
          setTimeout(() => {
            syncToFloating();
          }, 200);
        }
      } else {
        if (isVideoFloating) {
          setIsVideoFloating(false);
          // Sincronizar quando volta para o vídeo principal
          setTimeout(() => {
            syncToMain();
          }, 200);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Verificar estado inicial

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loteData?.youtube_video_url, showInfoMessage, videoMuted, isVideoFloating]);

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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Vídeo do YouTube - Seção em tela cheia (100vh) quando aguardando, normal após 10s */}
      {loteData.youtube_video_url && (
        <div 
          ref={videoSectionRef}
          className={`w-full h-screen max-h-screen bg-black relative flex flex-col overflow-hidden ${
            !showInfoMessage ? 'fixed inset-0 z-50' : 'relative z-10'
          }`}
          style={!showInfoMessage ? { 
            overscrollBehavior: 'none'
          } : undefined}
        >
          {/* Container principal com distribuição de espaço */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-1 px-2 sm:py-4 sm:px-4 min-h-0 max-h-screen overflow-hidden">
            {/* Vídeo principal - tamanho responsivo para mobile */}
            <div className={`w-full ${showInfoMessage ? 'max-w-2xl sm:max-w-4xl' : 'max-w-3xl sm:max-w-5xl'} aspect-video relative flex-shrink-0`}>
              <div id="youtube-player-main" ref={iframeRef} className="w-full h-full rounded-lg sm:rounded-xl shadow-2xl overflow-hidden"></div>
              
              {/* Overlay com botão "Ativar Som" centralizado sobre o vídeo */}
              {videoMuted && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-black/40 via-black/30 to-black/50 backdrop-blur-[2px] overflow-hidden">
                  <div className="text-center px-3 sm:px-6 w-full max-w-md sm:max-w-lg">
                    <button
                      onClick={handleActivateSound}
                      className="group bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-gray-900 px-5 py-3 sm:px-10 sm:py-5 rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-2xl flex items-center justify-center gap-2.5 sm:gap-3 mx-auto shadow-xl border-2 border-white/20 w-full sm:w-auto min-w-[180px] sm:min-w-[200px]"
                    >
                      <div className="relative flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-7 sm:h-7 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.383 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.383l4-3.617a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="tracking-wide flex-shrink-0">Ativar Som</span>
                    </button>
                    
                    {/* Timer abaixo do botão com design moderno - responsivo */}
                    {showTimer && (
                      <div className="mt-2 sm:mt-4 animate-fade-in">
                        <div className="bg-black/60 backdrop-blur-md rounded-lg sm:rounded-xl px-3 py-2 sm:px-6 sm:py-4 border border-white/10 shadow-2xl">
                          <p className="text-white/90 text-[10px] sm:text-xs font-medium mb-1 sm:mb-2 tracking-wide uppercase">
                            Informações disponível em
                          </p>
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            {/* Círculo de progresso - responsivo */}
                            <div className="relative w-11 h-11 sm:w-16 sm:h-16">
                              <svg className="transform -rotate-90 w-11 h-11 sm:w-16 sm:h-16">
                                <circle
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  className="sm:hidden"
                                  stroke="rgba(255,255,255,0.2)"
                                  strokeWidth="3"
                                  fill="none"
                                />
                                <circle
                                  cx="22"
                                  cy="22"
                                  r="18"
                                  className="sm:hidden"
                                  stroke="white"
                                  strokeWidth="3"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 18}`}
                                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - (10 - countdown) / 10)}`}
                                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                                  strokeLinecap="round"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  className="hidden sm:block"
                                  stroke="rgba(255,255,255,0.2)"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  className="hidden sm:block"
                                  stroke="white"
                                  strokeWidth="4"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 28}`}
                                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - (10 - countdown) / 10)}`}
                                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg sm:text-2xl font-bold text-white">{countdown}</span>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-white text-xs sm:text-lg font-bold">{countdown === 1 ? 'segundo' : 'segundos'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Mensagem após 10 segundos com botão âncora - responsiva */}
            {showInfoMessage && (
              <div className="mt-2 sm:mt-4 w-full max-w-3xl sm:max-w-4xl px-2 sm:px-0 animate-fade-in-up">
                <div className="bg-gradient-to-b from-black/95 via-black/90 to-black backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 p-4 sm:p-6 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white text-lg sm:text-2xl font-bold tracking-tight">
                      Informações Disponíveis
                    </h3>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed px-2">
                    Explore detalhes técnicos, composição e características únicas deste lote
                  </p>
                  <Button
                    onClick={showLotInfo}
                    className="group bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-white text-gray-900 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl flex items-center gap-2 sm:gap-3 mx-auto shadow-xl border-2 border-white/20 w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="tracking-wide">Ver Informações do Lote</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vídeo flutuante - apenas se o som foi ativado */}
      {loteData.youtube_video_url && showInfoMessage && isVideoFloating && !videoMuted && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 z-50 w-[280px] sm:w-[320px] md:w-[360px] transition-all duration-300 animate-fade-in" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
          <div className="relative bg-black rounded-lg sm:rounded-xl shadow-2xl overflow-hidden border border-white/20 w-full">
            {/* Botão para fechar o vídeo flutuante */}
            <button
              onClick={() => {
                setIsVideoFloating(false);
                if (videoSectionRef.current) {
                  videoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110"
              aria-label="Fechar vídeo flutuante"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Vídeo flutuante */}
            <div className="aspect-video relative w-full">
              <div id="youtube-player-floating" ref={floatingIframeRef} className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Conteúdo principal da página - Exibido após 10s ou quando não há vídeo */}
      <div className={`${loteData.youtube_video_url && !showInfoMessage ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Hero Section */}
        <HeroSection 
          loteData={loteData}
          isBlend={isBlend}
          blendComponentsCount={blendComponents.length}
          producerName={producer?.name}
          branding={branding ? {
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            accentColor: branding.accentColor,
            logoUrl: branding.logoUrl || null
          } : undefined}
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
                  onClick={showLotInfo}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
                  style={{
                    color: branding?.primaryColor || '#16a34a',
                  }}
                  onMouseEnter={(e) => {
                    const color = branding?.primaryColor || '#16a34a';
                    e.currentTarget.style.backgroundColor = `${color}15`;
                    e.currentTarget.style.color = branding?.secondaryColor || '#22c55e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = branding?.primaryColor || '#16a34a';
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Ver Informações</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
                  style={{
                    color: branding?.secondaryColor || '#22c55e',
                  }}
                  onMouseEnter={(e) => {
                    const color = branding?.secondaryColor || '#22c55e';
                    e.currentTarget.style.backgroundColor = `${color}15`;
                    e.currentTarget.style.color = branding?.accentColor || '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = branding?.secondaryColor || '#22c55e';
                  }}
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
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
                  style={{
                    color: branding?.accentColor || '#10b981',
                  }}
                  onMouseEnter={(e) => {
                    const color = branding?.accentColor || '#10b981';
                    e.currentTarget.style.backgroundColor = `${color}15`;
                    e.currentTarget.style.color = branding?.primaryColor || '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = branding?.accentColor || '#10b981';
                  }}
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Referência para scroll - Seção de informações do produto */}
          <div ref={productDetailsRef} className="scroll-mt-4">
            {/* Seção Principal - Informações do Lote */}
            <LotInfoSection 
              loteData={loteData}
              isBlend={isBlend}
              blendComponents={blendComponents}
              producerName={producer?.name}
              branding={branding || undefined}
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
                branding={branding || undefined}
              />
            )}

            {/* Seção de Produtores */}
            <ProducersSection 
              isBlend={isBlend}
              blendComponents={blendComponents}
              producer={producer}
              branding={branding || undefined}
            />

            {/* Análise Sensorial */}
            <SensoryAnalysis loteData={loteData} branding={branding || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoteDetails;