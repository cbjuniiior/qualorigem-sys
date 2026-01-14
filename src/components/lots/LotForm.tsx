import { useState, useRef } from "react";
import { CaretLeft, CaretRight, Check, Package, Medal, Eye, Quotes, X, ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProductionStep } from "./steps/ProductionStep";
import { SensoryAnalysisStep } from "./steps/SensoryAnalysisStep";
import { NotesStep } from "./steps/NotesStep";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

interface LotFormProps {
  formData: any;
  setFormData: (data: any) => void;
  producers: Producer[];
  associations: any[];
  industries: any[];
  isBlendMode: boolean;
  setIsBlendMode: (mode: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl?: string | null;
  } | null;
}

export const LOT_STEPS = [
  { id: 1, title: "Identificação", description: "Dados básicos", icon: Package },
  { id: 2, title: "Produção", description: "Origem e composição", icon: Medal },
  { id: 3, title: "Análise", description: "Perfil sensorial", icon: Eye },
  { id: 4, title: "História", description: "Relatos e mídia", icon: Quotes }
];

export const LotForm = ({
  formData,
  setFormData,
  producers,
  associations,
  industries,
  isBlendMode,
  setIsBlendMode,
  currentStep,
  setCurrentStep,
  totalSteps,
  onSubmit,
  onCancel,
  isEditing = false,
  branding
}: LotFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const primaryColor = branding?.primaryColor || '#16a34a';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPG, PNG ou GIF.");
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. Tamanho máximo: 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData({ ...formData, image_url: ev.target?.result });
        toast.success("Foto carregada com sucesso!");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setFormData({ ...formData, image_url: "" });
  const qrValue = `${window.location.origin}/produto/${formData.code}`;

  const nextStep = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  return (
    <div className="h-full flex flex-col bg-slate-50/30 min-h-0">
      <div className="flex-1 p-8 space-y-12 overflow-y-auto pb-10">
        <div className="max-w-[1600px] mx-auto w-full">
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              setFormData={setFormData}
              isBlendMode={isBlendMode}
              setIsBlendMode={setIsBlendMode}
              fileInputRef={fileInputRef}
              handleImageUpload={handleImageUpload}
              removeImage={removeImage}
              qrValue={qrValue}
              branding={branding}
            />
          )}

          {currentStep === 2 && (
            <ProductionStep
              formData={formData}
              setFormData={setFormData}
              isBlendMode={isBlendMode}
              producers={producers}
              associations={associations}
              industries={industries}
              qrValue={qrValue}
              branding={branding}
            />
          )}

          {currentStep === 3 && (
            <SensoryAnalysisStep
              formData={formData}
              setFormData={setFormData}
              branding={branding}
            />
          )}

          {currentStep === 4 && (
            <NotesStep
              formData={formData}
              setFormData={setFormData}
              branding={branding}
            />
          )}
        </div>
      </div>

      {/* Rodapé de Navegação Fixo - Estilo Premium */}
      <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex gap-3 flex-1">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="rounded-2xl h-14 px-8 font-black border-slate-200 text-slate-500 hover:bg-slate-50 transition-all gap-2"
            >
              <X size={20} weight="bold" /> Cancelar
            </Button>
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={prevStep}
                className="rounded-2xl h-14 px-8 font-black border-slate-200 text-slate-700 hover:bg-slate-50 transition-all gap-2"
              >
                <CaretLeft size={20} weight="bold" /> Voltar
              </Button>
            )}
          </div>
          
          <div className="flex-1 flex justify-end">
            {currentStep < totalSteps ? (
              <Button 
                onClick={nextStep}
                style={{ backgroundColor: primaryColor }}
                className="rounded-2xl h-14 px-10 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3 group"
              >
                Continuar
                <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                onClick={onSubmit}
                style={{ backgroundColor: primaryColor }}
                className="rounded-2xl h-14 px-10 font-black text-white hover:opacity-90 shadow-2xl transition-all gap-3"
              >
                <CheckCircle size={24} weight="bold" />
                {isEditing ? "Salvar Alterações" : "Finalizar Cadastro"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
