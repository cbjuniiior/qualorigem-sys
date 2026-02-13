import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { BrandingProvider } from "@/hooks/use-branding";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TenantResolver } from "@/components/TenantResolver";

import Index from "./pages/Index";
import LoteDetails from "./pages/LoteDetails";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import Produtores from "./pages/admin/Produtores";
import Lotes from "./pages/admin/Lotes";
import Relatorios from "./pages/admin/Relatorios";
import Associacoes from "./pages/admin/Associacoes";
import Industria from "./pages/admin/Industria";
import { ProducerDashboard } from "./pages/produtor/Dashboard";
import { ProducerLotes } from "./pages/produtor/Lotes";
import { ProducerQRCodes } from "./pages/produtor/QRCodes";
import { ProducerMetricas } from "./pages/produtor/Metricas";
import { ProducerConfiguracoes } from "./pages/produtor/Configuracoes";
import NotFound from "./pages/NotFound";
import RootPlaceholder from "./pages/RootPlaceholder";
import ProducerDetails from "./pages/admin/ProducerDetails";
import Configuracoes from "./pages/admin/Configuracoes";
import Usuarios from "./pages/admin/Usuarios";
import GestaoPlataforma from "./pages/admin/GestaoPlataforma";
import Certificacoes from "./pages/admin/Certificacoes";
import ProdutoresInternos from "./pages/admin/ProdutoresInternos";

import { PlatformProtectedRoute } from "@/components/PlatformProtectedRoute";
import PlatformLogin from "./pages/platform/Login";
import PlatformDashboard from "./pages/platform/Dashboard";
import PlatformTenants from "./pages/platform/Tenants";
import PlatformTenantDetail from "./pages/platform/TenantDetail";
import PlatformUsers from "./pages/platform/Users";
import PlatformSettings from "./pages/platform/Settings";
import PlatformSystemTypes from "./pages/platform/SystemTypes";

const queryClient = new QueryClient();

/** Redireciona /lote/:codigo para /?lote=:codigo (sem tenant default) */
const RedirectLoteToRoot = () => {
  const { codigo } = useParams();
  return <Navigate to={`/?lote=${codigo}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrandingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Página na raiz: não redireciona para tenant (landing específica pode ser feita depois) */}
              <Route path="/" element={<RootPlaceholder />} />

              {/* Redirecionamentos para caminhos legados: raiz (sem tenant default) */}
              <Route path="/auth/login" element={<Navigate to="/" replace />} />
              <Route path="/auth/reset-password" element={<Navigate to="/" replace />} />
              <Route path="/lote/:codigo" element={<RedirectLoteToRoot />} />

              {/* Login da Plataforma (sem proteção) */}
              <Route path="/platform/login" element={<PlatformLogin />} />

              {/* Rotas da Plataforma (Superadmin) */}
              <Route path="/platform" element={
                <PlatformProtectedRoute>
                  <PlatformDashboard />
                </PlatformProtectedRoute>
              } />
              <Route path="/platform/tenants" element={
                <PlatformProtectedRoute>
                  <PlatformTenants />
                </PlatformProtectedRoute>
              } />
              <Route path="/platform/tenants/:tenantId" element={
                <PlatformProtectedRoute>
                  <PlatformTenantDetail />
                </PlatformProtectedRoute>
              } />
              <Route path="/platform/types" element={
                <PlatformProtectedRoute>
                  <PlatformSystemTypes />
                </PlatformProtectedRoute>
              } />
              <Route path="/platform/users" element={
                <PlatformProtectedRoute>
                  <PlatformUsers />
                </PlatformProtectedRoute>
              } />
              <Route path="/platform/settings" element={
                <PlatformProtectedRoute>
                  <PlatformSettings />
                </PlatformProtectedRoute>
              } />

              {/* Rotas do Tenant */}
              <Route path="/:tenantSlug" element={<TenantResolver />}>
                <Route index element={<Index />} />
                <Route path="lote/:codigo" element={<LoteDetails />} />
                <Route path="auth/login" element={<Login />} />
                <Route path="auth/reset-password" element={<ResetPassword />} />
                
                {/* Rotas protegidas do admin */}
                <Route path="admin" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="admin/produtores" element={
                  <ProtectedRoute>
                    <Produtores />
                  </ProtectedRoute>
                } />
                <Route path="admin/lotes" element={
                  <ProtectedRoute>
                    <Lotes />
                  </ProtectedRoute>
                } />
                <Route path="admin/relatorios" element={
                  <ProtectedRoute>
                    <Relatorios />
                  </ProtectedRoute>
                } />
                <Route path="admin/associacoes" element={
                  <ProtectedRoute>
                    <Associacoes />
                  </ProtectedRoute>
                } />
                <Route path="admin/industria" element={
                  <ProtectedRoute>
                    <Industria />
                  </ProtectedRoute>
                } />
                <Route path="admin/produtores/:id" element={
                  <ProtectedRoute>
                    <ProducerDetails />
                  </ProtectedRoute>
                } />
                <Route path="admin/configuracoes" element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                } />
                <Route path="admin/usuarios" element={
                  <ProtectedRoute>
                    <Usuarios />
                  </ProtectedRoute>
                } />
                <Route path="admin/gestao" element={
                  <ProtectedRoute>
                    <GestaoPlataforma />
                  </ProtectedRoute>
                } />
                <Route path="admin/certificacoes" element={
                  <ProtectedRoute>
                    <Certificacoes />
                  </ProtectedRoute>
                } />
                <Route path="admin/produtores-internos" element={
                  <ProtectedRoute>
                    <ProdutoresInternos />
                  </ProtectedRoute>
                } />
                
                {/* Rotas protegidas do produtor */}
                <Route path="produtor" element={
                  <ProtectedRoute>
                    <ProducerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="produtor/lotes" element={
                  <ProtectedRoute>
                    <ProducerLotes />
                  </ProtectedRoute>
                } />
                <Route path="produtor/qrcodes" element={
                  <ProtectedRoute>
                    <ProducerQRCodes />
                  </ProtectedRoute>
                } />
                <Route path="produtor/metricas" element={
                  <ProtectedRoute>
                    <ProducerMetricas />
                  </ProtectedRoute>
                } />
                <Route path="produtor/configuracoes" element={
                  <ProtectedRoute>
                    <ProducerConfiguracoes />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all dentro do tenant */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Catch-all global */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </BrandingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
