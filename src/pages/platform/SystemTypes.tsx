import { useState, useEffect } from "react";
import { PlatformLayout } from "@/components/layout/PlatformLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  UsersThree,
  Buildings,
  Package,
  Certificate,
  Eye,
  Fingerprint,
  ChartBar,
  UserCircle,
  FloppyDisk,
  CaretDown,
  CaretUp,
  CheckCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import {
  systemTypeTemplatesApi,
  platformApi,
  AVAILABLE_MODULES,
} from "@/services/api";
import { toast } from "sonner";

const FIELD_LABELS: Record<string, string> = {
  seal: "Selos de Rastreabilidade",
  weight: "Peso/Volume",
  sensory_attributes: "Análise Sensorial",
  radar_chart: "Gráfico Radar",
  certifications: "Certificações",
  internal_producers: "Produtores Internos",
  youtube_video: "Vídeo YouTube",
  lot_observations: "Relato do Produtor",
};

const AVAILABLE_FIELDS = Object.keys(FIELD_LABELS);

const TYPE_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  ig: MapPin,
  marca_coletiva: UsersThree,
  privado: Buildings,
};

const MODULE_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  traceability: Package,
  certifications: Certificate,
  internal_producers: UsersThree,
  sensory_analysis: Eye,
  seal_control: Fingerprint,
  reports: ChartBar,
  crm: UserCircle,
};

const TYPE_DEFAULTS: Record<
  string,
  {
    name: string;
    description: string;
    color: string;
    icon: string;
    default_modules: string[];
    default_fields: string[];
  }
> = {
  ig: {
    name: "Indicação Geográfica",
    description:
      "Sistema para gestão de Indicações Geográficas (IG), com rastreabilidade completa de lotes, produtores e análise sensorial.",
    color: "#4f46e5",
    icon: "MapPin",
    default_modules: ["traceability", "sensory_analysis", "seal_control"],
    default_fields: ["seal", "weight", "sensory_attributes", "radar_chart", "lot_observations"],
  },
  marca_coletiva: {
    name: "Marca Coletiva",
    description:
      "Sistema para Marcas Coletivas com gestão de cooperativas, produtores internos, certificações e rastreabilidade.",
    color: "#10b981",
    icon: "UsersThree",
    default_modules: ["traceability", "certifications", "internal_producers", "sensory_analysis"],
    default_fields: [
      "certifications",
      "internal_producers",
      "sensory_attributes",
      "radar_chart",
      "lot_observations",
      "youtube_video",
    ],
  },
  privado: {
    name: "Empresa Privada",
    description:
      "Sistema simplificado para empresas privadas com rastreabilidade e controle de qualidade.",
    color: "#f59e0b",
    icon: "Buildings",
    default_modules: ["traceability"],
    default_fields: ["weight", "lot_observations"],
  },
};

type SystemTypeTemplate = {
  type_key: string;
  name: string;
  description?: string;
  default_modules?: string[];
  default_fields?: string[];
  color?: string;
  icon?: string;
};

const PlatformSystemTypes = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<SystemTypeTemplate[]>([]);
  const [tenantCounts, setTenantCounts] = useState<Record<string, number>>({});
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [configs, setConfigs] = useState<
    Record<string, { modules: Set<string>; fields: Set<string> }>
  >({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, tenantsData] = await Promise.all([
        systemTypeTemplatesApi.getAll(),
        platformApi.getAllTenants(),
      ]);

      const defaults = Object.entries(TYPE_DEFAULTS).map(([key, def]) => ({
        type_key: key,
        name: def.name,
        description: def.description,
        default_modules: def.default_modules,
        default_fields: def.default_fields,
        color: def.color,
        icon: def.icon,
      }));

      const merged =
        templatesData && templatesData.length > 0
          ? Object.keys(TYPE_DEFAULTS).map((key) => {
              const db = templatesData.find((t: SystemTypeTemplate) => t.type_key === key);
              const def = TYPE_DEFAULTS[key];
              return db
                ? {
                    type_key: key,
                    name: db.name ?? def.name,
                    description: db.description ?? def.description,
                    default_modules: (db.default_modules as string[]) ?? def.default_modules,
                    default_fields: (db.default_fields as string[]) ?? def.default_fields,
                    color: db.color ?? def.color,
                    icon: db.icon ?? def.icon,
                  }
                : { ...def, type_key: key };
            })
          : defaults;

      setTemplates(merged);

      const counts: Record<string, number> = { ig: 0, marca_coletiva: 0, privado: 0 };
      (tenantsData || []).forEach((t: { type?: string }) => {
        if (t.type && counts[t.type] !== undefined) counts[t.type]++;
      });
      setTenantCounts(counts);

      const cfg: Record<string, { modules: Set<string>; fields: Set<string> }> = {};
      merged.forEach((t) => {
        cfg[t.type_key] = {
          modules: new Set((t.default_modules || []) as string[]),
          fields: new Set((t.default_fields || []) as string[]),
        };
      });
      setConfigs(cfg);
    } catch (err) {
      toast.error("Erro ao carregar tipos de sistema");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModule = (typeKey: string, moduleKey: string) => {
    setConfigs((prev) => {
      const cfg = { ...prev[typeKey] };
      const modules = new Set(cfg.modules);
      if (modules.has(moduleKey)) modules.delete(moduleKey);
      else modules.add(moduleKey);
      return { ...prev, [typeKey]: { ...cfg, modules } };
    });
  };

  const toggleField = (typeKey: string, fieldKey: string) => {
    setConfigs((prev) => {
      const cfg = { ...prev[typeKey] };
      const fields = new Set(cfg.fields);
      if (fields.has(fieldKey)) fields.delete(fieldKey);
      else fields.add(fieldKey);
      return { ...prev, [typeKey]: { ...cfg, fields } };
    });
  };

  const handleSave = async (typeKey: string) => {
    const t = templates.find((x) => x.type_key === typeKey);
    if (!t || !configs[typeKey]) return;

    try {
      setSaving((s) => ({ ...s, [typeKey]: true }));
      setSaved((s) => ({ ...s, [typeKey]: false }));
      await systemTypeTemplatesApi.upsert({
        type_key: typeKey,
        name: t.name,
        description: t.description,
        default_modules: Array.from(configs[typeKey].modules),
        default_fields: Array.from(configs[typeKey].fields),
        color: t.color,
        icon: t.icon,
      });
      toast.success("Template salvo com sucesso!");
      setSaved((s) => ({ ...s, [typeKey]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [typeKey]: false })), 2000);
      await loadData();
    } catch (err) {
      toast.error("Erro ao salvar template");
    } finally {
      setSaving((s) => ({ ...s, [typeKey]: false }));
    }
  };

  if (loading) {
    return (
      <PlatformLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 overflow-hidden">
              <Skeleton className="h-2 w-full" />
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-80" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </PlatformLayout>
    );
  }

  return (
    <PlatformLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Tipos de Sistema
          </h1>
          <p className="text-slate-400 font-medium mt-1">
            Configure os módulos e campos padrão para cada tipo de cliente na plataforma.
          </p>
        </div>

        {templates.map((t) => {
          const Icon = TYPE_ICONS[t.type_key] ?? Buildings;
          const count = tenantCounts[t.type_key] ?? 0;
          const expanded = expandedKeys.has(t.type_key);
          const cfg = configs[t.type_key];
          const typeColor = t.color || "#a3e635";

          return (
            <Card
              key={t.type_key}
              className={`group border-0 shadow-lg bg-white/95 rounded-2xl border-slate-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                expanded ? "shadow-xl ring-1 ring-slate-200" : ""
              }`}
            >
              <div
                className="h-2 w-full shrink-0"
                style={{ backgroundColor: typeColor }}
              />
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
                      style={{ backgroundColor: `${typeColor}20` }}
                    >
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          background: `linear-gradient(135deg, ${typeColor} 0%, transparent 100%)`,
                        }}
                      />
                      <Icon
                        className="h-6 w-6 relative z-10"
                        weight="bold"
                        style={{ color: typeColor }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">
                        {t.name}
                      </CardTitle>
                      <CardDescription className="text-slate-500 font-medium mt-0.5">
                        {t.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full font-bold border-0"
                    style={{
                      backgroundColor: `${typeColor}15`,
                      color: typeColor,
                    }}
                  >
                    {count} cliente{count !== 1 ? "s" : ""} ativo{count !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 mb-4 -ml-2 transition-colors focus-visible:ring-2 focus-visible:ring-lime-400/50 focus-visible:ring-offset-2"
                  onClick={() => toggleExpanded(t.type_key)}
                >
                  {expanded ? (
                    <CaretUp className="h-5 w-5 mr-2 transition-transform duration-300" weight="bold" />
                  ) : (
                    <CaretDown className="h-5 w-5 mr-2 transition-transform duration-300" weight="bold" />
                  )}
                  Configurar Template
                </Button>

                {expanded && cfg && (
                  <div className="space-y-6 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-3 border-l-2 border-slate-200">
                        Módulos Padrão
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {AVAILABLE_MODULES.map((mod) => {
                          const ModIcon = MODULE_ICONS[mod.key] ?? Package;
                          const isChecked = cfg.modules.has(mod.key);
                          return (
                            <div
                              key={mod.key}
                              className={`flex items-center justify-between gap-4 p-3 rounded-xl border transition-colors ${
                                isChecked
                                  ? "bg-slate-100 border-slate-200"
                                  : "bg-slate-50 border-slate-100"
                              } hover:bg-slate-100/80`}
                            >
                              <div className="flex gap-3 min-w-0">
                                <ModIcon className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" weight="bold" />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">
                                    {mod.name}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {mod.description}
                                  </p>
                                </div>
                              </div>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={() => toggleModule(t.type_key, mod.key)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator className="bg-slate-100" />

                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-3 border-l-2 border-slate-200">
                        Campos Padrão
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {AVAILABLE_FIELDS.map((fieldKey) => {
                          const isChecked = cfg.fields.has(fieldKey);
                          return (
                            <div
                              key={fieldKey}
                              className={`flex items-center justify-between gap-4 p-3 rounded-xl border transition-colors ${
                                isChecked
                                  ? "bg-slate-100 border-slate-200"
                                  : "bg-slate-50 border-slate-100"
                              } hover:bg-slate-100/80`}
                            >
                              <p className="font-bold text-slate-900">
                                {FIELD_LABELS[fieldKey]}
                              </p>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={() => toggleField(t.type_key, fieldKey)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      className="w-full rounded-xl font-bold bg-lime-400 hover:bg-lime-300 text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleSave(t.type_key)}
                      disabled={saving[t.type_key]}
                    >
                      {saving[t.type_key] ? (
                        <>
                          <CircleNotch className="h-5 w-5 mr-2 animate-spin" weight="bold" />
                          Salvando...
                        </>
                      ) : saved[t.type_key] ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" weight="bold" />
                          Salvo!
                        </>
                      ) : (
                        <>
                          <FloppyDisk className="h-5 w-5 mr-2" weight="bold" />
                          Salvar Template
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PlatformLayout>
  );
};

export default PlatformSystemTypes;
