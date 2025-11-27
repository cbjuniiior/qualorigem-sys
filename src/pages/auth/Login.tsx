import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, Leaf, ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { systemConfigApi } from "@/services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
  } | null>(null);
  const { signIn, loading, user } = useAuth();
  const navigate = useNavigate();

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

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      navigate("/admin");
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await signIn(email, password);
      navigate("/admin");
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center mb-4 font-medium transition-colors"
            style={{ color: primaryColor }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Link>
          
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            {branding?.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt="Logo" 
                className="h-24 object-contain drop-shadow-sm"
              />
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ background: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
                >
                  <Leaf className="h-5 w-5 text-white" weight="fill" />
                </div>
                <h1 
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
                >
                  GeoTrace
                </h1>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">Acesse sua conta para continuar</p>
        </div>

        {/* Card de Login */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-gray-900">Entrar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-2 border-gray-200"
                  style={{ '--tw-ring-color': primaryColor, borderColor: 'inherit' } as React.CSSProperties}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-2 border-gray-200 pr-10"
                    style={{ '--tw-ring-color': primaryColor, borderColor: 'inherit' } as React.CSSProperties}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{" "}
                <Link
                  to="/auth/register"
                  className="font-medium hover:underline"
                  style={{ color: primaryColor }}
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Sistema de rastreabilidade para produtos com Indicação Geográfica
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 