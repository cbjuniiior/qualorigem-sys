import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, Leaf, ArrowLeft, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useBranding } from "@/hooks/use-branding";
import { toast } from "sonner";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { branding } = useBranding();
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  // Validações de senha
  const passwordValidations = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Pelo menos uma letra maiúscula", valid: /[A-Z]/.test(password) },
    { label: "Pelo menos uma letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Pelo menos um número", valid: /\d/.test(password) },
  ];

  const isPasswordValid = passwordValidations.every(v => v.valid);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (!isPasswordValid) {
      toast.error("A senha não atende aos requisitos de segurança");
      return;
    }

    if (!passwordsMatch) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      await signUp(email, password);
      navigate("/auth/login");
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const primaryColor = branding.primaryColor;
  const secondaryColor = branding.secondaryColor;

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
                  {branding.siteTitle?.split(' - ')[0] || "GeoTrace"}
                </h1>
              </div>
            )}
          </div>
          
          <p className="text-gray-600">Crie sua conta para começar</p>
        </div>

        {/* Card de Cadastro */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-gray-900">Criar Conta</CardTitle>
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

                {/* Validações de senha */}
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordValidations.map((validation, index) => (
                      <div key={index} className="flex items-center text-[10px] font-bold uppercase tracking-wider">
                        <Check 
                          className={`h-3 w-3 mr-2 ${
                            validation.valid ? "text-green-500" : "text-gray-300"
                          }`} 
                          weight="bold"
                        />
                        <span className={validation.valid ? "text-green-600" : "text-gray-400"}>
                          {validation.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`focus:ring-2 border-gray-200 pr-10 ${
                      confirmPassword && !passwordsMatch ? "border-red-300 focus:border-red-500" : ""
                    }`}
                    style={{ '--tw-ring-color': primaryColor, borderColor: 'inherit' } as React.CSSProperties}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-[10px] font-bold uppercase text-red-500">As senhas não coincidem</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
                disabled={loading || !isPasswordValid || !passwordsMatch}
              >
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link
                  to="/auth/login"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Fazer login
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

export default Register; 