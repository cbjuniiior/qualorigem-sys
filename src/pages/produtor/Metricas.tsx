import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Package,
  MapPin,
  DollarSign,
  Users,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi, ProductLot } from "@/services/api";
import { toast } from "sonner";

export const ProducerMetricas = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesAtivos: 0,
    lotesVendidos: 0,
    valorTotal: 0,
    mediaQuantidade: 0,
    topVariedades: [] as string[],
    distribuicaoPorMes: {} as Record<string, number>,
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
      const mediaQuantidade = totalLotes > 0 ? valorTotal / totalLotes : 0;
      
      // Top variedades
      const variedades = data?.map(lote => lote.variety).filter(Boolean) || [];
      const variedadesCount = variedades.reduce((acc, variedade) => {
        acc[variedade!] = (acc[variedade!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topVariedades = Object.entries(variedadesCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([variedade]) => variedade);
      
      // Distribuição por mês
      const distribuicaoPorMes = data?.reduce((acc, lote) => {
        const mes = new Date(lote.created_at).toLocaleDateString('pt-BR', { month: 'long' });
        acc[mes] = (acc[mes] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      setStats({
        totalLotes,
        lotesAtivos,
        lotesVendidos,
        valorTotal,
        mediaQuantidade,
        topVariedades,
        distribuicaoPorMes,
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

  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  return (
    <ProducerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Métricas
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Análise detalhada do desempenho dos seus lotes.
            </p>
          </div>
        </div>

        {/* Cards de estatísticas principais */}
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
              <Activity className="h-4 w-4 text-muted-foreground" />
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
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Quantidade Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.valorTotal.toLocaleString('pt-BR')} kg
              </div>
              <p className="text-xs text-muted-foreground">
                Quantidade total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e análises */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Distribuição por status */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>
                Proporção dos seus lotes por status atual
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
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lotes Processando</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalLotes > 0 ? Math.round(((stats.totalLotes - stats.lotesAtivos - stats.lotesVendidos) / stats.totalLotes) * 100) : 0}%
                  </span>
                </div>
                <Progress 
                  value={stats.totalLotes > 0 ? ((stats.totalLotes - stats.lotesAtivos - stats.lotesVendidos) / stats.totalLotes) * 100 : 0} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Top variedades */}
          <Card>
            <CardHeader>
              <CardTitle>Top Variedades</CardTitle>
              <CardDescription>
                Suas variedades mais cultivadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topVariedades.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma variedade registrada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topVariedades.map((variedade, index) => (
                    <div key={variedade} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{variedade}</span>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${100 - (index * 15)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por mês */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Mês</CardTitle>
              <CardDescription>
                Lotes criados por mês
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {meses.map(mes => {
                  const quantidade = stats.distribuicaoPorMes[mes] || 0;
                  const maxQuantidade = Math.max(...Object.values(stats.distribuicaoPorMes), 1);
                  const porcentagem = (quantidade / maxQuantidade) * 100;
                  
                  return (
                    <div key={mes} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{mes}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${porcentagem}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {quantidade}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Métricas adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Métricas Adicionais</CardTitle>
              <CardDescription>
                Informações complementares sobre seus lotes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Média por Lote</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.mediaQuantidade.toFixed(1)} kg
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Venda</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalLotes > 0 ? Math.round((stats.lotesVendidos / stats.totalLotes) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lotes Únicos</span>
                  <span className="text-sm text-muted-foreground">
                    {new Set(lotes.map(lote => lote.variety)).size}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Última Atividade</span>
                  <span className="text-sm text-muted-foreground">
                    {lotes.length > 0 
                      ? new Date(lotes[0].created_at).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lotes recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes Recentes</CardTitle>
            <CardDescription>
              Seus lotes mais recentemente criados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : lotes.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum lote encontrado
                </h3>
                <p className="text-gray-500">
                  Comece criando lotes para ver as métricas aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lotes.slice(0, 5).map((lote) => (
                  <div
                    key={lote.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Lote {lote.code}
                        </h4>
                        <p className="text-sm text-gray-600">{lote.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span>{lote.variety || 'N/A'}</span>
                          <span>•</span>
                          <span>{lote.quantity || 0} {lote.unit || 'kg'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(lote.category || 'ativo')}>
                        {lote.category || 'ativo'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(lote.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProducerLayout>
  );
}; 