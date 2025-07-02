
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, Weight, Thermometer, Mountain, Award, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { SensorialRadarChart } from "@/components/SensorialRadarChart";

interface LoteData {
  id: string;
  nome: string;
  imagem: string;
  variedade?: string;
  safra: string;
  quantidade: string;
  unidade: string;
  produtor: {
    nome: string;
    propriedade: {
      nome: string;
      altitude: number;
      temperatura: number;
      cidade: string;
      estado: string;
      descricao: string;
    };
  };
  sensorial: {
    fragrancia: number;
    sabor: number;
    finalizacao: number;
    acidez: number;
    corpo: number;
    observacoes?: string;
  };
}

const LoteDetails = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [loteData, setLoteData] = useState<LoteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulação de dados - em produção, buscaria do Supabase
    const mockData: LoteData = {
      id: codigo || "",
      nome: "Café Especial Montanha Verde",
      imagem: "/placeholder.svg",
      variedade: "Bourbon Amarelo",
      safra: "2024",
      quantidade: "500",
      unidade: "Kg",
      produtor: {
        nome: "João Silva Santos",
        propriedade: {
          nome: "Fazenda Alto da Serra",
          altitude: 1200,
          temperatura: 22.5,
          cidade: "Campos do Jordão",
          estado: "SP",
          descricao: "Propriedade familiar com tradição de mais de 50 anos na produção de café especial, localizada na Serra da Mantiqueira.",
        },
      },
      sensorial: {
        fragrancia: 8.5,
        sabor: 9.0,
        finalizacao: 8.2,
        acidez: 7.8,
        corpo: 8.8,
        observacoes: "Notas de chocolate e caramelo, com acidez cítrica equilibrada e corpo aveludado.",
      },
    };

    setTimeout(() => {
      setLoteData(mockData);
      setLoading(false);
    }, 1000);
  }, [codigo]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${loteData?.nome} - Lote ${codigo}`,
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
                    {loteData.nome}
                  </h1>
                  <div className="space-y-3">
                    {loteData.variedade && (
                      <div className="flex items-center text-gray-600">
                        <Award className="h-5 w-5 mr-2 text-green-600" />
                        <span>Variedade: {loteData.variedade}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      <span>Safra {loteData.safra}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Weight className="h-5 w-5 mr-2 text-green-600" />
                      <span>{loteData.quantidade} {loteData.unidade}</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <img
                    src={loteData.imagem}
                    alt={loteData.nome}
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
                  <h3 className="font-semibold text-gray-900 mb-2">{loteData.produtor.nome}</h3>
                  <p className="text-gray-600">{loteData.produtor.propriedade.nome}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Mountain className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Altitude</div>
                    <div className="font-semibold text-gray-900">{loteData.produtor.propriedade.altitude}m</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <Thermometer className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">Temperatura Média</div>
                    <div className="font-semibold text-gray-900">{loteData.produtor.propriedade.temperatura}°C</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Localização</div>
                  <div className="font-medium text-gray-900">
                    {loteData.produtor.propriedade.cidade}, {loteData.produtor.propriedade.estado}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Sobre a Propriedade</div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {loteData.produtor.propriedade.descricao}
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
                  <SensorialRadarChart data={loteData.sensorial} />
                </div>
                
                {loteData.sensorial.observacoes && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Observações do Especialista</div>
                      <p className="text-gray-700 text-sm leading-relaxed italic">
                        "{loteData.sensorial.observacoes}"
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
