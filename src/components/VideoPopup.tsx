import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, SpeakerHigh, SpeakerSlash, SkipForward } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  onSkipToContent: () => void;
  showAfterSeconds?: number;
  brandingTitle?: string;
}

export const VideoPopup = ({ 
  isOpen, 
  onClose, 
  videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  onSkipToContent,
  showAfterSeconds = 3,
  brandingTitle = "GeoTrace"
}: VideoPopupProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Mostrar botão de pular após X segundos
      const timer = setTimeout(() => {
        setShowSkipButton(true);
      }, showAfterSeconds * 1000);

      return () => clearTimeout(timer);
    } else {
      setShowSkipButton(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setVideoError(false);
    }
  }, [isOpen, showAfterSeconds]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black">
        <div className="relative w-full h-full bg-black">
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Botão de pular para conteúdo */}
          {showSkipButton && (
            <Button
              onClick={onSkipToContent}
              className="absolute top-4 left-4 z-50 bg-green-600 hover:bg-green-700 text-white"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Pular para Produto
            </Button>
          )}

          {/* Vídeo */}
          {videoError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <p className="text-lg mb-4">Erro ao carregar o vídeo</p>
                <Button
                  onClick={() => {
                    setVideoError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setVideoError(true)}
              muted={isMuted}
              loop
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Seu navegador não suporta vídeos HTML5.
            </video>
          )}

          {/* Controles do vídeo */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            {/* Barra de progresso */}
            <div 
              className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-200"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <SpeakerSlash className="h-5 w-5" />
                  ) : (
                    <SpeakerHigh className="h-5 w-5" />
                  )}
                </Button>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">
                  {brandingTitle} - Rastreabilidade Premium
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

