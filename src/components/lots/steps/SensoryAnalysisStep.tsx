import { Eye } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface SensoryAnalysisStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const SensoryAnalysisStep = ({ formData, setFormData }: SensoryAnalysisStepProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-600" />
          Análise Sensorial
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Fragrância: {formData.fragrance_score.toFixed(1)}</Label>
              <Slider 
                value={[formData.fragrance_score]} 
                onValueChange={([value]) => setFormData({ ...formData, fragrance_score: value })} 
                max={10} 
                min={0} 
                step={0.1} 
                className="mt-2" 
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Sabor: {formData.flavor_score.toFixed(1)}</Label>
              <Slider 
                value={[formData.flavor_score]} 
                onValueChange={([value]) => setFormData({ ...formData, flavor_score: value })} 
                max={10} 
                min={0} 
                step={0.1} 
                className="mt-2" 
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Finalização: {formData.finish_score.toFixed(1)}</Label>
              <Slider 
                value={[formData.finish_score]} 
                onValueChange={([value]) => setFormData({ ...formData, finish_score: value })} 
                max={10} 
                min={0} 
                step={0.1} 
                className="mt-2" 
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Acidez: {formData.acidity_score.toFixed(1)}</Label>
              <Slider 
                value={[formData.acidity_score]} 
                onValueChange={([value]) => setFormData({ ...formData, acidity_score: value })} 
                max={10} 
                min={0} 
                step={0.1} 
                className="mt-2" 
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Corpo: {formData.body_score.toFixed(1)}</Label>
              <Slider 
                value={[formData.body_score]} 
                onValueChange={([value]) => setFormData({ ...formData, body_score: value })} 
                max={10} 
                min={0} 
                step={0.1} 
                className="mt-2" 
              />
            </div>
            <div>
              <Label htmlFor="sensory_notes" className="text-sm font-medium mb-2 block">Notas Sensoriais</Label>
              <Textarea 
                id="sensory_notes" 
                value={formData.sensory_notes} 
                onChange={e => setFormData({ ...formData, sensory_notes: e.target.value })} 
                placeholder="Descreva as características sensoriais..." 
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
