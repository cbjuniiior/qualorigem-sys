import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LoteDetails from "./pages/LoteDetails";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import Produtores from "./pages/admin/Produtores";
import Lotes from "./pages/admin/Lotes";
import Relatorios from "./pages/admin/Relatorios";
import Associacoes from "./pages/admin/Associacoes";
import { ProducerDashboard } from "./pages/produtor/Dashboard";
import { ProducerLotes } from "./pages/produtor/Lotes";
import { ProducerQRCodes } from "./pages/produtor/QRCodes";
import { ProducerMetricas } from "./pages/produtor/Metricas";
import { ProducerConfiguracoes } from "./pages/produtor/Configuracoes";
import NotFound from "./pages/NotFound";
import ProducerDetails from "./pages/admin/ProducerDetails";
import Configuracoes from "./pages/admin/Configuracoes";
import Personalizacao from "./pages/admin/Personalizacao";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lote/:codigo" element={<LoteDetails />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Rotas protegidas do admin */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/produtores" element={
              <ProtectedRoute>
                <Produtores />
              </ProtectedRoute>
            } />
            <Route path="/admin/lotes" element={
              <ProtectedRoute>
                <Lotes />
              </ProtectedRoute>
            } />
            <Route path="/admin/relatorios" element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="/admin/associacoes" element={
              <ProtectedRoute>
                <Associacoes />
              </ProtectedRoute>
            } />
            <Route path="/admin/produtores/:id" element={
              <ProtectedRoute>
                <ProducerDetails />
              </ProtectedRoute>
            } />
            <Route path="/admin/personalizacao" element={
              <ProtectedRoute>
                <Personalizacao />
              </ProtectedRoute>
            } />
            <Route path="/admin/configuracoes" element={
              <ProtectedRoute>
                <Configuracoes />
              </ProtectedRoute>
            } />
            
            {/* Rotas protegidas do produtor */}
            <Route path="/produtor" element={
              <ProtectedRoute>
                <ProducerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/produtor/lotes" element={
              <ProtectedRoute>
                <ProducerLotes />
              </ProtectedRoute>
            } />
            <Route path="/produtor/qrcodes" element={
              <ProtectedRoute>
                <ProducerQRCodes />
              </ProtectedRoute>
            } />
            <Route path="/produtor/metricas" element={
              <ProtectedRoute>
                <ProducerMetricas />
              </ProtectedRoute>
            } />
            <Route path="/produtor/configuracoes" element={
              <ProtectedRoute>
                <ProducerConfiguracoes />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
