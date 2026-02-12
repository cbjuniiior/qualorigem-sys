import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  QrCode, 
  DownloadSimple, 
  Printer, 
  Copy, 
  Package, 
  Eye, 
  MagnifyingGlass, 
  FunnelSimple, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  ShareNetwork, 
  CaretRight, 
  Calendar
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
} from "@/components/ui/select";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { useTenant } from "@/hooks/use-tenant";
import { productLotsApi, systemConfigApi } from "@/services/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";

export const ProducerQRCodes = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [lotes, setLotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [branding, setBranding] = useState<any>(null);
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      if (!tenant || !user) return;
      try {
        setLoading(true);
        const [brand, data] = await Promise.all([
          systemConfigApi.getBrandingConfig(tenant.id),
          productLotsApi.getByProducer(user.id, tenant.id)
        ]);
        setBranding(brand);
        setLotes(data || []);
        
        // Gerar URLs
        const urls: Record<string, string> = {};
        const { generateQRCodeUrl } = await import("@/utils/qr-code-generator");
        for (const lote of data || []) {
          try {
            urls[lote.id] = await generateQRCodeUrl(lote.code, lote.category);
          } catch {
            urls[lote.id] = `${window.location.origin}/${tenant.slug}/lote/${lote.code}`;
          }
        }
        setQrUrls(urls);
      } catch (error) {
        toast.error("Erro ao carregar QR Codes");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, tenant]);

  const handleCopyUrl = (loteId: string) => {
    const url = qrUrls[loteId];
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("Link de rastreabilidade copiado!");
    }
  };

  const filteredLotes = lotes.filter(lote => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = lote.code.toLowerCase().includes(search) || lote.name.toLowerCase().includes(search);
    const matchesStatus = statusFilter === "todos" || lote.category === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const primaryColor = branding?.primaryColor || '#16a34a';
  const tenantSlug = tenant?.slug || 'default';

  return (
    <ProducerLayout>
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <QrCode size={32} style={{ color: primaryColor }} weight="fill" />
              Etiquetas de Origem
            </h2>
            <p className="text-slate-500 font-medium text-sm">Gere os códigos de rastreabilidade para suas embalagens.</p>
          </div>
        </div>

        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou código do lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-0 rounded-xl font-medium focus-visible:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger 
                  className="w-full sm:w-56 h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 focus:ring-primary"
                  style={{ '--primary': primaryColor } as any}
                >
                  <div className="flex items-center gap-2">
                    <FunnelSimple size={18} weight="bold" style={{ color: primaryColor }} />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="todos" className="font-bold">Todos Lotes</SelectItem>
                  <SelectItem value="ativo" className="font-medium">Ativo</SelectItem>
                  <SelectItem value="vendido" className="font-medium">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-3xl" />)}
          </div>
        ) : filteredLotes.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <QrCode size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum QR Code disponível</h3>
            <p className="text-slate-400 font-medium">Cadastre um lote para gerar sua etiqueta de rastreabilidade.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLotes.map((lote) => (
              <Card key={lote.id} className="group border-0 shadow-sm bg-white rounded-3xl hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
                <div className="p-8 flex-1 flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div 
                      className="absolute -inset-4 rounded-full blur-2xl group-hover:opacity-100 opacity-50 transition-all duration-500" 
                      style={{ backgroundColor: `${primaryColor}15` }}
                    />
                    <div className="relative bg-white p-4 rounded-3xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 group-hover:scale-105 transition-transform duration-500">
                      <QRCodeSVG 
                        value={qrUrls[lote.id] || ""} 
                        size={160} 
                        level="H"
                        includeMargin={false}
                        imageSettings={branding?.logoUrl ? {
                          src: branding.logoUrl,
                          x: undefined,
                          y: undefined,
                          height: 30,
                          width: 30,
                          excavate: true,
                        } : undefined}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-center gap-2">
                      <h4 className="text-xl font-black text-slate-900 truncate transition-colors group-hover:text-primary" style={{ '--primary': primaryColor } as any}>{lote.name}</h4>
                      <Badge 
                        className="border-0 font-black text-[9px] uppercase"
                        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                      >
                        {lote.category}
                      </Badge>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] font-mono">CODE: {lote.code}</p>
                  </div>

                  <div className="w-full pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                    <div className="text-left space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Safra</p>
                      <p className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                        <Calendar size={16} weight="fill" style={{ color: `${primaryColor}40` }} /> {lote.harvest_year}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Variedade</p>
                      <p className="text-sm font-black text-slate-700 truncate">{lote.variety || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 flex gap-2">
                  <Button variant="white" onClick={() => handleCopyUrl(lote.id)} className="flex-1 rounded-xl font-bold text-xs gap-2 shadow-sm border-0 hover:bg-white transition-all">
                    <ShareNetwork size={16} weight="bold" /> Link
                  </Button>
                  <Button variant="white" onClick={() => window.print()} className="flex-1 rounded-xl font-bold text-xs gap-2 shadow-sm border-0 hover:bg-white transition-all">
                    <Printer size={16} weight="bold" /> Imprimir
                  </Button>
                  <Button 
                    asChild 
                    variant="white" 
                    className="rounded-xl font-bold text-slate-400 border-0 hover:bg-white transition-all group/btn"
                  >
                    <Link to={`/${tenantSlug}/produtor/lotes`}>
                      <ArrowRight size={18} weight="bold" className="group-hover/btn:text-primary transition-colors" style={{ '--primary': primaryColor } as any} />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Knowledge Card */}
        <div 
          className="rounded-[2.5rem] p-10 relative overflow-hidden border transition-all duration-500"
          style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}10` }}
        >
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
                <Info size={18} style={{ color: primaryColor }} weight="fill" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guia de Uso</span>
              </div>
              <h3 className="text-3xl font-black tracking-tight leading-tight text-slate-800">Como utilizar suas etiquetas de rastreabilidade?</h3>
              <div className="space-y-4">
                {[
                  { title: "Impressão de Qualidade", desc: "Use papel adesivo fosco para evitar reflexos no escaneamento." },
                  { title: "Posicionamento Estratégico", desc: "Aplique em superfícies planas da embalagem para leitura fácil." },
                  { title: "Verificação de Link", desc: "Sempre teste o QR Code com seu celular antes de imprimir em massa." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div 
                      className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {i+1}
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-sm text-slate-700">{item.title}</p>
                      <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="w-64 h-64 bg-white rounded-3xl p-6 shadow-2xl rotate-3 flex items-center justify-center ring-1 ring-slate-100">
                <QRCodeSVG value={window.location.origin} size={200} />
              </div>
            </div>
          </div>
          <div 
            className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full -mr-48 -mt-48 opacity-10" 
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
    </ProducerLayout>
  );
};
