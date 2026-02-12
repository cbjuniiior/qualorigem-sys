import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTenant } from "@/hooks/use-tenant";

const NotFound = () => {
  const location = useLocation();
  const { tenant } = useTenant();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const homeLink = tenant ? `/${tenant.slug}` : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
        <Link to={homeLink} className="text-blue-500 hover:text-blue-700 underline">
          Voltar para o Início
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
