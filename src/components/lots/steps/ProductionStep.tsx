import { Medal, Users, Calendar, Package, MapPin, Tag, Buildings, CheckCircle, WarningCircle, CircleNotch, Mountains, Thermometer, Lock, LockOpen, MapTrifold, Camera, Trash, Plus, ChatCircleText, CaretDown, MagnifyingGlass } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BlendComposition } from "../BlendComposition";
import { LocationPicker } from "@/components/ui/location-picker";
import { useState, useEffect, useCallback } from "react";
import { brandsApi, producersApi, associationsApi, industriesApi, systemConfigApi } from "@/services/api";
import { generateSlug } from "@/utils/slug-generator";
import { generateLotCode } from "@/utils/lot-code-generator";
import { uploadImageToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

interface ProductionStepProps {
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode: boolean;
  producers: Producer[];
  associations: any[];
  industries: any[];
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  } | null;
  qrValue?: string;
}

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

const FormSection = ({ title, icon: Icon, children, description, primaryColor }: any) => (
  <div className="space-y-6 text-left">
    <div className="flex items-start gap-4 px-2">
      <div 
        className="p-2.5 rounded-xl border shadow-sm"
        style={{ backgroundColor: `${primaryColor}10`, color: primaryColor, borderColor: `${primaryColor}20` }}
      >
        <Icon size={24} weight="duotone" />
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">{title}</h3>
        {description && <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{description}</p>}
      </div>
    </div>
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
      {children}
    </div>
  </div>
);

export const ProductionStep = ({ formData, setFormData, isBlendMode, producers, associations, industries, branding, qrValue }: ProductionStepProps) => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [filteredAssociations, setFilteredAssociations] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Novos estados para cidades e altitude/temp opcional
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showAltTemp, setShowAltTemp] = useState(!!(formData.altitude || formData.average_temperature));
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);

  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  // Buscar cidades quando o estado muda
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }
      
      setLoadingCities(true);
      try {
        const response = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.state}/municipios`);
        const sortedCities = response.data.sort((a: any, b: any) => a.nome.localeCompare(b.nome));
        setCities(sortedCities);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        // toast.error("Erro ao carregar cidades");
      } finally {
        setLoadingCities(false);
      }
    };
    
    fetchCities();
  }, [formData.state]);

  // Geocodificar quando cidade+estado mudam para centralizar mapa
  const geocodeAddress = useCallback(async (city: string, state: string) => {
    if (!city || !state) return;
    
    try {
      const query = `${city}, ${state}, Brasil`;
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setFormData((prev: any) => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));
      }
    } catch (error) {
      console.error("Erro na geocodificação:", error);
    }
  }, [setFormData]);

  useEffect(() => {
    const loadProducerData = async () => {
      if (formData.producer_id) {
        setLoadingBrands(true);
        try {
          const [brandsData, producerAssocs, producerData] = await Promise.all([
            brandsApi.getByProducer(formData.producer_id),
            associationsApi.getByProducer(formData.producer_id),
            producersApi.getById(formData.producer_id)
          ]);
          setBrands(brandsData);
          setFilteredAssociations(producerAssocs);
          
          // Se for um novo lote e o produtor for selecionado, sugerir os dados da última propriedade dele
          // ou dados cadastrados no produtor (legado)
          if (!formData.property_name && producerData) {
            setFormData((prev: any) => ({
              ...prev,
              property_name: producerData.property_name || "",
              property_description: producerData.property_description || "",
              altitude: producerData.altitude || "",
              average_temperature: producerData.average_temperature || "",
              city: producerData.city || "",
              state: producerData.state || "",
              address: producerData.address || "",
              cep: producerData.cep || "",
              latitude: producerData.latitude || "",
              longitude: producerData.longitude || "",
              address_internal_only: producerData.address_internal_only || false,
            }));
          }

          if (producerAssocs.length === 1 && !formData.association_id) {
            setFormData((prev: any) => ({ ...prev, association_id: producerAssocs[0].id }));
          }
        } catch (error) {
          console.error("Erro ao carregar dados do produtor:", error);
        } finally {
          setLoadingBrands(false);
        }
      } else {
        setBrands([]);
        setFilteredAssociations([]);
      }
    };
    
    loadProducerData();
  }, [formData.producer_id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadImageToSupabase(file);
        urls.push(url);
      }
      setFormData((prev: any) => ({ 
        ...prev, 
        photos: [...(prev.photos || []), ...urls] 
      }));
      toast.success("Fotos da propriedade carregadas!");
    } catch (error) {
      toast.error("Erro no upload das fotos");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      photos: prev.photos.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {isBlendMode ? (
        <FormSection title="Composição do Blend" icon={Users} description="Mistura de diferentes origens e lotes" primaryColor={primaryColor}>
          <BlendComposition 
            formData={formData}
            setFormData={setFormData}
            producers={producers}
            associations={associations}
            branding={branding}
          />
        </FormSection>
      ) : (
        <>
          {/* Origem & Propriedade */}
          <FormSection title="Dados da Propriedade" icon={Buildings} description="Informações específicas do local de cultivo" primaryColor={primaryColor}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Buildings size={16} style={{ color: primaryColor }} /> Nome da Propriedade / Sítio *
                </Label>
                <Input 
                  value={formData.property_name} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, property_name: e.target.value }))} 
                  placeholder="Ex: Fazenda Bela Vista - Talhão 4" 
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                  style={{ '--primary': primaryColor } as any}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">O local exato onde este lote foi cultivado.</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Buildings size={16} style={{ color: primaryColor }} /> Associação / Cooperativa *
                </Label>
                <Select 
                  value={formData.association_id} 
                  onValueChange={value => setFormData((prev: any) => ({ ...prev, association_id: value }))}
                  disabled={!formData.producer_id}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                    <SelectValue placeholder={!formData.producer_id ? "Aguardando produtor..." : "Selecione a entidade"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {filteredAssociations.map((assoc) => (
                      <SelectItem key={assoc.id} value={assoc.id}>
                        {assoc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Tag size={16} style={{ color: primaryColor }} /> Indústria Parceira
                </Label>
                <Select 
                  value={formData.industry_id} 
                  onValueChange={value => setFormData((prev: any) => ({ ...prev, industry_id: value }))}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                    <SelectValue placeholder="Processamento (Opcional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="none" className="font-bold text-slate-400 italic">Venda Direta / Sem Indústria</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Calendar size={16} style={{ color: primaryColor }} /> Ano da Safra *
                </Label>
                <Input 
                  type="number" 
                  value={formData.harvest_year} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, harvest_year: e.target.value }))} 
                  placeholder="2024" 
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold focus-visible:ring-primary shadow-sm"
                  style={{ '--primary': primaryColor } as any}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">O ano em que o produto foi colhido.</p>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 shadow-sm transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                      <Mountains size={20} weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight">Informar Altitude e Temperatura?</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Habilite para detalhar o clima da propriedade</p>
                    </div>
                  </div>
                  <Switch 
                    checked={showAltTemp} 
                    onCheckedChange={setShowAltTemp}
                    style={{ '--primary': primaryColor } as any}
                  />
                </div>

                {showAltTemp && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Mountains size={16} style={{ color: primaryColor }} /> Altitude (m)
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.altitude} 
                        onChange={e => setFormData({ ...formData, altitude: e.target.value })} 
                        placeholder="Ex: 1150" 
                        className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                        <Thermometer size={16} style={{ color: primaryColor }} /> Temp. Média (°C)
                      </Label>
                      <Input 
                        type="number" 
                        value={formData.average_temperature} 
                        onChange={e => setFormData({ ...formData, average_temperature: e.target.value })} 
                        placeholder="Ex: 22.5" 
                        className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2 pt-4">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <MapPin size={16} style={{ color: primaryColor }} /> Endereço / Localização
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-1">
                    <Input 
                      value={formData.cep} 
                      onChange={e => setFormData({ ...formData, cep: e.target.value })} 
                      placeholder="CEP" 
                      className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                      style={{ '--primary': primaryColor } as any}
                    />
                  </div>
                  
                  <div className="md:col-span-1">
                    <Select value={formData.state} onValueChange={v => setFormData((prev: any) => ({ ...prev, state: v, city: "" }))}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        {stateOptions.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityPopoverOpen}
                          className="w-full h-12 justify-between rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm hover:bg-slate-50"
                          disabled={!formData.state || loadingCities}
                        >
                          {formData.city
                            ? cities.find((city) => city.nome === formData.city)?.nome || formData.city
                            : loadingCities ? "Carregando cidades..." : "Cidade"}
                          <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 rounded-2xl shadow-xl border-slate-100">
                        <Command>
                          <CommandInput placeholder="Buscar cidade..." className="h-11 font-bold" />
                          <CommandList>
                            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {cities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={city.nome}
                                  onSelect={() => {
                                    setFormData((prev: any) => ({ ...prev, city: city.nome }));
                                    setCityPopoverOpen(false);
                                    geocodeAddress(city.nome, formData.state);
                                  }}
                                  className="font-bold cursor-pointer"
                                >
                                  <CheckCircle
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.city === city.nome ? "opacity-100" : "opacity-0"
                                    )}
                                    style={{ color: primaryColor }}
                                  />
                                  {city.nome}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="md:col-span-4">
                    <Input 
                      value={formData.address} 
                      onChange={e => setFormData((prev: any) => ({ ...prev, address: e.target.value }))} 
                      placeholder="Rua, número, bairro, zona rural..." 
                      className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                      style={{ '--primary': primaryColor } as any}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div 
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 shadow-sm transition-all bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm border border-slate-100" style={{ color: primaryColor }}>
                      {formData.address_internal_only ? <Lock size={20} weight="fill" /> : <LockOpen size={20} weight="fill" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Privacidade do Endereço</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {formData.address_internal_only ? "Ocultar endereço no QR Code" : "Mostrar endereço no QR Code"}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.address_internal_only} 
                    onCheckedChange={v => setFormData((prev: any) => ({ ...prev, address_internal_only: v }))}
                    style={{ '--primary': primaryColor } as any}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <ChatCircleText size={16} style={{ color: primaryColor }} /> História da Propriedade (Opcional)
                  </Label>
                  <Textarea 
                    value={formData.property_description} 
                    onChange={e => setFormData((prev: any) => ({ ...prev, property_description: e.target.value }))} 
                    placeholder="Conte a história específica deste local de cultivo..." 
                    className="min-h-[120px] rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary shadow-sm"
                    style={{ '--primary': primaryColor } as any}
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Camera size={16} style={{ color: primaryColor }} /> Galeria da Propriedade
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {formData.photos?.map((p: string, i: number) => (
                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                      <img src={p} className="w-full h-full object-cover" alt="Propriedade" />
                      <button 
                        type="button" 
                        onClick={() => removePhoto(i)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                      >
                        <Trash size={20} weight="fill" />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={() => document.getElementById('lot-property-photos')?.click()}
                    disabled={uploadingPhoto}
                    className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 transition-all group shadow-sm"
                  >
                    {uploadingPhoto ? <CircleNotch className="animate-spin" /> : (
                      <>
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                          <Plus size={20} weight="bold" />
                        </div>
                        <span className="text-[10px] font-black uppercase">Foto</span>
                      </>
                    )}
                  </button>
                  <input id="lot-property-photos" type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <MapPin size={18} style={{ color: primaryColor }} weight="fill" /> Localização Exata
                  </h4>
                  <p className="text-xs text-slate-400 font-bold">Clique no mapa para marcar o pin exato da colheita</p>
                </div>
              </div>
              <LocationPicker 
                value={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null}
                onChange={(coords) => setFormData((prev: any) => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }))}
                primaryColor={primaryColor}
              />
            </div>
          </FormSection>
        </>
      )}
    </div>
  );
};
