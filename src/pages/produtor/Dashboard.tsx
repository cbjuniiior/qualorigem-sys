import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  TrendUp, 
  Calendar, 
  MapPin, 
  Plus,
  Eye,
  QrCode,
  ChartBar,
  WarningCircle,
  CheckCircle,
  Clock,
  Ticket,
  CaretRight,
  Scales
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const ProducerDashboard = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesAtivos: 0,
    visualizacoes: 0,
    volumeTotal: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [brand, data] = await Promise.all([
          systemConfigApi.getBrandingConfig(),
          productLotsApi.getByProducer(user?.id)
        ]);
        
        setBranding(brand);
        setLotes(data || []);
        
        setStats({
          totalLotes: data?.length || 0,
          lotesAtivos: data?.filter((l: any) => l.category !== 'vendido').length || 0,
          visualizacoes: data?.reduce((sum: number, l: any) => sum + (l.views || 0), 0) || 0,
          volumeTotal: data?.reduce((sum: number, l: any) => sum + (Number(l.quantity) || 0), 0) || 0,
        });
      } catch (error) {
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const primaryColor = branding?.primaryColor || '#16a34a';

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}10`, color }}>
            <Icon size={24} weight="fill" />
          </div>
          <Badge variant="outline" className="border-slate-100 font-bold">Hoje</Badge>
        </div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-2xl font-black text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <ProducerLayout>
      <div className="space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Olá, {user?.user_metadata?.full_name?.split(' ')[0] || "Produtor"}! 🌿</h2>
            <p className="text-slate-500 font-medium">Veja o desempenho da sua produção e rastreabilidade.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              asChild 
              className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg h-12 px-6 transition-all"
              style={{ backgroundColor: primaryColor, shadowColor: `${primaryColor}30` } as any}
            >
              <Link to="/produtor/lotes">
                <Plus size={20} weight="bold" className="mr-2" /> Novo Lote
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />) : (
            <>
              <StatCard title="Meus Lotes" value={stats.totalLotes} icon={Package} color={primaryColor} />
              <StatCard title="Lotes Ativos" value={stats.lotesAtivos} icon={TrendUp} color="#3b82f6" />
              <StatCard title="Visualizações" value={stats.visualizacoes} icon={Eye} color="#8b5cf6" />
              <StatCard title="Volume Total" value={`${stats.volumeTotal} Kg`} icon={Scales} color="#f59e0b" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lotes Recentes */}
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Últimas Produções</CardTitle>
                <CardDescription className="font-medium text-slate-400">Acompanhe seus lotes mais recentes.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                asChild 
                className="font-bold hover:bg-primary/5 rounded-xl transition-all"
                style={{ color: primaryColor }}
              >
                <Link to="/produtor/lotes">Ver Todos <CaretRight className="ml-1" weight="bold" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="p-8 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div> : (
                <div className="divide-y divide-slate-50">
                  {lotes.slice(0, 5).map(lot => (
                    <div key={lot.id} className="p-6 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-5">
                        <img src={lot.image_url || "/placeholder.svg"} className="h-14 w-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div>
                          <h4 className="font-black text-slate-900 transition-colors group-hover:text-primary" style={{ '--primary': primaryColor } as any}>{lot.name}</h4>
                          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                            <span>#{lot.code}</span>
                            <span className="h-1 w-1 bg-slate-300 rounded-full" />
                            <span>Safra {lot.harvest_year}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 border-0 font-black px-3 py-1 rounded-lg uppercase text-[10px]">
                        {lot.category}
                      </Badge>
                    </div>
                  ))}
                  {lotes.length === 0 && (
                    <div className="p-20 text-center text-slate-400 font-bold">Nenhum lote registrado.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Links */}
          <div className="space-y-8">
            <Card 
              className="border-0 shadow-sm rounded-3xl overflow-hidden p-8 relative transition-all duration-500"
              style={{ backgroundColor: `${primaryColor}05`, border: `1px solid ${primaryColor}10` }}
            >
              <div className="relative z-10 space-y-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                  <QrCode size={24} weight="fill" style={{ color: primaryColor }} />
                </div>
                <div className="space-y-2 text-left">
                  <h3 className="text-xl font-black text-slate-800">Gerar QR Codes</h3>
                  <p className="text-sm text-slate-400 font-medium">Baixe as etiquetas de rastreabilidade para suas embalagens.</p>
                </div>
                <Button 
                  asChild 
                  className="w-full rounded-xl font-black text-white hover:opacity-90 h-12 transition-all shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Link to="/produtor/qrcodes">Acessar Etiquetas</Link>
                </Button>
              </div>
              <QrCode size={140} weight="thin" className="absolute -bottom-10 -right-10 text-primary/5 rotate-12" style={{ color: primaryColor }} />
            </Card>

            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 p-8">
                <CardTitle className="text-lg font-black">Links Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Link to="/produtor/metricas" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><ChartBar weight="fill" /></div>
                    <span className="font-bold text-slate-700">Ver Métricas</span>
                  </div>
                  <CaretRight weight="bold" className="text-slate-300" />
                </Link>
                <Link to="/produtor/configuracoes" className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-lg group-hover:scale-110 transition-transform"><Gear weight="fill" /></div>
                    <span className="font-bold text-slate-700">Configurações</span>
                  </div>
                  <CaretRight weight="bold" className="text-slate-300" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProducerLayout>
  );
};

export default ProducerDashboard;