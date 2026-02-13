import { Link, useParams, useNavigate } from "react-router-dom";
import { useBranding } from "@/hooks/use-branding";
import { Button } from "@/components/ui/button";
import { ArrowLeft, House, Buildings } from "@phosphor-icons/react";

/**
 * Página exibida quando a URL contém um slug de tenant que não existe
 * (ex.: /asd, /asd/dashboard). Mesmo visual da 404, com CTAs para início e plataforma.
 */
const TenantNotFound = () => {
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const { branding } = useBranding();
  const primaryColor = branding?.primaryColor || "#16a34a";

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Ícone e código */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${primaryColor}12` }}
          >
            <Buildings size={48} className="text-slate-400" weight="duotone" />
          </div>
          <span
            className="text-8xl font-black tracking-tighter tabular-nums"
            style={{ color: primaryColor }}
          >
            404
          </span>
        </div>

        {/* Mensagem */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Organização não encontrada
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Não foi possível encontrar a organização &quot;{tenantSlug || "—"}&quot;.
            Verifique o endereço ou acesse a página inicial.
          </p>
        </div>

        {/* Slug na URL (debug) */}
        {tenantSlug && (
          <p className="text-xs font-mono text-slate-400 truncate max-w-full px-2" title={`/${tenantSlug}`}>
            /{tenantSlug}
          </p>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="rounded-xl font-bold h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={20} weight="bold" className="mr-2" />
            Voltar
          </Button>
          <Button
            asChild
            className="rounded-xl font-bold h-12 px-6 text-white hover:opacity-90 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <Link to="/">
              <House size={20} weight="bold" className="mr-2" />
              Página inicial
            </Link>
          </Button>
        </div>

        <p className="text-sm text-slate-400">
          Administrador?{" "}
          <Link to="/platform" className="font-bold hover:underline" style={{ color: primaryColor }}>
            Acessar plataforma
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TenantNotFound;
