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
  Thermometer,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { producersApi, productLotsApi } from "@/services/api";
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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Tooltip } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
  photos: string[];
  latitude: string | null;
  longitude: string | null;
}

const Produtores = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [producerLots, setProducerLots] = useState<any[]>([]);
  const [loadingLots, setLoadingLots] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const navigate = useNavigate();
  const [filterCity, setFilterCity] = useState("");
  const [filterState, setFilterState] = useState("");

  useEffect(() => {
    fetchProducers();
  }, []);

  useEffect(() => {
    if (selectedProducer) {
      setLoadingLots(true);
      productLotsApi.getByProducer(selectedProducer.id)
        .then((lots) => setProducerLots(lots || []))
        .finally(() => setLoadingLots(false));
    } else {
      setProducerLots([]);
    }
  }, [selectedProducer]);

  useEffect(() => {
    if (selectedProducer) {
      // Se já tem coordenadas, usa elas
      if (selectedProducer.latitude && selectedProducer.longitude) {
        setMapCoords({ lat: selectedProducer.latitude, lon: selectedProducer.longitude });
      } else if (selectedProducer.address || selectedProducer.city || selectedProducer.state) {
        // Busca coordenadas pelo endereço
        setLoadingMap(true);
        const query = `${selectedProducer.address ? selectedProducer.address + ', ' : ''}${selectedProducer.city ? selectedProducer.city + ', ' : ''}${selectedProducer.state || ''}`;
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
          .then(res => {
            if (res.data && res.data.length > 0) {
              setMapCoords({ lat: res.data[0].lat, lon: res.data[0].lon });
            } else {
              setMapCoords(null);
            }
          })
          .catch(() => setMapCoords(null))
          .finally(() => setLoadingMap(false));
      } else {
        setMapCoords(null);
      }
    } else {
      setMapCoords(null);
    }
  }, [selectedProducer]);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      const data = await producersApi.getAll();
      // Garante que todos os produtores tenham o campo 'photos' (mesmo que vazio)
      const normalized = (data as any[]).map((prod) => ({
        ...prod,
        photos: prod.photos ?? [],
        latitude: prod.latitude ?? null,
        longitude: prod.longitude ?? null,
      }));
      setProducers(normalized);
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

  const filteredProducers = producers.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = filterCity ? prod.city === filterCity : true;
    const matchesState = filterState ? prod.state === filterState : true;
    return matchesSearch && matchesCity && matchesState;
  });

  const uniqueCities = Array.from(new Set(producers.map(p => p.city))).sort();
  const uniqueStates = Array.from(new Set(producers.map(p => p.state))).sort();

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
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtores</h1>
            <p className="text-gray-600">Gerencie os produtores cadastrados no sistema</p>
          </div>
          <button className="bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg shadow flex items-center gap-2 text-base h-12 min-w-[180px] justify-center" onClick={() => setIsCreateDialogOpen(true)}>
            <span className="text-xl">+</span> Novo Produtor
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full mb-6">
          <input
            type="text"
            placeholder="Buscar produtores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 h-12 px-4 border border-gray-200 rounded-lg shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-lg bg-white"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="border border-gray-200 rounded-lg px-4 h-12 bg-white shadow-sm flex items-center gap-2 text-base">
                {filterCity || "Cidade"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterCity("")}>Todas</DropdownMenuItem>
              {uniqueCities.map(city => (
                <DropdownMenuItem key={city} onClick={() => setFilterCity(city)}>{city}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="border border-gray-200 rounded-lg px-4 h-12 bg-white shadow-sm flex items-center gap-2 text-base">
                {filterState || "Estado"}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterState("")}>Todos</DropdownMenuItem>
              {uniqueStates.map(state => (
                <DropdownMenuItem key={state} onClick={() => setFilterState(state)}>{state}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="ml-auto text-gray-500 text-base hidden md:inline">{filteredProducers.length} de {producers.length} produtores</span>
        </div>
        <div className="mb-4 md:hidden text-gray-500 text-base">{filteredProducers.length} de {producers.length} produtores</div>
        {/* Grid de cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))
          ) : filteredProducers.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-20 text-lg">Nenhum produtor encontrado.</div>
          ) : (
            filteredProducers.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-7 flex flex-col gap-5 border border-gray-100 relative group min-h-[270px] w-full max-w-xl mx-auto cursor-pointer"
                onClick={e => {
                  // Evita navegação se clicar em ação rápida
                  if ((e.target as HTMLElement).closest('.card-action')) return;
                  navigate(`/admin/produtores/${prod.id}`);
                }}
              >
                {/* Avatar/foto e ações */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 shadow border-2 border-primary/20">
                      <AvatarImage src={prod.photos?.[0]} alt={prod.name} />
                      <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                        {prod.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        {prod.name}
                      </div>
                      <div className="text-gray-500 text-base font-medium">{prod.property_name}</div>
                    </div>
                  </div>
                  {/* Ações rápidas */}
                  <div className="flex gap-2 opacity-100 group-hover:opacity-100 transition-all">
                    <button className="p-2 rounded-full hover:bg-gray-100 card-action" title="Editar" onClick={e => {e.stopPropagation(); openEditDialog(prod)}}>
                      <Edit className="h-5 w-5 text-primary" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 card-action" title="Excluir" onClick={e => {e.stopPropagation(); handleDelete(prod.id)}}>
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 card-action" title="Copiar email" onClick={e => {e.stopPropagation(); navigator.clipboard.writeText(prod.email); toast.success("Email copiado!")}}>
                      <Copy className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                {/* Info principal */}
                <div className="flex flex-col gap-2 text-gray-700 text-base mt-2">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary/70" /> <span>{prod.city}, {prod.state}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary/70" /> <span>{prod.phone}</span></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary/70" /> <span>{prod.email}</span></div>
                </div>
                {/* Badges */}
                <div className="flex gap-3 mt-3">
                  {prod.altitude && <Badge variant="secondary" className="px-3 py-1 text-base font-medium bg-primary/10 text-primary border-0">{prod.altitude}m</Badge>}
                  {prod.average_temperature && <Badge variant="secondary" className="px-3 py-1 text-base font-medium bg-primary/10 text-primary border-0">{prod.average_temperature}°C</Badge>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de detalhes do produtor */}
      <Dialog open={!!selectedProducer} onOpenChange={open => !open && setSelectedProducer(null)}>
        <DialogContent className="max-w-6xl max-h-[98vh] overflow-y-auto p-0 rounded-3xl shadow-2xl border-0 bg-[#f7f8fa]">
          {selectedProducer && (
            <div className="flex flex-col gap-10 p-0 md:p-12">
              {/* Topo: Carrossel e dados primários em duas colunas */}
              <div className="flex flex-col md:flex-row gap-10">
                {/* Coluna esquerda: Carrossel/foto */}
                <div className="md:w-[44%] flex flex-col gap-6 items-center bg-white rounded-3xl p-8 md:shadow-sm md:border md:mt-6 md:mb-6 md:ml-2">
                  {Array.isArray(selectedProducer.photos) && selectedProducer.photos.length > 0 ? (
                    <div className="w-full bg-[#f3f4f6] rounded-2xl p-2 flex flex-col items-center">
                      <Carousel className="relative group w-full">
                        <CarouselContent>
                          {selectedProducer.photos.map((url: string, idx: number) => (
                            <CarouselItem key={idx} className="flex items-center justify-center">
                              <img
                                src={url}
                                alt={`Foto ${idx + 1}`}
                                className="object-cover w-full h-80 md:h-[26rem] rounded-xl border bg-background transition-transform duration-200 group-hover:scale-[1.01] cursor-zoom-in shadow-sm"
                                onClick={() => window.open(url, '_blank')}
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                      {selectedProducer.photos.length > 1 && (
                        <div className="flex gap-2 mt-3 justify-center">
                          {selectedProducer.photos.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Miniatura ${idx + 1}`}
                              className="object-cover w-12 h-12 rounded-xl border cursor-pointer opacity-80 hover:opacity-100 transition ring-2 ring-transparent hover:ring-primary"
                              onClick={() => {
                                const embla = document.querySelector('[aria-roledescription="carousel"]')?.emblaApi;
                                if (embla) embla.scrollTo(idx);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-[#f3f4f6] rounded-2xl flex items-center justify-center text-muted-foreground text-lg font-medium min-h-[320px]">
                      Sem foto
                    </div>
                  )}
                </div>
                {/* Coluna direita: Dados primários + mapa */}
                <div className="md:w-[56%] flex flex-col gap-8 bg-white rounded-3xl p-8 md:shadow-sm md:border md:mt-6 md:mb-6 md:mr-2">
                  {/* Header e ações */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h2 className="text-3xl font-bold mb-1 flex items-center gap-2 text-gray-900">
                        {selectedProducer.name}
                      </h2>
                      <p className="text-lg text-primary font-semibold mb-2">{selectedProducer.property_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" title="Editar produtor"><Edit className="w-5 h-5 text-blue-500" /></Button>
                      <Button size="icon" variant="outline" title="Adicionar lote"><Plus className="w-5 h-5 text-green-500" /></Button>
                      <Button size="icon" variant="ghost" title="Fechar" onClick={() => setSelectedProducer(null)}><span className="sr-only">Fechar</span><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg></Button>
                    </div>
                  </div>
                  {/* Descrição */}
                  <p className="text-gray-500 text-base mb-4 whitespace-pre-line">{selectedProducer.property_description}</p>
                  {/* Bloco de dados principais */}
                  <div className="flex flex-col gap-4 bg-white rounded-2xl p-4 shadow-sm border">
                    <div className="flex items-center gap-3 text-base">
                      <MapPin className="h-6 w-6 text-purple-500" />
                      <span className="text-gray-800">{selectedProducer.address && <>{selectedProducer.address}, </>}{selectedProducer.city}, {selectedProducer.state}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base">
                      <Phone className="h-6 w-6 text-green-500" />
                      <span className="text-gray-800">{selectedProducer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-base">
                      <Mail className="h-6 w-6 text-blue-500" />
                      <span className="text-gray-800">{selectedProducer.email}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {selectedProducer.altitude && (
                        <Tooltip content="Altitude da propriedade">
                          <Badge variant="outline" className="text-xs cursor-help bg-[#f3f4f6] text-gray-700"><Mountain className="h-4 w-4 mr-1 text-orange-500" />{selectedProducer.altitude}m</Badge>
                        </Tooltip>
                      )}
                      {selectedProducer.average_temperature && (
                        <Tooltip content="Temperatura média anual">
                          <Badge variant="outline" className="text-xs cursor-help bg-[#f3f4f6] text-gray-700"><Thermometer className="h-4 w-4 mr-1 text-pink-500" />{selectedProducer.average_temperature}°C</Badge>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 select-all">
                      ID: {selectedProducer.id}
                      <Button size="icon" variant="ghost" className="p-1" onClick={() => {navigator.clipboard.writeText(selectedProducer.id)}} title="Copiar ID"><Copy className="w-4 h-4 text-gray-400" /></Button>
                    </div>
                  </div>
                  {/* Bloco do mapa */}
                  <div className="w-full">
                    <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin className="w-4 h-4 text-purple-500" /> Localização da Fazenda</div>
                    <div className="w-full h-56 rounded-2xl overflow-hidden border relative bg-[#f3f4f6]">
                      {loadingMap ? (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Carregando mapa...</div>
                      ) : mapCoords ? (
                        <>
                          <iframe
                            title="Mapa"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapCoords.lon) - 0.01}%2C${Number(mapCoords.lat) - 0.01}%2C${Number(mapCoords.lon) + 0.01}%2C${Number(mapCoords.lat) + 0.01}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                            allowFullScreen
                          ></iframe>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lon}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-2 right-2 bg-primary text-white px-3 py-1 rounded shadow text-xs font-medium transition hover:bg-primary/90"
                          >
                            Ver no Google Maps
                          </a>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">Localização não disponível</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Seção de Lotes: abaixo, ocupando toda a largura */}
              <div className="w-full">
                <h3 className="text-xl font-bold mb-6 ml-2 text-gray-900">Lotes do Produtor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {producerLots.length === 0 ? (
                    <div className="col-span-2 text-center text-gray-400 py-12">Nenhum lote cadastrado.</div>
                  ) : (
                    producerLots.map((lote) => (
                      <div key={lote.id} className="col-span-1 md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-3">
                          {lote.image_url && <img src={lote.image_url} alt={lote.name} className="w-16 h-16 object-cover rounded-xl border" />}
                          <div>
                            <div className="font-semibold text-base text-gray-900">{lote.name}</div>
                            <div className="text-xs text-gray-500">Código: {lote.code} | Safra: {lote.harvest_year}</div>
                            <div className="text-xs text-gray-500">Categoria: {lote.category} | Variedade: {lote.variety}</div>
                          </div>
                        </div>
                        <div className="flex flex-col md:items-end gap-1">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs bg-white text-gray-700 border-gray-200">{lote.quantity} {lote.unit}</Badge>
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">{lote.flavor_score?.toFixed(1) ?? "-"} Sabor</Badge>
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">{lote.fragrance_score?.toFixed(1) ?? "-"} Fragrância</Badge>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">{lote.finish_score?.toFixed(1) ?? "-"} Finalização</Badge>
                            <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">{lote.acidity_score?.toFixed(1) ?? "-"} Acidez</Badge>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">{lote.body_score?.toFixed(1) ?? "-"} Corpo</Badge>
                          </div>
                          <div className="text-xs text-gray-400">ID: {lote.id}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
  const [loading, setLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState<any[]>(() => {
    if (initialData && initialData.photos && Array.isArray(initialData.photos)) {
      return initialData.photos.map((url: string) => ({ url, uploaded: true }));
    }
    return [];
  });
  const [tab, setTab] = useState("dados");

  const methods = useForm({
    defaultValues: initialData || defaultValues,
    mode: "onTouched",
  });
  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = methods;

  // Máscaras e handlers
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");
    let masked = numbers;
    if (numbers.length <= 11) {
      // Máscara progressiva para CPF
      if (numbers.length > 9) {
        masked = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
      } else if (numbers.length > 6) {
        masked = numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else if (numbers.length > 3) {
        masked = numbers.replace(/(\d{3})(\d{0,3})/, "$1.$2");
      }
    } else {
      // Máscara progressiva para CNPJ
      if (numbers.length > 12) {
        masked = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5");
      } else if (numbers.length > 8) {
        masked = numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4");
      } else if (numbers.length > 5) {
        masked = numbers.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else if (numbers.length > 2) {
        masked = numbers.replace(/(\d{2})(\d{0,3})/, "$1.$2");
      }
    }
    setValue("document_number", masked);
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numbers = value.replace(/\D/g, "");
    let maskedPhone = numbers;
    if (numbers.length > 10) {
      maskedPhone = numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    } else if (numbers.length > 6) {
      maskedPhone = numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else if (numbers.length > 2) {
      maskedPhone = numbers.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    }
    setValue("phone", maskedPhone);
  };
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cep = value.replace(/\D/g, "");
    let maskedCep = cep;
    if (cep.length > 5) {
      maskedCep = cep.replace(/(\d{5})(\d{0,3})/, "$1-$2");
    }
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
      setPhotoPreviews(prev => [...prev, { file, url: URL.createObjectURL(file), uploading: true }]);
      try {
        const url = await uploadImageToSupabase(file);
        setPhotoPreviews(prev => prev.map(p => p.file === file ? { ...p, url, uploading: false, uploaded: true } : p));
        setValue("photos", [...(watch("photos") || []), url]);
      } catch (err) {
        setPhotoPreviews(prev => prev.filter(p => p.file !== file));
        toast.error("Erro ao fazer upload da imagem");
      }
    }
  };
  const removePhoto = async (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    setValue("photos", (watch("photos") || []).filter((_: any, i: number) => i !== index));
  };

  // Validação por etapa
  const validateStep = async () => {
    let fields: string[] = [];
    if (tab === "dados") fields = ["name", "document_number", "email", "phone"];
    if (tab === "propriedade") fields = ["property_name", "altitude", "average_temperature"];
    if (tab === "localizacao") {
      if (!watch("use_coordinates")) fields = ["cep", "city", "state"];
      else fields = ["latitude", "longitude"];
    }
    return await trigger(fields);
  };

  const nextStep = async () => {
    if (await validateStep()) setTab(s => s === "dados" ? "propriedade" : s === "propriedade" ? "localizacao" : "dados");
  };
  const prevStep = () => setTab(s => s === "dados" ? "dados" : s === "propriedade" ? "dados" : "propriedade");

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
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="propriedade">Propriedade</TabsTrigger>
            <TabsTrigger value="localizacao">Localização</TabsTrigger>
          </TabsList>
          <TabsContent value="dados">
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
                {typeof errors.document_number?.message === 'string' && (
                  <span className="text-xs text-red-500">
                    {errors.document_number?.message || "Campo obrigatório"}
                    <br />Exemplo: 123.456.789-00 ou 12.345.678/0001-00
                  </span>
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
                {typeof errors.email?.message === 'string' && (
                  <span className="text-xs text-red-500">
                    {errors.email?.message || "Campo obrigatório"}
                    <br />Exemplo: email@exemplo.com
                  </span>
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
                {typeof errors.phone?.message === 'string' && (
                  <span className="text-xs text-red-500">
                    {errors.phone?.message || "Campo obrigatório"}
                    <br />Exemplo: (11) 91234-5678
                  </span>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="propriedade">
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
          </TabsContent>
          <TabsContent value="localizacao">
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
                  {typeof errors.cep?.message === 'string' && (
                    <span className="text-xs text-red-500">
                      {errors.cep?.message || "Campo obrigatório"}
                      <br />Exemplo: 12345-678
                    </span>
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
                  {errors.latitude && <span className="text-xs text-red-500">Campo obrigatório<br />Ex: -23.123456</span>}
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input id="longitude" type="number" step="any" {...register("longitude", { required: true })} placeholder="-46.123456" className={errors.longitude ? "border-red-500 focus:border-red-500" : ""} />
                  {errors.longitude && <span className="text-xs text-red-500">Campo obrigatório<br />Ex: -46.123456</span>}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* Botões de ação */}
        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
        </div>
      </form>
    </FormProvider>
  );
};

export { ProducerForm };
export default Produtores; 