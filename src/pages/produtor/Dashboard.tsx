import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Plus,
  Eye,
  QrCode,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi } from "@/services/api";
import { ProductLot } from "@/services/api";
import { toast } from "sonner";

export const ProducerDashboard = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesAtivos: 0,
    lotesVendidos: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      setLoading(true);
      const data = await productLotsApi.getByProducer(user?.id);
      
      setLotes(data || []);
      
      // Calcular estatísticas
      const totalLotes = data?.length || 0;
      const lotesAtivos = data?.filter(lote => lote.category === 'ativo').length || 0;
      const lotesVendidos = data?.filter(lote => lote.category === 'vendido').length || 0;
      const valorTotal = data?.reduce((sum, lote) => sum + (lote.quantity || 0), 0) || 0;
      
      setStats({
        totalLotes,
        lotesAtivos,
        lotesVendidos,
        valorTotal,
      });
    } catch (error) {
      console.error("Erro ao buscar lotes:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'vendido':
        return 'bg-blue-100 text-blue-800';
      case 'processando':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4" />;
      case 'vendido':
        return <CheckCircle className="h-4 w-4" />;
      case 'processando':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const recentLotes = lotes.slice(0, 5);

  return (
    <ProducerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard do Produtor
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Bem-vindo de volta! Aqui está uma visão geral dos seus lotes.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button asChild>
              <Link to="/produtor/lotes/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/produtor/qrcodes">
                <QrCode className="h-4 w-4 mr-2" />
                QR Codes
              </Link>
            </Button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Lotes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLotes}</div>
              <p className="text-xs text-muted-foreground">
                Lotes registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lotes Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lotesAtivos}</div>
              <p className="text-xs text-muted-foreground">
                Em produção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lotes Vendidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lotesVendidos}</div>
              <p className="text-xs text-muted-foreground">
                Comercializados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.valorTotal.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor estimado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de progresso */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso dos Lotes</CardTitle>
            <CardDescription>
              Distribuição dos seus lotes por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lotes Ativos</span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalLotes > 0 ? Math.round((stats.lotesAtivos / stats.totalLotes) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalLotes > 0 ? (stats.lotesAtivos / stats.totalLotes) * 100 : 0} 
                className="h-2"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lotes Vendidos</span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalLotes > 0 ? Math.round((stats.lotesVendidos / stats.totalLotes) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={stats.totalLotes > 0 ? (stats.lotesVendidos / stats.totalLotes) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lotes recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes Recentes</CardTitle>
            <CardDescription>
              Seus lotes mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : recentLotes.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum lote encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Comece criando seu primeiro lote para ver as informações aqui.
                </p>
                <Button asChild>
                  <Link to="/produtor/lotes/novo">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Lote
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLotes.map((lote) => (
                  <div
                    key={lote.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                                                 <h4 className="font-medium text-gray-900">
                           Lote {lote.code}
                         </h4>
                         <div className="flex items-center space-x-2 text-sm text-gray-500">
                           <MapPin className="h-3 w-3" />
                           <span>{lote.name || 'N/A'}</span>
                           <Calendar className="h-3 w-3 ml-2" />
                           <span>
                             {lote.harvest_year || 'N/A'}
                           </span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                                             <Badge className={getStatusColor(lote.category || 'ativo')}>
                         <div className="flex items-center space-x-1">
                           {getStatusIcon(lote.category || 'ativo')}
                           <span className="capitalize">{lote.category || 'ativo'}</span>
                         </div>
                       </Badge>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/produtor/lotes/${lote.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/produtor/qrcodes/${lote.id}`}>
                            <QrCode className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {lotes.length > 5 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link to="/produtor/lotes">
                        Ver Todos os Lotes
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProducerLayout>
  );
}; 