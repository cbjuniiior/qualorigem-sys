import { useEffect, useState } from "react";
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
      toast.error("Erro ao carregar dados");
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

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Produtores Internos</h1>
            <p className="text-slate-500 text-sm mt-1">
              Produtores associados vinculados às {labels.producers.toLowerCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCsvOpen(true)}
              className="font-bold rounded-xl h-11"
            >
              <Upload size={18} weight="bold" className="mr-2" />
              Importar CSV
            </Button>
            <Button
              onClick={openNew}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shadow-lg"
            >
              <Plus size={18} weight="bold" className="mr-2" />
              Novo Produtor Interno
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou documento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200"
            />
          </div>
          {cooperativas.length > 0 && (
            <Select value={filterCooperativa} onValueChange={setFilterCooperativa}>
              <SelectTrigger className="w-[220px] h-11 rounded-xl">
                <SelectValue placeholder={`Filtrar por ${labels.producer.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as {labels.producers.toLowerCase()}</SelectItem>
                {cooperativas.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <Card className="border-0 shadow-sm rounded-2xl px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users size={20} className="text-blue-600" weight="fill" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-xl font-black text-slate-900">{producers.length}</p>
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
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-12 text-center">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-1">Nenhum produtor interno encontrado</h3>
              <p className="text-slate-400 text-sm">Cadastre ou importe produtores internos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(producer => (
              <Card key={producer.id} className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
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
          <SheetHeader>
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
                className={form.formState.errors.name ? "border-red-500" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF / Documento</Label>
              <Input id="document" {...form.register("document")} placeholder="000.000.000-00" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" {...form.register("city")} placeholder="Cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Select
                  value={form.watch("state") || ""}
                  onValueChange={v => form.setValue("state", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecione ${labels.producer.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {cooperativas.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={saving}>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produtor interno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ProdutoresInternos;
