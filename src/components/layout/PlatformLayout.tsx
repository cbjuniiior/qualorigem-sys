import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Users,
  Buildings,
  SignOut,
  List,
  X,
  SquaresFour,
  Gear,
  Stack,
  CaretRight,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlatformLayoutProps {
  children: React.ReactNode;
}

const mainNav = [
  { name: "Dashboard", href: "/platform", icon: Layout },
  { name: "Clientes", href: "/platform/tenants", icon: Buildings },
  { name: "Tipos de Sistema", href: "/platform/types", icon: Stack },
];

const secondaryNav = [
  { name: "Usuários", href: "/platform/users", icon: Users },
  { name: "Configurações", href: "/platform/settings", icon: Gear },
];

const BREADCRUMB_MAP: Record<string, string> = {
  "/platform": "Dashboard",
  "/platform/tenants": "Clientes",
  "/platform/types": "Tipos de Sistema",
  "/platform/users": "Usuários",
  "/platform/settings": "Configurações",
};

export const PlatformLayout = ({ children }: PlatformLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/platform/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const userEmail = user?.email || "";
  const userInitials = userEmail.substring(0, 2).toUpperCase();

  // Build breadcrumb
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href?: string }[] = [{ label: "Plataforma", href: "/platform" }];
  if (pathSegments.length >= 2 && pathSegments[1] !== "") {
    const base = `/${pathSegments[0]}/${pathSegments[1]}`;
    breadcrumbs.push({ label: BREADCRUMB_MAP[base] || pathSegments[1], href: base });
  }
  if (pathSegments.length >= 3) {
    breadcrumbs.push({ label: "Detalhes" });
  }

  const allNav = [...mainNav, ...secondaryNav];

  const renderNavItem = (item: typeof mainNav[0], mobile = false) => {
    const isActive = location.pathname === item.href || (item.href !== "/platform" && location.pathname.startsWith(item.href));
    return (
      <li key={item.name}>
        <Link
          to={item.href}
          onClick={mobile ? () => setSidebarOpen(false) : undefined}
          className={`
            group relative flex gap-x-3 rounded-xl ${mobile ? "p-4" : "p-3"} text-sm leading-6 font-bold transition-all duration-200 ease-out
            ${isActive
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 translate-x-1"
              : "text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1"}
          `}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-sm" />
          )}
          <item.icon
            className={`${mobile ? "h-6 w-6" : "h-5 w-5"} shrink-0 transition-all duration-200 ease-out ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`}
            weight={isActive ? "fill" : "bold"}
          />
          {item.name}
        </Link>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 px-6 pb-4">
          <div className="flex h-24 shrink-0 items-center justify-center py-6">
            <Link to="/platform" className="flex items-center gap-3 transition-all duration-200 ease-out hover:opacity-90">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20">
                <SquaresFour className="h-6 w-6 text-white" weight="fill" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white">QualOrigem</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Platform Admin</span>
              </div>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col">
            {/* Main group */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-2">Gestão</div>
            <ul role="list" className="flex flex-col gap-y-1">
              {mainNav.map((item) => renderNavItem(item))}
            </ul>

            {/* Separator */}
            <div className="my-4 border-t border-slate-800" />

            {/* Secondary group */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-2">Sistema</div>
            <ul role="list" className="flex flex-col gap-y-1">
              {secondaryNav.map((item) => renderNavItem(item))}
            </ul>

            <div className="mt-auto pt-6 border-t border-slate-800">
              <button
                onClick={handleSignOut}
                className="group flex w-full gap-x-3 rounded-xl p-3 text-sm font-bold text-slate-400 hover:bg-rose-900/20 hover:text-rose-400 transition-all duration-200 ease-out"
              >
                <SignOut className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-rose-400 transition-all duration-200 ease-out" weight="bold" />
                Sair da Plataforma
              </button>
            </div>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-slate-600 transition-all duration-200 ease-out hover:bg-slate-100" 
            onClick={() => setSidebarOpen(true)}
          >
            <List className="h-6 w-6" />
          </Button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <CaretRight size={12} className="text-slate-300" />}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link 
                    to={crumb.href} 
                    className="text-slate-400 hover:text-indigo-600 font-medium transition-all duration-200 ease-out"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 font-bold px-2.5 py-1 rounded-md bg-slate-100/80">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>

          <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="-m-1.5 flex items-center p-1.5 hover:opacity-80 transition-all duration-200 ease-out rounded-lg hover:ring-2 hover:ring-indigo-200/50 ring-offset-2">
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-indigo-600 text-white text-xs font-black">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-3 text-sm font-black text-slate-900">Super Admin</span>
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 mt-2 rounded-xl shadow-2xl border-slate-100 p-2">
                  <div className="px-3 py-3">
                    <p className="text-sm font-black text-slate-900">Super Admin</p>
                    <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem 
                    onClick={() => navigate("/platform/settings")} 
                    className="rounded-lg py-2.5 font-bold cursor-pointer transition-all duration-200 ease-out"
                  >
                    <Gear size={16} className="mr-2" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="rounded-lg py-2.5 font-bold cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600 transition-all duration-200 ease-out"
                  >
                    <SignOut size={16} className="mr-2" weight="bold" /> Sair da Plataforma
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 relative">
          {/* Subtle top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
            {children}
          </div>
          {/* Footer watermark */}
          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-slate-300/40 tracking-widest uppercase">
              QualOrigem Platform
            </span>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-200 ease-out" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-gradient-to-b from-slate-900 to-slate-950 animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="absolute right-4 top-4 z-10">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-slate-800 transition-all duration-200 ease-out" 
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
              <div className="flex h-24 shrink-0 items-center justify-center py-6 relative">
                <Link to="/platform" className="flex items-center gap-3 transition-all duration-200 ease-out hover:opacity-90" onClick={() => setSidebarOpen(false)}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-500/20">
                    <SquaresFour className="h-6 w-6 text-white" weight="fill" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight text-white">QualOrigem</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Platform Admin</span>
                  </div>
                </Link>
              </div>
              <nav className="flex flex-1 flex-col">
                {/* Main group */}
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-2">Gestão</div>
                <ul role="list" className="flex flex-col gap-y-1">
                  {mainNav.map((item) => renderNavItem(item, true))}
                </ul>

                {/* Separator */}
                <div className="my-4 border-t border-slate-800" />

                {/* Secondary group */}
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 px-2">Sistema</div>
                <ul role="list" className="flex flex-col gap-y-1">
                  {secondaryNav.map((item) => renderNavItem(item, true))}
                </ul>

                <div className="mt-auto pt-6 border-t border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="group flex w-full gap-x-3 rounded-xl p-4 text-sm font-bold text-slate-400 hover:bg-rose-900/20 hover:text-rose-400 transition-all duration-200 ease-out"
                  >
                    <SignOut className="h-6 w-6 shrink-0 text-slate-500 group-hover:text-rose-400 transition-all duration-200 ease-out" weight="bold" />
                    Sair da Plataforma
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
