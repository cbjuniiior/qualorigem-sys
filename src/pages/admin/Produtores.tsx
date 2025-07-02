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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { uploadImageToSupabase } from "@/services/upload";

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
        latitude: data.latitude === "" ? null : data.latitude,
        longitude: data.longitude === "" ? null : data.longitude,
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
              <ProducerForm
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
                            onClick={async () => {
                              await handleDelete(producer.id);
                            }}
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
              <ProducerForm
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

const steps = [
  { title: "Sobre o Produtor", description: "Dados pessoais do produtor" },
  { title: "Sobre a Propriedade", description: "Informações da propriedade" },
  { title: "Localização", description: "Endereço e coordenadas" },
];

const defaultValues = {
  name: "",
  document_number: "",
  email: "",
  phone: "",
  property_name: "",
  property_description: "",
  photos: [],
  altitude: "",
  average_temperature: "",
  cep: "",
  address: "",
  city: "",
  state: "",
  use_coordinates: false,
  latitude: "",
  longitude: "",
};

const ProducerForm = ({ initialData, onSubmit, onCancel }: { initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<any[]>([]);

  const methods = useForm({
    defaultValues: initialData || defaultValues,
    mode: "onTouched",
  });
  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = methods;

  // Máscaras e handlers
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");
    let masked = "";
    if (numbers.length <= 11) {
      masked = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      masked = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    setValue("document_number", masked);
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");
    let masked = "";
    if (numbers.length <= 10) {
      masked = numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
      masked = numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    setValue("phone", masked);
  };
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cep = value.replace(/\D/g, "");
    const maskedCep = cep.replace(/(\d{5})(\d{3})/, "$1-$2");
    setValue("cep", maskedCep);
    if (cep.length === 8) {
      try {
        const res = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!res.data.erro) {
          setValue("address", res.data.logradouro || "");
          setValue("city", res.data.localidade || "");
          setValue("state", res.data.uf || "");
          toast.success("Endereço preenchido automaticamente!");
        }
      } catch {
        toast.error("Erro ao buscar CEP");
      }
    }
  };
  // Upload de fotos
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      // Adiciona preview local imediatamente
      setPhotoPreviews(prev => [...prev, { file, url: URL.createObjectURL(file), uploading: true }]);
      try {
        const url = await uploadImageToSupabase(file);
        // Atualiza preview para mostrar que terminou o upload
        setPhotoPreviews(prev => prev.map(p => p.file === file ? { ...p, url, uploading: false, uploaded: true } : p));
        // Salva a URL real no campo do formulário
        setValue("photos", [...(watch("photos") || []), url]);
      } catch (err) {
        setPhotoPreviews(prev => prev.filter(p => p.file !== file));
        toast.error("Erro ao fazer upload da imagem");
      }
    }
  };
  const removePhoto = async (index: number) => {
    const photo = photoPreviews[index];
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setValue("photos", (watch("photos") || []).filter((_: any, i: number) => i !== index));
    // Opcional: deletar do storage se já foi enviado
    // if (photo.uploaded && photo.url) {
    //   const path = photo.url.split('/propriedades/')[1];
    //   await supabase.storage.from('propriedades').remove([`propriedades/${path}`]);
    // }
  };

  // Validação por etapa
  const validateStep = async () => {
    let fields: string[] = [];
    if (currentStep === 0) fields = ["name", "document_number", "email", "phone"];
    if (currentStep === 1) fields = ["property_name", "altitude", "average_temperature"];
    if (currentStep === 2) {
      if (!watch("use_coordinates")) fields = ["cep", "city", "state"];
      else fields = ["latitude", "longitude"];
    }
    return await trigger(fields);
  };

  const nextStep = async () => {
    if (await validateStep()) setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const onSubmitForm = async (data: any) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  // Renderização condicional por etapa (mantendo todos os campos montados)
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        {/* Barra de progresso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${idx <= currentStep ? "bg-green-600 border-green-600 text-white" : "bg-white border-gray-300 text-gray-500"}`}>{idx < currentStep ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <span className="text-sm font-medium">{idx + 1}</span>}</div>{idx < steps.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${idx < currentStep ? "bg-green-600" : "bg-gray-300"}`} />}</div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h3>
            <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>
        {/* Etapa 1 */}
        <div style={{ display: currentStep === 0 ? "block" : "none" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Produtor *</Label>
              <Input id="name" {...register("name", { required: true })} placeholder="Nome completo" className={errors.name ? "border-red-500 focus:border-red-500" : ""} />
              {errors.name && <span className="text-xs text-red-500">Campo obrigatório</span>}
            </div>
            <div>
              <Label htmlFor="document_number">CPF/CNPJ *</Label>
              <Input
                id="document_number"
                {...register("document_number", {
                  required: true,
                  validate: value => {
                    const numbers = value.replace(/\D/g, "");
                    return (
                      numbers.length === 11 || numbers.length === 14 ||
                      "CPF deve ter 11 dígitos ou CNPJ 14 dígitos"
                    );
                  },
                })}
                onChange={handleDocumentChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className={errors.document_number ? "border-red-500 focus:border-red-500" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">Exemplo: 123.456.789-00 ou 12.345.678/0001-00</p>
              {typeof errors.document_number?.message === 'string' && (
                <span className="text-xs text-red-500">{errors.document_number?.message || "Campo obrigatório"}</span>
              )}
            </div>
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "E-mail inválido"
                  }
                })}
                placeholder="email@exemplo.com"
                className={errors.email ? "border-red-500 focus:border-red-500" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">Exemplo: email@exemplo.com</p>
              {typeof errors.email?.message === 'string' && (
                <span className="text-xs text-red-500">{errors.email?.message || "Campo obrigatório"}</span>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                {...register("phone", {
                  required: true,
                  validate: value => {
                    const numbers = value.replace(/\D/g, "");
                    return (
                      (numbers.length === 10 || numbers.length === 11) ||
                      "Telefone deve ter 10 ou 11 dígitos"
                    );
                  },
                })}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className={errors.phone ? "border-red-500 focus:border-red-500" : ""}
              />
              <p className="text-xs text-gray-500 mt-1">Exemplo: (11) 91234-5678</p>
              {typeof errors.phone?.message === 'string' && (
                <span className="text-xs text-red-500">{errors.phone?.message || "Campo obrigatório"}</span>
              )}
            </div>
          </div>
        </div>
        {/* Etapa 2 */}
        <div style={{ display: currentStep === 1 ? "block" : "none" }}>
          <div>
            <Label htmlFor="property_name">Nome da Propriedade *</Label>
            <Input id="property_name" {...register("property_name", { required: true })} placeholder="Nome da fazenda/sítio" className={errors.property_name ? "border-red-500 focus:border-red-500" : ""} />
            {errors.property_name && <span className="text-xs text-red-500">Campo obrigatório</span>}
          </div>
          <div>
            <Label htmlFor="property_description">Descrição da Propriedade</Label>
            <Textarea id="property_description" {...register("property_description")} placeholder="Descreva a propriedade, história, características..." rows={3} />
          </div>
          <div>
            <Label>Fotos da Propriedade</Label>
            <input type="file" accept="image/*" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" onChange={handlePhotoUpload} />
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {photoPreviews.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    {photo.uploading ? (
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-b-4 border-green-500"></div>
                      </div>
                    ) : (
                      <img src={photo.url} alt={`Foto ${idx + 1}`} className="w-full h-24 object-cover rounded-lg border" />
                    )}
                    <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="altitude">Altitude (metros) *</Label>
              <Input id="altitude" type="number" {...register("altitude", { required: true })} placeholder="1200" className={errors.altitude ? "border-red-500 focus:border-red-500" : ""} />
              {errors.altitude && <span className="text-xs text-red-500">Campo obrigatório</span>}
            </div>
            <div>
              <Label htmlFor="average_temperature">Temperatura Média (°C) *</Label>
              <Input id="average_temperature" type="number" step="0.1" {...register("average_temperature", { required: true })} placeholder="22.5" className={errors.average_temperature ? "border-red-500 focus:border-red-500" : ""} />
              {errors.average_temperature && <span className="text-xs text-red-500">Campo obrigatório</span>}
            </div>
          </div>
        </div>
        {/* Etapa 3 */}
        <div style={{ display: currentStep === 2 ? "block" : "none" }}>
          <div className="flex items-center space-x-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <Switch id="use_coordinates" checked={watch("use_coordinates")} onCheckedChange={checked => setValue("use_coordinates", checked)} />
            <div className="flex-1">
              <Label htmlFor="use_coordinates" className="text-sm font-medium text-gray-900">Usar coordenadas geográficas</Label>
              <p className="text-xs text-gray-600">Marque esta opção para propriedades sem endereço fixo no mapa</p>
            </div>
          </div>
          {!watch("use_coordinates") ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  {...register("cep", {
                    required: true,
                    validate: value => {
                      const numbers = value.replace(/\D/g, "");
                      return (
                        numbers.length === 8 ||
                        "CEP deve ter 8 dígitos"
                      );
                    },
                  })}
                  onChange={handleCepChange}
                  placeholder="00000-000"
                  className={errors.cep ? "border-red-500 focus:border-red-500" : ""}
                />
                <p className="text-xs text-gray-500 mt-1">Exemplo: 12345-678</p>
                {typeof errors.cep?.message === 'string' && (
                  <span className="text-xs text-red-500">{errors.cep?.message || "Campo obrigatório"}</span>
                )}
              </div>
              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" {...register("address")} placeholder="Endereço completo" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Cidade *</Label>
                  <Input id="city" {...register("city", { required: true })} placeholder="Nome da cidade" className={errors.city ? "border-red-500 focus:border-red-500" : ""} />
                  {errors.city && <span className="text-xs text-red-500">Campo obrigatório</span>}
                </div>
                <div>
                  <Label htmlFor="state">Estado *</Label>
                  <Input id="state" {...register("state", { required: true })} placeholder="UF" className={errors.state ? "border-red-500 focus:border-red-500" : ""} />
                  {errors.state && <span className="text-xs text-red-500">Campo obrigatório</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input id="latitude" type="number" step="any" {...register("latitude", { required: true })} placeholder="-23.123456" className={errors.latitude ? "border-red-500 focus:border-red-500" : ""} />
                {errors.latitude && <span className="text-xs text-red-500">Campo obrigatório</span>}
                <p className="text-xs text-gray-500 mt-1">Ex: -23.123456</p>
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input id="longitude" type="number" step="any" {...register("longitude", { required: true })} placeholder="-46.123456" className={errors.longitude ? "border-red-500 focus:border-red-500" : ""} />
                {errors.longitude && <span className="text-xs text-red-500">Campo obrigatório</span>}
                <p className="text-xs text-gray-500 mt-1">Ex: -46.123456</p>
              </div>
            </div>
          )}
        </div>
        {/* Botões de navegação */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <div className="flex space-x-2">
            {currentStep > 0 && <Button type="button" variant="outline" onClick={prevStep}>Anterior</Button>}
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep}>Próximo</Button>
            ) : (
              <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default Produtores; 