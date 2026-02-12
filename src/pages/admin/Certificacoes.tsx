import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { certificationsApi } from "@/services/api";
import { uploadCertificateToSupabase } from "@/services/upload";
import { toast } from "sonner";
import {
  Plus,
  PencilSimple,
  MagnifyingGlass,
  Trash,
  FileText,
  Download,
  Certificate,
  CheckCircle,
  WarningCircle,
  Eye,
  EyeSlash,
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
import type { Certification } from "@/services/api";

// Schema Zod para validação
const certificationSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  issuing_body: z.string().optional(),
  valid_until: z.string().optional(),
  is_public: z.boolean().default(true),
});

type CertificationFormData = z.infer<typeof certificationSchema>;

const Certificacoes = () => {
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [currentDocUrl, setCurrentDocUrl] = useState<string | null>(null);

  const form = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: "",
      issuing_body: "",
      valid_until: "",
      is_public: true,
    },
  });

  useEffect(() => {
    if (tenant?.id) loadData();
  }, [tenant?.id]);

  const loadData = async () => {
    if (!tenant?.id) return;
    try {
      setLoading(true);
      const data = await certificationsApi.getAll(tenant.id);
      setCertifications(data || []);
    } catch (error) {
      toast.error("Erro ao carregar certificações");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setPdfFile(null);
    setCurrentDocUrl(null);
    form.reset({ name: "", issuing_body: "", valid_until: "", is_public: true });
    setIsSheetOpen(true);
  };

  const openEdit = (cert: Certification) => {
    setEditing(cert);
    setPdfFile(null);
    setCurrentDocUrl(cert.document_url);
    form.reset({
      name: cert.name,
      issuing_body: cert.issuing_body || "",
      valid_until: cert.valid_until || "",
      is_public: cert.is_public ?? true,
    });
    setIsSheetOpen(true);
  };

  const onSubmit = async (data: CertificationFormData) => {
    if (!tenant?.id) return;
    try {
      setSaving(true);
      let documentUrl = currentDocUrl;

      // Upload PDF se houver novo arquivo
      if (pdfFile) {
        setUploading(true);
        try {
          documentUrl = await uploadCertificateToSupabase(pdfFile);
        } catch (err: any) {
          toast.error(err.message || "Erro ao fazer upload do PDF");
          return;
        } finally {
          setUploading(false);
        }
      }

      const payload = {
        tenant_id: tenant.id,
        name: data.name,
        issuing_body: data.issuing_body || null,
        valid_until: data.valid_until || null,
        document_url: documentUrl,
        is_public: data.is_public,
      };

      if (editing) {
        await certificationsApi.update(editing.id, payload);
        toast.success("Certificação atualizada!");
      } else {
        await certificationsApi.create(payload);
        toast.success("Certificação cadastrada!");
      }

      setIsSheetOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao salvar certificação");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await certificationsApi.delete(deletingId);
      toast.success("Certificação removida!");
      setDeletingId(null);
      loadData();
    } catch (error) {
      toast.error("Erro ao remover certificação");
    }
  };

  const filtered = certifications.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.issuing_body || "").toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Certificações</h1>
            <p className="text-slate-500 text-sm mt-1">
              Gerencie os certificados e documentos oficiais
            </p>
          </div>
          <Button
            onClick={openNew}
            className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shadow-lg"
          >
            <Plus size={18} weight="bold" className="mr-2" />
            Nova Certificação
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou órgão emissor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl border-slate-200"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-12 text-center">
              <Certificate size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-600 mb-1">Nenhuma certificação encontrada</h3>
              <p className="text-slate-400 text-sm">Cadastre sua primeira certificação para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cert => (
              <Card key={cert.id} className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 rounded-xl">
                        <FileText size={24} className="text-indigo-600" weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{cert.name}</h3>
                        {cert.issuing_body && (
                          <p className="text-xs text-slate-500">{cert.issuing_body}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cert)}>
                        <PencilSimple size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeletingId(cert.id)}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cert.valid_until && (
                      <div className="flex items-center gap-2">
                        {isExpired(cert.valid_until) ? (
                          <Badge variant="destructive" className="text-xs">
                            <WarningCircle size={12} className="mr-1" /> Expirado
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                            <CheckCircle size={12} className="mr-1" /> Válido
                          </Badge>
                        )}
                        <span className="text-xs text-slate-500">
                          até {new Date(cert.valid_until).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <Badge variant={cert.is_public ? "default" : "secondary"} className="text-xs">
                        {cert.is_public ? (
                          <><Eye size={12} className="mr-1" /> Público</>
                        ) : (
                          <><EyeSlash size={12} className="mr-1" /> Privado</>
                        )}
                      </Badge>
                      {cert.document_url && (
                        <a
                          href={cert.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <Download size={14} /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sheet Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? "Editar Certificação" : "Nova Certificação"}</SheetTitle>
            <SheetDescription>
              {editing ? "Atualize os dados da certificação" : "Cadastre uma nova certificação"}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Certificação *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Ex: Certificado Orgânico, Fair Trade..."
                className={form.formState.errors.name ? "border-red-500" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Órgão Emissor */}
            <div className="space-y-2">
              <Label htmlFor="issuing_body">Órgão Emissor</Label>
              <Input
                id="issuing_body"
                {...form.register("issuing_body")}
                placeholder="Ex: MAPA, IBD, Ecocert..."
              />
            </div>

            {/* Validade */}
            <div className="space-y-2">
              <Label htmlFor="valid_until">Válido até</Label>
              <Input
                id="valid_until"
                type="date"
                {...form.register("valid_until")}
              />
            </div>

            {/* Upload PDF */}
            <div className="space-y-2">
              <Label>Documento (PDF)</Label>
              {currentDocUrl && !pdfFile && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <FileText size={20} className="text-indigo-600" />
                  <a
                    href={currentDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:underline flex-1 truncate"
                  >
                    Documento atual
                  </a>
                </div>
              )}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                <input
                  type="file"
                  accept="application/pdf"
                  id="pdf-upload"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== 'application/pdf') {
                        toast.error("Apenas arquivos PDF são aceitos");
                        return;
                      }
                      setPdfFile(file);
                    }
                  }}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
                      <CheckCircle size={18} />
                      {pdfFile.name}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">
                      <FileText size={24} className="mx-auto mb-1 text-slate-300" />
                      Clique para selecionar um PDF
                      <br />
                      <span className="text-xs text-slate-400">Máximo 10MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Visibilidade */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <Label className="font-bold">Exibição Pública</Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mostrar na página pública do lote
                </p>
              </div>
              <Switch
                checked={form.watch("is_public")}
                onCheckedChange={v => form.setValue("is_public", v)}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold"
              disabled={saving || uploading}
            >
              {saving || uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {uploading ? "Enviando PDF..." : "Salvando..."}
                </div>
              ) : editing ? "Atualizar Certificação" : "Cadastrar Certificação"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover certificação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A certificação será removida permanentemente.
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

export default Certificacoes;
