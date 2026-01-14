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
  Palette,
  UserCircle,
  Buildings,
  Tag,
  Bell,
  MagnifyingGlass,
  Plus
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { systemConfigApi } from "@/services/api";
import { hexToHsl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: Layout },
  { name: "Associações", href: "/admin/associacoes", icon: Buildings },
  { name: "Produtores", href: "/admin/produtores", icon: Users },
  { name: "Indústria", href: "/admin/industria", icon: Tag },
  { name: "Lotes", href: "/admin/lotes", icon: Package },
  { name: "Relatórios", href: "/admin/relatorios", icon: ChartBar },
  { name: "Personalização", href: "/admin/personalizacao", icon: Palette },
  { name: "Usuários", href: "/admin/usuarios", icon: UserCircle },
  { name: "Configurações", href: "/admin/configuracoes", icon: Gear },
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

  const cssVariables = {
    '--primary': hexToHsl(primaryColor),
    '--secondary': hexToHsl(secondaryColor),
    '--accent': hexToHsl(accentColor),
    '--ring': hexToHsl(primaryColor),
  } as React.CSSProperties;

  const userInitials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={cssVariables}>
      {/* Sidebar para desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white px-6 pb-4 border-r border-slate-200/60 shadow-sm">
          {/* Logo Section */}
          <div className="flex h-24 shrink-0 items-center justify-center py-6">
            <Link to="/admin" className="flex items-center gap-3 transition-all duration-300 hover:opacity-80">
              {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-12 w-auto object-contain max-w-[180px]" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-secondary">
                    <Leaf className="h-6 w-6 text-white" weight="fill" />
                  </div>
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    GeoTrace
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Menu Principal</div>
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`
                        group flex gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-semibold transition-all duration-200
                        ${isActive 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"}
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`}
                        weight={isActive ? "fill" : "regular"}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Logout at bottom */}
            <div className="mt-auto pt-6 border-t border-slate-100">
              <button
                onClick={handleSignOut}
                className="group flex w-full gap-x-3 rounded-xl p-2.5 text-sm leading-6 font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <SignOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-600" />
                Sair do Sistema
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-600"
            onClick={() => setSidebarOpen(true)}
          >
            <List className="h-6 w-6" />
          </Button>

          {/* Search Bar - Mockup functional */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">Buscar...</label>
              <MagnifyingGlass className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400" aria-hidden="true" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm bg-transparent"
                placeholder="Busca rápida..."
                type="search"
                name="search"
              />
            </form>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-primary transition-colors relative">
                <span className="sr-only">Ver notificações</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary border border-white"></span>
                </span>
              </button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="-m-1.5 flex items-center p-1.5 transition-opacity hover:opacity-80">
                    <span className="sr-only">Abrir menu do usuário</span>
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-3 text-sm font-bold leading-6 text-slate-900" aria-hidden="true">
                        {user?.user_metadata?.full_name || "Administrador"}
                      </span>
                      <CaretDown className="ml-2 h-4 w-4 text-slate-400" aria-hidden="true" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl shadow-lg border-slate-100 p-1">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={() => navigate("/admin/perfil")} className="rounded-lg py-2 cursor-pointer focus:bg-slate-50">
                    <UserCircle className="mr-2 h-4 w-4" /> Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/admin/configuracoes")} className="rounded-lg py-2 cursor-pointer focus:bg-slate-50">
                    <Gear className="mr-2 h-4 w-4" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg py-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600">
                    <SignOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>

        {/* Footer opcional */}
        <footer className="py-6 border-t border-slate-200/60 px-8 text-center text-xs text-slate-400">
          &copy; 2026 GeoTrace - Sistema de Rastreabilidade Premium
        </footer>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white animate-in slide-in-from-left duration-300">
            <div className="absolute right-0 top-0 -mr-12 pt-4">
              <Button variant="ghost" className="text-white" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            {/* Sidebar content simplified for mobile */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
              <div className="flex h-20 shrink-0 items-center py-6">
                <span className="text-xl font-black text-slate-900">GeoTrace Admin</span>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold ${location.pathname === item.href ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"}`}
                          >
                            <item.icon className="h-6 w-6" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
