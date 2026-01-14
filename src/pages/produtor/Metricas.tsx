import { useState, useEffect } from "react";
import { 
  ChartBar, 
  TrendUp, 
  Calendar, 
  Package, 
  MapPin, 
  CurrencyDollar, 
  Users, 
  Pulse, 
  Scales, 
  Eye, 
  CaretRight,
  ChartLineUp,
  DownloadSimple
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";

export const ProducerMetricas = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLotes: 0,
    lotesAtivos: 0,
    visualizacoes: 0,
    volumeTotal: 0,
    topVariedades: [] as any[],
    monthlyData: [] as any[],
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
        
        // Processar variedades
        const varCounts = data?.reduce((acc: any, l: any) => {
          if (l.variety) acc[l.variety] = (acc[l.variety] || 0) + 1;
          return acc;
        }, {});
        const topVars = Object.entries(varCounts || {})
          .map(([name, count]) => ({ name, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5);

        // Processar dados mensais (simulado para o gráfico)
        const monthly = [
          { month: 'Set', lots: 2, views: 140 },
          { month: 'Out', lots: 5, views: 320 },
          { month: 'Nov', lots: 3, views: 280 },
          { month: 'Dez', lots: 8, views: 540 },
          { month: 'Jan', lots: data?.length || 0, views: data?.reduce((s:number, l:any)=>s+(l.views||0),0) || 0 },
        ];

        setStats({
          totalLotes: data?.length || 0,
          lotesAtivos: data?.filter((l: any) => l.category !== 'vendido').length || 0,
          visualizacoes: data?.reduce((sum: number, l: any) => sum + (l.views || 0), 0) || 0,
          volumeTotal: data?.reduce((sum: number, l: any) => sum + (Number(l.quantity) || 0), 0) || 0,
          topVariedades: topVars,
          monthlyData: monthly
        });
      } catch (error) {
        toast.error("Erro ao carregar métricas");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const primaryColor = branding?.primaryColor || '#16a34a';

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}10`, color }}>
            <Icon size={24} weight="fill" />
          </div>
          {trend && <Badge className="bg-emerald-50 text-emerald-600 border-0 font-black">+{trend}%</Badge>}
        </div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-2xl font-black text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <ProducerLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ChartLineUp size={32} style={{ color: primaryColor }} weight="fill" />
              Análise de Desempenho
            </h2>
            <p className="text-slate-500 font-medium text-sm">Insights detalhados sobre sua produção e engajamento.</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl font-bold border-slate-200 text-slate-600 gap-2 h-12 px-6 hover:bg-slate-50 transition-all"
            style={{ '--primary': primaryColor } as any}
          >
            <DownloadSimple size={20} weight="bold" style={{ color: primaryColor }} /> Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />) : (
            <>
              <StatCard title="Total de Lotes" value={stats.totalLotes} icon={Package} color={primaryColor} trend="8" />
              <StatCard title="Visualizações" value={stats.visualizacoes.toLocaleString()} icon={Eye} color="#8b5cf6" trend="15" />
              <StatCard title="Volume Produzido" value={`${stats.volumeTotal} Kg`} icon={Scales} color="#3b82f6" />
              <StatCard title="Eficiência" value="94%" icon={Pulse} color="#f59e0b" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-8 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Engajamento do Consumidor</CardTitle>
                <CardDescription className="font-medium text-slate-400">Visualizações dos QR Codes ao longo do tempo</CardDescription>
              </div>
              <Eye size={32} className="text-slate-100" weight="fill" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full">
                {loading ? <Skeleton className="h-full w-full rounded-2xl" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                      <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                      <Area type="monotone" dataKey="views" name="Visualizações" stroke={primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-8">
              <CardTitle className="text-xl font-black text-slate-900">Top Variedades</CardTitle>
              <CardDescription className="font-medium text-slate-400">Distribuição por tipo de cultivo</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {loading ? <div className="space-y-6">{Array(4).fill(0).map((_, i)=><Skeleton key={i} className="h-12 w-full rounded-xl"/>)}</div> : (
                <div className="space-y-6">
                  {stats.topVariedades.map((v, i) => (
                    <div key={i} className="space-y-2 group">
                      <div className="flex items-center justify-between font-bold text-sm">
                        <span className="text-slate-700 transition-colors group-hover:text-primary" style={{ '--primary': primaryColor } as any}>{v.name}</span>
                        <span style={{ color: primaryColor }}>{v.count} Lotes</span>
                      </div>
                      <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ 
                            width: `${(v.count / stats.totalLotes) * 100}%`,
                            backgroundColor: primaryColor
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                  {stats.topVariedades.length === 0 && (
                    <div className="py-10 text-center text-slate-400 font-bold">Sem dados de variedades.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-8">
              <CardTitle className="text-xl font-black text-slate-900">Status da Produção</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col items-center">
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Ativos', value: stats.lotesAtivos },
                          { name: 'Vendidos', value: stats.totalLotes - stats.lotesAtivos }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={primaryColor} />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-4 w-full">
                  <div 
                    className="text-center p-4 rounded-2xl border shadow-sm"
                    style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: `${primaryColor}80` }}>Em Aberto</p>
                    <p className="text-xl font-black" style={{ color: primaryColor }}>{stats.lotesAtivos}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Finalizados</p>
                    <p className="text-xl font-black text-slate-900">{stats.totalLotes - stats.lotesAtivos}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="border-b border-slate-50 p-8">
              <CardTitle className="text-xl font-black text-slate-900">Histórico de Crescimento</CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col justify-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}} />
                    <Bar dataKey="lots" name="Novos Lotes" fill={primaryColor} radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProducerLayout>
  );
};

export default ProducerMetricas;