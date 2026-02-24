import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { certificationsApi, internalProducersApi } from "@/services/api";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import { Certificate, CheckCircle, FileText, Info, Users, Buildings } from "@phosphor-icons/react";
import type { Certification } from "@/services/api";
import { cn } from "@/lib/utils";

interface VinculosStepProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  primaryColor?: string;
  associations: any[];
  industries: any[];
  tenantId: string;
}

export const VinculosStep = ({
  formData,
  setFormData,
  primaryColor = "#16a34a",
  associations,
  industries,
  tenantId
}: VinculosStepProps) => {
  const labels = useTenantLabels();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(true);
  const [internalProducers, setInternalProducers] = useState<any[]>([]);
  const [loadingIp, setLoadingIp] = useState(true);

  useEffect(() => {
    if (tenantId) {
      certificationsApi.getAll(tenantId).then((data) => {
        setCertifications(data || []);
      }).catch((e) => console.error("Erro ao carregar certificações:", e)).finally(() => setLoadingCerts(false));
      internalProducersApi.getAll(tenantId).then((data) => setInternalProducers(data || [])).catch((e) => console.error(e)).finally(() => setLoadingIp(false));
    }
  }, [tenantId]);

  const selectedAssociationIds: string[] = formData.association_ids || [];
  const selectedIndustryIds: string[] = formData.industry_ids || [];
  const selectedCertIds: string[] = formData.certification_ids || [];
  const selectedIpIds: string[] = formData.internal_producer_ids || [];

  const toggleAssociation = (id: string) => {
    setFormData((prev: any) => {
      const current = prev.association_ids || [];
      const isSelected = current.includes(id);
      const updated = isSelected ? current.filter((x: string) => x !== id) : [...current, id];
      return { ...prev, association_ids: updated, association_id: updated.length > 0 ? updated[0] : "" };
    });
  };

  const toggleIndustry = (id: string) => {
    setFormData((prev: any) => {
      const current = prev.industry_ids || [];
      const isSelected = current.includes(id);
      const updated = isSelected ? current.filter((x: string) => x !== id) : [...current, id];
      return { ...prev, industry_ids: updated, industry_id: updated.length > 0 ? updated[0] : "" };
    });
  };

  const toggleCertification = (certId: string) => {
    setFormData((prev: any) => {
      const current: string[] = prev.certification_ids || [];
      const isSelected = current.includes(certId);
      return {
        ...prev,
        certification_ids: isSelected ? current.filter((id: string) => id !== certId) : [...current, certId]
      };
    });
  };

  const toggleInternalProducer = (id: string) => {
    setFormData((prev: any) => {
      const current: string[] = prev.internal_producer_ids || [];
      return {
        ...prev,
        internal_producer_ids: current.includes(id) ? current.filter((pid: string) => pid !== id) : [...current, id]
      };
    });
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const showInternalProducers = labels.isMarcaColetiva && !loadingIp && internalProducers.length > 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}10` }}>
          <Certificate size={22} style={{ color: primaryColor }} weight="fill" />
        </div>
        <div>
          <h3 className="font-black text-slate-900">Vínculos do Lote</h3>
          <p className="text-xs text-slate-500">Associações, indústrias, certificações e outros vínculos aplicáveis a este blend</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
        <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Selecione as associações, indústrias e certificações que se aplicam a este lote. Serão exibidas na página pública.
        </p>
      </div>

      {/* Associações */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 font-black text-slate-800">
          <Users size={18} style={{ color: primaryColor }} weight="fill" />
          Associações
        </Label>
        {associations.length === 0 ? (
          <p className="text-sm text-slate-500 font-bold">Nenhuma associação cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-100 bg-white">
            {associations.map((assoc: any) => {
              const isChecked = selectedAssociationIds.includes(assoc.id);
              return (
                <label
                  key={assoc.id}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors", isChecked ? "bg-slate-50" : "hover:bg-slate-50")}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleAssociation(assoc.id)}
                    className="rounded-md border-slate-300"
                    style={isChecked ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                  />
                  <span className={cn("text-sm truncate", isChecked ? "font-black text-slate-800" : "font-bold text-slate-600")}>{assoc.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Indústrias */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 font-black text-slate-800">
          <Buildings size={18} style={{ color: primaryColor }} weight="fill" />
          Indústrias Parceiras
        </Label>
        {industries.length === 0 ? (
          <p className="text-sm text-slate-500 font-bold">Nenhuma indústria cadastrada.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-100 bg-white">
            {industries.map((ind: any) => {
              const isChecked = selectedIndustryIds.includes(ind.id);
              return (
                <label
                  key={ind.id}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors", isChecked ? "bg-slate-50" : "hover:bg-slate-50")}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleIndustry(ind.id)}
                    className="rounded-md border-slate-300"
                    style={isChecked ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                  />
                  <span className={cn("text-sm truncate", isChecked ? "font-black text-slate-800" : "font-bold text-slate-600")}>{ind.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificações */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 font-black text-slate-800">
          <Certificate size={18} style={{ color: primaryColor }} weight="fill" />
          Certificações
        </Label>
        {loadingCerts ? (
          <p className="text-sm text-slate-500">Carregando certificações...</p>
        ) : certifications.length === 0 ? (
          <p className="text-sm text-slate-500 font-bold">Nenhuma certificação cadastrada.</p>
        ) : (
          <div className="space-y-3">
            {certifications.map((cert) => {
              const isSelected = selectedCertIds.includes(cert.id);
              const expired = isExpired(cert.valid_until);
              return (
                <div
                  key={cert.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
                    isSelected ? "border-primary/30 bg-primary/5" : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                  onClick={() => toggleCertification(cert.id)}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleCertification(cert.id)} className="mt-1" />
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
                      {cert.valid_until && <span>até {new Date(cert.valid_until).toLocaleDateString("pt-BR")}</span>}
                    </div>
                    {cert.document_url && (
                      <a
                        href={cert.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText size={12} /> Ver documento
                      </a>
                    )}
                  </div>
                  {isSelected && <CheckCircle size={22} weight="fill" style={{ color: primaryColor }} className="shrink-0 mt-1" />}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Produtores Internos (marca coletiva) */}
      {showInternalProducers && (
        <div className="mt-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} style={{ color: primaryColor }} weight="fill" />
            <Label className="font-black text-slate-700">Produtores Internos Envolvidos</Label>
            {selectedIpIds.length > 0 && (
              <Badge className="bg-blue-100 text-blue-700 text-xs ml-auto">{selectedIpIds.length} selecionado(s)</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">Selecione os produtores associados que participaram deste lote.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {internalProducers.map((ip) => (
              <label
                key={ip.id}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm",
                  selectedIpIds.includes(ip.id) ? "bg-white border border-blue-200 shadow-sm" : "hover:bg-white/60"
                )}
              >
                <Checkbox checked={selectedIpIds.includes(ip.id)} onCheckedChange={() => toggleInternalProducer(ip.id)} />
                <span className="font-medium text-slate-700 truncate">{ip.name}</span>
                {ip.city && <span className="text-xs text-slate-400 ml-auto">{ip.city}</span>}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
