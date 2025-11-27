import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { associationsApi, systemConfigApi } from "@/services/api";
import { uploadImageToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { hexToHsl } from "@/lib/utils";
import { 
  Plus, 
  PencilSimple, 
  Image, 
  Upload, 
  MagnifyingGlass, 
  FunnelSimple, 
  MapPin, 
  Envelope, 
  Phone, 
  Globe, 
  Trash, 
  Eye, 
  Building, 
  Users, 
  X 
} from "@phosphor-icons/react";

interface AssociationFormData {
  id?: string;
  name: string;
  type: string;
  city: string;
  state: string;
  description: string;
  contact_info: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
  };
  logo_url?: string;
}

const defaultForm: AssociationFormData = {
  name: "",
  type: "associacao",
  city: "",
  state: "",
  description: "",
  contact_info: {
    email: "",
    phone: "",
    website: "",
    address: "",
  },
  logo_url: "",
};

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

export default function Associacoes() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<AssociationFormData>(defaultForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [showProducersModal, setShowProducersModal] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState<any>(null);
  const [producersList, setProducersList] = useState<any[]>([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [branding, setBranding] = useState<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null>(null);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  const cssVariables = {
    '--primary': hexToHsl(primaryColor),
    '--secondary': hexToHsl(secondaryColor),
    '--accent': hexToHsl(accentColor),
    '--ring': hexToHsl(primaryColor),
  } as React.CSSProperties;

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

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await associationsApi.getAll();
      
      // Adicionar contagem de produtores para cada associação
      const dataWithCounts = await Promise.all(
        (data || []).map(async (association) => {
          try {
            const count = await associationsApi.getProducerCount(association.id);
            return { ...association, producer_count: count };
          } catch (e) {
            return { ...association, producer_count: 0 };
          }
        })
      );
      
      setItems(dataWithCounts);
      setFilteredItems(dataWithCounts);
    } catch (e) {
      toast.error("Erro ao carregar associações");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = items;

    if (filterType !== "all") {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.city?.toLowerCase().includes(term) ||
        item.state?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.contact_info?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredItems(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, items]);

  useEffect(() => {
    fetchAll();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setCurrentStep(1);
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      id: item.id,
      name: item.name || "",
      type: item.type || "associacao",
      city: item.city || "",
      state: item.state || "",
      description: item.description || "",
      contact_info: item.contact_info || {
        email: "",
        phone: "",
        website: "",
        address: "",
      },
      logo_url: item.logo_url || "",
    });
    setCurrentStep(1);
    setOpen(true);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return form.name.trim() !== "";
      case 2:
        return true; // Descrição e logo são opcionais
      case 3:
        return true; // Contatos são opcionais
      default:
        return false;
    }
  };

  const openProducersModal = async (association: any) => {
    try {
      setLoadingProducers(true);
      setSelectedAssociation(association);
      const producers = await associationsApi.getProducers(association.id);
      setProducersList(producers || []);
      setShowProducersModal(true);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar produtores");
    } finally {
      setLoadingProducers(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploadingLogo(true);
      const url = await uploadImageToSupabase(file);
      setForm(prev => ({ ...prev, logo_url: url }));
      toast.success("Logo enviado com sucesso");
    } catch (e) {
      toast.error("Erro ao enviar logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.name.trim()) {
        toast.error("Nome é obrigatório");
        return;
      }
      if (editing) {
        await associationsApi.update(editing.id, {
          name: form.name,
          type: form.type,
          city: form.city || null,
          state: form.state || null,
          description: form.description || null,
          contact_info: form.contact_info,
          logo_url: form.logo_url || null,
        });
        toast.success("Associação atualizada!");
      } else {
        await associationsApi.create({
          name: form.name,
          type: form.type,
          city: form.city || null,
          state: form.state || null,
          description: form.description || null,
          contact_info: form.contact_info,
          logo_url: form.logo_url || null,
        });
        toast.success("Associação criada!");
      }
      setOpen(false);
      setForm(defaultForm);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="rounded-2xl p-6 border shadow-sm" style={{ background: `linear-gradient(to right, ${primaryColor}10, ${primaryColor}05)`, borderColor: `${primaryColor}20` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}20` }}>
                <Building className="h-8 w-8" style={{ color: primaryColor }} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Associações & Cooperativas</h1>
                <p className="text-gray-600 mt-1">Gerencie organizações e suas informações de contato</p>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={openCreate} 
                  className="flex items-center gap-2 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus className="h-5 w-5" />
                  Nova Associação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <div style={cssVariables}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Building className="h-5 w-5" style={{ color: primaryColor }} />
                      {editing ? "Editar Associação" : "Nova Associação"}
                    </DialogTitle>
                    
                    {/* Indicador de Progresso */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                          <div 
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-300`}
                            style={{ 
                              backgroundColor: step <= currentStep ? primaryColor : '#e5e7eb',
                              color: step <= currentStep ? 'white' : '#6b7280'
                            }}
                          >
                            {step}
                          </div>
                          <div className="ml-2 text-sm font-medium text-gray-700">
                            {step === 1 && 'Informações Básicas'}
                            {step === 2 && 'Descrição & Logo'}
                            {step === 3 && 'Contatos'}
                          </div>
                          {step < 3 && (
                            <div 
                              className={`w-8 h-0.5 mx-4 transition-colors duration-300`}
                              style={{ backgroundColor: step < currentStep ? primaryColor : '#e5e7eb' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Step 1: Informações Básicas */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações Básicas</h3>
                        <p className="text-gray-600">Preencha os dados principais da organização</p>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-sm font-medium">Nome da Organização *</Label>
                            <Input 
                              id="name" 
                              value={form.name} 
                              onChange={e => setForm({ ...form, name: e.target.value })} 
                              placeholder="Ex: Associação dos Produtores de Café de Minas"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Tipo de Organização</Label>
                            <Select value={form.type} onValueChange={value => setForm({ ...form, type: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="associacao">Associação</SelectItem>
                                <SelectItem value="cooperativa">Cooperativa</SelectItem>
                                <SelectItem value="outra">Outra</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="city" className="text-sm font-medium">Cidade</Label>
                            <Input 
                              id="city" 
                              value={form.city} 
                              onChange={e => setForm({ ...form, city: e.target.value })} 
                              placeholder="Cidade"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Estado</Label>
                            <Select value={form.state} onValueChange={value => setForm({ ...form, state: value })}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione o estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {stateOptions.map(uf => (
                                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Descrição e Logo */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Descrição e Identidade Visual</h3>
                        <p className="text-gray-600">Adicione uma descrição e o logo da organização</p>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="description" className="text-sm font-medium">Descrição da Organização</Label>
                            <Textarea 
                              id="description" 
                              value={form.description} 
                              onChange={e => setForm({ ...form, description: e.target.value })} 
                              placeholder="Descreva brevemente a missão, objetivos e atividades da organização..."
                              rows={8}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Logo da Organização</Label>
                            <div className="mt-1">
                              {form.logo_url && (
                                <div className="mb-4">
                                  <div className="w-32 h-32 border-2 border-gray-200 rounded-xl overflow-hidden mx-auto">
                                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLogoUpload(file);
                                }}
                                className="hidden"
                                id="logo-upload"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('logo-upload')?.click()}
                                disabled={uploadingLogo}
                                className="w-full h-12"
                              >
                                {uploadingLogo ? (
                                  <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Enviando...
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    {form.logo_url ? "Alterar Logo" : "Enviar Logo"}
                                  </div>
                                )}
                              </Button>
                              <p className="text-xs text-gray-500 mt-2 text-center">Formatos aceitos: JPG, PNG, GIF (máx. 5MB)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Informações de Contato */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Informações de Contato</h3>
                        <p className="text-gray-600">Adicione as formas de contato da organização</p>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium">E-mail de Contato</Label>
                            <Input 
                              id="email" 
                              type="email"
                              value={form.contact_info.email || ""} 
                              onChange={e => setForm({ 
                                ...form, 
                                contact_info: { ...form.contact_info, email: e.target.value }
                              })} 
                              placeholder="contato@associacao.com"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                            <Input 
                              id="phone" 
                              value={form.contact_info.phone || ""} 
                              onChange={e => setForm({ 
                                ...form, 
                                contact_info: { ...form.contact_info, phone: e.target.value }
                              })} 
                              placeholder="(11) 99999-9999"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                            <Input 
                              id="website" 
                              value={form.contact_info.website || ""} 
                              onChange={e => setForm({ 
                                ...form, 
                                contact_info: { ...form.contact_info, website: e.target.value }
                              })} 
                              placeholder="https://www.associacao.com"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="address" className="text-sm font-medium">Endereço Completo</Label>
                            <Textarea 
                              id="address" 
                              value={form.contact_info.address || ""} 
                              onChange={e => setForm({ 
                                ...form, 
                                contact_info: { ...form.contact_info, address: e.target.value }
                              })} 
                              placeholder="Rua, número, bairro, cidade, estado, CEP..."
                              rows={8}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botões de Navegação */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <div className="flex gap-3">
                      {currentStep > 1 && (
                        <Button 
                          variant="outline" 
                          onClick={prevStep}
                          className="px-6"
                        >
                          Anterior
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        className="px-6"
                      >
                        Cancelar
                      </Button>
                    </div>
                    
                    <div className="flex gap-3">
                      {currentStep < totalSteps ? (
                        <Button 
                          onClick={nextStep}
                          className="px-6 text-white hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                          disabled={!validateStep(currentStep)}
                        >
                          Próximo
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleSubmit}
                          className="px-6 text-white hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                          disabled={!form.name.trim()}
                        >
                          {editing ? "Salvar Alterações" : "Criar Associação"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Modal de Produtores Associados */}
        <Dialog open={showProducersModal} onOpenChange={setShowProducersModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <div style={cssVariables}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: primaryColor }} />
                  Produtores Associados
                </DialogTitle>
              {selectedAssociation && (
                <p className="text-gray-600">
                  {selectedAssociation.name} • {producersList.length} produtores
                </p>
              )}
            </DialogHeader>
            
            <div className="space-y-4">
              {loadingProducers ? (
                <div className="flex items-center justify-center py-12">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: primaryColor }}
                  ></div>
                  <span className="ml-3 text-gray-600">Carregando produtores...</span>
                </div>
              ) : producersList.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum produtor associado
                  </h3>
                  <p className="text-gray-500">
                    Esta associação ainda não possui produtores vinculados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {producersList.map((producer: any) => (
                    <Card key={producer.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `linear-gradient(to bottom right, ${primaryColor}20, ${primaryColor}10)` }}
                          >
                            <Building className="h-6 w-6" style={{ color: primaryColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {producer.name}
                            </h4>
                            {producer.property_name && (
                              <p className="text-sm text-gray-600 truncate">
                                {producer.property_name}
                              </p>
                            )}
                            {(producer.city || producer.state) && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {producer.city}{producer.city && producer.state ? " / " : ""}{producer.state}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setShowProducersModal(false)}
                className="px-6"
              >
                Fechar
              </Button>
            </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, cidade, estado, descrição ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:ring-2"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <FunnelSimple className="h-4 w-4" />
                  Filtros
                </Button>
                
                {searchTerm && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchTerm("")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Tipo:</Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="associacao">Associação</SelectItem>
                        <SelectItem value="cooperativa">Cooperativa</SelectItem>
                        <SelectItem value="outra">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                    <Building className="h-5 w-5" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: primaryColor }}>Total</p>
                    <p className="text-2xl font-bold" style={{ color: `${primaryColor}CC` }}>{items.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${secondaryColor}10` }}>
                    <Building className="h-5 w-5" style={{ color: secondaryColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: secondaryColor }}>Associações</p>
                    <p className="text-2xl font-bold" style={{ color: `${secondaryColor}CC` }}>{items.filter(i => i.type === 'associacao').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${accentColor}10` }}>
                    <Building className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: accentColor }}>Cooperativas</p>
                    <p className="text-2xl font-bold" style={{ color: `${accentColor}CC` }}>{items.filter(i => i.type === 'cooperativa').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <Eye className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Exibindo</p>
                    <p className="text-2xl font-bold text-gray-800">{filteredItems.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12">
                <div className="flex items-center justify-center">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-b-2"
                    style={{ borderColor: primaryColor }}
                  ></div>
                  <span className="ml-3 text-gray-600">Carregando associações...</span>
                </div>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || filterType !== "all" ? "Nenhuma associação encontrada" : "Nenhuma associação cadastrada"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || filterType !== "all" 
                      ? "Tente ajustar os filtros ou termo de busca" 
                      : "Comece criando sua primeira associação ou cooperativa"
                    }
                  </p>
                  {!searchTerm && filterType === "all" && (
                    <Button 
                      onClick={openCreate} 
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Associação
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-w-0">
              {filteredItems.map(item => (
                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4 min-w-0">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {item.logo_url ? (
                          <div 
                            className="w-16 h-16 border-2 border-gray-100 rounded-xl overflow-hidden flex-shrink-0 transition-colors bg-white"
                            style={{ borderColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = `${primaryColor}40`}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                          >
                            <img src={item.logo_url} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div 
                            className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center transition-all group-hover:bg-opacity-20"
                            style={{ 
                              backgroundColor: '#f9fafb'
                            }}
                          >
                            <Building 
                              className="h-8 w-8 text-gray-400 transition-colors" 
                              style={{ color: '#9ca3af' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="font-bold text-gray-900 text-lg transition-colors truncate"
                            onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                            onMouseLeave={(e) => e.currentTarget.style.color = ''}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                item.type === 'cooperativa' 
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                                  : item.type === 'associacao'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {item.type === 'cooperativa' ? 'Cooperativa' : 
                               item.type === 'associacao' ? 'Associação' : 
                               'Outra'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              • {item.producer_count || 0} produtores
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEdit(item)} 
                          className="h-8 w-8"
                          style={{ color: primaryColor }}
                          title="Editar"
                        >
                          <PencilSimple className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {(item.city || item.state) && (
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{item.city}{item.city && item.state ? " / " : ""}{item.state}</span>
                      </div>
                    )}

                    {/* Botão para ver produtores associados */}
                    {(item.producer_count || 0) > 0 && (
                      <div className="mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openProducersModal(item)}
                          className="h-8 px-3 hover:bg-opacity-10"
                          style={{ color: primaryColor }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${primaryColor}10`}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Ver produtores ({item.producer_count || 0})
                        </Button>
                      </div>
                    )}
                    
                    {item.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                    
                    {item.contact_info && (
                      <div className="space-y-2">
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          {item.contact_info.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Envelope className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span className="truncate">{item.contact_info.email}</span>
                            </div>
                          )}
                          {item.contact_info.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <span>{item.contact_info.phone}</span>
                            </div>
                          )}
                          {item.contact_info.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              <a 
                                href={item.contact_info.website.startsWith('http') ? item.contact_info.website : `https://${item.contact_info.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline truncate"
                                style={{ color: primaryColor }}
                              >
                                {item.contact_info.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}