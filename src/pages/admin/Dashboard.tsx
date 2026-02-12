import { useState, useEffect } from "react";
import {
  Users,
  Package,
  Eye,
  Calendar,
  MapPin,
  ChartBar,
  Ticket,
  Plus,
  CaretRight,
  Medal
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi, associationsApi, industriesApi, productLotCharacteristicsApi } from "@/services/api";
import { useBranding } from "@/hooks/use-branding";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import { toast } from "sonner";
import { ProducerForm } from "./Produtores";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LotForm, LOT_STEPS } from "@/components/lots/LotForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FormStepIndicator } from "@/components/ui/step-indicator";

interface DashboardStats {
  totalProducers: number;
  totalLots: number;
  totalViews: number;
  topCategories: { category: string; count: number }[];
  recentLots: any[];
  totalSeals30Days: number;
}

const PRODUCER_STEPS = [
  { id: 1, title: "Responsável" },
  { id: 2, title: "Vínculos" },
];

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
  const { branding } = useBranding();
  const { user } = useAuth();
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  const [showProducerSheet, setShowProducerSheet] = useState(false);
  const [showLotSheet, setShowLotSheet] = useState(false);
  const [lotCurrentStep, setLotCurrentStep] = useState(1);
  const [producerCurrentStep, setProducerCurrentStep] = useState(1);
  const [lotFormData, setLotFormData] = useState({
    code: "",
    name: "",
    category: "",
    harvest_year: "",
    quantity: "",
    unit: "",
    producer_id: "",
    brand_id: "",
    industry_id: "",
    association_id: "",
    sensory_type: "nota",
    fragrance_score: 5,
    flavor_score: 5,
    finish_score: 5,
    acidity_score: 5,
    body_score: 5,
    latitude: "",
    longitude: "",
    property_name: "",
    property_description: "",
    altitude: "",
    average_temperature: "",
    address: "",
    city: "",
    state: "",
    cep: "",
    address_internal_only: false,
    photos: [] as string[],
    components: [] as any[],
    characteristics: [] as { characteristic_id: string; value: string }[],
    youtube_video_url: "",
    video_delay_seconds: 10,
    video_description: "",
  });
  const [lotProducers, setLotProducers] = useState<any[]>([]);
  const [lotAssociations, setLotAssociations] = useState<any[]>([]);
  const [lotIndustries, setLotIndustries] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!tenant) return;
      try {
        setLoading(true);
        const [producers, lots] = await Promise.all([
          producersApi.getAll(tenant.id),
          productLotsApi.getAll(tenant.id),
        ]);

        const categoryCount = lots.reduce((acc: any, lot) => {
          const category = lot.category || "Sem categoria";
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

        const topCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const totalViews = lots.reduce((sum, lot) => sum + (lot.views ?? 0), 0);
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
  }, [tenant]);

  useEffect(() => {
    if (showLotSheet && tenant) {
      setLotCurrentStep(1);
      Promise.all([
        producersApi.getAll(tenant.id),
        associationsApi.getAll(tenant.id),
        industriesApi.getAll(tenant.id)
      ]).then(([p, a, i]) => {
        setLotProducers(p);
        setLotAssociations(a);
        setLotIndustries(i);
      });

      const generateCode = async () => {
        if (!lotFormData.code && tenant?.id) {
          try {
            const { generateLotCode } = await import("@/utils/lot-code-generator");
            const newCode = await generateLotCode(tenant.id);
            if (newCode) {
              setLotFormData((prev) => ({ ...prev, code: newCode }));
            }
          } catch (error) {
            console.error('Erro ao gerar código único:', error);
          }
        }
      };
      generateCode();
    }
  }, [showLotSheet, tenant]);

  const handleLotCreate = async () => {
    if (!tenant) return;
    try {
      const lotData = {
        ...lotFormData,
        quantity: lotFormData.quantity ? parseFloat(lotFormData.quantity) : null,
        seals_quantity: lotFormData.seals_quantity ? parseInt(lotFormData.seals_quantity) : null,
        latitude: lotFormData.latitude ? parseFloat(lotFormData.latitude) : null,
        longitude: lotFormData.longitude ? parseFloat(lotFormData.longitude) : null,
        altitude: lotFormData.altitude ? parseInt(lotFormData.altitude) : null,
        average_temperature: lotFormData.average_temperature ? parseFloat(lotFormData.average_temperature) : null,
        tenant_id: tenant.id
      };

      const { components, characteristics, ...cleanLotData } = lotData;
      const newLot = await productLotsApi.create(cleanLotData as any);
      
      if (lotFormData.components && lotFormData.components.length > 0) {
        await Promise.all(lotFormData.components.map(c => productLotsApi.createComponent({ ...c, lot_id: newLot.id, tenant_id: tenant.id })));
      }

      if (characteristics && characteristics.length > 0) {
        await Promise.all(characteristics.map(c => productLotCharacteristicsApi.create({ ...c, lot_id: newLot.id, tenant_id: tenant.id })));
      }

      toast.success("Lote criado com sucesso!");
      setShowLotSheet(false);
    } catch (error) {
      toast.error("Erro ao criar lote");
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

  const StatCardSkeleton = () => (
    <Card className="border-0 shadow-sm bg-white overflow-hidden">
      <div className="h-1 bg-slate-100" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description, 
    trend,
    color = primaryColor
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    trend?: { value: number; isPositive: boolean };
    color?: string;
  }) => (
    <Card className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
      <div className="h-1 transition-all duration-300 group-hover:h-1.5" style={{ backgroundColor: color }} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm"
            style={{ backgroundColor: `${color}10`, color: color }}
          >
            <Icon className="h-6 w-6" weight="fill" />
          </div>
          {trend && (
            <Badge variant="outline" className={`border-0 font-bold ${
              trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </Badge>
          )}
        </div>
        <div className="text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</h3>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
          {description && (
            <p className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
              <ChartBar size={12} /> {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Bem-vindo, {user?.user_metadata?.full_name?.split(' ')[0] || "Admin"}! 👋
            </h2>
            <p className="text-slate-500 font-medium">Aqui está o que está acontecendo no {branding?.siteTitle?.split(' - ')[0] || "GeoTrace"} hoje.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="rounded-xl border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              onClick={() => window.location.reload()}
            >
              Atualizar Dados
            </Button>
            <Button 
              className="rounded-xl font-bold text-white shadow-lg hover:opacity-90 transition-all"
              onClick={() => { setLotCurrentStep(1); setShowLotSheet(true); }}
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="mr-2 h-5 w-5" weight="bold" />
              Novo Lote
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title={labels.producers}
                value={stats.totalProducers}
                icon={Users}
                description="Parceiros ativos no sistema"
                trend={{ value: 12, isPositive: true }}
                color={primaryColor}
              />
              <StatCard
                title="Lotes Registrados"
                value={stats.totalLots}
                icon={Package}
                description="Produtos rastreados"
                trend={{ value: 8, isPositive: true }}
                color="#3b82f6"
              />
              <StatCard
                title="Visualizações"
                value={stats.totalViews.toLocaleString()}
                icon={Eye}
                description="Engajamento de consumidores"
                trend={{ value: 15, isPositive: true }}
                color="#8b5cf6"
              />
              <StatCard
                title="Selos (30 dias)"
                value={stats.totalSeals30Days.toLocaleString()}
                icon={Ticket}
                description="Volume de etiquetas geradas"
                color="#f59e0b"
              />
            </>
          )}
        </div>

        {/* Charts & Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* Lotes Recentes */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Lotes Recentes</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Últimos produtos inseridos na plataforma</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                className="font-bold hover:bg-primary/5 rounded-xl" 
                onClick={() => window.location.href=`/${tenant?.slug}/admin/lotes`}
                style={{ color: primaryColor }}
              >
                Ver Todos <CaretRight className="ml-1 h-4 w-4" weight="bold" />
              </Button>
            </CardHeader>
            <CardContent className="p-0 min-h-0">
              {loading ? (
                <div className="p-8 space-y-4">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                </div>
              ) : stats.recentLots.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Package size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold">Nenhum lote registrado recentemente.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {stats.recentLots.map((lot) => (
                    <div key={lot.id} className="group p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <div 
                            className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: `${primaryColor}10` }}
                          >
                            <Package 
                              size={28} 
                              weight="fill" 
                              style={{ color: primaryColor }}
                            />
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{lot.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1"><MapPin size={14} weight="fill" className="text-slate-300" /> {lot.city && lot.state ? `${lot.city}, ${lot.state}` : lot.city || lot.state || "Local não inf."}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span className="flex items-center gap-1"><Calendar size={14} weight="fill" className="text-slate-300" /> Safra {lot.harvest_year}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="bg-slate-100 text-slate-600 border-0 hover:bg-slate-200 font-bold px-3 py-1 rounded-lg">
                          {lot.category}
                        </Badge>
                        <span className="font-mono text-[10px] text-slate-300 font-black tracking-tighter">#{lot.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorias & Quick Actions */}
          <div className="space-y-8">
            <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden text-left">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <CardTitle className="text-xl font-black text-slate-900">Categorias</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Distribuição por tipo de produto</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="space-y-6">
                    {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {stats.topCategories.map((cat, index) => (
                      <div key={cat.category} className="space-y-2">
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span className="text-slate-700">{cat.category}</span>
                          <span style={{ color: primaryColor }}>{cat.count}</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ 
                              width: `${(cat.count / stats.totalLots) * 100}%`,
                              backgroundColor: index === 0 ? primaryColor : `${primaryColor}60`
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setProducerCurrentStep(1); setShowProducerSheet(true); }}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all group"
                style={{ backgroundColor: `${primaryColor}05` }}
              >
                <div 
                  className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform"
                  style={{ color: primaryColor }}
                >
                  <Users size={24} weight="fill" />
                </div>
                <span className="text-sm font-black tracking-tight text-center" style={{ color: primaryColor }}>Novo Produtor</span>
              </button>
              
              <button 
                onClick={() => window.location.href=`/${tenant?.slug}/admin/industria`}
                className="flex flex-col items-center gap-3 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all group"
              >
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                  <Medal size={24} weight="fill" />
                </div>
                <span className="text-sm font-black text-blue-700 tracking-tight text-center">Gestão Indústria</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sheets (Offcanvas) para Formulários */}
      <Sheet open={showProducerSheet} onOpenChange={setShowProducerSheet}>
        <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
          <div className="h-full flex flex-col bg-white">
            <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Users size={32} weight="fill" />
                  </div>
                  <div>
                    <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">Novo Produtor</SheetTitle>
                    <SheetDescription className="text-slate-500 font-bold text-base">Cadastre as informações do produtor e sua propriedade.</SheetDescription>
                  </div>
                </div>

                <FormStepIndicator steps={PRODUCER_STEPS} currentStep={producerCurrentStep} primaryColor={primaryColor} />
              </div>
            </SheetHeader>
            <div className="flex-1 relative flex flex-col min-h-0">
              <ProducerForm 
                branding={branding}
                currentStep={producerCurrentStep}
                setCurrentStep={setProducerCurrentStep}
                onSubmit={() => {
                  setShowProducerSheet(false);
                  toast.success("Produtor cadastrado com sucesso!");
                }} 
                onCancel={() => setShowProducerSheet(false)} 
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showLotSheet} onOpenChange={setShowLotSheet}>
        <SheetContent className="w-full sm:max-w-[80vw] sm:rounded-l-[2.5rem] border-0 p-0 overflow-hidden shadow-2xl">
          <div className="h-full flex flex-col bg-white">
            <SheetHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 text-left">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Package size={32} weight="fill" />
                  </div>
                  <div>
                    <SheetTitle className="text-3xl font-black text-slate-900 tracking-tight">Novo Lote</SheetTitle>
                    <SheetDescription className="text-slate-500 font-bold text-base">Configure os dados técnicos do produto.</SheetDescription>
                  </div>
                </div>

                <FormStepIndicator steps={LOT_STEPS} currentStep={lotCurrentStep} primaryColor={primaryColor} />
              </div>
            </SheetHeader>
            <div className="flex-1 relative flex flex-col min-h-0">
              <LotForm
                formData={lotFormData}
                setFormData={setLotFormData}
                producers={lotProducers}
                associations={lotAssociations}
                industries={lotIndustries}
                onSubmit={handleLotCreate}
                onCancel={() => setShowLotSheet(false)}
                isBlendMode={false}
                setIsBlendMode={() => {}}
                currentStep={lotCurrentStep}
                setCurrentStep={setLotCurrentStep}
                totalSteps={5}
                branding={branding}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default Dashboard;
