import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlass, QrCode, Leaf, Mountains, Medal } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Index = () => {
  const [searchCode, setSearchCode] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      toast.error("Digite um código de lote para buscar");
      return;
    }
    navigate(`/lote/${searchCode.trim()}`);
  };

  const handleQRScan = () => {
    // Simulação do scanner QR - em produção, integraria com uma biblioteca de scanner
    toast.info("Scanner QR será implementado em breve");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
                GeoTrace
              </h1>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-green-200 hover:bg-green-50"
              onClick={() => navigate("/auth/login")}
            >
              Acesso Produtor
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Rastreabilidade de
            <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Produtos Artesanais
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Descubra a origem, qualidade e história por trás de cada produto com Indicação Geográfica
          </p>

          {/* Search Section */}
          <Card className="max-w-2xl mx-auto mb-16 border-green-100 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Busque seu produto
              </h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Digite o código do lote"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="h-14 text-lg pr-14 border-green-200 focus:border-green-500"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-2 h-10 bg-green-600 hover:bg-green-700"
                  >
                    <MagnifyingGlass className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-4">Ou escaneie o QR Code do produto</p>
                <Button
                  onClick={handleQRScan}
                  variant="outline"
                  className="w-full h-12 border-green-200 hover:bg-green-50"
                >
                  <QrCode className="h-5 w-5 mr-2" />
                  Escanear QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mountains className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Origem Garantida</h4>
                <p className="text-gray-600 text-sm">
                  Conheça a propriedade, altitude, clima e terroir único de cada produto
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Medal className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Análise Sensorial</h4>
                <p className="text-gray-600 text-sm">
                  Perfil completo de sabor, aroma e características sensoriais
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sustentabilidade</h4>
                <p className="text-gray-600 text-sm">
                  Práticas sustentáveis e responsabilidade social certificada
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-green-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 GeoTrace. Sistema de rastreabilidade para produtos com Indicação Geográfica.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
