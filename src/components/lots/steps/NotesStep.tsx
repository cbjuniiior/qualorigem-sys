import { Quotes } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface NotesStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const NotesStep = ({ formData, setFormData }: NotesStepProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Quotes className="w-5 h-5 text-gray-600" />
          Observações e Configurações
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="lot_observations" className="text-sm font-medium mb-1.5 block">
              Observações Gerais
            </Label>
            <Textarea 
              id="lot_observations" 
              value={formData.lot_observations} 
              onChange={e => setFormData({ ...formData, lot_observations: e.target.value })} 
              placeholder="Descreva observações importantes sobre este lote, como condições especiais de produção, características únicas, processo de beneficiamento, armazenamento, etc..." 
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Estas observações aparecerão na página pública do lote para consumidores
            </p>
          </div>
          
          <div>
            <Label htmlFor="youtube_video_url" className="text-sm font-medium mb-1.5 block">
              Link do Vídeo do YouTube (Opcional)
            </Label>
            <Input 
              id="youtube_video_url" 
              value={formData.youtube_video_url} 
              onChange={e => setFormData({ ...formData, youtube_video_url: e.target.value })} 
              placeholder="https://www.youtube.com/watch?v=..." 
            />
            <p className="text-xs text-gray-500 mt-1">
              🎥 Se informado, o vídeo será exibido na primeira seção da página pública
            </p>
          </div>
          
          {formData.youtube_video_url && (
            <div>
              <Label htmlFor="video_delay_seconds" className="text-sm font-medium mb-1.5 block">
                Delay para Mostrar Informações (segundos)
              </Label>
              <Input 
                id="video_delay_seconds" 
                type="number"
                min="5"
                max="60"
                value={formData.video_delay_seconds} 
                onChange={e => setFormData({ ...formData, video_delay_seconds: parseInt(e.target.value) || 10 })} 
              />
              <p className="text-xs text-gray-500 mt-1">
                ⏱️ Tempo em segundos antes de mostrar o botão "Ver informações do lote"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
