import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Plus, 
  MagnifyingGlass, 
  Funnel, 
  PencilSimple, 
  Trash, 
  Eye,
  QrCode,
  Calendar,
  MapPin,
  WarningCircle,
  CheckCircle,
  Clock
} from "@phosphor-icons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProducerLayout } from "@/components/layout/ProducerLayout";
import { useAuth } from "@/hooks/use-auth";
import { productLotsApi, ProductLot } from "@/services/api";
import { toast } from "sonner";

export const ProducerLotes = () => {
  const { user } = useAuth();
  const [lotes, setLotes] = useState<ProductLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      setLoading(true);
      const data = await productLotsApi.getByProducer(user?.id);
      setLotes(data || []);
    } catch (error) {
      console.error("Erro ao buscar lotes:", error);
      toast.error("Erro ao carregar lotes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lote?")) return;
    
    try {
      await productLotsApi.delete(id);
      toast.success("Lote excluído com sucesso");
      fetchLotes();
    } catch (error) {
      console.error("Erro ao excluir lote:", error);
      toast.error("Erro ao excluir lote");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'vendido':
        return 'bg-blue-100 text-blue-800';
      case 'processando':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="h-4 w-4" />;
      case 'vendido':
        return <CheckCircle className="h-4 w-4" />;
      case 'processando':
        return <Clock className="h-4 w-4" />;
      default:
        return <WarningCircle className="h-4 w-4" />;
    }
  };

  const filteredLotes = lotes.filter(lote => {
    const matchesSearch = lote.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lote.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || lote.category === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProducerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Meus Lotes
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Gerencie todos os seus lotes de produtos.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link to="/produtor/lotes/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Link>
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre seus lotes por código, nome ou status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por código ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de lotes */}
        <Card>
          <CardHeader>
            <CardTitle>Lotes ({filteredLotes.length})</CardTitle>
            <CardDescription>
              Lista de todos os seus lotes registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : filteredLotes.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum lote encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || statusFilter !== "todos" 
                    ? "Tente ajustar os filtros de busca."
                    : "Comece criando seu primeiro lote."
                  }
                </p>
                {!searchTerm && statusFilter === "todos" && (
                  <Button asChild>
                    <Link to="/produtor/lotes/novo">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Lote
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLotes.map((lote) => (
                  <div
                    key={lote.id}
                    className="flex flex-col md:flex-row items-center md:items-stretch justify-between gap-4 p-5 border rounded-2xl shadow-sm bg-white hover:shadow-lg transition-all"
                  >
                    {/* Imagem do lote */}
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {lote.image_url ? (
                        <img src={lote.image_url} alt={lote.name} className="object-cover w-full h-full" />
                      ) : (
                        <Package className="h-10 w-10 text-gray-300" />
                      )}
                    </div>
                    {/* Conteúdo principal */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg text-gray-900 truncate">{lote.name}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full p-2 text-blue-600 hover:text-blue-700"
                          asChild
                          title="Ver Página Pública"
                        >
                          <Link to={`/lote/${lote.code}`} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        Código: {lote.code} | Safra: {lote.harvest_year} | Categoria: {lote.category} {lote.variety && `| Variedade: ${lote.variety}`}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
                          {lote.quantity} {lote.unit}
                        </span>
                        {lote.flavor_score && (
                          <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
                            {lote.flavor_score.toFixed(1)} Sabor
                          </span>
                        )}
                        {lote.fragrance_score && (
                          <span className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-semibold">
                            {lote.fragrance_score.toFixed(1)} Fragrância
                          </span>
                        )}
                        {lote.finish_score && (
                          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold">
                            {lote.finish_score.toFixed(1)} Finalização
                          </span>
                        )}
                        {lote.acidity_score && (
                          <span className="bg-pink-100 text-pink-700 rounded-full px-3 py-1 text-xs font-semibold">
                            {lote.acidity_score.toFixed(1)} Acidez
                          </span>
                        )}
                        {lote.body_score && (
                          <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-semibold">
                            {lote.body_score.toFixed(1)} Corpo
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Ações */}
                    <div className="flex flex-col gap-2 items-end md:items-center justify-center">
                      <Button variant="ghost" size="icon" className="rounded-full p-2" asChild title="Editar Lote">
                        <Link to={`/produtor/lotes/${lote.id}/editar`}><PencilSimple className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full p-2" asChild title="QR Code do Lote">
                        <Link to={`/produtor/qrcodes/${lote.id}`}><QrCode className="h-4 w-4" /></Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full p-2 text-red-600 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => handleDelete(lote.id)} 
                        title="Excluir Lote"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProducerLayout>
  );
}; 