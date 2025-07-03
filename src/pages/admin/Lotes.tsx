import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Award,
  Package,
  Eye,
  Filter,
  Upload,
  Image as ImageIcon,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { productLotsApi, producersApi } from "@/services/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Slider } from "@/components/ui/slider";
import { QRCodeSVG } from "qrcode.react";

interface ProductLot {
  id: string;
  code: string;
  name: string;
  category: string | null;
  variety: string | null;
  harvest_year: string | null;
  quantity: number | null;
  unit: string | null;
  image_url: string | null;
  producer_id: string;
  fragrance_score: number | null;
  flavor_score: number | null;
  finish_score: number | null;
  acidity_score: number | null;
  body_score: number | null;
  sensory_notes: string | null;
  created_at: string;
  producers: {
    id: string;
    name: string;
    property_name: string;
    city: string;
    state: string;
  };
}

interface Producer {
  id: string;
  name: string;
  property_name: string;
}

const Lotes = () => {
  const [lots, setLots] = useState<ProductLot[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ProductLot | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    variety: "",
    harvest_year: "",
    quantity: "",
    unit: "",
    image_url: "",
    producer_id: "",
    fragrance_score: 5,
    flavor_score: 5,
    finish_score: 5,
    acidity_score: 5,
    body_score: 5,
    sensory_notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [lotsData, producersData] = await Promise.all([
        productLotsApi.getAll(),
        producersApi.getAll(),
      ]);
      setLots(lotsData);
      setProducers(producersData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        fragrance_score: formData.fragrance_score,
        flavor_score: formData.flavor_score,
        finish_score: formData.finish_score,
        acidity_score: formData.acidity_score,
        body_score: formData.body_score,
      };

      await productLotsApi.create(lotData);
      toast.success("Lote criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erro ao criar lote:", error);
      toast.error("Erro ao criar lote");
    }
  };

  const handleUpdate = async () => {
    if (!editingLot) return;

    try {
      const lotData = {
        ...formData,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        fragrance_score: formData.fragrance_score,
        flavor_score: formData.flavor_score,
        finish_score: formData.finish_score,
        acidity_score: formData.acidity_score,
        body_score: formData.body_score,
      };

      await productLotsApi.update(editingLot.id, lotData);
      toast.success("Lote atualizado com sucesso!");
      setEditingLot(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Erro ao atualizar lote:", error);
      toast.error("Erro ao atualizar lote");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productLotsApi.delete(id);
      toast.success("Lote excluído com sucesso!");
      fetchData();
    } catch (error) {
      console.error("Erro ao excluir lote:", error);
      toast.error("Erro ao excluir lote");
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "",
      variety: "",
      harvest_year: "",
      quantity: "",
      unit: "",
      image_url: "",
      producer_id: "",
      fragrance_score: 5,
      flavor_score: 5,
      finish_score: 5,
      acidity_score: 5,
      body_score: 5,
      sensory_notes: "",
    });
  };

  const openEditDialog = (lot: ProductLot) => {
    setEditingLot(lot);
    setFormData({
      code: lot.code,
      name: lot.name,
      category: lot.category || "",
      variety: lot.variety || "",
      harvest_year: lot.harvest_year || "",
      quantity: lot.quantity?.toString() || "",
      unit: lot.unit || "",
      image_url: lot.image_url || "",
      producer_id: lot.producer_id,
      fragrance_score: lot.fragrance_score || 5,
      flavor_score: lot.flavor_score || 5,
      finish_score: lot.finish_score || 5,
      acidity_score: lot.acidity_score || 5,
      body_score: lot.body_score || 5,
      sensory_notes: lot.sensory_notes || "",
    });
  };

  const filteredLots = lots.filter(lot => {
    const matchesSearch = 
      lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.producers.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "todas" || lot.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(lots.map(lot => lot.category).filter(Boolean)));

  // Função para gerar código do produto
  const generateProductCode = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PROD-${year}-${rand}`;
  };

  // Código do produto gerado automaticamente (apenas uma vez)
  useEffect(() => {
    if (!formData.code) {
      setFormData({ ...formData, code: generateProductCode() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando lotes...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lotes</h1>
            <p className="text-gray-600">Gerencie os lotes de produtos cadastrados</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Novo Lote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Lote</DialogTitle>
              </DialogHeader>
              <LotForm
                formData={formData}
                setFormData={setFormData}
                producers={producers}
                onSubmit={handleCreate}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar lotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category!}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <Card key={lot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{lot.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Código: {lot.code}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(lot)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Lote</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o lote "{lot.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(lot.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {lot.category}
                  </Badge>
                  {lot.variety && (
                    <Badge variant="secondary" className="text-xs">
                      {lot.variety}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Package className="h-4 w-4 mr-2" />
                  {lot.quantity} {lot.unit}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Safra {lot.harvest_year}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {lot.producers.city}, {lot.producers.state}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="h-4 w-4 mr-2" />
                  Produtor: {lot.producers.name}
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Fragrância:</span>
                    <span className="font-medium">{lot.fragrance_score?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabor:</span>
                    <span className="font-medium">{lot.flavor_score?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finalização:</span>
                    <span className="font-medium">{lot.finish_score?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acidez:</span>
                    <span className="font-medium">{lot.acidity_score?.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLots.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum lote encontrado.</p>
          </div>
        )}

        {/* Edit Dialog */}
        {editingLot && (
          <Dialog open={!!editingLot} onOpenChange={() => setEditingLot(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Lote</DialogTitle>
              </DialogHeader>
              <LotForm
                formData={formData}
                setFormData={setFormData}
                producers={producers}
                onSubmit={handleUpdate}
                onCancel={() => {
                  setEditingLot(null);
                  resetForm();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

// Componente do formulário
const LotForm = ({ 
  formData, 
  setFormData, 
  producers,
  onSubmit, 
  onCancel 
}: {
  formData: any;
  setFormData: (data: any) => void;
  producers: Producer[];
  onSubmit: () => void;
  onCancel: () => void;
}) => {
  const averageScore = (
    formData.fragrance_score + 
    formData.flavor_score + 
    formData.finish_score + 
    formData.acidity_score + 
    formData.body_score
  ) / 5;

  // Upload único de imagem
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData({ ...formData, image_url: ev.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => setFormData({ ...formData, image_url: "" });

  // URL para QRCode
  const qrValue = `${window.location.origin}/produto/${formData.code}`;

  return (
    <div className="space-y-8 p-4 md:p-8 bg-[#f7f8fa] rounded-2xl shadow-md">
      {/* Bloco: Dados principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex flex-col gap-4">
          <Label htmlFor="code" className="font-semibold flex items-center gap-2"><QrCode className="w-5 h-5 text-blue-500" /> Código do Produto</Label>
          <Input id="code" value={formData.code} disabled className="bg-gray-100 font-mono" />
          <div className="flex flex-col gap-2 mt-2">
            <Label className="font-semibold flex items-center gap-2"><ImageIcon className="w-5 h-5 text-green-500" /> Imagem do Produto</Label>
            {formData.image_url ? (
              <div className="relative w-40 h-40 rounded-xl overflow-hidden border bg-[#f3f4f6] flex items-center justify-center">
                <img src={formData.image_url} alt="Produto" className="object-cover w-full h-full" />
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 bg-white/80" onClick={removeImage} title="Remover imagem"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg></Button>
              </div>
            ) : (
              <Button type="button" variant="outline" className="w-40 h-40 flex flex-col items-center justify-center gap-2 border-dashed" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500">Clique para enviar</span>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Label htmlFor="name" className="font-semibold">Nome do Produto *</Label>
          <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome do produto" required />
          <Label htmlFor="category" className="font-semibold">Categoria</Label>
          <Select value={formData.category} onValueChange={value => setFormData({ ...formData, category: value })}>
            <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Café">Café</SelectItem>
              <SelectItem value="Vinho">Vinho</SelectItem>
              <SelectItem value="Queijo">Queijo</SelectItem>
              <SelectItem value="Mel">Mel</SelectItem>
              <SelectItem value="Outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Label htmlFor="variety" className="font-semibold">Variedade</Label>
          <Input id="variety" value={formData.variety} onChange={e => setFormData({ ...formData, variety: e.target.value })} placeholder="Variedade do produto" />
          <Label htmlFor="harvest_year" className="font-semibold">Safra</Label>
          <Input id="harvest_year" value={formData.harvest_year} onChange={e => setFormData({ ...formData, harvest_year: e.target.value })} placeholder="2024" />
        </div>
      </div>
      {/* Bloco: Produtor, quantidade, unidade, QRCode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex flex-col gap-4">
          <Label htmlFor="producer_id" className="font-semibold">Produtor *</Label>
          <Select value={formData.producer_id} onValueChange={value => setFormData({ ...formData, producer_id: value })}>
            <SelectTrigger><SelectValue placeholder="Selecione o produtor" /></SelectTrigger>
            <SelectContent>
              {producers.map((producer) => (
                <SelectItem key={producer.id} value={producer.id}>{producer.name} - {producer.property_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label htmlFor="quantity" className="font-semibold">Quantidade</Label>
          <Input id="quantity" type="number" step="0.01" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="500" />
          <Label htmlFor="unit" className="font-semibold">Unidade</Label>
          <Select value={formData.unit} onValueChange={value => setFormData({ ...formData, unit: value })}>
            <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Kg">Quilogramas (Kg)</SelectItem>
              <SelectItem value="L">Litros (L)</SelectItem>
              <SelectItem value="un">Unidades</SelectItem>
              <SelectItem value="g">Gramas (g)</SelectItem>
              <SelectItem value="ml">Mililitros (ml)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center">
          <Label className="font-semibold flex items-center gap-2"><QrCode className="w-5 h-5 text-blue-500" /> QR Code do Produto</Label>
          <div className="bg-white rounded-xl border p-4 flex flex-col items-center">
            <QRCodeSVG value={qrValue} size={120} bgColor="#fff" fgColor="#222" />
            <span className="text-xs text-gray-500 mt-2 break-all text-center">{qrValue}</span>
          </div>
        </div>
      </div>
      {/* Bloco: Análise sensorial */}
      <div className="space-y-4 bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-2">Análise Sensorial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Fragrância: {formData.fragrance_score}</Label>
              <Slider value={[formData.fragrance_score]} onValueChange={([value]) => setFormData({ ...formData, fragrance_score: value })} max={10} min={0} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label>Sabor: {formData.flavor_score}</Label>
              <Slider value={[formData.flavor_score]} onValueChange={([value]) => setFormData({ ...formData, flavor_score: value })} max={10} min={0} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label>Finalização: {formData.finish_score}</Label>
              <Slider value={[formData.finish_score]} onValueChange={([value]) => setFormData({ ...formData, finish_score: value })} max={10} min={0} step={0.1} className="mt-2" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Acidez: {formData.acidity_score}</Label>
              <Slider value={[formData.acidity_score]} onValueChange={([value]) => setFormData({ ...formData, acidity_score: value })} max={10} min={0} step={0.1} className="mt-2" />
            </div>
            <div>
              <Label>Corpo: {formData.body_score}</Label>
              <Slider value={[formData.body_score]} onValueChange={([value]) => setFormData({ ...formData, body_score: value })} max={10} min={0} step={0.1} className="mt-2" />
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{averageScore.toFixed(1)}</div>
                <div className="text-sm text-green-700">Nota Geral</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="sensory_notes" className="font-semibold">Observações Sensoriais</Label>
          <Textarea id="sensory_notes" value={formData.sensory_notes} onChange={e => setFormData({ ...formData, sensory_notes: e.target.value })} placeholder="Descreva as características sensoriais do produto..." rows={3} />
        </div>
      </div>
      {/* Botões de ação */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit}>Salvar</Button>
      </div>
    </div>
  );
};

export default Lotes; 