import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { certificationsApi } from "@/services/api";
import { useTenant } from "@/hooks/use-tenant";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import { Certificate, CheckCircle, FileText, Info } from "@phosphor-icons/react";
import type { Certification } from "@/services/api";

interface CertificationsStepProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  primaryColor?: string;
}

const CertificationsStep = ({ formData, setFormData, primaryColor = "#16a34a" }: CertificationsStepProps) => {
  const { tenant } = useTenant();
  const labels = useTenantLabels();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant?.id) loadCertifications();
  }, [tenant?.id]);

  const loadCertifications = async () => {
    if (!tenant?.id) return;
    try {
      const data = await certificationsApi.getAll(tenant.id);
      setCertifications(data || []);
    } catch (error) {
      console.error("Erro ao carregar certificações:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedIds: string[] = formData.certification_ids || [];

  const toggleCertification = (certId: string) => {
    setFormData((prev: any) => {
      const current: string[] = prev.certification_ids || [];
      const isSelected = current.includes(certId);
      return {
        ...prev,
        certification_ids: isSelected
          ? current.filter((id: string) => id !== certId)
          : [...current, certId],
      };
    });
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Carregando certificações...</p>
      </div>
    );
  }

  if (certifications.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
        <Certificate size={48} className="mx-auto text-slate-300 mb-3" />
        <h3 className="font-bold text-slate-600 mb-1">Nenhuma certificação cadastrada</h3>
        <p className="text-sm text-slate-400 mb-4">
          Cadastre certificações na página de Certificações para vinculá-las aos lotes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}10` }}>
          <Certificate size={22} style={{ color: primaryColor }} weight="fill" />
        </div>
        <div>
          <h3 className="font-black text-slate-900">Certificações do Lote</h3>
          <p className="text-xs text-slate-500">Selecione as certificações aplicáveis a este lote</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
        <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          {selectedIds.length > 0
            ? `${selectedIds.length} certificação(ões) selecionada(s). Serão exibidas na página pública do lote.`
            : "Selecione as certificações que se aplicam a este lote de produção."
          }
        </p>
      </div>

      {/* Certifications List */}
      <div className="space-y-3">
        {certifications.map(cert => {
          const isSelected = selectedIds.includes(cert.id);
          const expired = isExpired(cert.valid_until);

          return (
            <div
              key={cert.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-primary/30 bg-primary/5"
                  : "border-slate-100 hover:border-slate-200 bg-white"
              }`}
              onClick={() => toggleCertification(cert.id)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleCertification(cert.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-sm">{cert.name}</span>
                  {expired ? (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Expirado</Badge>
                  ) : cert.valid_until ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">Válido</Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {cert.issuing_body && <span>{cert.issuing_body}</span>}
                  {cert.valid_until && (
                    <span>até {new Date(cert.valid_until).toLocaleDateString("pt-BR")}</span>
                  )}
                </div>
                {cert.document_url && (
                  <a
                    href={cert.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                    onClick={e => e.stopPropagation()}
                  >
                    <FileText size={12} /> Ver documento
                  </a>
                )}
              </div>
              {isSelected && (
                <CheckCircle size={22} weight="fill" style={{ color: primaryColor }} className="shrink-0 mt-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CertificationsStep;
