import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Buildings,
  Users,
  Package,
  CheckCircle,
  ArrowRight,
  Eye,
  Plus,
  ShieldCheck,
  Clock,
  TrendUp,
} from "@phosphor-icons/react";
import { platformApi } from "@/services/api";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;
  return `há ${Math.floor(diffDays / 365)} anos`;
}

function formatDate(date: Date): string {
  const days = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    ig: "IG",
    marca_coletiva: "Marca Coletiva",
    privado: "Privado",
  };
  return map[type] || type;
};

export const PlatformDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{
    total_tenants: number;
    active_tenants: number;
    total_users: number;
    total_lots: number;
  }>({ total_tenants: 0, active_tenants: 0, total_users: 0, total_lots: 0 });
  const [allTenants, setAllTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [globalStats, tenants] = await Promise.all([
          platformApi.getGlobalStats().catch(() => null),
          platformApi.getAllTenants(),
        ]);

        const list = tenants || [];
        setAllTenants(list);

        if (globalStats && typeof globalStats === "object") {
          setStats(globalStats);
        } else {
          setStats({
            total_tenants: list.length,
            active_tenants: list.filter((t: any) => t.status === "active").length,
            total_users: 0,
            total_lots: 0,
          });
        }
      } catch (error) {
        console.error(error);
        try {
          const tenants = await platformApi.getAllTenants();
          const list = tenants || [];
          setStats({
            total_tenants: list.length,
            active_tenants: list.filter((t: any) => t.status === "active").length,
            total_users: 0,
            total_lots: 0,
          });
          setAllTenants(list);
        } catch {
          /* ignore */
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const recentTenants = allTenants.slice(0, 5);

  const statCards = [
    { title: "Total Clientes", value: stats.total_tenants, icon: Buildings, color: "#a3e635" },
    { title: "Clientes Ativos", value: stats.active_tenants, icon: CheckCircle, color: "#22c55e" },
    { title: "Usuários Globais", value: stats.total_users, icon: Users, color: "#eab308" },
    { title: "Lotes Registrados", value: stats.total_lots, icon: Package, color: "#a78bfa" },
  ];

  const typeRows = [
    { type: "ig", label: "IG", color: "#a3e635" },
    { type: "marca_coletiva", label: "Marca Coletiva", color: "#22c55e" },
    { type: "privado", label: "Privado", color: "#eab308" },
  ];

  const typeCounts = allTenants.reduce(
    (acc: Record<string, number>, t: any) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalTenantsForPercentage = stats.total_tenants || allTenants.length || 1;
  const typePercentages = typeRows.reduce((acc, item) => {
    acc[item.type] = Math.round(((typeCounts[item.type] || 0) / totalTenantsForPercentage) * 100);
    return acc;
  }, {} as Record<string, number>);

  const activationRate =
    stats.total_tenants > 0 && stats.active_tenants > 0
      ? Math.round((stats.active_tenants / stats.total_tenants) * 100)
      : 0;

  const currentDate = formatDate(new Date());

  return (
    <PlatformLayout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Visão Geral</h1>
          <p className="text-slate-400 font-medium">Monitoramento global da plataforma QualOrigem.</p>
          <p className="text-sm text-slate-500">Bem-vindo! Hoje é {currentDate}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 w-full rounded-2xl bg-slate-800/50 border border-slate-700/50 animate-pulse" />
            ))
          ) : (
            statCards.map((card) => (
              <Card 
                key={card.title} 
                className="border-0 shadow-lg bg-white/95 overflow-hidden rounded-2xl border-slate-200/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default"
              >
                <div className="h-1.5" style={{ backgroundColor: card.color }} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="p-3 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${card.color}20`, color: card.color }}
                    >
                      <card.icon size={24} weight="fill" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                      <TrendUp size={14} weight="bold" />
                      <span>--</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</h3>
                  <div className="text-3xl font-black text-slate-900">{card.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-black text-slate-500 uppercase tracking-widest">Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-5 pb-5">
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                className="rounded-xl font-bold bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-500/20 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2"
                onClick={() => navigate("/platform/tenants")}
              >
                <Plus size={18} className="mr-2" weight="bold" />
                Novo Cliente
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl font-bold border-lime-400/50 bg-white hover:bg-lime-50 hover:border-lime-400 text-lime-700 transition-all duration-200"
                onClick={() => navigate("/platform/users")}
              >
                <Users size={18} className="mr-2" weight="bold" />
                Gerenciar Usuários
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Últimos Clientes */}
          <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 lg:col-span-2">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black text-slate-900">Últimos Clientes</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/platform/tenants")}
                  className="text-lime-600 font-bold hover:text-lime-700 hover:bg-lime-50 transition-all duration-200"
                >
                  Ver todos <ArrowRight size={16} className="ml-1" weight="bold" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 w-full rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : recentTenants.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Buildings size={40} className="text-slate-400" weight="duotone" />
                  </div>
                  <p className="font-bold text-slate-600 mb-1">Nenhum cliente cadastrado</p>
                  <p className="text-sm text-slate-400 mb-6">Cadastre o primeiro cliente para começar.</p>
                  <Button
                    className="rounded-xl font-bold bg-lime-400 text-slate-900 hover:bg-lime-300 shadow-lg shadow-lime-500/20 transition-all duration-200"
                    onClick={() => navigate("/platform/tenants")}
                  >
                    <Plus size={18} className="mr-2" weight="bold" />
                    Cadastrar Cliente
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {recentTenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      role="button"
                      tabIndex={0}
                      className="relative flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer group border-l-4 border-l-transparent hover:border-l-lime-400 focus:outline-none focus-visible:bg-slate-50 focus-visible:border-l-lime-400"
                      onClick={() => navigate(`/platform/tenants/${tenant.id}`)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/platform/tenants/${tenant.id}`); } }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-all duration-200">
                          <Buildings size={20} className="text-slate-400 group-hover:text-slate-600 transition-all duration-200" weight="duotone" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{tenant.name}</p>
                          <p className="text-xs text-slate-400 font-mono">/{tenant.slug}</p>
                        </div>
                        <span className="text-xs text-slate-400 hidden sm:inline">
                          {tenant.created_at ? formatRelativeTime(tenant.created_at) : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className="text-xs font-bold">
                          {typeLabel(tenant.type)}
                        </Badge>
                        <Badge
                          className={`text-xs font-bold border-0 ${
                            tenant.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {tenant.status === "active" ? "Ativo" : "Suspenso"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/platform/tenants/${tenant.id}`);
                          }}
                        >
                          <Eye size={16} weight="bold" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Por Tipo */}
          <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50">
            <CardHeader className="border-b border-slate-100 px-6 py-5">
              <CardTitle className="text-lg font-black text-slate-900">Por Tipo</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                  <div className="h-16 w-full rounded-xl bg-slate-100 animate-pulse mt-4" />
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {typeRows.map((item) => {
                      const count = typeCounts[item.type] || 0;
                      const percentage = typePercentages[item.type] || 0;
                      return (
                        <button
                          key={item.type}
                          onClick={() => navigate("/platform/types")}
                          className="relative flex flex-col w-full p-3 bg-slate-50 rounded-xl hover:bg-slate-100 hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left border-l-4"
                          style={{ borderLeftColor: item.color }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">{item.label}</span>
                            <span className="text-lg font-black text-slate-900">{count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-200"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: item.color
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 mt-1">{percentage}%</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 p-5 bg-gradient-to-br from-lime-50 via-lime-50/80 to-lime-100 rounded-xl text-center border border-lime-200">
                    <p className="text-xs font-black text-lime-600 uppercase tracking-widest mb-2">
                      Taxa de Ativação
                    </p>
                    <p className="text-3xl font-black text-lime-700 mb-1">{activationRate}%</p>
                    <p className="text-xs font-bold text-lime-600">
                      {stats.active_tenants} de {stats.total_tenants} clientes
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PlatformLayout>
  );
};

export default PlatformDashboard;