import { Quotes, MapPin, MapTrifold, Info, YoutubeLogo, Clock, ChatCircleText, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface NotesStepProps {
  formData: any;
  setFormData: (data: any) => void;
  branding?: any;
}

export const NotesStep = ({ formData, setFormData, branding }: NotesStepProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';

  const openGoogleMaps = () => {
    window.open("https://www.google.com/maps", "_blank");
    toast.info("No Google Maps, clique com o botão direito no local e copie a Latitude/Longitude.");
  };

  const FormSection = ({ title, icon: Icon, children, description, badge }: any) => (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-start gap-4">
          <div 
            className="p-2.5 rounded-xl border shadow-sm"
            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
          >
            <Icon size={24} weight="duotone" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
            {description && <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{description}</p>}
          </div>
        </div>
        {badge && (
          <div 
            className="px-4 py-2 rounded-2xl border flex items-center gap-2"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
          >
            <badge.icon size={18} weight="fill" />
            <span className="text-[10px] font-black uppercase tracking-tight">{badge.text}</span>
          </div>
        )}
      </div>
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <FormSection 
        title="História & Observações" 
        icon={Quotes} 
        description="Informações complementares sobre a produção"
        badge={{ text: "Exibição Pública", icon: CheckCircle, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" }}
      >
        <div className="space-y-4">
          <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
            <ChatCircleText size={18} style={{ color: primaryColor }} /> Relato do Produtor
          </Label>
          <Textarea 
            value={formData.lot_observations} 
            onChange={e => setFormData({ ...formData, lot_observations: e.target.value })} 
            placeholder="Descreva observações importantes sobre este lote, como condições climáticas, colheita manual, processos de secagem ou qualquer história que agregue valor ao seu produto..." 
            className="min-h-[180px] rounded-2xl text-base leading-relaxed p-6 bg-slate-50 border-0 focus-visible:ring-primary"
            style={{ '--primary': primaryColor } as any}
          />
          <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <Info size={20} className="text-amber-600" weight="fill" />
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Dica: Consumidores adoram ler sobre a origem e o cuidado no preparo. Seja detalhista!
            </p>
          </div>
        </div>
      </FormSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FormSection title="Conteúdo em Vídeo" icon={YoutubeLogo} description="Link para vídeo de apresentação">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                <YoutubeLogo size={18} className="text-rose-600" /> Link do YouTube
              </Label>
              <Input 
                value={formData.youtube_video_url} 
                onChange={e => setFormData({ ...formData, youtube_video_url: e.target.value })} 
                placeholder="https://www.youtube.com/watch?v=..." 
                className="h-12 rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-primary"
                style={{ '--primary': primaryColor } as any}
              />
            </div>
            
            {formData.youtube_video_url && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <ChatCircleText size={18} style={{ color: primaryColor }} /> Texto abaixo do vídeo
                  </Label>
                  <Textarea 
                    value={formData.video_description} 
                    onChange={e => setFormData({ ...formData, video_description: e.target.value })} 
                    placeholder="Frase curta de impacto para aparecer logo abaixo do player..." 
                    className="min-h-[80px] rounded-xl bg-slate-50 border-0 font-medium focus-visible:ring-primary"
                    style={{ '--primary': primaryColor } as any}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Clock size={18} style={{ color: primaryColor }} /> Delay de Exibição
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="number"
                      min="5"
                      max="60"
                      value={formData.video_delay_seconds} 
                      onChange={e => setFormData({ ...formData, video_delay_seconds: parseInt(e.target.value) || 10 })} 
                      className="w-24 h-12 rounded-xl bg-slate-50 border-0 text-center font-black focus-visible:ring-primary"
                      style={{ '--primary': primaryColor } as any}
                    />
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Segundos</span>
                  </div>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${formData.youtube_video_url.split('v=')[1]?.split('&')[0]}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Localização Exata" icon={MapPin} description="Coordenadas GPS do talhão">
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] ml-1">Latitude</Label>
                <Input 
                  type="number" 
                  step="any"
                  value={formData.latitude} 
                  onChange={e => setFormData({ ...formData, latitude: e.target.value })} 
                  placeholder="-23.123456"
                  className="font-mono text-sm h-12 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] ml-1">Longitude</Label>
                <Input 
                  type="number" 
                  step="any"
                  value={formData.longitude} 
                  onChange={e => setFormData({ ...formData, longitude: e.target.value })} 
                  placeholder="-46.123456"
                  className="font-mono text-sm h-12 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={openGoogleMaps}
              className="w-full h-12 rounded-xl font-black gap-3 bg-slate-50 border-slate-200 text-slate-600 hover:bg-white transition-all shadow-sm"
              style={{ '--primary': primaryColor } as any}
            >
              <MapTrifold size={20} weight="bold" style={{ color: primaryColor }} /> Selecionar no Google Maps
            </Button>

            <Separator className="bg-slate-100" />

            <div 
              className="p-6 rounded-[1.5rem] border shadow-inner"
              style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <WarningCircle size={20} style={{ color: primaryColor }} />
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Se você não informar as coordenadas específicas deste lote, o sistema utilizará a localização padrão do cadastro do produtor.
                </p>
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
};
