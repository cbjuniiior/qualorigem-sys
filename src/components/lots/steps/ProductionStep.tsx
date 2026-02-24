import { Medal, Users, Calendar, Package, MapPin, Tag, Buildings, CheckCircle, WarningCircle, CircleNotch, Mountains, Thermometer, MapTrifold, Camera, Trash, Plus, ChatCircleText, CaretDown, X as XIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationPicker } from "@/components/ui/location-picker";
import { useState, useEffect, useCallback } from "react";
import { brandsApi, producersApi, associationsApi, industriesApi, systemConfigApi, productLotsApi, internalProducersApi } from "@/services/api";
import { generateSlug } from "@/utils/slug-generator";
import { generateLotCode } from "@/utils/lot-code-generator";
import { uploadImageToSupabase } from "@/services/upload";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import axios from "axios";

interface Producer {
  id: string;
  name: string;
  property_name: string;
  city?: string;
  state?: string;
}

interface ProductionStepProps {
  tenantId: string;
  formData: any;
  setFormData: (data: any) => void;
  isBlendMode?: boolean;
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

export const ProductionStep = ({ tenantId, formData, setFormData, producers, associations, industries, branding, qrValue }: ProductionStepProps) => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [filteredAssociations, setFilteredAssociations] = useState<any[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Novos estados para cidades e altitude/temp opcional
  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showAltTemp, setShowAltTemp] = useState(!!(formData.altitude || formData.average_temperature));
  // Estados para propriedades salvas
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("new");
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [industryPopoverOpen, setIndustryPopoverOpen] = useState(false);
  const [associationPopoverOpen, setAssociationPopoverOpen] = useState(false);

  const labels = useTenantLabels();
  const selectedIndustryIds: string[] = formData.industry_ids || [];
  const selectedAssociationIds: string[] = formData.association_ids || [];
  const toggleAssociation = (associationId: string) => {
    setFormData((prev: any) => {
      const current = prev.association_ids || [];
      const isSelected = current.includes(associationId);
      const updated = isSelected ? current.filter((id: string) => id !== associationId) : [...current, associationId];
      return { ...prev, association_ids: updated, association_id: updated.length > 0 ? updated[0] : "" };
    });
  };
  const removeAssociation = (associationId: string) => {
    setFormData((prev: any) => {
      const updated = (prev.association_ids || []).filter((id: string) => id !== associationId);
      return { ...prev, association_ids: updated, association_id: updated.length > 0 ? updated[0] : "" };
    });
  };
  const toggleIndustry = (industryId: string) => {
    setFormData((prev: any) => {
      const current = prev.industry_ids || [];
      const isSelected = current.includes(industryId);
      const updated = isSelected ? current.filter((id: string) => id !== industryId) : [...current, industryId];
      return { ...prev, industry_ids: updated, industry_id: updated.length > 0 ? updated[0] : "" };
    });
  };
  const removeIndustry = (industryId: string) => {
    setFormData((prev: any) => {
      const updated = (prev.industry_ids || []).filter((id: string) => id !== industryId);
      return { ...prev, industry_ids: updated, industry_id: updated.length > 0 ? updated[0] : "" };
    });
  };
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

  // Geocodificar para pré-localizar o mapa: cidade+estado ou apenas estado (fallback)
  const geocodeAddress = useCallback(async (city: string | null, state: string) => {
    if (!state) return;

    const setLatLng = (lat: string, lon: string) => {
      setFormData((prev: any) => ({ ...prev, latitude: lat, longitude: lon }));
    };

    try {
      if (city && city.trim()) {
        const query = `${city.trim()}, ${state}, Brasil`;
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setLatLng(lat, lon);
          return;
        }
      }
      // Fallback: apenas estado (cidade não informada ou não encontrada)
      const stateQuery = `${state}, Brasil`;
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(stateQuery)}&limit=1`);
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setLatLng(lat, lon);
      }
    } catch (error) {
      console.error("Erro na geocodificação:", error);
    }
  }, [setFormData]);

  // Geocodificar automaticamente quando estado ou cidade mudarem
  useEffect(() => {
    if (formData.city && formData.state && !formData.latitude && !formData.longitude) {
      geocodeAddress(formData.city, formData.state);
    }
  }, [formData.state, formData.city, geocodeAddress]);

  // Carregar propriedades salvas e dados do produtor
  useEffect(() => {
    const loadProducerData = async () => {
      if (formData.producer_id && tenantId) {
        setLoadingBrands(true);
        setLoadingProperties(true);
        try {
          const [brandsData, producerAssocs, allLots] = await Promise.all([
            brandsApi.getByProducer(formData.producer_id, tenantId),
            associationsApi.getByProducer(formData.producer_id, tenantId),
            productLotsApi.getAll(tenantId)
          ]);
          setBrands(brandsData);
          setFilteredAssociations(producerAssocs);
          
          // Extrair propriedades únicas dos lotes anteriores do produtor
          const producerLots = allLots.filter((lot: any) => lot.producer_id === formData.producer_id);
          const uniqueProperties = new Map();
          
          producerLots.forEach((lot: any) => {
            if (lot.property_name && lot.city && lot.state) {
              const key = `${lot.property_name}|${lot.city}|${lot.state}`;
              if (!uniqueProperties.has(key)) {
                uniqueProperties.set(key, {
                  id: key,
                  property_name: lot.property_name,
                  city: lot.city,
                  state: lot.state,
                  property_description: lot.property_description || "",
                  altitude: lot.altitude || "",
                  average_temperature: lot.average_temperature || "",
                  latitude: lot.latitude || "",
                  longitude: lot.longitude || "",
                  photos: lot.photos || []
                });
              }
            }
          });

          const propertiesArray = Array.from(uniqueProperties.values());
          setSavedProperties(propertiesArray);
          if (propertiesArray.length >= 1) {
            setSelectedPropertyId(propertiesArray[0].id);
          } else {
            setSelectedPropertyId("new");
          }

          // Auto-selecionar associação se houver apenas uma
          if (producerAssocs.length === 1 && !(formData.association_ids?.length)) {
            setFormData((prev: any) => ({ ...prev, association_id: producerAssocs[0].id, association_ids: [producerAssocs[0].id] }));
          }
        } catch (error) {
          console.error("Erro ao carregar dados do produtor:", error);
        } finally {
          setLoadingBrands(false);
          setLoadingProperties(false);
        }
      } else {
        setBrands([]);
        setFilteredAssociations([]);
        setSavedProperties([]);
        setSelectedPropertyId("new");
      }
    };
    
    loadProducerData();
  }, [formData.producer_id, tenantId, setFormData]);
  
  // Carregar dados da propriedade selecionada
  useEffect(() => {
    if (selectedPropertyId && selectedPropertyId !== "new" && savedProperties.length > 0) {
      const selectedProperty = savedProperties.find(p => p.id === selectedPropertyId);
      if (selectedProperty) {
        setFormData((prev: any) => ({
          ...prev,
          property_name: selectedProperty.property_name,
          city: selectedProperty.city,
          state: selectedProperty.state,
          property_description: selectedProperty.property_description || "",
          altitude: selectedProperty.altitude || "",
          average_temperature: selectedProperty.average_temperature || "",
          latitude: selectedProperty.latitude || "",
          longitude: selectedProperty.longitude || "",
          photos: selectedProperty.photos || []
        }));
        // Atualizar showAltTemp baseado nos dados carregados
        if (selectedProperty.altitude || selectedProperty.average_temperature) {
          setShowAltTemp(true);
        }
      }
    } else if (selectedPropertyId === "new") {
      // Limpar campos quando criar nova propriedade (apenas se não houver dados já preenchidos)
      if (!formData.property_name && !formData.city && !formData.state) {
        setFormData((prev: any) => ({
          ...prev,
          property_name: "",
          property_description: "",
          altitude: "",
          average_temperature: "",
          city: "",
          state: "",
          latitude: "",
          longitude: "",
          photos: []
        }));
        setShowAltTemp(false);
      }
    }
  }, [selectedPropertyId, savedProperties, setFormData]);


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
      setFormData((prev: any) => {
        const updated = { 
          ...prev, 
          photos: [...(prev.photos || []), ...urls] 
        };
        // Se adicionar fotos, considerar como nova propriedade
        if (selectedPropertyId !== "new") {
          setSelectedPropertyId("new");
        }
        return updated;
      });
      toast.success("Fotos da propriedade carregadas!");
    } catch (error) {
      toast.error("Erro no upload das fotos");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev: any) => {
      const updated = {
        ...prev,
        photos: prev.photos?.filter((_: any, i: number) => i !== index) || []
      };
      // Se remover fotos, considerar como nova propriedade
      if (selectedPropertyId !== "new") {
        setSelectedPropertyId("new");
      }
      return updated;
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        <>
          {/* Vínculos e Propriedade */}
          <FormSection title="Vínculos e Propriedade" icon={Buildings} description="Associações e localização do cultivo" primaryColor={primaryColor}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {/* Vínculos primeiro */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Users size={16} style={{ color: primaryColor }} /> {labels.association} *
                </Label>
                {filteredAssociations.length > 0 ? (
                  <Popover open={associationPopoverOpen} onOpenChange={setAssociationPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={!formData.producer_id}
                        className="w-full min-h-[3rem] rounded-xl bg-slate-50 border border-slate-200 shadow-sm px-4 py-2.5 text-left font-bold text-sm flex items-center gap-2 flex-wrap hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ '--primary': primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                      >
                        {!formData.producer_id ? (
                          <span className="text-slate-400 font-bold">Aguardando {labels.producer.toLowerCase()}...</span>
                        ) : selectedAssociationIds.length === 0 ? (
                          <span className="text-slate-400 font-bold">Selecione uma ou mais associações...</span>
                        ) : (
                          selectedAssociationIds.map((id: string) => {
                            const assoc = filteredAssociations.find((a: any) => a.id === id);
                            if (!assoc) return null;
                            return (
                              <Badge
                                key={id}
                                className="border-0 font-black text-[11px] rounded-lg px-2.5 py-1 flex items-center gap-1.5 cursor-default"
                                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                              >
                                <Users size={12} weight="fill" />
                                {assoc.name}
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 cursor-pointer"
                                  onClick={(e) => { e.stopPropagation(); removeAssociation(id); }}
                                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); removeAssociation(id); } }}
                                >
                                  <XIcon size={10} weight="bold" />
                                </span>
                              </Badge>
                            );
                          })
                        )}
                        {formData.producer_id && <CaretDown size={16} className="ml-auto text-slate-400 flex-shrink-0" />}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-xl shadow-xl border-slate-100" align="start">
                      <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {filteredAssociations.map((assoc: any) => {
                          const isChecked = selectedAssociationIds.includes(assoc.id);
                          return (
                            <label
                              key={assoc.id}
                              className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors", isChecked ? "bg-slate-50" : "hover:bg-slate-50")}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => toggleAssociation(assoc.id)}
                                className="rounded-md border-slate-300 data-[state=checked]:border-transparent"
                                style={isChecked ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                              />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Users size={14} weight={isChecked ? "fill" : "regular"} style={{ color: isChecked ? primaryColor : "#94a3b8" }} />
                                <span className={cn("text-sm truncate", isChecked ? "font-black text-slate-800" : "font-bold text-slate-600")}>{assoc.name}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="text-sm text-slate-500 font-bold py-2">{!formData.producer_id ? `Selecione um(a) ${labels.producer.toLowerCase()} para ver associações.` : "Nenhuma associação disponível."}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Tag size={16} style={{ color: primaryColor }} /> Indústrias Parceiras
                </Label>
                {industries.length > 0 ? (
                  <>
                    <Popover open={industryPopoverOpen} onOpenChange={setIndustryPopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full min-h-[3rem] rounded-xl bg-slate-50 border border-slate-200 shadow-sm px-4 py-2.5 text-left font-bold text-sm flex items-center gap-2 flex-wrap hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0"
                          style={{ '--primary': primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties}
                        >
                          {selectedIndustryIds.length === 0 ? (
                            <span className="text-slate-400 font-bold">Selecione uma ou mais indústrias...</span>
                          ) : (
                            selectedIndustryIds.map((id: string) => {
                              const ind = industries.find((i: any) => i.id === id);
                              if (!ind) return null;
                              return (
                                <Badge
                                  key={id}
                                  className="border-0 font-black text-[11px] rounded-lg px-2.5 py-1 flex items-center gap-1.5 cursor-default"
                                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                                >
                                  <Buildings size={12} weight="fill" />
                                  {ind.name}
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    className="ml-0.5 rounded-full hover:bg-black/10 p-0.5 cursor-pointer"
                                    onClick={(e) => { e.stopPropagation(); removeIndustry(id); }}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); removeIndustry(id); } }}
                                  >
                                    <XIcon size={10} weight="bold" />
                                  </span>
                                </Badge>
                              );
                            })
                          )}
                          <CaretDown size={16} className="ml-auto text-slate-400 flex-shrink-0" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 rounded-xl shadow-xl border-slate-100" align="start">
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                          {industries.map((industry: any) => {
                            const isChecked = selectedIndustryIds.includes(industry.id);
                            return (
                              <label
                                key={industry.id}
                                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors", isChecked ? "bg-slate-50" : "hover:bg-slate-50")}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() => toggleIndustry(industry.id)}
                                  className="rounded-md border-slate-300 data-[state=checked]:border-transparent"
                                  style={isChecked ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                />
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Buildings size={14} weight={isChecked ? "fill" : "regular"} style={{ color: isChecked ? primaryColor : "#94a3b8" }} />
                                  <span className={cn("text-sm truncate", isChecked ? "font-black text-slate-800" : "font-bold text-slate-600")}>{industry.name}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">
                      {selectedIndustryIds.length > 0
                        ? `${selectedIndustryIds.length} indústria(s) selecionada(s).`
                        : "Opcional. Selecione as indústrias parceiras deste lote."}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 font-bold">Nenhuma indústria cadastrada.</p>
                )}
              </div>

              {/* Seleção de Propriedade */}
              {formData.producer_id && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                    <Buildings size={16} style={{ color: primaryColor }} /> Propriedade
                  </Label>
                  <Select 
                    value={selectedPropertyId} 
                    onValueChange={(value) => {
                      setSelectedPropertyId(value);
                    }}
                    disabled={loadingProperties}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                      <SelectValue placeholder={loadingProperties ? "Carregando propriedades..." : "Selecione ou crie uma nova"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="new" className="font-bold">
                        <div className="flex items-center gap-2">
                          <Plus size={16} weight="bold" />
                          <span>Criar Nova Propriedade</span>
                        </div>
                      </SelectItem>
                      {savedProperties.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          {savedProperties.map((prop) => (
                            <SelectItem key={prop.id} value={prop.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-black">{prop.property_name}</span>
                                <span className="text-xs text-slate-400 font-bold">{prop.city}, {prop.state}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">
                    {selectedPropertyId === "new" ? "Preencha os dados da nova propriedade abaixo" : "Propriedade selecionada - ajuste os dados se necessário"}
                  </p>
                </div>
              )}

              {/* Dados da Propriedade */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <Buildings size={16} style={{ color: primaryColor }} /> {labels.propertyName} / Sítio *
                </Label>
                <Input 
                  value={formData.property_name} 
                  onChange={e => {
                    setFormData((prev: any) => ({ ...prev, property_name: e.target.value }));
                    // Se editar manualmente, considerar como nova propriedade
                    if (selectedPropertyId !== "new") {
                      setSelectedPropertyId("new");
                    }
                  }} 
                  placeholder="Ex: Fazenda Bela Vista - Talhão 4" 
                  className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                  style={{ '--primary': primaryColor } as any}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">O local exato onde este lote foi cultivado.</p>
              </div>

              {/* Localização */}
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <MapPin size={16} style={{ color: primaryColor }} /> Localização *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Select 
                      value={formData.state} 
                      onValueChange={v => {
                        setFormData((prev: any) => ({ ...prev, state: v, city: "" }));
                        if (selectedPropertyId !== "new") setSelectedPropertyId("new");
                        geocodeAddress("", v);
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                        <SelectValue placeholder="Estado (UF)" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        {stateOptions.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select
                      value={formData.city || ""}
                      onValueChange={(cityName) => {
                        setFormData((prev: any) => ({ ...prev, city: cityName }));
                        if (selectedPropertyId !== "new") setSelectedPropertyId("new");
                        geocodeAddress(cityName, formData.state);
                      }}
                      disabled={!formData.state || loadingCities}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus:ring-primary font-bold shadow-sm" style={{ '--primary': primaryColor } as any}>
                        <SelectValue placeholder={loadingCities ? "Carregando cidades..." : "Selecione a cidade"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold max-h-[300px]">
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.nome} className="font-bold">
                            {city.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase ml-1">Selecione o estado e em seguida a cidade para pré-localizar o mapa.</p>
              </div>

              {/* Altitude e Temperatura (Opcional) */}
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
                    onCheckedChange={(checked) => {
                      setShowAltTemp(checked);
                      // Se alterar altitude/temp, considerar como nova propriedade
                      if (selectedPropertyId !== "new") {
                        setSelectedPropertyId("new");
                      }
                    }}
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
                        onChange={e => {
                          setFormData((prev: any) => ({ ...prev, altitude: e.target.value }));
                          // Se editar altitude, considerar como nova propriedade
                          if (selectedPropertyId !== "new") {
                            setSelectedPropertyId("new");
                          }
                        }} 
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
                        onChange={e => {
                          setFormData((prev: any) => ({ ...prev, average_temperature: e.target.value }));
                          // Se editar temperatura, considerar como nova propriedade
                          if (selectedPropertyId !== "new") {
                            setSelectedPropertyId("new");
                          }
                        }} 
                        placeholder="Ex: 22.5" 
                        className="h-12 rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary font-bold shadow-sm"
                        style={{ '--primary': primaryColor } as any}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* História da Propriedade */}
              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2 font-black text-slate-700 ml-1 mb-1">
                  <ChatCircleText size={16} style={{ color: primaryColor }} /> História da Propriedade (Opcional)
                </Label>
                <Textarea 
                  value={formData.property_description} 
                  onChange={e => {
                    setFormData((prev: any) => ({ ...prev, property_description: e.target.value }));
                    // Se editar história, considerar como nova propriedade
                    if (selectedPropertyId !== "new") {
                      setSelectedPropertyId("new");
                    }
                  }} 
                  placeholder="Conte a história específica deste local de cultivo..." 
                  className="min-h-[120px] rounded-xl bg-slate-50 border border-slate-200 focus-visible:ring-primary shadow-sm"
                  style={{ '--primary': primaryColor } as any}
                />
              </div>

              {/* Galeria da Propriedade */}
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
                  <p className="text-xs text-slate-400 font-bold">Clique no mapa para marcar o pin exato da colheita. Você pode reposicionar o PIN clicando na região desejada no mapa.</p>
                </div>
              </div>
              <LocationPicker 
                value={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null}
                onChange={(coords) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    latitude: coords.lat.toString(),
                    longitude: coords.lng.toString()
                  }));
                }}
                primaryColor={primaryColor}
              />
              {/* Coordenadas manuais + referência */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, latitude: e.target.value }))}
                    placeholder="-9.97499"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, longitude: e.target.value }))}
                    placeholder="-67.81000"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500">Referência (opcional)</Label>
                  <Input
                    value={formData.location_reference || ""}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, location_reference: e.target.value }))}
                    placeholder="Ex: Km 5, Estrada da Serra"
                    className="h-10 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Produtores Internos (apenas marca coletiva) */}
          {labels.isMarcaColetiva && (
            <InternalProducersSection
              formData={formData}
              setFormData={setFormData}
              tenantId={tenantId}
              primaryColor={primaryColor}
            />
          )}
        </>
    </div>
  );
};

// Sub-componente: Seleção de produtores internos para marca coletiva
const InternalProducersSection = ({
  formData,
  setFormData,
  tenantId,
  primaryColor,
}: {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  tenantId: string;
  primaryColor: string;
}) => {
  const [internalProducers, setInternalProducers] = useState<any[]>([]);
  const [loadingIp, setLoadingIp] = useState(true);

  useEffect(() => {
    if (tenantId) {
      setLoadingIp(true);
      internalProducersApi.getAll(tenantId)
        .then(data => setInternalProducers(data || []))
        .catch(e => console.error("Erro ao carregar produtores internos:", e))
        .finally(() => setLoadingIp(false));
    }
  }, [tenantId]);

  // Filtrar por cooperativa selecionada
  const filtered = formData.producer_id
    ? internalProducers.filter(ip => ip.cooperativa_id === formData.producer_id || !ip.cooperativa_id)
    : internalProducers;

  const selectedIds: string[] = formData.internal_producer_ids || [];

  const toggleProducer = (id: string) => {
    setFormData((prev: any) => {
      const current: string[] = prev.internal_producer_ids || [];
      return {
        ...prev,
        internal_producer_ids: current.includes(id)
          ? current.filter((pid: string) => pid !== id)
          : [...current, id],
      };
    });
  };

  if (loadingIp) return null;
  if (filtered.length === 0) return null;

  return (
    <div className="mt-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} style={{ color: primaryColor }} weight="fill" />
        <Label className="font-black text-slate-700">
          Produtores Internos Envolvidos
        </Label>
        {selectedIds.length > 0 && (
          <Badge className="bg-blue-100 text-blue-700 text-xs ml-auto">
            {selectedIds.length} selecionado(s)
          </Badge>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-3">
        Selecione os produtores associados que participaram deste lote.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {filtered.map(ip => (
          <label
            key={ip.id}
            className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm ${
              selectedIds.includes(ip.id)
                ? "bg-white border border-blue-200 shadow-sm"
                : "hover:bg-white/60"
            }`}
          >
            <Checkbox
              checked={selectedIds.includes(ip.id)}
              onCheckedChange={() => toggleProducer(ip.id)}
            />
            <span className="font-medium text-slate-700 truncate">{ip.name}</span>
            {ip.city && <span className="text-xs text-slate-400 ml-auto">{ip.city}</span>}
          </label>
        ))}
      </div>
    </div>
  );
};
