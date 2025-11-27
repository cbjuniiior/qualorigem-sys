import { useState, useEffect } from "react";
import { ChartBar, TrendUp, Users, Package, MapPin, Calendar, DownloadSimple, ArrowUp } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi, systemConfigApi } from "@/services/api";
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
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
      } catch (error) {
        console.error("Erro ao carregar branding:", error);
      }
    };
    loadBranding();
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

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend 
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="p-3 rounded-xl transition-colors duration-300 group-hover:bg-opacity-20"
            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
          >
            <Icon className="h-6 w-6" weight="duotone" />
          </div>
          {trend && (
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              <ArrowUp className="h-3 w-3 mr-1" />
              {trend.value}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
          <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
          {description && (
            <p className="text-xs text-gray-400 mt-2">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-12 h-12 border-4 rounded-full animate-spin"
              style={{ borderColor: `${primaryColor}30`, borderTopColor: primaryColor }}
            ></div>
            <p className="text-gray-500 text-sm font-medium animate-pulse">Carregando relatórios...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Relatórios</h1>
            <p className="text-gray-500 mt-1">Análises e métricas do sistema</p>
          </div>
          <Button 
            onClick={exportReport} 
            className="text-white hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <DownloadSimple className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Produtores"
            value={reportData.totalProducers}
            icon={Users}
            description="Produtores cadastrados"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total de Lotes"
            value={reportData.totalLots}
            icon={Package}
            description="Lotes registrados"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Categorias"
            value={reportData.categories.length}
            icon={ChartBar}
            description="Tipos de produtos"
          />
          <StatCard
            title="Estados"
            value={reportData.states.length}
            icon={MapPin}
            description="Estados atendidos"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Categorias mais populares */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ChartBar className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Categorias por Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reportData.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4 w-1/3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                        style={{ 
                          backgroundColor: index === 0 ? `${primaryColor}15` : '#f3f4f6',
                          color: index === 0 ? primaryColor : '#6b7280'
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${(category.count / reportData.totalLots) * 100}%`,
                            backgroundColor: primaryColor
                          }}
                        ></div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 min-w-[60px] justify-center">
                        {category.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top produtores */}
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Top Produtores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reportData.topProducers.map((producer, index) => (
                  <div key={producer.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                        style={{ 
                          backgroundColor: index === 0 ? `${primaryColor}15` : '#f3f4f6',
                          color: index === 0 ? primaryColor : '#6b7280'
                        }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {producer.name}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      {producer.lots} lotes
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por estado */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MapPin className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
              Distribuição por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {reportData.states.map((state) => (
                <div 
                  key={state.state} 
                  className="text-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 group"
                >
                  <div 
                    className="text-3xl font-bold mb-1 transition-colors"
                    style={{ color: primaryColor }}
                  >
                    {state.count}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{state.state}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crescimento mensal */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendUp className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
              Crescimento Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {reportData.monthlyGrowth.map((month) => (
                <div 
                  key={month.month} 
                  className="text-center p-6 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 hover:bg-white transition-all duration-300"
                >
                  <div className="text-lg font-bold text-gray-900 mb-3">{month.month}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="text-gray-500">Produtores</span>
                      <span className="font-bold text-gray-900">{month.producers}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg shadow-sm">
                      <span className="text-gray-500">Lotes</span>
                      <span className="font-bold text-gray-900">{month.lots}</span>
                    </div>
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