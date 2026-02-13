import { useState, useEffect, useRef } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  Globe,
  Database,
  Info,
  Copy,
  Check,
  CheckCircle,
  Warning,
  Package,
  Certificate,
  UsersThree,
  Eye,
  Fingerprint,
  ChartBar,
  UserCircle,
  PaintBrush,
  Image,
  FloppyDisk,
  CircleNotch,
} from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { platformSettingsApi } from "@/services/api";
import { uploadPlatformFaviconToSupabase, uploadPlatformOgImageToSupabase } from "@/services/upload";
import type { PlatformSettings as PlatformSettingsType } from "@/services/api";

const MODULE_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  traceability: Package,
  certifications: Certificate,
  internal_producers: UsersThree,
  sensory_analysis: Eye,
  seal_control: Fingerprint,
  reports: ChartBar,
  crm: UserCircle,
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  traceability: "Rastreabilidade completa de lotes e produtos",
  certifications: "Gestão de certificações e selos de qualidade",
  internal_producers: "Cadastro e gestão de produtores internos",
  sensory_analysis: "Análise sensorial e avaliação de qualidade",
  seal_control: "Controle e validação de selos de rastreabilidade",
  reports: "Relatórios e análises de produção",
  crm: "Gestão de relacionamento com clientes",
};

const DEFAULT_SITE_TITLE = "QualOrigem - Painel Admin";
const DEFAULT_SITE_DESCRIPTION = "Sistema de rastreabilidade de origem.";

export const PlatformSettings = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsType | null>(null);
  const [personalizationLoading, setPersonalizationLoading] = useState(true);
  const [personalizationSaving, setPersonalizationSaving] = useState(false);
  const [formTitle, setFormTitle] = useState(DEFAULT_SITE_TITLE);
  const [formDescription, setFormDescription] = useState(DEFAULT_SITE_DESCRIPTION);
  const [formFaviconUrl, setFormFaviconUrl] = useState<string | null>(null);
  const [formOgImageUrl, setFormOgImageUrl] = useState<string | null>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const ogImageInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(null), 2000);
  };

  // Load platform settings (personalização)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await platformSettingsApi.get();
        if (cancelled) return;
        setPlatformSettings(data ?? null);
        if (data) {
          setFormTitle(data.site_title || DEFAULT_SITE_TITLE);
          setFormDescription(data.site_description ?? DEFAULT_SITE_DESCRIPTION);
          setFormFaviconUrl(data.favicon_url ?? null);
          setFormOgImageUrl(data.og_image_url ?? null);
        }
      } catch (e) {
        if (!cancelled) toast.error("Erro ao carregar personalização.");
      } finally {
        if (!cancelled) setPersonalizationLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSavePersonalization = async () => {
    setPersonalizationSaving(true);
    try {
      await platformSettingsApi.upsert({
        site_title: formTitle || DEFAULT_SITE_TITLE,
        site_description: formDescription || undefined,
        favicon_url: formFaviconUrl ?? undefined,
        og_image_url: formOgImageUrl ?? undefined,
      });
      toast.success("Personalização salva.");
    } catch (e) {
      toast.error("Erro ao salvar personalização.");
    } finally {
      setPersonalizationSaving(false);
    }
  };

  const handleFaviconFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }
    try {
      const url = await uploadPlatformFaviconToSupabase(file);
      setFormFaviconUrl(url);
      toast.success("Favicon enviado.");
    } catch (err) {
      toast.error("Erro ao enviar favicon.");
    }
    e.target.value = "";
  };

  const handleOgImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.");
      return;
    }
    try {
      const url = await uploadPlatformOgImageToSupabase(file);
      setFormOgImageUrl(url);
      toast.success("Imagem OG enviada.");
    } catch (err) {
      toast.error("Erro ao enviar imagem.");
    }
    e.target.value = "";
  };

  // Supabase info
  const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "";

  return (
    <PlatformLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Configurações</h2>
          <p className="text-slate-400 font-medium">Configurações globais da plataforma QualOrigem.</p>
        </div>

        {/* Personalização da plataforma */}
        <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 hover:shadow-xl transition-all duration-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-100 rounded-xl text-pink-600">
                <PaintBrush size={20} weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg font-black">Personalização e SEO</CardTitle>
                <CardDescription>Título, descrição e imagens usados na página raiz, no painel e ao compartilhar links (redes sociais). Nas páginas dos clientes (tenants) continua sendo usada a logo do tenant.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {personalizationLoading ? (
              <div className="flex items-center justify-center py-8">
                <CircleNotch className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Favicon</Label>
                  <p className="text-xs text-slate-500 mb-2">Usado nas abas do navegador nas páginas do painel (login, clientes, etc.). Nas páginas dos clientes (tenants) continua a logo do tenant.</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {(formFaviconUrl || platformSettings?.favicon_url) && (
                      <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                        <img src={formFaviconUrl || platformSettings?.favicon_url || ""} alt="Favicon" className="w-10 h-10 object-contain" />
                      </div>
                    )}
                    <input
                      ref={faviconInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFaviconFile}
                    />
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => faviconInputRef.current?.click()}>
                      <Image size={18} className="mr-2" /> {formFaviconUrl || platformSettings?.favicon_url ? "Trocar favicon" : "Enviar imagem"}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-site-title" className="text-xs font-black uppercase tracking-widest text-slate-500">Título do site (SEO e abas)</Label>
                  <p className="text-xs text-slate-500 mb-1">Exibido na aba do navegador e em compartilhamentos (og:title).</p>
                  <Input
                    id="platform-site-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={DEFAULT_SITE_TITLE}
                    className="rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-site-description" className="text-xs font-black uppercase tracking-widest text-slate-500">Descrição do site (SEO)</Label>
                  <p className="text-xs text-slate-500 mb-1">Meta description e og:description — aparece em buscas e ao compartilhar o link.</p>
                  <textarea
                    id="platform-site-description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder={DEFAULT_SITE_DESCRIPTION}
                    rows={3}
                    className="flex w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Imagem para redes sociais (OG Image)</Label>
                  <p className="text-xs text-slate-500 mb-2">Imagem exibida ao compartilhar o link no WhatsApp, Facebook, Twitter etc. Recomendado: 1200×630 px.</p>
                  <div className="flex items-start gap-4 flex-wrap">
                    {(formOgImageUrl || platformSettings?.og_image_url) && (
                      <div className="w-40 h-[105px] rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0">
                        <img src={formOgImageUrl || platformSettings?.og_image_url || ""} alt="Preview OG" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      ref={ogImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleOgImageFile}
                    />
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => ogImageInputRef.current?.click()}>
                      <Image size={18} className="mr-2" /> {formOgImageUrl || platformSettings?.og_image_url ? "Trocar imagem" : "Enviar imagem"}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleSavePersonalization}
                  disabled={personalizationSaving}
                  className="rounded-xl bg-lime-500 hover:bg-lime-600 text-white font-bold"
                >
                  {personalizationSaving ? <CircleNotch size={18} className="mr-2 animate-spin" /> : <FloppyDisk size={18} className="mr-2" />}
                  Salvar
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Platform Info */}
        <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 hover:shadow-xl transition-all duration-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-lime-100 rounded-xl text-lime-600">
                <Info size={20} weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg font-black">Informações da Plataforma</CardTitle>
                <CardDescription>Dados técnicos do ambiente.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1 hover:bg-slate-100 transition-colors cursor-default">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Versão</p>
                <p className="font-bold text-slate-900">QualOrigem v1.0.0</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1 hover:bg-slate-100 transition-colors cursor-default">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ambiente</p>
                <Badge variant="secondary" className="font-bold">{import.meta.env.MODE || "development"}</Badge>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1 hover:bg-slate-100 transition-colors cursor-default">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Supabase URL</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-slate-700 truncate flex-1">{supabaseUrl || "Não configurado"}</p>
                  {supabaseUrl && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(supabaseUrl, "URL")}>
                      {copied === "URL" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </Button>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1 hover:bg-slate-100 transition-colors cursor-default">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Build</p>
                <p className="font-mono text-sm text-slate-700">{new Date().toISOString().split("T")[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 hover:shadow-xl transition-all duration-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600">
                <ShieldCheck size={20} weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg font-black">Segurança</CardTitle>
                <CardDescription>Configurações de segurança e políticas.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
              <div>
                <p className="font-bold text-sm text-slate-900">Row-Level Security (RLS)</p>
                <p className="text-xs text-slate-500">Isolamento de dados entre tenants via políticas PostgreSQL.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold shadow-sm shadow-emerald-200/50">
                <CheckCircle size={14} className="mr-1" /> Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
              <div>
                <p className="font-bold text-sm text-slate-900">Multi-Tenant Isolation</p>
                <p className="text-xs text-slate-500">Cada cliente possui isolamento completo de dados.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold shadow-sm shadow-emerald-200/50">
                <CheckCircle size={14} className="mr-1" /> Ativo
              </Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-l-xl" />
              <div>
                <p className="font-bold text-sm text-slate-900">Autenticação</p>
                <p className="text-xs text-slate-500">Supabase Auth com confirmação de email.</p>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 font-bold shadow-sm shadow-emerald-200/50">
                <CheckCircle size={14} className="mr-1" /> Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* DB & Migration Guide */}
        <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 hover:shadow-xl transition-all duration-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-violet-100 rounded-xl text-violet-600">
                <Database size={20} weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg font-black">Banco de Dados</CardTitle>
                <CardDescription>Migrations e estado do banco.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[
                { name: "SCHEMA_COMPLETO.sql", desc: "Schema base (tabelas, tipos, funções)", status: "applied" },
                { name: "MIGRATION_V2_MULTITENANT.sql", desc: "Multi-tenancy, RLS, memberships", status: "applied" },
                { name: "MIGRATION_V3_MARCA_COLETIVA.sql", desc: "Marca Coletiva, certificações, produtores internos", status: "check" },
                { name: "MIGRATION_V4_PLATFORM_ADMIN.sql", desc: "RPCs do painel platform admin", status: "check" },
                { name: "MIGRATION_V5_PLATFORM_ENHANCEMENTS.sql", desc: "Subscriptions, templates de tipo, RPCs adicionais", status: "check" },
              ].map((m, idx) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors relative pl-12"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-black text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 font-mono">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                  <Badge
                    className={`border-0 font-bold text-xs flex items-center gap-1 ${
                      m.status === "applied"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {m.status === "applied" ? (
                      <CheckCircle size={12} weight="fill" />
                    ) : (
                      <Warning size={12} weight="fill" />
                    )}
                    {m.status === "applied" ? "Aplicado" : "Verificar"}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400 relative">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-xl" />
              <p className="text-sm font-bold text-blue-800 mb-1">Nota sobre migrations</p>
              <p className="text-xs text-blue-600">
                Os arquivos de migration estão em <code className="bg-blue-100 px-1 rounded">docs/database/</code>.
                Aplique-os em ordem no Supabase SQL Editor. A MIGRATION_V4 contém as RPCs necessárias
                para o funcionamento completo deste painel admin. A MIGRATION_V5 adiciona subscriptions e templates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Modules Catalog */}
        <Card className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 hover:shadow-xl transition-all duration-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-600">
                <Globe size={20} weight="fill" />
              </div>
              <div>
                <CardTitle className="text-lg font-black">Catálogo de Módulos</CardTitle>
                <CardDescription>Módulos disponíveis para ativação nos clientes.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "traceability", name: "Rastreabilidade" },
                { key: "certifications", name: "Certificações" },
                { key: "internal_producers", name: "Produtores Internos" },
                { key: "sensory_analysis", name: "Análise Sensorial" },
                { key: "seal_control", name: "Controle de Selos" },
                { key: "reports", name: "Relatórios" },
                { key: "crm", name: "CRM" },
              ].map((m) => {
                const ModuleIcon = MODULE_ICONS[m.key] ?? Package;
                return (
                  <div
                    key={m.key}
                    className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-100"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-white rounded-lg shrink-0">
                        <ModuleIcon className="h-5 w-5 text-slate-600" weight="bold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 mb-1">{m.name}</p>
                        <p className="text-xs text-slate-500">{MODULE_DESCRIPTIONS[m.key] || "Módulo de funcionalidade"}</p>
                      </div>
                    </div>
                    <code className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shrink-0 font-mono">
                      {m.key}
                    </code>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlatformLayout>
  );
};

export default PlatformSettings;
