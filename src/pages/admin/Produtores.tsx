import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin, 
  Phone, 
  Mail,
  Mountain,
  Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi } from "@/services/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import InputMask from "react-input-mask";
import { useRef } from "react";
import axios from "axios";

interface Producer {
  id: string;
  name: string;
  document_number: string | null;
  phone: string | null;
  email: string | null;
  property_name: string;
  property_description: string | null;
  address: string | null;
  city: string;
  state: string;
  altitude: number | null;
  average_temperature: number | null;
  created_at: string;
}

// Definição do initialWizardData ANTES do WizardProducerForm
const initialWizardData = {
  name: "",
  document_number: "",
  phone: "",
  email: "",
  property_name: "",
  property_description: "",
  images: [],
  cep: "",
  address: "",
  city: "",
  state: "",
  latitude: "",
  longitude: "",
  altitude: "",
  average_temperature: "",
};

// Definição do steps ANTES do WizardProducerForm
const steps = [
  "Dados Pessoais",
  "Propriedade",
  "Localização",
  "Outros Dados",
  "Revisão"
];

const Produtores = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      const data = await producersApi.getAll();
      setProducers(data);
    } catch (error) {
      console.error("Erro ao buscar produtores:", error);
      toast.error("Erro ao carregar produtores");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      const producerData = {
        ...data,
        altitude: data.altitude ? parseInt(data.altitude) : null,
        average_temperature: data.average_temperature ? parseFloat(data.average_temperature) : null,
      };
      await producersApi.create(producerData);
      toast.success("Produtor criado com sucesso!");
      setIsCreateDialogOpen(false);
      fetchProducers();
    } catch (error) {
      console.error("Erro ao criar produtor:", error);
      toast.error("Erro ao criar produtor");
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingProducer) return;
    try {
      const producerData = {
        ...data,
        altitude: data.altitude ? parseInt(data.altitude) : null,
        average_temperature: data.average_temperature ? parseFloat(data.average_temperature) : null,
      };
      await producersApi.update(editingProducer.id, producerData);
      toast.success("Produtor atualizado com sucesso!");
      setEditingProducer(null);
      fetchProducers();
    } catch (error) {
      console.error("Erro ao atualizar produtor:", error);
      toast.error("Erro ao atualizar produtor");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await producersApi.delete(id);
      toast.success("Produtor excluído com sucesso!");
      fetchProducers();
    } catch (error) {
      console.error("Erro ao excluir produtor:", error);
      toast.error("Erro ao excluir produtor");
    }
  };

  const openEditDialog = (producer: Producer) => {
    setEditingProducer(producer);
  };

  const filteredProducers = producers.filter(producer =>
    producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producer.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produtores...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Produtores</h1>
            <p className="text-gray-600">Gerencie os produtores cadastrados no sistema</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Novo Produtor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Produtor</DialogTitle>
              </DialogHeader>
              <WizardProducerForm
                initialData={undefined}
                onSubmit={handleCreate}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Producers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducers.map((producer) => (
            <Card key={producer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{producer.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{producer.property_name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(producer)}
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
                          <AlertDialogTitle>Excluir Produtor</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produtor "{producer.name}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(producer.id)}
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
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {producer.city}, {producer.state}
                </div>
                {producer.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {producer.phone}
                  </div>
                )}
                {producer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {producer.email}
                  </div>
                )}
                <div className="flex space-x-2">
                  {producer.altitude && (
                    <Badge variant="outline" className="text-xs">
                      <Mountain className="h-3 w-3 mr-1" />
                      {producer.altitude}m
                    </Badge>
                  )}
                  {producer.average_temperature && (
                    <Badge variant="outline" className="text-xs">
                      <Thermometer className="h-3 w-3 mr-1" />
                      {producer.average_temperature}°C
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produtor encontrado.</p>
          </div>
        )}

        {/* Edit Dialog */}
        {editingProducer && (
          <Dialog open={!!editingProducer} onOpenChange={() => setEditingProducer(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Produtor</DialogTitle>
              </DialogHeader>
              <WizardProducerForm
                key={editingProducer.id}
                initialData={editingProducer}
                onSubmit={handleUpdate}
                onCancel={() => setEditingProducer(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

// Wizard de etapas para cadastro/edição de produtor
const WizardProducerForm = ({
  initialData = initialWizardData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(() => ({
    ...initialWizardData,
    ...initialData,
    images: initialData?.images || [],
    cep: initialData?.cep || "",
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
  }));
  const [errors, setErrors] = useState<any>({});

  // Máscaras
  const handleMaskedChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Validação simples da etapa 1
  const validateStep1 = () => {
    const errs: any = {};
    if (!formData.name) errs.name = "Nome obrigatório";
    if (!formData.document_number) errs.document_number = "CPF/CNPJ obrigatório";
    if (!formData.phone) errs.phone = "Telefone obrigatório";
    if (!formData.email) errs.email = "E-mail obrigatório";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 0 && !validateStep1()) return;
    setStep((s) => s + 1);
  };
  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  // Função para lidar com upload de imagens
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setFormData((prev: any) => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
    }));
  };

  const handleRemoveImage = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== idx),
    }));
  };

  // Máscara de CEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, "");
    setFormData((prev: any) => ({ ...prev, cep: e.target.value }));
    if (cep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!res.data.erro) {
          setFormData((prev: any) => ({
            ...prev,
            address: res.data.logradouro || prev.address,
            city: res.data.localidade || prev.city,
            state: res.data.uf || prev.state,
          }));
        }
      } catch (err) {
        // Não faz nada se erro
      }
    }
  };

  // Etapa 1: Dados pessoais
  const Step1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Produtor *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleMaskedChange("name", e.target.value)}
            placeholder="Nome completo"
            required
          />
          {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
        </div>
        <div>
          <Label htmlFor="document_number">CPF/CNPJ *</Label>
          <InputMask
            mask={formData.document_number.length > 14 ? "99.999.999/9999-99" : "999.999.999-99"}
            value={formData.document_number}
            onChange={(e) => handleMaskedChange("document_number", e.target.value)}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="document_number"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                required
              />
            )}
          </InputMask>
          {errors.document_number && <span className="text-xs text-red-500">{errors.document_number}</span>}
        </div>
        <div>
          <Label htmlFor="phone">Telefone *</Label>
          <InputMask
            mask={formData.phone.replace(/\D/g, "").length > 10 ? "(99) 99999-9999" : "(99) 9999-9999"}
            value={formData.phone}
            onChange={(e) => handleMaskedChange("phone", e.target.value)}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="phone"
                placeholder="(00) 00000-0000"
                required
              />
            )}
          </InputMask>
          {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
        </div>
        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleMaskedChange("email", e.target.value)}
            placeholder="email@exemplo.com"
            required
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>
      </div>
    </div>
  );

  // Etapa 2: Propriedade
  const Step2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="property_name">Nome da Propriedade *</Label>
        <Input
          id="property_name"
          value={formData.property_name}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, property_name: e.target.value }))}
          placeholder="Nome da fazenda/sítio"
          required
        />
      </div>
      <div>
        <Label htmlFor="property_description">Descrição da Propriedade</Label>
        <Textarea
          id="property_description"
          value={formData.property_description}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, property_description: e.target.value }))}
          placeholder="Descreva a propriedade, história, características..."
          rows={3}
        />
      </div>
      <div>
        <Label>Imagens da Fazenda</Label>
        <input
          type="file"
          accept="image/*"
          multiple
          className="block mt-2"
          onChange={handleImageUpload}
        />
        {formData.images && formData.images.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {formData.images.map((img: any, idx: number) => (
              <div key={idx} className="relative group w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                  src={img.url}
                  alt={`Imagem ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  title="Remover imagem"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Você pode enviar até 5 imagens. Arraste para reordenar (em breve).</p>
      </div>
    </div>
  );

  // Etapa 3: Localização
  const Step3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cep">CEP</Label>
          <InputMask
            mask="99999-999"
            value={formData.cep}
            onChange={handleCepChange}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="cep"
                placeholder="00000-000"
              />
            )}
          </InputMask>
        </div>
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, address: e.target.value }))}
            placeholder="Endereço completo"
          />
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, city: e.target.value }))}
            placeholder="Nome da cidade"
          />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, state: e.target.value }))}
            placeholder="UF"
          />
        </div>
        <div>
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            value={formData.latitude}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, latitude: e.target.value }))}
            placeholder="-23.123456"
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            value={formData.longitude}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, longitude: e.target.value }))}
            placeholder="-46.123456"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">Ao digitar o CEP, cidade e estado serão preenchidos automaticamente.</p>
    </div>
  );

  // Etapa 4: Outros Dados
  const Step4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="altitude">Altitude (metros)</Label>
          <Input
            id="altitude"
            type="number"
            value={formData.altitude}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, altitude: e.target.value }))}
            placeholder="1200"
          />
        </div>
        <div>
          <Label htmlFor="average_temperature">Temperatura Média (°C)</Label>
          <Input
            id="average_temperature"
            type="number"
            step="0.1"
            value={formData.average_temperature}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, average_temperature: e.target.value }))}
            placeholder="22.5"
          />
        </div>
      </div>
    </div>
  );

  // Etapa 5: Revisão
  const Step5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Revisar informações</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Dados Pessoais</h4>
          <p><b>Nome:</b> {formData.name}</p>
          <p><b>CPF/CNPJ:</b> {formData.document_number}</p>
          <p><b>Telefone:</b> {formData.phone}</p>
          <p><b>E-mail:</b> {formData.email}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Propriedade</h4>
          <p><b>Nome:</b> {formData.property_name}</p>
          <p><b>Descrição:</b> {formData.property_description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.images && formData.images.length > 0 && formData.images.map((img: any, idx: number) => (
              <img key={idx} src={img.url} alt="img" className="w-14 h-14 object-cover rounded border" />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Localização</h4>
          <p><b>CEP:</b> {formData.cep}</p>
          <p><b>Endereço:</b> {formData.address}</p>
          <p><b>Cidade:</b> {formData.city}</p>
          <p><b>Estado:</b> {formData.state}</p>
          <p><b>Latitude:</b> {formData.latitude}</p>
          <p><b>Longitude:</b> {formData.longitude}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Outros Dados</h4>
          <p><b>Altitude:</b> {formData.altitude} m</p>
          <p><b>Temperatura Média:</b> {formData.average_temperature} °C</p>
        </div>
      </div>
      <div className="text-sm text-gray-500 mt-4">Confira todos os dados antes de salvar. Se precisar, volte e ajuste as informações.</div>
    </div>
  );

  // Barra de progresso
  const ProgressBar = () => (
    <div className="w-full flex items-center mb-6">
      {steps.map((label, idx) => (
        <div key={label} className="flex-1 flex items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white transition-all duration-300 ${step === idx ? "bg-green-600 scale-110" : idx < step ? "bg-green-400" : "bg-gray-300"}`}>{idx + 1}</div>
          {idx < steps.length - 1 && <div className={`flex-1 h-1 ${step > idx ? "bg-green-400" : "bg-gray-200"}`}></div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <ProgressBar />
      {step === 0 && <Step1 />}
      {step === 1 && <Step2 />}
      {step === 2 && <Step3 />}
      {step === 3 && <Step4 />}
      {step === 4 && <Step5 />}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <div className="flex gap-2">
          {step > 0 && <Button variant="secondary" onClick={prevStep}>Voltar</Button>}
          {step === steps.length - 1 ? (
            <Button onClick={() => onSubmit(formData)}>Salvar</Button>
          ) : (
            <Button onClick={nextStep}>Avançar</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Produtores; 