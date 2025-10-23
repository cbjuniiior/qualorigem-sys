import { Medal, Users, Calendar, Package, MapPin } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BlendComposition } from "../BlendComposition";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

interface ProductionStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode: boolean;
  producers: Producer[];
  associations: any[];
}

export const ProductionStep = ({ formData, setFormData, isBlendMode, producers, associations }: ProductionStepProps) => {
  return (
    <div className="space-y-6">
      {isBlendMode ? (
        // Modo Blend - Composição do Blend
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Composição do Blend</h3>
              <p className="text-xs text-gray-500">Configure os componentes e produtores</p>
            </div>
          </div>
          
          <BlendComposition 
            formData={formData}
            setFormData={setFormData}
            producers={producers}
            associations={associations}
          />
        </div>
      ) : (
        // Modo Produto Único - Informações de Produção
        <div className="space-y-6">
          {/* Informações do Produtor */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Medal className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Produtor</h3>
                <p className="text-xs text-gray-500">Selecione o produtor responsável</p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="producer_id" className="text-sm font-medium mb-2 block">
                Produtor *
              </Label>
              <Select value={formData.producer_id} onValueChange={value => setFormData({ ...formData, producer_id: value })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione o produtor" />
                </SelectTrigger>
                <SelectContent>
                  {producers.map((producer) => (
                    <SelectItem key={producer.id} value={producer.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{producer.name}</span>
                        <span className="text-sm text-gray-500">{producer.property_name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações da Safra */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Informações da Safra</h3>
                <p className="text-xs text-gray-500">Dados da colheita e produção</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="harvest_year" className="text-sm font-medium mb-2 block">
                  Ano da Safra *
                </Label>
                <Input 
                  id="harvest_year" 
                  type="number" 
                  value={formData.harvest_year} 
                  onChange={e => setFormData({ ...formData, harvest_year: e.target.value })} 
                  placeholder="2024" 
                  className="h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="harvest_month" className="text-sm font-medium mb-2 block">
                  Mês da Colheita
                </Label>
                <Select value={formData.harvest_month} onValueChange={value => setFormData({ ...formData, harvest_month: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Quantidade e Unidade */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Quantidade Produzida</h3>
                <p className="text-xs text-gray-500">Volume total do lote</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                  Quantidade *
                </Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  step="0.01" 
                  value={formData.quantity} 
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })} 
                  placeholder="500" 
                  className="h-10"
                />
              </div>
              
              <div>
                <Label htmlFor="unit" className="text-sm font-medium mb-2 block">
                  Unidade *
                </Label>
                <Select value={formData.unit} onValueChange={value => setFormData({ ...formData, unit: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kg">Quilogramas (Kg)</SelectItem>
                    <SelectItem value="L">Litros (L)</SelectItem>
                    <SelectItem value="un">Unidades</SelectItem>
                    <SelectItem value="g">Gramas (g)</SelectItem>
                    <SelectItem value="ml">Mililitros (ml)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};