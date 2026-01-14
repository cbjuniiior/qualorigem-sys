import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Package,
  QrCode,
  ChartBar,
  Gear,
  SignOut,
  List,
  X,
  Leaf,
  User,
  Bell,
  MagnifyingGlass,
  CaretDown,
  UserCircle
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
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

interface ProducerLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/produtor", icon: Layout },
  { name: "Meus Lotes", href: "/produtor/lotes", icon: Package },
  { name: "QR Codes", href: "/produtor/qrcodes", icon: QrCode },
  { name: "Métricas", href: "/produtor/metricas", icon: ChartBar },
  { name: "Configurações", href: "/produtor/configuracoes", icon: Gear },
];

export const ProducerLayout = ({ children }: ProducerLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { branding } = useBranding();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const primaryColor = branding.primaryColor;
  const secondaryColor = branding.secondaryColor;

  const userInitials = (user?.user_metadata?.full_name || user?.email || "P")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-white px-6 pb-4 border-r border-slate-200/60 shadow-sm">
          <div className="flex h-24 shrink-0 items-center justify-center py-6">
            <Link to="/produtor" className="flex items-center gap-3 transition-all hover:opacity-80">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-emerald-500">
                <Leaf className="h-6 w-6 text-white" weight="fill" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                {branding?.siteTitle?.split(' - ')[0] || "GeoTrace"} <span className="text-primary font-medium">PRO</span>
              </span>
            </Link>
          </div>

          <nav className="flex flex-1 flex-col">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Portal do Produtor</div>
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`
                        group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-bold transition-all duration-200
                        ${isActive 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary"}
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`}
                        weight={isActive ? "fill" : "bold"}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto pt-6 border-t border-slate-100">
              <button
                onClick={handleSignOut}
                className="group flex w-full gap-x-3 rounded-xl p-3 text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <SignOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-rose-600" weight="bold" />
                Sair do Portal
              </button>
            </div>
          </nav>
        </div>
      </aside>

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
            <List className="h-6 w-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <MagnifyingGlass className="absolute left-0 h-5 w-5 text-slate-400" />
              <input className="block h-full w-full border-0 py-0 pl-8 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm bg-transparent" placeholder="Buscar lotes ou métricas..." type="search" />
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button type="button" className="p-2.5 text-slate-400 hover:text-primary transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="-m-1.5 flex items-center p-1.5 hover:opacity-80 transition-opacity">
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-white text-xs font-black">{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:flex lg:items-center">
                      <span className="ml-3 text-sm font-black text-slate-900">{user?.user_metadata?.full_name || "Produtor"}</span>
                      <CaretDown className="ml-2 h-4 w-4 text-slate-400" />
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-xl border-slate-100 p-1">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest">Minha Fazenda</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={() => navigate("/produtor/configuracoes")} className="rounded-xl py-2.5 font-bold cursor-pointer focus:bg-slate-50">
                    <UserCircle size={18} className="mr-2" weight="bold" /> Perfil & Dados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/produtor/configuracoes")} className="rounded-xl py-2.5 font-bold cursor-pointer focus:bg-slate-50">
                    <Gear size={18} className="mr-2" weight="bold" /> Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-50" />
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-xl py-2.5 font-bold cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-600">
                    <SignOut size={18} className="mr-2" weight="bold" /> Sair do Portal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>

        <footer className="py-6 border-t border-slate-200/60 px-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
          {branding?.siteTitle?.split(' - ')[0] || "GeoTrace"} Pro &copy; 2026 - Rastreabilidade de Origem
        </footer>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white animate-in slide-in-from-left duration-300 shadow-2xl">
            <div className="absolute right-0 top-0 -mr-12 pt-4">
              <Button variant="ghost" className="text-white" onClick={() => setSidebarOpen(false)}><X className="h-6 w-6" /></Button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
              <div className="flex h-20 shrink-0 items-center py-6">
                <span className="text-xl font-black text-slate-900">{branding?.siteTitle?.split(' - ')[0] || "GeoTrace"} <span className="text-primary">PRO</span></span>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} onClick={() => setSidebarOpen(false)} className={`group flex gap-x-3 rounded-xl p-4 text-sm font-bold ${location.pathname === item.href ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                        <item.icon className="h-6 w-6" weight={location.pathname === item.href ? "fill" : "bold"} />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};