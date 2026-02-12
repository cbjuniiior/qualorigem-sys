import { useState } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const PlatformSettings = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copiado!`);
    setTimeout(() => setCopied(null), 2000);
  };

  // Supabase info
  const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL || "";

  return (
    <PlatformLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configurações</h2>
          <p className="text-slate-500 font-medium">Configurações globais da plataforma QualOrigem.</p>
        </div>

        {/* Platform Info */}
        <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-all duration-200">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600">
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
        <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-all duration-200">
          <CardHeader className="border-b border-slate-50">
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
        <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-all duration-200">
          <CardHeader className="border-b border-slate-50">
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
        <Card className="border-0 shadow-sm bg-white rounded-2xl hover:shadow-md transition-all duration-200">
          <CardHeader className="border-b border-slate-50">
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
