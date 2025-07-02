import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  QrCode,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
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
        return <AlertCircle className="h-4 w-4" />;
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Lote {lote.code}
                        </h4>
                        <p className="text-sm text-gray-600">{lote.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{lote.variety || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{lote.harvest_year || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span>Qtd: {lote.quantity || 0} {lote.unit || 'kg'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(lote.category || 'ativo')}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(lote.category || 'ativo')}
                          <span className="capitalize">{lote.category || 'ativo'}</span>
                        </div>
                      </Badge>
                      
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/produtor/lotes/${lote.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/produtor/lotes/${lote.id}/editar`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/produtor/qrcodes/${lote.id}`}>
                            <QrCode className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(lote.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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