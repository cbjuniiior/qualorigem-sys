import { useState, useEffect } from "react";
import {
  Users,
  Package,
  TrendUp,
  Eye,
  Calendar,
  MapPin,
  Medal,
  ChartBar,
  ArrowUp,
  ArrowDown,
  Ticket
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { ProducerForm } from "./Produtores";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LotForm } from "@/components/lots/LotForm";

interface DashboardStats {
  totalProducers: number;
  totalLots: number;
  totalViews: number;
  topCategories: { category: string; count: number }[];
  recentLots: any[];
  totalSeals30Days: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducers: 0,
    totalLots: 0,
    totalViews: 0,
    topCategories: [],
    recentLots: [],
    totalSeals30Days: 0,
  });
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);
  const [showProducerModal, setShowProducerModal] = useState(false);
  const [showLotModal, setShowLotModal] = useState(false);
  const [lotFormData, setLotFormData] = useState({
    code: "",
    name: "",
    category: "",
    variety: "",
    harvest_year: "",
    quantity: "",
    unit: "",
    image_url: "",
    producer_id: "",
    fragrance_score: 5,
    flavor_score: 5,
    finish_score: 5,
    acidity_score: 5,
    body_score: 5,
    sensory_notes: "",
  });
  const [lotProducers, setLotProducers] = useState<any[]>([]);

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
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados em paralelo
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

        const topCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Visualizações reais
        const totalViews = lots.reduce((sum, lot) => sum + (lot.views ?? 0), 0);

        // Calcular total de selos dos lotes criados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentLots = lots.filter(lot => new Date(lot.created_at) >= thirtyDaysAgo);
        const totalSeals30Days = recentLots.reduce((acc, lot) => acc + (lot.seals_quantity || 0), 0);

        setStats({
          totalProducers: producers.length,
          totalLots: lots.length,
          totalViews,
          topCategories,
          recentLots: lots.slice(0, 5),
          totalSeals30Days,
        });
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast.error("Erro ao carregar dados do dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (showLotModal) {
      producersApi.getAll().then(setLotProducers);
      const generateCode = async () => {
        if (!lotFormData.code) {
          try {
            const { generateLotCode } = await import("@/utils/lot-code-generator");
            const newCode = await generateLotCode();
            if (newCode) {
              setLotFormData((prev) => ({ ...prev, code: newCode }));
            }
          } catch (error) {
            console.error('Erro ao gerar código único:', error);
            // Fallback: usar timestamp + random para garantir unicidade
            const year = new Date().getFullYear();
            const timestamp = Date.now().toString().slice(-6);
            const rand = Math.floor(1000 + Math.random() * 9000);
            setLotFormData((prev) => ({ ...prev, code: `PROD-${year}-${timestamp}-${rand}` }));
          }
        }
      };
      generateCode();
    }
  }, [showLotModal]);

  const handleLotCreate = async () => {
    try {
      const lotData = {
        ...lotFormData,
        quantity: lotFormData.quantity ? parseFloat(lotFormData.quantity) : null,
        fragrance_score: lotFormData.fragrance_score,
        flavor_score: lotFormData.flavor_score,
        finish_score: lotFormData.finish_score,
        acidity_score: lotFormData.acidity_score,
        body_score: lotFormData.body_score,
      };
      await productLotsApi.create(lotData);
      toast.success("Lote criado com sucesso!");
      setShowLotModal(false);
      setLotFormData({
        code: "",
        name: "",
        category: "",
        variety: "",
        harvest_year: "",
        quantity: "",
        unit: "",
        image_url: "",
        producer_id: "",
        fragrance_score: 5,
        flavor_score: 5,
        finish_score: 5,
        acidity_score: 5,
        body_score: 5,
        sensory_notes: "",
      });
    } catch (error) {
      toast.error("Erro ao criar lote");
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';

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
              {trend.isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
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
            <p className="text-gray-500 text-sm font-medium animate-pulse">Carregando dados...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Visão geral do sistema e métricas principais</p>
          </div>
          <div className="flex gap-3">
            <button 
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
              onClick={() => window.location.reload()}
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Produtores"
            value={stats.totalProducers}
            icon={Users}
            description="Produtores cadastrados e ativos"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total de Lotes"
            value={stats.totalLots}
            icon={Package}
            description="Lotes registrados no sistema"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Visualizações Totais"
            value={stats.totalViews.toLocaleString()}
            icon={Eye}
            description="Acessos às páginas dos lotes"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Selos Emitidos (30d)"
            value={stats.totalSeals30Days.toLocaleString()}
            icon={Ticket}
            description="Total de selos gerados no mês"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categorias mais populares - 1 Coluna */}
          <Card className="border border-gray-100 shadow-sm lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Medal className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Top Categorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.topCategories.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between group">
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
                        {item.category}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                      {item.count} lotes
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lotes recentes - 2 Colunas */}
          <Card className="border border-gray-100 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2" style={{ color: primaryColor }} weight="duotone" />
                Lotes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentLots.map((lot) => (
                  <div 
                    key={lot.id} 
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                      >
                        <Package className="h-5 w-5" weight="duotone" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{lot.name}</span>
                          <Badge variant="outline" className="text-[10px] px-2 h-5 bg-white">
                            {lot.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {lot.harvest_year}
                          </div>
                          {lot.producers?.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {lot.producers.city}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 mb-1">
                        {lot.quantity} {lot.unit}
                      </div>
                      <div className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {lot.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col items-center gap-3" 
            onClick={() => setShowProducerModal(true)}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-opacity-20"
              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
            >
              <Users className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Novo Produtor</div>
              <div className="text-xs text-gray-500">Cadastrar parceiro</div>
            </div>
          </button>

          <button 
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col items-center gap-3" 
            onClick={() => setShowLotModal(true)}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-opacity-20"
              style={{ backgroundColor: `${secondaryColor}10`, color: secondaryColor }}
            >
              <Package className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Novo Lote</div>
              <div className="text-xs text-gray-500">Registrar produto</div>
            </div>
          </button>

          <button 
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col items-center gap-3" 
            onClick={() => window.location.href='/admin/relatorios'}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-100"
            >
              <ChartBar className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Relatórios</div>
              <div className="text-xs text-gray-500">Análises e métricas</div>
            </div>
          </button>

          <button 
            className="p-6 bg-white border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center group flex flex-col items-center gap-3" 
            onClick={() => window.location.href='/admin/associacoes'}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 transition-colors duration-300 group-hover:bg-purple-100"
            >
              <Users className="h-6 w-6" weight="duotone" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">Associações</div>
              <div className="text-xs text-gray-500">Gerenciar entidades</div>
            </div>
          </button>
        </div>
      </div>

      {/* Dialogs para formulários */}
      <Dialog open={showProducerModal} onOpenChange={setShowProducerModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produtor</DialogTitle>
          </DialogHeader>
          <ProducerForm onSubmit={() => setShowProducerModal(false)} onCancel={() => setShowProducerModal(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={showLotModal} onOpenChange={setShowLotModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-2">
          <DialogHeader>
            <DialogTitle className="mt-4 px-6">Novo Lote</DialogTitle>
          </DialogHeader>
          <LotForm
            formData={lotFormData}
            setFormData={setLotFormData}
            producers={lotProducers}
            onSubmit={handleLotCreate}
            onCancel={() => setShowLotModal(false)}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Dashboard; 