import { useState, useEffect } from "react";
import {
  Users,
  Package,
  TrendUp,
  Eye,
  Calendar,
  MapPin,
  Medal,
  ChartBar
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProducerForm } from "./Produtores";
import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LotForm } from "@/components/lots/LotForm";

interface DashboardStats {
  totalProducers: number;
  totalLots: number;
  totalViews: number;
  topCategories: { category: string; count: number }[];
  recentLots: any[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducers: 0,
    totalLots: 0,
    totalViews: 0,
    topCategories: [],
    recentLots: [],
  });
  const [loading, setLoading] = useState(true);
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

        setStats({
          totalProducers: producers.length,
          totalLots: lots.length,
          totalViews,
          topCategories,
          recentLots: lots.slice(0, 5),
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
            // Chamar função do Supabase para gerar código único
            const { data, error } = await supabase.rpc('generate_unique_lot_code');
            if (error) throw error;
            setLotFormData((prev) => ({ ...prev, code: data }));
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendUp 
              className={`h-3 w-3 mr-1 ${
                trend.isPositive ? "text-green-500" : "text-red-500"
              }`} 
            />
            <span className={`text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}>
              {trend.isPositive ? "+" : "-"}{trend.value}% este mês
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema GeoTrace</p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Produtores"
            value={stats.totalProducers}
            icon={Users}
            description="Produtores cadastrados"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total de Lotes"
            value={stats.totalLots}
            icon={Package}
            description="Lotes de produtos"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Visualizações"
            value={stats.totalViews.toLocaleString()}
            icon={Eye}
            description="Consultas aos lotes"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Categorias"
            value={stats.topCategories.length}
            icon={Medal}
            description="Tipos de produtos"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categorias mais populares */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Medal className="h-5 w-5 mr-2 text-green-600" />
                Categorias Mais Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCategories.map((item, index) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-700 font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{item.category}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {item.count} lotes
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lotes recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                Lotes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentLots.map((lot) => (
                  <div key={lot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{lot.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {lot.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {lot.harvest_year}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {lot.producers?.city}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {lot.quantity} {lot.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Código: {lot.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center" onClick={() => setShowProducerModal(true)}>
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Adicionar Produtor</div>
                <div className="text-sm text-gray-500">Cadastrar novo produtor</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center" onClick={() => setShowLotModal(true)}>
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Criar Lote</div>
                <div className="text-sm text-gray-500">Registrar novo lote</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center" onClick={() => window.location.href='/admin/relatorios'}>
                <ChartBar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Ver Relatórios</div>
                <div className="text-sm text-gray-500">Análises e métricas</div>
              </button>
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center" onClick={() => window.location.href='/admin/associacoes'}>
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Associações</div>
                <div className="text-sm text-gray-500">Gerenciar entidades</div>
              </button>
            </div>
          </CardContent>
        </Card>
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