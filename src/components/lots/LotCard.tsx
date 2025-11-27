import { ArrowUpRight, PencilSimple, Trash, Calendar, MapPin, Medal, Package, Eye, Users, User, Stack, Tag } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LotDetailsModal } from "./LotDetailsModal";
import { ProductLot } from "@/types/lot";

interface LotCardProps {
  lot: ProductLot;
  onEdit: (lot: ProductLot) => void;
  onDelete: (id: string) => void;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
}

export const LotCard = ({ lot, onEdit, onDelete, branding }: LotCardProps) => {
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';
  
  // Detectar se é um blend - verificar tanto components quanto lot_components
  const isBlend = (lot.components && lot.components.length > 0) || (lot.lot_components && lot.lot_components.length > 0);
  
  // Usar components ou lot_components dependendo do que estiver disponível
  const blendComponents = lot.components || lot.lot_components || [];
  
  // Debug: verificar estrutura do lote
  // console.log("LotCard recebido:", lot);

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden border-0 bg-white shadow-sm flex flex-col h-full">
        {/* Imagem do lote - clicável para abrir detalhes */}
        <div 
          className="relative w-full h-32 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => setIsDetailsOpen(true)}
        >
          {lot.image_url ? (
            <img src={lot.image_url} alt={lot.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <Package className="w-12 h-12 text-gray-300" />
          )}
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300" />
          
          {/* Badge de Blend ou Individual no canto superior esquerdo da imagem */}
          <div className="absolute left-2 top-2">
            {isBlend ? (
              <Badge className="text-white text-xs font-medium border-0" style={{ backgroundColor: accentColor }}>
                <Stack className="w-3 h-3 mr-1" />
                Blend
              </Badge>
            ) : (
              <Badge className="text-white text-xs font-medium border-0" style={{ backgroundColor: primaryColor }}>
                <Medal className="w-3 h-3 mr-1" />
                Individual
              </Badge>
            )}
          </div>
        </div>
      
        <CardHeader className="pb-3 pt-5 px-5 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-gray-900 truncate mb-1 group-hover:text-primary transition-colors" style={{ color: 'inherit' }}>
                {lot.name}
              </CardTitle>
              <p className="text-xs text-gray-500 truncate">
                {lot.code}
              </p>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-gray-500 hover:bg-gray-100" 
                style={{ color: 'inherit' }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/lote/${lot.code}`);
                }} 
                title="Ver Página Pública"
                onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <ArrowUpRight className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-gray-500 hover:bg-gray-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(lot);
                }} 
                title="Editar"
                onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <PencilSimple className="h-3 w-3" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50" 
                    title="Excluir"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Lote</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o lote "{lot.name}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(lot.id)} 
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {/* Badges de categoria e variedade */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {lot.category && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                {lot.category}
              </Badge>
            )}
            {lot.variety && (
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-200">
                {lot.variety}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-between px-5 pb-5">
          {/* Informações principais - Layout compacto */}
          <div className="space-y-1.5 text-xs text-gray-600">
            {/* Quantidade de Matéria Prima */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{lot.quantity} {lot.unit}</span>
            </div>
            
            {/* Número de Selos */}
            {lot.seals_quantity && lot.quantity && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" style={{ color: secondaryColor }} />
                <span>
                  {(() => {
                    const packageSize = lot.quantity / lot.seals_quantity;
                    const roundedSize = Math.round(packageSize * 100) / 100;
                    
                    // Se a unidade for Kg e o tamanho for menor que 1, converter para gramas
                    if (lot.unit === 'Kg' && roundedSize < 1) {
                      const grams = Math.round(roundedSize * 1000);
                      return `${lot.seals_quantity} Selos em embalagens de ${grams}g`;
                    }
                    
                    return `${lot.seals_quantity} Selos em embalagens de ${roundedSize}${lot.unit}`;
                  })()}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Safra {lot.harvest_year}</span>
            </div>
          </div>
          
          {/* Produtor único ou múltiplos produtores para blend */}
          <div className="mt-auto">
            {isBlend ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {blendComponents.length} Produtor{blendComponents.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="ml-5 space-y-0.5">
                  {blendComponents.slice(0, 2).map((component, index) => (
                    <div key={component.id} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }}></div>
                      <span className="truncate text-xs text-gray-600">
                        {component.producers?.name || 'Produtor não informado'} 
                        <span className="text-gray-400 ml-1">({component.component_percentage}%)</span>
                      </span>
                    </div>
                  ))}
                  {blendComponents.length > 2 && (
                    <div className="text-xs text-gray-400">
                      +{blendComponents.length - 2} mais...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="truncate text-xs text-gray-600">{lot.producers?.name || 'Produtor não informado'}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <LotDetailsModal
        lot={lot}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
};
