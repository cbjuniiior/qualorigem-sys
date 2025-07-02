import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Leaf, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-green-700 hover:text-green-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">
              GeoTrace
            </h1>
          </div>
          
          <p className="text-gray-600">Crie sua conta para começar</p>
        </div>

        {/* Card de Cadastro */}
        <Card className="border-green-100 shadow-lg">
          <CardHeader className="text-center">
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
                  className="border-green-200 focus:border-green-500"
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
                    className="border-green-200 focus:border-green-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>

                {/* Validações de senha */}
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordValidations.map((validation, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <Check 
                          className={`h-3 w-3 mr-2 ${
                            validation.valid ? "text-green-500" : "text-gray-300"
                          }`} 
                        />
                        <span className={validation.valid ? "text-green-600" : "text-gray-500"}>
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
                    className={`border-green-200 focus:border-green-500 pr-10 ${
                      confirmPassword && !passwordsMatch ? "border-red-300 focus:border-red-500" : ""
                    }`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">As senhas não coincidem</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 h-11"
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