import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { internalProducersApi, producersApi } from "@/services/api";
import { toast } from "sonner";
import {
  Plus,
  PencilSimple,
  MagnifyingGlass,
  Trash,
  Users,
  Upload,
  MapPin,
  IdentificationCard,
  FunnelSimple,
  CheckCircle,
  UsersThree,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import { useBranding } from "@/hooks/use-branding";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CsvImporter } from "@/components/csv/CsvImporter";
import type { InternalProducer } from "@/services/api";

const internalProducerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  document: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  cooperativa_id: z.string().optional(),
});

type InternalProducerFormData = z.infer<typeof internalProducerSchema>;

const BRAZILIAN_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const ProdutoresInternos = () => {
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  const { branding } = useBranding();
  const primaryColor = branding?.primaryColor || "#16a34a";
  const [producers, setProducers] = useState<any[]>([]);
  const [cooperativas, setCooperativas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCooperativa, setFilterCooperativa] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<InternalProducerFormData>({
    resolver: zodResolver(internalProducerSchema),
    defaultValues: { name: "", document: "", city: "", state: "", cooperativa_id: "" },
  });

  useEffect(() => {
    if (tenant?.id) loadData();
  }, [tenant?.id]);

  const loadData = async () => {
    if (!tenant?.id) return;
    try {
      setLoading(true);
      const [prods, coops] = await Promise.all([
        internalProducersApi.getAll(tenant.id),
        producersApi.getAll(tenant.id),
      ]);
      setProducers(prods || []);
      setCooperativas(coops || []);
    } catch (error) {
      toast.error("Erro ao carregar dados. Verifique se a migration V3 (Marca Coletiva) foi aplicada no banco.");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    form.reset({ name: "", document: "", city: "", state: "", cooperativa_id: "" });
    setIsSheetOpen(true);
  };

  const openEdit = (producer: any) => {
    setEditing(producer);
    form.reset({
      name: producer.name,
      document: producer.document || "",
      city: producer.city || "",
      state: producer.state || "",
      cooperativa_id: producer.cooperativa_id || "",
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (data: InternalProducerFormData) => {
    if (!tenant?.id) return;
    try {
      setSaving(true);
      const payload = {
        tenant_id: tenant.id,
        name: data.name,
        document: data.document || null,
        city: data.city || null,
        state: data.state || null,
        cooperativa_id: data.cooperativa_id || null,
      };

      if (editing) {
        await internalProducersApi.update(editing.id, payload);
        toast.success("Produtor interno atualizado!");
      } else {
        await internalProducersApi.create(payload);
        toast.success("Produtor interno cadastrado!");
      }

      setIsSheetOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await internalProducersApi.delete(deletingId);
      toast.success("Produtor interno removido!");
      setDeletingId(null);
      loadData();
    } catch (error) {
      toast.error("Erro ao remover");
    }
  };

  const handleCsvImport = async (rows: Record<string, string>[]) => {
    if (!tenant?.id) return;
    const inserts = rows.map(row => ({
      tenant_id: tenant.id,
      name: row.nome || row.name || "",
      document: row.documento || row.document || row.cpf || null,
      city: row.cidade || row.city || null,
      state: row.estado || row.state || row.uf || null,
      cooperativa_id: null as string | null,
    })).filter(r => r.name.trim() !== "");

    if (inserts.length === 0) {
      toast.error("Nenhum registro válido encontrado");
      return;
    }

    try {
      await internalProducersApi.bulkCreate(inserts);
      toast.success(`${inserts.length} produtores internos importados!`);
      setIsCsvOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Erro na importação");
    }
  };

  const filtered = producers.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.document || "").toLowerCase().includes(search.toLowerCase());
    const matchCooperativa = filterCooperativa === "all" || p.cooperativa_id === filterCooperativa;
    return matchSearch && matchCooperativa;
  });

  const getCoopName = (id: string | null) => {
    if (!id) return null;
    return cooperativas.find(c => c.id === id)?.name || null;
  };

  const vinculadosCount = producers.filter(p => p.cooperativa_id).length;
  const cooperativasComProdutoresCount = new Set(producers.filter(p => p.cooperativa_id).map(p => p.cooperativa_id)).size;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
              <Users size={32} style={{ color: primaryColor }} weight="fill" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Produtores Internos</h1>
              <p className="text-slate-500 text-sm mt-1">
                Produtores associados vinculados às {labels.producers.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCsvOpen(true)}
              className="font-bold rounded-xl h-11 focus-visible:ring-primary border-slate-200"
              style={{ "--primary": primaryColor } as React.CSSProperties}
            >
              <Upload size={18} weight="bold" className="mr-2" />
              Importar CSV
            </Button>
            <Button
              onClick={openNew}
              className="text-white font-bold rounded-xl px-6 h-11 shadow-lg hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={18} weight="bold" className="mr-2" />
              Novo Produtor Interno
            </Button>
          </div>
        </div>

        {/* Aviso quando não há cooperativas */}
        {!loading && cooperativas.length === 0 && (
          <Card className="border-0 shadow-sm rounded-2xl bg-amber-50 border border-amber-100">
            <CardContent className="py-3 px-4">
              <p className="text-sm text-amber-800 font-medium">
                Cadastre {labels.producers.toLowerCase()} na página{" "}
                <Link to={`/${tenant?.slug}/admin/produtores`} className="underline font-bold hover:opacity-80">
                  {labels.producers}
                </Link>{" "}
                para poder vinculá-las aos produtores internos.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por nome ou documento..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-slate-50 border-0 rounded-xl focus-visible:ring-primary font-medium"
                  style={{ "--primary": primaryColor } as React.CSSProperties}
                />
              </div>
              {cooperativas.length > 0 && (
                <Select value={filterCooperativa} onValueChange={setFilterCooperativa}>
                  <SelectTrigger
                    className="w-full sm:w-[220px] h-12 bg-slate-50 border-0 rounded-xl font-bold text-slate-600 focus:ring-primary"
                    style={{ "--primary": primaryColor } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-2">
                      <FunnelSimple size={18} weight="bold" style={{ color: primaryColor }} />
                      <SelectValue placeholder={`Filtrar por ${labels.producer.toLowerCase()}`} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Todas as {labels.producers.toLowerCase()}</SelectItem>
                    {cooperativas.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Users size={20} style={{ color: primaryColor }} weight="fill" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-xl font-black text-slate-900">{producers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <CheckCircle size={20} className="text-emerald-600" weight="fill" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vinculados</p>
                <p className="text-xl font-black text-slate-900">{vinculadosCount}</p>
              </div>
            </div>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50">
                <UsersThree size={20} className="text-blue-600" weight="fill" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{labels.producers}</p>
                <p className="text-xl font-black text-slate-900">{cooperativasComProdutoresCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white rounded-3xl p-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum produtor interno encontrado</h3>
            <p className="text-slate-400 font-medium">Cadastre ou importe produtores internos pelos botões acima.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(producer => (
              <Card key={producer.id} className="border-0 shadow-sm rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      >
                        {producer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{producer.name}</h3>
                        {producer.document && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <IdentificationCard size={12} /> {producer.document}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(producer)}>
                        <PencilSimple size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeletingId(producer.id)}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {(producer.city || producer.state) && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} /> {[producer.city, producer.state].filter(Boolean).join(" - ")}
                      </p>
                    )}
                    {getCoopName(producer.cooperativa_id) && (
                      <Badge variant="secondary" className="text-xs">
                        {getCoopName(producer.cooperativa_id)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b border-slate-100 pb-4">
            <SheetTitle>{editing ? "Editar Produtor Interno" : "Novo Produtor Interno"}</SheetTitle>
            <SheetDescription>
              Dados do produtor associado
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Nome do produtor"
                className={`h-12 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary ${form.formState.errors.name ? "border border-red-500" : ""}`}
                style={{ "--primary": primaryColor } as React.CSSProperties}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF / Documento</Label>
              <Input
                id="document"
                {...form.register("document")}
                placeholder="000.000.000-00"
                className="h-12 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary"
                style={{ "--primary": primaryColor } as React.CSSProperties}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Cidade"
                  className="h-12 rounded-xl bg-slate-50 border-0 focus-visible:ring-primary"
                  style={{ "--primary": primaryColor } as React.CSSProperties}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select
                  value={form.watch("state") || ""}
                  onValueChange={v => form.setValue("state", v)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {BRAZILIAN_STATES.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {cooperativas.length > 0 && (
              <div className="space-y-2">
                <Label>{labels.producer} vinculado(a)</Label>
                <Select
                  value={form.watch("cooperativa_id") || ""}
                  onValueChange={v => form.setValue("cooperativa_id", v)}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0">
                    <SelectValue placeholder={`Selecione ${labels.producer.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {cooperativas.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-white hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : editing ? "Atualizar" : "Cadastrar"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* CSV Import */}
      <CsvImporter
        open={isCsvOpen}
        onOpenChange={setIsCsvOpen}
        onImport={handleCsvImport}
        requiredColumns={["nome"]}
        optionalColumns={["documento", "cidade", "estado"]}
        title="Importar Produtores Internos"
        description="Faça upload de um arquivo CSV com os dados dos produtores internos."
      />

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="rounded-3xl border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produtor interno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl font-bold border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ProdutoresInternos;
