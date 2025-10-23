import { ArrowUpRight, PencilSimple, Trash, Calendar, MapPin, Medal, Package, Eye, Users, Stack } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LotDetailsModal } from "./LotDetailsModal";

interface ProductLot {
  id: string;
  code: string;
  name: string;
  category: string | null;
  variety: string | null;
  harvest_year: string | null;
  quantity: number | null;
  unit: string | null;
  image_url: string | null;
  producer_id: string | null; // Pode ser null para blends
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
  created_at: string;
  producers: {
    id: string;
    name: string;
    property_name: string;
    city: string;
    state: string;
  } | null; // Pode ser null para blends
  components?: Array<{
    id: string;
    component_name: string;
    component_percentage: number;
    producers: {
      id: string;
      name: string;
      property_name: string;
      city: string;
      state: string;
    } | null;
    associations: {
      id: string;
      name: string;
      type: string;
    } | null;
  }>;
  lot_components?: Array<{
    id: string;
    component_name: string;
    component_percentage: number;
    producers: {
      id: string;
      name: string;
      property_name: string;
      city: string;
      state: string;
    } | null;
    associations: {
      id: string;
      name: string;
      type: string;
    } | null;
  }>;
}

interface LotCardProps {
  lot: ProductLot;
  onEdit: (lot: ProductLot) => void;
  onDelete: (id: string) => void;
}

export const LotCard = ({ lot, onEdit, onDelete }: LotCardProps) => {
  const navigate = useNavigate();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Detectar se é um blend - verificar tanto components quanto lot_components
  const isBlend = (lot.components && lot.components.length > 0) || (lot.lot_components && lot.lot_components.length > 0);
  
  // Usar components ou lot_components dependendo do que estiver disponível
  const blendComponents = lot.components || lot.lot_components || [];
  
  // Debug: verificar estrutura do lote
  console.log("LotCard recebido:", lot);
  console.log("lot.components:", lot.components);
  console.log("lot.lot_components:", lot.lot_components);
  console.log("Estrutura detalhada dos componentes:", blendComponents.map((c: any) => ({
    id: c.id,
    component_name: c.component_name,
    component_percentage: c.component_percentage,
    producers: c.producers,
    associations: c.associations
  })));
  
  // Calcular nota média arredondada
  const averageScore = Math.round(
    ((lot.fragrance_score ?? 0) + (lot.flavor_score ?? 0) + (lot.finish_score ?? 0) + (lot.acidity_score ?? 0)) / 4
  );

  return (
    <>
      <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-xl overflow-hidden border-0 bg-white shadow-sm flex flex-col h-full">
        {/* Imagem do lote - clicável para abrir detalhes */}
        <div 
          className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => setIsDetailsOpen(true)}
        >
          {lot.image_url ? (
            <img src={lot.image_url} alt={lot.name} className="object-cover w-full h-full" />
          ) : (
            <Package className="w-16 h-16 text-gray-300" />
          )}
          {/* Overlay sutil */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-300" />
        </div>
      
        <CardHeader className="pb-3 pt-4 px-4 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 truncate mb-1">
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
                className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50" 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/lote/${lot.code}`);
                }} 
                title="Ver Página Pública"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(lot);
                }} 
                title="Editar"
              >
                <PencilSimple className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50" 
                    title="Excluir"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash className="h-4 w-4" />
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
          <div className="flex flex-wrap gap-2 mt-3">
            {isBlend && (
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium">
                <Stack className="w-3 h-3 mr-1" />
                Blend
              </Badge>
            )}
            {lot.category && (
              <Badge variant="secondary" className="text-xs">
                {lot.category}
              </Badge>
            )}
            {lot.variety && (
              <Badge variant="outline" className="text-xs">
                {lot.variety}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4 px-4 pb-4">
          {/* Informações principais */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span>{lot.quantity} {lot.unit}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>Safra {lot.harvest_year}</span>
            </div>
            
            {/* Produtor único ou múltiplos produtores para blend */}
            {isBlend ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">
                    {blendComponents.length} Componente{blendComponents.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {blendComponents.slice(0, 2).map((component, index) => (
                    <div key={component.id} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span className="truncate">
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
                <Medal className="h-4 w-4 text-gray-400" />
                <span className="truncate">{lot.producers?.name || 'Produtor não informado'}</span>
              </div>
            )}
          </div>
          
          {/* Análise sensorial - design minimalista */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Análise Sensorial</span>
              <span className="text-gray-400 font-medium">
                {averageScore}/10
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Fragrância</span>
                  <span className="font-medium">{Math.round(lot.fragrance_score ?? 0)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-purple-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(lot.fragrance_score ?? 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Sabor</span>
                  <span className="font-medium">{Math.round(lot.flavor_score ?? 0)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-green-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(lot.flavor_score ?? 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Finalização</span>
                  <span className="font-medium">{Math.round(lot.finish_score ?? 0)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(lot.finish_score ?? 0) * 10}%` }} 
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Acidez</span>
                  <span className="font-medium">{Math.round(lot.acidity_score ?? 0)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div 
                    className="bg-pink-400 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${(lot.acidity_score ?? 0) * 10}%` }} 
                  />
                </div>
              </div>
            </div>
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