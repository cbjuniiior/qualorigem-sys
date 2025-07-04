import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  QrCode, 
  DownloadSimple, 
  Printer, 
  Copy, 
  Package,
  Eye,
  MagnifyingGlass,
  Funnel
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi, ProductLot } from "@/services/api";
import { toast } from "sonner";

// Componente QR Code simples (em produção, use uma biblioteca como qrcode.react)
const QRCodeDisplay = ({ value }: { value: string }) => {
  return (
    <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-mono">{value.slice(0, 8)}...</p>
      </div>
    </div>
  );
};

export const ProducerQRCodes = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      setLoading(true);
      const data = await productLotsApi.getByProducer(user?.id);
      setLotes(data || []);
    } catch (error) {
      console.error("Erro ao buscar lotes:", error);
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  };

  const generateQRUrl = (loteCode: string) => {
    return `${window.location.origin}/lote/${loteCode}`;
  };

  const handleDownloadQR = (loteCode: string, loteName: string) => {
    // Em produção, implemente a geração real do QR code como imagem
    toast.info("Funcionalidade de download será implementada");
  };

  const handlePrintQR = (loteCode: string, loteName: string) => {
    // Em produção, implemente a impressão do QR code
    toast.info("Funcionalidade de impressão será implementada");
  };

  const handleCopyUrl = (loteCode: string) => {
    const url = generateQRUrl(loteCode);
    navigator.clipboard.writeText(url);
    toast.success("URL copiada para a área de transferência");
  };

  const filteredLotes = lotes.filter(lote => {
    const matchesSearch = lote.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lote.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || lote.category === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProducerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              QR Codes
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gere e gerencie QR codes para seus lotes.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre seus lotes para gerar QR codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por código ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de QR Codes */}
        <Card>
          <CardHeader>
            <CardTitle>QR Codes ({filteredLotes.length})</CardTitle>
            <CardDescription>
              Clique nos botões para baixar, imprimir ou copiar o QR code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredLotes.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum lote encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "todos" 
                    ? "Tente ajustar os filtros de busca."
                    : "Crie lotes primeiro para gerar QR codes."
                  }
                </p>
                {!searchTerm && statusFilter === "todos" && (
                  <Button asChild>
                    <Link to="/produtor/lotes/novo">
                      <Package className="h-4 w-4 mr-2" />
                      Criar Primeiro Lote
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLotes.map((lote) => (
                  <Card key={lote.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Lote {lote.code}</CardTitle>
                          <CardDescription className="text-sm">
                            {lote.name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {lote.category || 'ativo'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* QR Code */}
                      <div className="flex justify-center">
                        <QRCodeDisplay value={generateQRUrl(lote.code)} />
                      </div>
                      
                      {/* Informações do lote */}
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Variedade:</span>
                          <span className="font-medium">{lote.variety || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Safra:</span>
                          <span className="font-medium">{lote.harvest_year || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantidade:</span>
                          <span className="font-medium">
                            {lote.quantity || 0} {lote.unit || 'kg'}
                          </span>
                        </div>
                      </div>
                      
                      {/* URL do QR Code */}
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 break-all">
                        {generateQRUrl(lote.code)}
                      </div>
                      
                      {/* Ações */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadQR(lote.code, lote.name)}
                          className="flex-1"
                        >
                          <DownloadSimple className="h-3 w-3 mr-1" />
                          Baixar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrintQR(lote.code, lote.name)}
                          className="flex-1"
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Imprimir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopyUrl(lote.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link to={`/produtor/lotes/${lote.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar os QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Para Produtores</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Baixe ou imprima os QR codes para seus lotes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Cole os QR codes nos produtos ou embalagens</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">•</span>
                    <span>Compartilhe os QR codes com distribuidores</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Para Consumidores</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Escaneie o QR code com o celular</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Acesse informações detalhadas do produto</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Verifique a origem e rastreabilidade</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProducerLayout>
  );
}; 