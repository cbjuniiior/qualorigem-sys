import { useState, useEffect } from "react";
import { 
  ChartBar, 
  TrendUp, 
  Users, 
  Package, 
  MapPin, 
  Calendar, 
  DownloadSimple, 
  FunnelSimple, 
  Tag, 
  CaretRight,
  FilePdf,
  FileCsv,
  Check
} from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi, associationsApi, brandsApi } from "@/services/api";
import { useBranding } from "@/hooks/use-branding";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";

interface ReportData {
  totalProducers: number;
  totalLots: number;
  totalSeals: number;
  productionUnitLabel: string;
  categories: { name: string; count: number }[];
  topProducers: { name: string; lots: number }[];
  cities: { city: string; count: number }[];
  monthlyGrowth: { month: string; producers: number; lots: number; seals: number; produced: number }[];
  associationData: { name: string; producers: number; lots: number }[];
}

const Relatorios = () => {
  const labels = useTenantLabels();
  const [reportData, setReportData] = useState<ReportData>({
    totalProducers: 0,
    totalLots: 0,
    totalSeals: 0,
    productionUnitLabel: "",
    categories: [],
    topProducers: [],
    cities: [],
    monthlyGrowth: [],
    associationData: [],
  });
  const [loading, setLoading] = useState(true);
  const { branding } = useBranding();
  const { tenant } = useTenant();

  const [filters, setFilters] = useState({
    associationId: "all",
    producerId: "all",
    brandId: "all",
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }
  });

  const [associations, setAssociations] = useState<any[]>([]);
  const [producers, setProducers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [rawLots, setRawLots] = useState<any[]>([]);
  const [producerAssociations, setProducerAssociations] = useState<{ producer_id: string; association_id: string }[]>([]);

  useEffect(() => {
    fetchAllData();
  }, [tenant]);

  const fetchAllData = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const [producersData, lotsData, associationsData, brandsData, producerAssocs] = await Promise.all([
        producersApi.getAll(tenant.id),
        productLotsApi.getAll(tenant.id),
        associationsApi.getAll(tenant.id),
        brandsApi.getAll(tenant.id),
        supabase.from("producers_associations").select("producer_id, association_id").eq("tenant_id", tenant.id),
      ]);

      setProducers(producersData);
      setRawLots(lotsData);
      setAssociations(associationsData);
      setBrands(brandsData || []);
      setProducerAssociations((producerAssocs as any)?.data || []);
      
    } catch (error) {
      toast.error("Erro ao carregar dados analíticos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) computeReport();
  }, [filters, loading]);

  const computeReport = () => {
    let filteredLots = rawLots;
    let filteredProducers = producers;

    // Filtrar por associação
    if (filters.associationId !== "all") {
      const assocId = filters.associationId;

      // produtores vinculados pela tabela pivot
      const producerIds = new Set(
        producerAssociations
          .filter((pa) => pa.association_id === assocId)
          .map((pa) => pa.producer_id)
      );

      filteredProducers = filteredProducers.filter((p) => producerIds.has(p.id));

      // lotes vinculados diretamente OU por componentes de blend
      filteredLots = filteredLots.filter((l: any) => {
        if (l.association_id === assocId) return true;
        const comps = l.lot_components || l.components || [];
        return Array.isArray(comps) && comps.some((c: any) => c?.association_id === assocId);
      });
    }

    if (filters.producerId !== "all") {
      filteredLots = filteredLots.filter(l => l.producer_id === filters.producerId);
      filteredProducers = filteredProducers.filter(p => p.id === filters.producerId);
    }

    if (filters.brandId !== "all") {
      filteredLots = filteredLots.filter((l: any) => l.brand_id === filters.brandId);
    }

    if (filters.dateRange.from && filters.dateRange.to) {
      const interval = { start: filters.dateRange.from, end: filters.dateRange.to };
      filteredLots = filteredLots.filter(l => isWithinInterval(parseISO(l.created_at), interval));
    }

    const categoryCount = filteredLots.reduce((acc: any, lot) => {
      const category = lot.category || "Sem categoria";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count: count as number }))
      .sort((a, b) => b.count - a.count);

    const producerLotCount = filteredLots.reduce((acc: any, lot) => {
      const producerName = lot.producers?.name || "Desconhecido";
      acc[producerName] = (acc[producerName] || 0) + 1;
      return acc;
    }, {});

    const topProducers = Object.entries(producerLotCount)
      .map(([name, lots]) => ({ name, lots: lots as number }))
      .sort((a, b) => b.lots - a.lots)
      .slice(0, 5);

    // Cidades ativas (baseado nos lotes, pois o rastreio/localização hoje é do lote)
    const cityCount = filteredLots.reduce((acc: any, lot: any) => {
      const city = (lot.city || lot.property_city || "").toString().trim();
      const state = (lot.state || lot.property_state || "").toString().trim();
      const label = city ? (state ? `${city}, ${state}` : city) : "N/A";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const cities = Object.entries(cityCount)
      .map(([city, count]) => ({ city, count: count as number }))
      .sort((a, b) => b.count - a.count);

    // Selos no sistema hoje são a quantidade definida/gerada no lote (seals_quantity)
    const totalSeals = filteredLots.reduce((acc: number, l: any) => acc + (Number(l.seals_quantity) || 0), 0);

    const monthlyGrowth = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthLabel = format(date, "MMM", { locale: ptBR });
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthLots = rawLots.filter(l => isWithinInterval(parseISO(l.created_at), { start: monthStart, end: monthEnd }));
      const monthProducers = producers.filter(p => isWithinInterval(parseISO(p.created_at), { start: monthStart, end: monthEnd }));
      const monthSeals = monthLots.reduce((acc: number, l: any) => acc + (Number(l.seals_quantity) || 0), 0);
      const monthProduced = monthLots.reduce((acc: number, l: any) => acc + (Number(l.quantity) || 0), 0);

      return { month: monthLabel, producers: monthProducers.length, lots: monthLots.length, seals: monthSeals, produced: monthProduced };
    });

    const unitSet = new Set(
      filteredLots
        .map((l: any) => (l?.unit || "").toString().trim().toLowerCase())
        .filter(Boolean)
    );
    const productionUnitLabel =
      unitSet.size === 1 ? Array.from(unitSet)[0] : unitSet.size > 1 ? "unidades mistas" : "";

    setReportData({
      totalProducers: filteredProducers.length,
      totalLots: filteredLots.length,
      totalSeals,
      productionUnitLabel,
      categories,
      topProducers,
      cities,
      monthlyGrowth,
      associationData: [] // Mockup for now
    });
  };

  const primaryColor = branding?.primaryColor || '#16a34a';

  const SearchableSelect = ({
    label,
    value,
    onChange,
    placeholder,
    options,
    allLabel,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
    allLabel: string;
  }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const selectedLabel =
      value === "all" ? allLabel : options.find((o) => o.value === value)?.label;

    const normalize = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    const filteredOptions = query
      ? options.filter((o) => normalize(o.label).includes(normalize(query)))
      : options;

    return (
      <div className="flex-1 min-w-[240px] space-y-2">
        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</Label>
        <Popover
          open={open}
          onOpenChange={(v) => {
            if (v) setQuery("");
            setOpen(v);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 justify-between hover:bg-slate-100"
            >
              <span className="truncate">{selectedLabel || placeholder}</span>
              <FunnelSimple size={18} weight="bold" className="ml-3 text-slate-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
            <div className="p-3">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <FunnelSimple size={16} weight="bold" className="text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="h-8 border-0 bg-transparent px-0 font-bold text-slate-700 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="mt-2 max-h-[280px] overflow-auto rounded-xl border border-slate-100 bg-white">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange("all");
                    setOpen(false);
                  }}
                >
                  <Check
                    size={16}
                    weight="bold"
                    className={`${value === "all" ? "opacity-100" : "opacity-0"} text-emerald-600`}
                  />
                  <span className="truncate">{allLabel}</span>
                </button>

                <div className="h-px bg-slate-100" />

                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm font-bold text-slate-400">
                    Nenhum resultado.
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-left font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        size={16}
                        weight="bold"
                        className={`${value === opt.value ? "opacity-100" : "opacity-0"} text-emerald-600`}
                      />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color = primaryColor }: any) => (
    <Card className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="h-1" style={{ backgroundColor: color }} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: `${color}10`, color }}>
            <Icon size={24} weight="fill" />
          </div>
          <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-600 font-black">+12%</Badge>
        </div>
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-black text-slate-900 tracking-tighter">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <ChartBar size={32} style={{ color: primaryColor }} weight="fill" />
              Relatórios Analíticos
            </h2>
            <p className="text-slate-500 font-medium text-sm">Dados e insights detalhados do sistema {branding?.siteTitle?.split(' - ')[0] || "GeoTrace"}.</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="rounded-xl font-bold text-white hover:opacity-90 shadow-lg transition-all gap-2 h-12 px-6"
                style={{ backgroundColor: primaryColor, shadowColor: `${primaryColor}30` } as any}
              >
                <DownloadSimple size={20} weight="bold" /> Exportar Dados
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-xl border-slate-100 w-48">
              <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer">
                <FilePdf size={18} weight="bold" className="mr-2 text-rose-500" /> Baixar em PDF
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2.5 font-bold text-slate-600 cursor-pointer">
                <FileCsv size={18} weight="bold" className="mr-2 text-emerald-500" /> Baixar em CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros Avançados */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-6 items-end">
              <SearchableSelect
                label="Filtrar por Associação"
                value={filters.associationId}
                onChange={(v) => setFilters((prev) => ({ ...prev, associationId: v }))}
                placeholder="Todas as associações"
                allLabel="Todas Associações"
                options={associations.map((a) => ({ value: a.id, label: a.name }))}
              />

              <SearchableSelect
                label={`Filtrar por ${labels.producer}`}
                value={filters.producerId}
                onChange={(v) =>
                  setFilters((prev) => ({
                    ...prev,
                    producerId: v,
                    // ao trocar produtor, se a marca não pertencer a ele, resetar
                    brandId:
                      v === "all"
                        ? prev.brandId
                        : (brands || []).some((b: any) => b.id === prev.brandId && b.producer_id === v)
                          ? prev.brandId
                          : "all",
                  }))
                }
                placeholder={`Todos(as) ${labels.producers.toLowerCase()}`}
                allLabel={`Todos(as) ${labels.producers}`}
                options={producers.map((p) => ({ value: p.id, label: p.name }))}
              />

              <SearchableSelect
                label="Filtrar por Marca"
                value={filters.brandId}
                onChange={(v) => setFilters((prev) => ({ ...prev, brandId: v }))}
                placeholder="Todas as marcas"
                allLabel="Todas Marcas"
                options={(filters.producerId !== "all"
                  ? brands.filter((b: any) => b.producer_id === filters.producerId)
                  : brands
                ).map((b: any) => ({ value: b.id, label: b.name }))}
              />

              <div className="flex-1 min-w-[240px] space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Período de Análise</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 justify-start hover:bg-slate-100">
                      <Calendar size={18} weight="bold" className="mr-2" style={{ color: primaryColor }} />
                      {filters.dateRange.from ? format(filters.dateRange.from, "dd/MM/yy") : "Início"} - {filters.dateRange.to ? format(filters.dateRange.to, "dd/MM/yy") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                      onSelect={(range: any) => setFilters(prev => ({ 
                        ...prev, 
                        dateRange: { from: range?.from || prev.dateRange.from, to: range?.to || prev.dateRange.to } 
                      }))}
                      numberOfMonths={2}
                      locale={ptBR}
                      style={{ '--primary': primaryColor } as any}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button variant="ghost" className="h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 px-6" onClick={() => setFilters({
                associationId: "all",
                producerId: "all",
                brandId: "all",
                dateRange: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
              })}>Limpar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />) : (
            <>
              <StatCard title={`Total ${labels.producers}`} value={reportData.totalProducers} icon={Users} color="#10b981" />
              <StatCard title="Lotes Rastreados" value={reportData.totalLots} icon={Package} color="#3b82f6" />
              <StatCard title="Selos Emitidos" value={reportData.totalSeals.toLocaleString()} icon={Tag} color="#f59e0b" />
              <StatCard title="Cidades Atendidas" value={reportData.cities.length} icon={MapPin} color="#8b5cf6" />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Evolução do Sistema</CardTitle>
                  <CardDescription className="font-medium text-slate-400">Crescimento de lotes e {labels.producers.toLowerCase()} nos últimos meses</CardDescription>
                </div>
                <TrendUp size={32} className="text-primary/20" weight="fill" />
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full">
                {loading ? <Skeleton className="h-full w-full rounded-xl" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reportData.monthlyGrowth}>
                      <defs>
                        <linearGradient id="colorLots" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={primaryColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 700 }}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        name="Lotes"
                        dataKey="lots"
                        stroke={primaryColor}
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorLots)"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        name="Selos"
                        dataKey="seals"
                        stroke="#f59e0b"
                        strokeWidth={4}
                        fill="transparent"
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <CardTitle className="text-xl font-black text-slate-900">Categorias</CardTitle>
              <CardDescription className="font-medium text-slate-400">Distribuição por tipo de produto</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full flex flex-col items-center">
                {loading ? <Skeleton className="h-full w-full rounded-xl" /> : (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={reportData.categories}
                          dataKey="count"
                          nameKey="name"
                          cx="50%" cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={8}
                        >
                          {reportData.categories.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={[primaryColor, '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e'][index % 5]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-2 mt-4">
                      {reportData.categories.slice(0, 3).map((cat, i) => (
                        <div key={i} className="flex items-center justify-between text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: [primaryColor, '#3b82f6', '#f59e0b'][i % 3] }} />
                            <span className="text-slate-600">{cat.name}</span>
                          </div>
                          <span className="text-slate-900">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Produção x Selos (mensal) */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900">Produção x Selos Emitidos</CardTitle>
                <CardDescription className="font-medium text-slate-400">
                  Comparativo mensal entre quantidade produzida e emissão de selos
                </CardDescription>
              </div>
              <Tag size={28} className="text-primary/20" weight="fill" />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[320px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportData.monthlyGrowth}
                    barCategoryGap={8}
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
                    />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 700 }}
                      formatter={(value: any, name: any) => {
                        if (name === "Quantidade produzida") {
                          const unit = reportData.productionUnitLabel;
                          const label = unit ? `Quantidade produzida (${unit})` : "Quantidade produzida";
                          return [value, label];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar
                      name="Quantidade produzida"
                      dataKey="produced"
                      fill="#3b82f6"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      name="Selos emitidos"
                      dataKey="seals"
                      fill="#f59e0b"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <CardTitle className="text-xl font-black text-slate-900">Top {labels.producers}</CardTitle>
              <CardDescription className="font-medium text-slate-400">Liderança em volume de lotes registrados</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : (
                <div className="divide-y divide-slate-50">
                  {reportData.topProducers.map((p, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {i + 1}
                        </div>
                        <span className="font-black text-slate-700">{p.name}</span>
                      </div>
                      <Badge className="bg-slate-100 text-slate-600 border-0 font-black px-3 py-1 rounded-lg">{p.lots} Lotes</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <CardTitle className="text-xl font-black text-slate-900">Cidades Ativas</CardTitle>
              <CardDescription className="font-medium text-slate-400">Presença geográfica dos lotes registrados</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="p-8 space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div> : (
                <div className="divide-y divide-slate-50">
                  {reportData.cities.map((s, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <MapPin size={20} weight="fill" className="text-slate-300 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-black text-slate-700">{s.city}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-300 uppercase">Impacto</p>
                          <p className="text-sm font-black text-slate-700">{s.count} Lotes</p>
                        </div>
                        <CaretRight size={20} weight="bold" className="text-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Relatorios;
