import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Users,
  Package,
  ChartBar,
  Gear,
  SignOut,
  List,
  X,
  Leaf,
  CaretDown,
  Palette
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { systemConfigApi } from "@/services/api";
import { hexToHsl } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Layout,
  },
  {
    name: "Produtores",
    href: "/admin/produtores",
    icon: Users,
  },
  {
    name: "Lotes",
    href: "/admin/lotes",
    icon: Package,
  },
  {
    name: "Associações",
    href: "/admin/associacoes",
    icon: Users,
  },
  {
    name: "Relatórios",
    href: "/admin/relatorios",
    icon: ChartBar,
  },
  {
    name: "Personalização",
    href: "/admin/personalizacao",
    icon: Palette,
  },
  {
    name: "Configurações",
    href: "/admin/configuracoes",
    icon: Gear,
  },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const config = await systemConfigApi.getBrandingConfig();
        setBranding(config);
      } catch (error) {
        console.error("Erro ao carregar branding:", error);
      }
    };
    loadBranding();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  // Generate CSS variables for dynamic theming
  const cssVariables = {
    '--primary': hexToHsl(primaryColor),
    '--secondary': hexToHsl(secondaryColor),
    '--accent': hexToHsl(accentColor),
    '--ring': hexToHsl(primaryColor),
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50" style={cssVariables}>
      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
          {/* Logo */}
          <div className="flex h-32 shrink-0 items-center justify-center border-b border-gray-100 py-4">
            <Link to="/admin" className="flex items-center space-x-2 w-full justify-center px-4 h-full">
              {branding?.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="max-h-full w-auto object-contain max-w-[200px] transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Leaf className="h-5 w-5 text-white" weight="fill" />
                  </div>
                  <span 
                    className="text-xl font-bold bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    GeoTrace
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navegação */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200
                            ${isActive
                              ? "bg-opacity-10 border-r-2"
                              : "text-gray-700 hover:bg-gray-50"
                            }
                          `}
                          style={isActive ? {
                            backgroundColor: `${primaryColor}15`,
                            color: primaryColor,
                            borderColor: primaryColor
                          } : {}}
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = primaryColor;
                              e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.color = '';
                              e.currentTarget.style.backgroundColor = '';
                            }
                          }}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 transition-colors`}
                            style={{ color: isActive ? primaryColor : undefined }}
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>

              {/* Usuário */}
              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <span 
                      className="font-medium"
                      style={{ color: primaryColor }}
                    >
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <SignOut className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Sidebar mobile */}
      <div className={`lg:hidden ${sidebarOpen ? "fixed inset-0 z-50" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2">
              {branding?.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="h-8 object-contain"
                />
              ) : (
                <>
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    <Leaf className="h-4 w-4 text-white" />
                  </div>
                  <span 
                    className="text-xl font-bold bg-clip-text text-transparent"
                    style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                  >
                    GeoTrace Admin
                  </span>
                </>
              )}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-2 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        group flex gap-x-3 rounded-md px-3 py-2 text-base font-semibold leading-7 transition-colors
                        ${isActive
                          ? "bg-opacity-10"
                          : "text-gray-900 hover:bg-gray-50"
                        }
                      `}
                      style={isActive ? {
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor
                      } : {}}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0`}
                        style={{ color: isActive ? primaryColor : undefined }}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <div className="py-6">
                <div className="flex items-center gap-x-4 px-3 py-2 text-base font-semibold leading-7 text-gray-900">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <span 
                      className="font-medium"
                      style={{ color: primaryColor }}
                    >
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{user?.email}</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <SignOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="lg:pl-72">
        {/* Header mobile */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <List className="h-6 w-6" />
          </Button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt="Logo" 
                className="h-8 object-contain"
              />
            ) : (
              "GeoTrace Admin"
            )}
          </div>
        </div>

        {/* Conteúdo da página */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
