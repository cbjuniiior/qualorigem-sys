import { useState, useRef } from "react";
import { CaretLeft, CaretRight, Check, Package, Medal, Eye, Quotes } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StepIndicator } from "./StepIndicator";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ProductionStep } from "./steps/ProductionStep";
import { SensoryAnalysisStep } from "./steps/SensoryAnalysisStep";
import { NotesStep } from "./steps/NotesStep";
import { BlendComposition } from "./BlendComposition";

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
  isBlendMode: boolean;
  setIsBlendMode: (mode: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  onSubmit: () => void;
  onCancel: () => void;
}

export const LotForm = ({
  formData,
  setFormData,
  producers,
  associations,
  isBlendMode,
  setIsBlendMode,
  currentStep,
  setCurrentStep,
  totalSteps,
  onSubmit,
  onCancel
}: LotFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload único de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use JPG, PNG ou GIF.");
        return;
      }
      
      // Validar tamanho (máx. 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
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

  // URL para QRCode
  const qrValue = `${window.location.origin}/produto/${formData.code}`;

  // Configuração das etapas
  const steps = [
    {
      id: 1,
      title: "Tipo e Informações",
      description: "Tipo de lote e dados básicos",
      icon: Package,
      color: "blue"
    },
    {
      id: 2,
      title: "Produção",
      description: "Produtor e composição do blend",
      icon: Medal,
      color: "emerald"
    },
    {
      id: 3,
      title: "Análise Sensorial",
      description: "Características do produto",
      icon: Eye,
      color: "purple"
    },
    {
      id: 4,
      title: "Observações",
      description: "Informações adicionais e configurações",
      icon: Quotes,
      color: "orange"
    }
  ];

  // Funções de navegação
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Verificar se a etapa atual está completa
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.category;
      case 2:
        if (isBlendMode) {
          return formData.components.length > 0 && 
                 formData.components.some((c: any) => c.producer_id && c.component_name && c.component_percentage > 0);
        } else {
          return formData.producer_id && formData.quantity && formData.unit;
        }
      case 3:
        return true; // Análise Sensorial - Opcional
      case 4:
        return true; // Observações - Opcional
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Etapas */}
      <StepIndicator 
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />

      {/* Conteúdo das Etapas */}
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
        />
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {!isBlendMode ? (
            <ProductionStep
              formData={formData}
              setFormData={setFormData}
              isBlendMode={isBlendMode}
              producers={producers}
              qrValue={qrValue}
            />
          ) : (
            <BlendComposition
              formData={formData}
              setFormData={setFormData}
              producers={producers}
              associations={associations}
            />
          )}
        </div>
      )}

      {currentStep === 3 && (
        <SensoryAnalysisStep
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {currentStep === 4 && (
        <NotesStep
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/* Botões de navegação */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={prevStep}
            >
              <CaretLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={nextStep}
            >
              Próximo
              <CaretRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={onSubmit}
            >
              <Check className="w-4 h-4 mr-2" />
              Criar Lote
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
