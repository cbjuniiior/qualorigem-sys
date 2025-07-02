
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Weight, Thermometer, Mountain, Award, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SensorialRadarChart } from "@/components/SensorialRadarChart";
import { productLotsApi } from "@/services/api";
import type { ProductLot } from "@/services/api";

// Interface para compatibilidade com dados do Supabase
interface LoteData {
  id: string;
  code: string;
  name: string;
  image_url: string | null;
  variety?: string;
  harvest_year: string;
  quantity: number | null;
  unit: string | null;
  producers: {
    id: string;
    name: string;
    property_name: string;
    property_description: string | null;
    city: string;
    state: string;
    altitude: number | null;
    average_temperature: number | null;
  };
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
}

const LoteDetails = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [loteData, setLoteData] = useState<LoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoteData = async () => {
      if (!codigo) return;
      
      try {
        const data = await productLotsApi.getByCode(codigo);
        setLoteData(data);
      } catch (error) {
        console.error("Erro ao buscar dados do lote:", error);
        toast.error("Erro ao carregar dados do lote");
      } finally {
        setLoading(false);
      }
    };

    fetchLoteData();
  }, [codigo]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${loteData?.name} - Lote ${codigo}`,
        text: `Conheça a origem e qualidade deste produto com Indicação Geográfica`,
        url: window.location.href,
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do lote...</p>
        </div>
      </div>
    );
  }

  if (!loteData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lote não encontrado</h2>
          <p className="text-gray-600 mb-6">O código "{codigo}" não foi encontrado em nossa base de dados.</p>
          <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à busca
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-green-700 hover:bg-green-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShare}
              className="border-green-200 hover:bg-green-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header do Produto */}
          <Card className="mb-8 border-green-100 shadow-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-100">
                    Lote #{codigo}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {loteData.name}
                  </h1>
                  <div className="space-y-3">
                    {loteData.variety && (
                      <div className="flex items-center text-gray-600">
                        <Award className="h-5 w-5 mr-2 text-green-600" />
                        <span>Variedade: {loteData.variety}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      <span>Safra {loteData.harvest_year}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Weight className="h-5 w-5 mr-2 text-green-600" />
                      <span>{loteData.quantity} {loteData.unit}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={loteData.image_url || "/placeholder.svg"}
                    alt={loteData.name}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Informações do Produtor */}
            <Card className="border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <MapPin className="h-5 w-5 mr-2" />
                  Origem do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{loteData.producers.name}</h3>
                  <p className="text-gray-600">{loteData.producers.property_name}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Mountain className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Altitude</div>
                    <div className="font-semibold text-gray-900">{loteData.producers.altitude}m</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <Thermometer className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Temperatura Média</div>
                    <div className="font-semibold text-gray-900">{loteData.producers.average_temperature}°C</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Localização</div>
                  <div className="font-medium text-gray-900">
                    {loteData.producers.city}, {loteData.producers.state}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Sobre a Propriedade</div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {loteData.producers.property_description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Análise Sensorial */}
            <Card className="border-green-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Award className="h-5 w-5 mr-2" />
                  Análise Sensorial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <SensorialRadarChart data={{
                    fragrancia: loteData.fragrance_score || 0,
                    sabor: loteData.flavor_score || 0,
                    finalizacao: loteData.finish_score || 0,
                    acidez: loteData.acidity_score || 0,
                    corpo: loteData.body_score || 0,
                  }} />
                </div>
                
                {loteData.sensory_notes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Observações do Especialista</div>
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{loteData.sensory_notes}"
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoteDetails;
