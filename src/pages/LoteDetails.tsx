import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShareNetwork, Copy, CaretDown, Tag, SpeakerHigh, Fingerprint, FileText, Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productLotsApi, producersApi, associationsApi, certificationsApi, internalProducersApi } from "@/services/api";
import { useBranding } from "@/hooks/use-branding";
import type { LotComponent } from "@/services/api";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";

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
  video_description?: string | null;
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
    latitude?: string | number;
    longitude?: string | number;
    photos?: string[];
    profile_picture_url?: string | null;
  };
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
  characteristics?: Array<{
    id: string;
    characteristic_id: string;
    value: string;
    characteristics: {
      id: string;
      name: string;
    };
  }>;
}

const LoteDetails = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  console.log('Branding na Página Pública:', branding);
  const [loteData, setLoteData] = useState<LoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [producer, setProducer] = useState<any | null>(null);
  const [industry, setIndustry] = useState<any | null>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const [lotCertifications, setLotCertifications] = useState<any[]>([]);
  const [internalProducerCount, setInternalProducerCount] = useState(0);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const productDetailsRef = useRef<HTMLDivElement>(null);
  
  // Estados para controle do vídeo
  const [videoConfig, setVideoConfig] = useState<{
    enabled: boolean;
    auto_play: boolean;
    show_after_seconds: number;
  } | null>(null);
  const [videoMuted, setVideoMuted] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [showTimer, setShowTimer] = useState(true);
  const [showInfoMessage, setShowInfoMessage] = useState(false);
  const [isVideoFloating, setIsVideoFloating] = useState(false);
  const [videoClosedByUser, setVideoClosedByUser] = useState(false);
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

  const hexToRgba = (hex: string, alpha: number) => {
    if (!hex) return `rgba(0, 0, 0, ${alpha})`;
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return `rgba(0, 0, 0, ${alpha})`;
    }
  };

  // Função para ativar som e recomeçar o vídeo
  const handleActivateSound = () => {
    if (!loteData?.youtube_video_url) return;
    
    const videoId = getYouTubeVideoId(loteData.youtube_video_url);
    if (!videoId) return;
    
    // Atualizar o estado de mute primeiro (isso fará o overlay desaparecer)
    setVideoMuted(false);
    setVideoClosedByUser(false);
    
    // Se a API do YouTube estiver disponível, usar ela para reiniciar
    if (isPlayerReady(mainPlayerRef.current, mainPlayerReadyRef)) {
      try {
        // Reiniciar do 0 e ativar som conforme novos requisitos
        mainPlayerRef.current.seekTo(0, true);
        mainPlayerRef.current.unMute();
        mainPlayerRef.current.playVideo();
      } catch (error) {
        console.error('Erro ao ativar som com API:', error);
      }
    } else if (iframeRef.current) {
      // Fallback: atualizar src do iframe mas mantendo a posição se possível
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

  // Carregar branding e configurações de vídeo
  useEffect(() => {
    const loadConfigs = async () => {
      if (!tenant) return;
      try {
        const { systemConfigApi } = await import("@/services/api");
        const videoConfigData = await systemConfigApi.getVideoConfig(tenant.id);
        setVideoConfig(videoConfigData);
        console.log('Video Config Carregada:', videoConfigData);
      } catch (error) {
        console.error('Erro ao carregar configurações de vídeo:', error);
        setVideoConfig({
          enabled: true,
          auto_play: true,
          show_after_seconds: 3
        });
      }
    };
    loadConfigs();
  }, [tenant]);

  useEffect(() => {
    const fetchLoteData = async () => {
      if (!codigo || !tenant) return;
      
      try {
        const data = await productLotsApi.getByCode(codigo, tenant.id);
        setLoteData(data);
        productLotsApi.incrementViews(codigo).catch(() => {});
        
        // Tentar obter dados do produtor do relacionamento
        if (data.producers) {
          // Lidar com retorno do Supabase que pode ser objeto ou array
          const producerData = Array.isArray(data.producers) ? data.producers[0] : data.producers;
          if (producerData) {
            setProducer(producerData);
            associationsApi.getByProducer(producerData.id, tenant.id).then(setAssociations).catch(() => {});
          }
        } else if (data.producer_id) {
          // Fallback: buscar dados do produtor se não vieram no join
          const [producerData, associationsData] = await Promise.all([
            producersApi.getById(data.producer_id, tenant.id),
            associationsApi.getByProducer(data.producer_id, tenant.id)
          ]);
          setProducer(producerData);
          setAssociations(associationsData);
        }

        // Buscar dados da indústria se houver
        if (data.industry_id) {
          try {
            const { industriesApi } = await import("@/services/api");
            const industryData = await industriesApi.getById(data.industry_id, tenant.id);
            setIndustry(industryData);
          } catch (e) {
            console.error("Erro ao buscar indústria:", e);
          }
        }

        // Buscar certificações públicas do lote
        try {
          const certs = await certificationsApi.getPublicByLot(data.id);
          setLotCertifications(certs || []);
        } catch (e) {
          console.error("Erro ao buscar certificações:", e);
        }

        // Contagem de produtores internos
        try {
          const count = await internalProducersApi.countByLot(data.id);
          setInternalProducerCount(count);
        } catch (e) {
          console.error("Erro ao contar produtores internos:", e);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados do lote:", error);
        setLoading(false);
      }
    };

    fetchLoteData();
  }, [codigo, tenant]);

  // Resetar countdown quando o vídeo é carregado
  useEffect(() => {
    if (loteData?.youtube_video_url && videoMuted && videoConfig) {
      const delaySeconds = videoConfig.show_after_seconds || 3;
      setCountdown(delaySeconds);
      setShowTimer(true);
      setShowInfoMessage(false);
    }
  }, [loteData?.youtube_video_url, videoMuted, videoConfig]);

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
          // Usar configuração de auto_play se disponível
          const shouldAutoplay = videoConfig?.auto_play !== false;
          
          mainPlayerRef.current = new (window as any).YT.Player('youtube-player-main', {
            videoId: videoId,
            playerVars: {
              autoplay: shouldAutoplay ? 1 : 0,
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
                // Garantir play automático mutado no início
                if (videoMuted) {
                  event.target.mute();
                  event.target.playVideo();
                }
              },
              onStateChange: (event: any) => {
                // Se o vídeo parar por algum motivo e ainda estiver mutado, tentar dar play novamente (loop)
                if (event.data === (window as any).YT.PlayerState.ENDED && videoMuted) {
                  event.target.playVideo();
                }
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
  }, [loteData?.youtube_video_url, videoMuted, videoConfig]);

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

  // Countdown baseado na configuração quando o vídeo está sendo exibido
  useEffect(() => {
    if (!loteData?.youtube_video_url || !showTimer || !videoConfig) return;

    const delaySeconds = loteData.video_delay_seconds || videoConfig.show_after_seconds || 3;
    setCountdown(delaySeconds);
    
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
  }, [loteData?.youtube_video_url, showTimer, videoConfig]);

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
    if (!loteData?.youtube_video_url || !showInfoMessage || !videoSectionRef.current || videoMuted || videoClosedByUser) {
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
  }, [loteData?.youtube_video_url, showInfoMessage, videoMuted, isVideoFloating, videoClosedByUser]);

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
  
  // Garantir que temos o produtor correto (prioridade para o estado carregado ou do lote)
  const currentProducer = producer || loteData?.producers;
  const producerName = currentProducer?.name || `${labels.producer} não informado(a)`;

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
    <div className={`min-h-screen bg-gray-50 overflow-x-hidden transition-all duration-300 ${isVideoFloating ? 'pb-40 sm:pb-48' : 'pb-0'}`}>
      {/* Vídeo do YouTube - Seção em tela cheia (100vh) quando aguardando, normal após X segundos */}
      {loteData.youtube_video_url && videoConfig?.enabled && (
        <div 
          ref={videoSectionRef}
          className={`w-full h-screen max-h-screen relative flex flex-col overflow-hidden transition-all duration-700 ${
            !showInfoMessage ? 'fixed inset-0 z-50' : 'relative z-10'
          }`}
          style={{ 
            backgroundColor: 'black',
            overscrollBehavior: !showInfoMessage ? 'none' : 'auto'
          }}
        >
          {/* Fundo Personalizado com Imagem e Overlay - Sempre visível para evitar fundo preto */}
          <div className="absolute inset-0 z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center scale-105 animate-[pulse_8s_infinite_alternate]"
              style={{ 
                backgroundImage: `url(${branding?.videoBackgroundUrl || loteData.image_url || '/placeholder.svg'})`,
                filter: 'brightness(0.5) contrast(1.1)'
              }}
            />
            <div 
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ 
                background: `linear-gradient(to bottom, ${hexToRgba(branding?.primaryColor || '#000', 0.15)}, ${hexToRgba(branding?.primaryColor || '#000', 0.35)})`
              }}
            />
          </div>

          {/* Container de Conteúdo - Mobile First */}
          <div className="flex-1 flex flex-col items-center relative z-10 py-12 px-6 sm:py-16 sm:px-10 h-full w-full overflow-hidden">
            {/* Topo - Logo ou Identificação sutil */}
            <div className="w-full flex justify-center opacity-80 mb-auto">
              {branding?.logoUrl && (
                <div className="relative group">
                  <div 
                    className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rounded-full scale-150"
                    style={{ backgroundColor: branding.primaryColor }}
                  />
                  <img 
                    src={branding.logoUrl} 
                    alt="Logo" 
                    className="h-20 sm:h-28 md:h-36 object-contain filter brightness-0 invert drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] relative z-10 transition-all duration-700 hover:scale-105" 
                  />
                </div>
              )}
            </div>

            {/* Centro - Bloco de Conteúdo Centralizado */}
            <div className="w-full max-w-4xl flex flex-col items-center gap-8 sm:gap-12 flex-grow justify-center">
              {/* Texto Dinâmico do Lote */}
              <div className="text-center space-y-4 px-4 max-w-2xl mx-auto animate-fade-in">
                <h2 className="text-white text-3xl sm:text-5xl font-black tracking-tight leading-tight drop-shadow-2xl">
                  {loteData.name}
                </h2>
                {loteData.video_description && (
                  <p className="text-white/80 text-base sm:text-xl font-medium leading-relaxed italic drop-shadow-lg max-w-lg mx-auto">
                    "{loteData.video_description}"
                  </p>
                )}
              </div>

              {/* Player de Vídeo */}
              <div className={`w-full ${showInfoMessage ? 'max-w-2xl' : 'max-w-3xl'} aspect-video relative group transition-all duration-500`}>
                <div 
                  id="youtube-player-main" 
                  ref={iframeRef} 
                  className="w-full h-full rounded-3xl sm:rounded-[3rem] shadow-[0_32px_80px_-12px_rgba(0,0,0,0.8)] overflow-hidden border-4 border-white/10"
                ></div>
                
                {/* Botão Ativar Som - Enxuto e Moderno (Centralizado) */}
                {videoMuted && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <button
                      onClick={handleActivateSound}
                      className="group relative flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      {/* Pulse Rings */}
                      <div className="absolute inset-0 -m-4">
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-[ping_2s_infinite]"></div>
                        <div className="absolute inset-0 rounded-full border border-white/10 animate-[ping_3s_infinite_500ms]"></div>
                      </div>

                      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white text-gray-900 shadow-[0_0_50px_rgba(255,255,255,0.3)] flex items-center justify-center relative z-10 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                        <SpeakerHigh size={32} weight="fill" className="sm:hidden" />
                        <SpeakerHigh size={44} weight="fill" className="hidden sm:block" />
                      </div>
                      
                      <span className="text-white font-black text-[10px] sm:text-sm uppercase tracking-[0.3em] drop-shadow-xl animate-pulse">
                        Explorar com Som
                      </span>
                    </button>

                    {/* Timer Minimalista */}
                    {showTimer && (
                      <div className="flex flex-col items-center gap-2 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                          <span className="text-white/90 text-[9px] sm:text-xs font-black uppercase tracking-widest">
                            Em {countdown}s
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé - Fingerprint e Scroll - Aparece apenas após o delay */}
            <div className={`w-full flex justify-center mt-auto ${showInfoMessage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex flex-col items-center gap-6 animate-bounce">
                <button 
                  onClick={showLotInfo}
                  className="flex flex-col items-center gap-2 group/scroll transition-all duration-300 hover:opacity-100 opacity-80"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 shadow-xl group-hover/scroll:bg-white/20 transition-all duration-500"
                    style={{ color: branding?.primaryColor }}
                  >
                    <Fingerprint size={28} weight="duotone" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">
                      Deslize para explorar
                    </span>
                    <CaretDown size={16} className="text-white/40" weight="bold" />
                  </div>
                </button>
              </div>
            </div>
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
                // Marcar como fechado pelo usuário para evitar que o scroll reabra
                setVideoClosedByUser(true);
                setIsVideoFloating(false);
                
                try {
                  if (floatingPlayerRef.current && typeof floatingPlayerRef.current.pauseVideo === 'function') {
                    floatingPlayerRef.current.pauseVideo();
                  }
                  if (mainPlayerRef.current && typeof mainPlayerRef.current.pauseVideo === 'function') {
                    mainPlayerRef.current.pauseVideo();
                  }
                } catch (e) {
                  console.error("Erro ao pausar vídeos no fechamento:", e);
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
      <div className={`${loteData.youtube_video_url && videoConfig?.enabled && !showInfoMessage ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Hero Section */}
        <HeroSection 
          loteData={loteData}
          isBlend={isBlend}
          blendComponentsCount={blendComponents.length}
          producerName={producerName}
          onScrollToContent={showLotInfo}
          branding={branding ? {
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            accentColor: branding.accentColor,
            logoUrl: branding.logoUrl || null,
            headerImageUrl: branding.headerImageUrl || null
          } : undefined}
        />
      
        {/* Barra de ações */}
        <div className="bg-white border-b border-gray-200/60 -mt-2 sticky top-0 z-40 shadow-sm transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-3 max-w-6xl">
            <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
              {/* Lado esquerdo - Informações contextuais */}
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="hidden md:block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Compartilhe este lote
                  </span>
                  <span className="hidden md:block w-px h-3 bg-gray-200"></span>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                    <Tag className="w-2.5 h-2.5 text-gray-400" weight="fill" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                      {loteData?.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Lado direito - Ações */}
              <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={showLotInfo}
                  className="group flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg transition-all duration-200 hover:scale-[1.02] font-black uppercase tracking-wider"
                  style={{
                    color: branding?.primaryColor || '#16a34a',
                  }}
                  onMouseEnter={(e) => {
                    const color = branding?.primaryColor || '#16a34a';
                    e.currentTarget.style.backgroundColor = `${color}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <CaretDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" weight="bold" />
                  <span className="hidden sm:inline">Ver Informações</span>
                  <span className="sm:hidden">Infos</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="group flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg transition-all duration-200 hover:scale-[1.02] font-black uppercase tracking-wider"
                  style={{
                    color: branding?.secondaryColor || '#22c55e',
                  }}
                  onMouseEnter={(e) => {
                    const color = branding?.secondaryColor || '#22c55e';
                    e.currentTarget.style.backgroundColor = `${color}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ShareNetwork className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-200 group-hover:rotate-12" weight="fill" />
                  <span className="hidden sm:inline">Compartilhar</span>
                  <span className="sm:hidden">Share</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("URL copiada para a área de transferência!");
                  }}
                  className="group flex items-center gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8 rounded-lg transition-all duration-200 hover:scale-[1.02] font-black uppercase tracking-wider"
                  style={{
                    color: branding?.accentColor || '#10b981',
                  }}
                  onMouseEnter={(e) => {
                    const color = branding?.accentColor || '#10b981';
                    e.currentTarget.style.backgroundColor = `${color}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-200 group-hover:scale-110" weight="fill" />
                  <span className="hidden sm:inline">Copiar URL</span>
                  <span className="sm:hidden">URL</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
          {/* Referência para scroll - Seção de informações do produto */}
          <div ref={productDetailsRef} className="scroll-mt-20 sm:scroll-mt-24 space-y-8 sm:space-y-12">
            {/* 1. De onde veio / Quem plantou - Seção de Produtores */}
            <ProducersSection 
              isBlend={isBlend}
              blendComponents={blendComponents}
              producer={currentProducer}
              loteData={loteData}
              branding={branding || undefined}
            />

            {/* 2. Composição do Blend (se houver) */}
            {isBlend && (
              <BlendComposition 
                blendComponents={blendComponents}
                harvestYear={loteData.harvest_year}
                quantity={loteData.quantity}
                unit={loteData.unit}
                branding={branding || undefined}
              />
            )}

            {/* 3. Certificações Públicas */}
            {lotCertifications.length > 0 && (
              <div className="pt-12 sm:pt-16">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-3">
                    Certificações
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Certificações do Lote</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                  {lotCertifications.map((cert: any) => (
                    <div key={cert.id} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-3 shadow-sm">
                      <div className="p-2 bg-emerald-50 rounded-xl shrink-0">
                        <FileText size={20} className="text-emerald-600" weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm">{cert.name}</h4>
                        {cert.issuing_body && <p className="text-xs text-slate-500">{cert.issuing_body}</p>}
                        {cert.valid_until && (
                          <p className="text-xs text-slate-400 mt-1">
                            Válido até {new Date(cert.valid_until).toLocaleDateString("pt-BR")}
                          </p>
                        )}
                        {cert.document_url && (
                          <a
                            href={cert.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                          >
                            Ver documento PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Produtores internos (marca coletiva) */}
            {internalProducerCount > 0 && (
              <div className="flex items-center justify-center gap-3 py-6 px-8 bg-blue-50 rounded-2xl max-w-md mx-auto mt-8">
                <Users size={24} className="text-blue-600" weight="fill" />
                <p className="text-sm font-bold text-blue-800">
                  Este lote envolve <span className="text-lg">{internalProducerCount}</span> produtores associados
                </p>
              </div>
            )}

            {/* 4. Análise Sensorial */}
            <SensoryAnalysis loteData={loteData} branding={branding || undefined} />

            {/* 5. Observações do Especialista */}
            <LotObservations lotObservations={loteData.lot_observations} />

            {/* Nova Seção: Procedência e Certificação - Redesign Premium */}
            {(loteData.seals_quantity || (associations && associations.length > 0) || industry) && (
              <div className="pt-16 sm:pt-24 border-t border-slate-100">
                <div className="text-center mb-12 sm:mb-16">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                    Garantia de Qualidade
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">Procedência e Certificação</h2>
                  <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                    Entidades e parceiros que asseguram a excelência e a rastreabilidade deste lote.
                  </p>
                </div>

                <div className="max-w-6xl mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Selos de Rastreabilidade */}
                    {loteData.seals_quantity && (
                      <div className="lg:col-span-1">
                        <div className="h-full bg-slate-950 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-2xl">
                          <div 
                            className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-30"
                            style={{ background: `radial-gradient(circle at center, ${branding?.primaryColor || '#16a34a'} 0%, transparent 70%)` }}
                          />
                          
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 shadow-xl mb-6 transition-transform duration-500 group-hover:scale-110"
                            style={{ backgroundColor: branding?.primaryColor || '#16a34a', color: 'white' }}
                          >
                            <Tag size={32} weight="fill" />
                          </div>
                          
                          <div className="relative z-10">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Selos Gerados</p>
                            <div className="flex items-baseline gap-2 justify-center mb-2">
                              <span className="text-5xl font-black text-white tracking-tighter">{loteData.seals_quantity}</span>
                              <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Unidades</span>
                            </div>
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Rastreabilidade Garantida</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Associações e Indústria */}
                    <div className={`${loteData.seals_quantity ? 'lg:col-span-2' : 'lg:col-span-3'} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                      {/* Associações */}
                      {associations.map((assoc: any) => (
                        <div key={assoc.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-6 group">
                          <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-slate-50 border border-slate-50 flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105">
                            {assoc.logo_url ? (
                              <img src={assoc.logo_url} alt={assoc.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                              <Buildings size={32} weight="duotone" className="text-slate-300" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1.5">
                              {assoc.type || 'Associação'}
                            </div>
                            <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary transition-colors" style={{ '--primary': branding?.primaryColor || '#16a34a' } as any}>
                              {assoc.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Parceiro Certificador</p>
                          </div>
                        </div>
                      ))}

                      {/* Indústria */}
                      {industry && (
                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-6 group">
                          <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-slate-50 border border-slate-50 flex items-center justify-center p-3 transition-transform duration-500 group-hover:scale-105">
                            {industry.logo_url ? (
                              <img src={industry.logo_url} alt={industry.name} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                              <Buildings size={32} weight="duotone" className="text-slate-300" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1.5">
                              Indústria Parceira
                            </div>
                            <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary transition-colors" style={{ '--primary': branding?.primaryColor || '#16a34a' } as any}>
                              {industry.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                              {industry.city}, {industry.state}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Dados Técnicos - Informações do Lote */}
            <LotInfoSection 
              loteData={loteData}
              isBlend={isBlend}
              blendComponents={blendComponents}
              producer={currentProducer}
              producerName={currentProducer?.name}
              industry={industry}
              associations={associations}
              branding={branding || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoteDetails;
