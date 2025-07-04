import { useState, useEffect } from "react";
import { ChartBar, TrendUp, Users, Package, MapPin, Calendar, DownloadSimple } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi } from "@/services/api";
import { toast } from "sonner";

interface ReportData {
  totalProducers: number;
  totalLots: number;
  categories: { name: string; count: number }[];
  topProducers: { name: string; lots: number }[];
  states: { state: string; count: number }[];
  monthlyGrowth: { month: string; producers: number; lots: number }[];
}

const Relatorios = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalProducers: 0,
    totalLots: 0,
    categories: [],
    topProducers: [],
    states: [],
    monthlyGrowth: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      const [producers, lots] = await Promise.all([
        producersApi.getAll(),
        productLotsApi.getAll(),
      ]);

      // Calcular estatísticas
      const categoryCount = lots.reduce((acc: any, lot) => {
        const category = lot.category || "Sem categoria";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const categories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count);

      const producerCount = lots.reduce((acc: any, lot) => {
        const producerName = lot.producers?.name || "Desconhecido";
        acc[producerName] = (acc[producerName] || 0) + 1;
        return acc;
      }, {});

      const topProducers = Object.entries(producerCount)
        .map(([name, lots]) => ({ name, lots: lots as number }))
        .sort((a, b) => b.lots - a.lots)
        .slice(0, 5);

      const stateCount = producers.reduce((acc: any, producer) => {
        acc[producer.state] = (acc[producer.state] || 0) + 1;
        return acc;
      }, {});

      const states = Object.entries(stateCount)
        .map(([state, count]) => ({ state, count: count as number }))
        .sort((a, b) => b.count - a.count);

      // Simular crescimento mensal (em produção viria do analytics)
      const monthlyGrowth = [
        { month: "Jan", producers: 2, lots: 3 },
        { month: "Fev", producers: 3, lots: 5 },
        { month: "Mar", producers: 3, lots: 8 },
        { month: "Abr", producers: 3, lots: 8 },
      ];

      setReportData({
        totalProducers: producers.length,
        totalLots: lots.length,
        categories,
        topProducers,
        states,
        monthlyGrowth,
      });
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Simular exportação (em produção geraria um arquivo real)
    toast.success("Relatório exportado com sucesso!");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análises e métricas do sistema</p>
          </div>
          <Button onClick={exportReport} className="mt-4 sm:mt-0">
            <DownloadSimple className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Produtores
              </CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{reportData.totalProducers}</div>
              <p className="text-xs text-gray-500 mt-1">Produtores cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Lotes
              </CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{reportData.totalLots}</div>
              <p className="text-xs text-gray-500 mt-1">Lotes registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Categorias
              </CardTitle>
              <ChartBar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{reportData.categories.length}</div>
              <p className="text-xs text-gray-500 mt-1">Tipos de produtos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Estados
              </CardTitle>
              <MapPin className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{reportData.states.length}</div>
              <p className="text-xs text-gray-500 mt-1">Estados atendidos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categorias mais populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBar className="h-5 w-5 mr-2 text-green-600" />
                Categorias por Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-700 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(category.count / reportData.totalLots) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {category.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top produtores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Top Produtores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.topProducers.map((producer, index) => (
                  <div key={producer.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-700 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{producer.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {producer.lots} lotes
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Distribuição por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {reportData.states.map((state) => (
                <div key={state.state} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{state.count}</div>
                  <div className="text-sm text-gray-600">{state.state}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crescimento mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendUp className="h-5 w-5 mr-2 text-green-600" />
              Crescimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportData.monthlyGrowth.map((month) => (
                <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{month.month}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    <div>Produtores: {month.producers}</div>
                    <div>Lotes: {month.lots}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Relatorios; 