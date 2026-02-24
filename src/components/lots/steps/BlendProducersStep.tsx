import { Users, Buildings, MapPin, Mountains, Thermometer, Camera, Trash, Plus, CircleNotch, CaretDown, X as XIcon } from "@phosphor-icons/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LocationPicker } from "@/components/ui/location-picker";
import { useState, useEffect, useCallback } from "react";
import { productLotsApi } from "@/services/api";
import { uploadImageToSupabase } from "@/services/upload";
import { useTenantLabels } from "@/hooks/use-tenant-labels";
import axios from "axios";

const stateOptions = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

interface Producer {
  id: string;
  name: string;
  property_name?: string;
  city?: string;
  state?: string;
}

interface BlendProducersStepProps {
  tenantId: string;
  formData: any;
  setFormData: (data: any) => void;
  producers: Producer[];
  branding?: { primaryColor: string; secondaryColor?: string; accentColor?: string } | null;
}

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

export const BlendProducersStep = ({ tenantId, formData, setFormData, producers, branding }: BlendProducersStepProps) => {
  const primaryColor = branding?.primaryColor || "#16a34a";
  const labels = useTenantLabels();
  const [savedPropertiesByProducerId, setSavedPropertiesByProducerId] = useState<Record<string, any[]>>({});
  const [selectedPropertyIdByIndex, setSelectedPropertyIdByIndex] = useState<Record<number, string>>({});
  const [loadingPropertiesByProducerId, setLoadingPropertiesByProducerId] = useState<Record<string, boolean>>({});
  const [citiesByState, setCitiesByState] = useState<Record<string, { id: number; nome: string }[]>>({});
  const [loadingCitiesByState, setLoadingCitiesByState] = useState<Record<string, boolean>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [showAltTempByIndex, setShowAltTempByIndex] = useState<Record<number, boolean>>({});
  const [uploadingPhotoByIndex, setUploadingPhotoByIndex] = useState<number | null>(null);

  const components = formData.components || [];

  const geocodeAddress = useCallback(async (city: string | null, state: string, index: number) => {
    if (!state) return;
    const setLatLng = (lat: string, lon: string) => {
      setFormData((prev: any) => {
        const newComponents = [...(prev.components || [])];
        if (!newComponents[index]) return prev;
        newComponents[index] = { ...newComponents[index], latitude: lat, longitude: lon };
        return { ...prev, components: newComponents };
      });
    };
    try {
      if (city && city.trim()) {
        const query = `${city.trim()}, ${state}, Brasil`;
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        if (response.data?.length > 0) {
          const { lat, lon } = response.data[0];
          setLatLng(lat, lon);
          return;
        }
      }
      const stateQuery = `${state}, Brasil`;
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(stateQuery)}&limit=1`);
      if (response.data?.length > 0) {
        const { lat, lon } = response.data[0];
        setLatLng(lat, lon);
      }
    } catch (e) {
      console.error("Erro na geocodificação:", e);
    }
  }, [setFormData]);

  useEffect(() => {
    const toFetch = new Set<string>();
    components.forEach((c: any) => {
      if (c.producer_id && !savedPropertiesByProducerId[c.producer_id] && !loadingPropertiesByProducerId[c.producer_id]) {
        toFetch.add(c.producer_id);
      }
    });
    if (toFetch.size === 0) return;
    toFetch.forEach((producerId) => {
      setLoadingPropertiesByProducerId((prev) => ({ ...prev, [producerId]: true }));
      productLotsApi.getAll(tenantId).then((allLots) => {
        const producerLots = (allLots || []).filter((lot: any) => lot.producer_id === producerId);
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
        setSavedPropertiesByProducerId((prev) => ({ ...prev, [producerId]: Array.from(uniqueProperties.values()) }));
      }).catch((e) => console.error(e)).finally(() => {
        setLoadingPropertiesByProducerId((prev) => ({ ...prev, [producerId]: false }));
      });
    });
  }, [tenantId, components.map((c: any) => c.producer_id).join(",")]);

  useEffect(() => {
    const statesToFetch = new Set<string>();
    components.forEach((c: any) => {
      if (c.state && !citiesByState[c.state] && !loadingCitiesByState[c.state]) statesToFetch.add(c.state);
    });
    if (statesToFetch.size === 0) return;
    statesToFetch.forEach((state) => {
      setLoadingCitiesByState((prev) => ({ ...prev, [state]: true }));
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`)
        .then((r) => r.json())
        .then((data: { id: number; nome: string }[]) => {
          const sorted = (data || []).sort((a, b) => a.nome.localeCompare(b.nome));
          setCitiesByState((prev) => ({ ...prev, [state]: sorted }));
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingCitiesByState((prev) => ({ ...prev, [state]: false })));
    });
  }, [components.map((c: any) => c.state).join(",")]);

  // Garantir que o primeiro card esteja expandido quando houver participantes (select de Produtor visível)
  useEffect(() => {
    if (components.length === 0) return;
    if (expandedIndex === null || expandedIndex >= components.length) {
      setExpandedIndex(0);
    }
  }, [components.length, expandedIndex]);

  const addParticipant = () => {
    const newComponent = {
      id: crypto.randomUUID(),
      component_name: "",
      component_percentage: 0,
      component_quantity: 0,
      component_unit: "g",
      producer_id: undefined,
      property_name: "",
      city: "",
      state: "",
      latitude: undefined,
      longitude: undefined,
      altitude: undefined,
      average_temperature: "",
      property_description: "",
      photos: [] as string[]
    };
    setFormData((prev: any) => ({
      ...prev,
      components: [...(prev.components || []), newComponent]
    }));
    setExpandedIndex(components.length);
  };

  const removeParticipant = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      components: (prev.components || []).filter((_: any, i: number) => i !== index)
    }));
    setSelectedPropertyIdByIndex((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    if (expandedIndex === index) setExpandedIndex(Math.max(0, index - 1));
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const updateComponent = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const newComponents = [...(prev.components || [])];
      newComponents[index] = { ...newComponents[index], [field]: value };
      return { ...prev, components: newComponents };
    });
  };

  const setSelectedProperty = (index: number, value: string) => {
    setSelectedPropertyIdByIndex((prev) => ({ ...prev, [index]: value }));
    const component = components[index];
    if (!component || value === "new") return;
    const saved = savedPropertiesByProducerId[component.producer_id] || [];
    const prop = saved.find((p: any) => p.id === value);
    if (prop) {
      setFormData((prev: any) => {
        const newComponents = [...(prev.components || [])];
        newComponents[index] = {
          ...newComponents[index],
          property_name: prop.property_name,
          city: prop.city,
          state: prop.state,
          latitude: prop.latitude || "",
          longitude: prop.longitude || "",
          altitude: prop.altitude || "",
          average_temperature: prop.average_temperature || "",
          property_description: prop.property_description || "",
          photos: prop.photos || []
        };
        return { ...prev, components: newComponents };
      });
      setShowAltTempByIndex((prev) => ({ ...prev, [index]: !!(prop.altitude || prop.average_temperature) }));
    }
  };

  const handleProducerChange = (index: number, producerId: string) => {
    const producer = producers.find((p) => p.id === producerId);
    if (producer) {
      setFormData((prev: any) => {
        const newComponents = [...(prev.components || [])];
        newComponents[index] = {
          ...newComponents[index],
          producer_id: producerId,
          property_name: producer.property_name || "",
          city: producer.city || "",
          state: producer.state || "",
          latitude: producer.latitude || undefined,
          longitude: producer.longitude || undefined,
          altitude: producer.altitude || undefined,
          property_description: producer.property_description || "",
          photos: producer.photos || []
        };
        return { ...prev, components: newComponents };
      });
      setSelectedPropertyIdByIndex((prev) => ({ ...prev, [index]: "new" }));
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingPhotoByIndex(index);
    try {
      const currentPhotos = [...(components[index]?.photos || [])];
      for (const file of files) {
        const url = await uploadImageToSupabase(file);
        currentPhotos.push(url);
      }
      updateComponent(index, "photos", currentPhotos);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhotoByIndex(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <FormSection title="Produtores do Blend" icon={Users} description="Selecione produtores e propriedades (igual ao lote individual)" primaryColor={primaryColor}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 font-bold">Cadastre cada participante: produtor, propriedade e localização no mapa.</p>
            <Button
              type="button"
              onClick={addParticipant}
              className="rounded-xl font-black text-white gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus size={20} weight="bold" /> Adicionar produtor
            </Button>
          </div>

          {components.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <Users size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="font-black text-slate-700 mb-2">Nenhum produtor adicionado</p>
              <p className="text-sm text-slate-500 mb-4">Adicione ao menos um produtor participante do blend.</p>
              <Button type="button" onClick={addParticipant} className="rounded-2xl font-black" style={{ backgroundColor: primaryColor }}>
                Adicionar primeiro produtor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {components.map((comp: any, index: number) => {
                const isExpanded = expandedIndex === index;
                const savedProperties = (comp.producer_id && savedPropertiesByProducerId[comp.producer_id]) || [];
                const selectedPropId = selectedPropertyIdByIndex[index] ?? "new";
                const loadingProps = comp.producer_id ? loadingPropertiesByProducerId[comp.producer_id] : false;
                const showAltTemp = showAltTempByIndex[index] ?? !!(comp.altitude || comp.average_temperature);
                const cities = comp.state ? (citiesByState[comp.state] || []) : [];
                const loadingCities = comp.state ? loadingCitiesByState[comp.state] : false;

                return (
                  <div key={comp.id} className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white" style={{ backgroundColor: primaryColor }}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">
                            {comp.producer_id ? producers.find((p) => p.id === comp.producer_id)?.name || "Produtor" : "Selecione o produtor"}
                          </p>
                          {comp.property_name && (
                            <p className="text-xs text-slate-500 font-bold">{comp.property_name} {comp.city && comp.state && ` · ${comp.city}, ${comp.state}`}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={(ev) => { ev.stopPropagation(); removeParticipant(index); }}
                        >
                          <Trash size={18} weight="bold" />
                        </Button>
                        <CaretDown size={20} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 p-8 space-y-8 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="font-black text-slate-700 text-xs">Produtor *</Label>
                            <Select value={comp.producer_id || ""} onValueChange={(v) => handleProducerChange(index, v)}>
                              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold" style={{ '--primary': primaryColor } as any}>
                                <SelectValue placeholder="Selecione o produtor" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl font-bold">
                                {producers.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {producers.length === 0 && (
                              <p className="text-xs text-amber-600 font-bold">
                                Nenhum produtor cadastrado. Cadastre produtores no sistema primeiro.
                              </p>
                            )}
                          </div>

                          {comp.producer_id && (
                            <div className="space-y-2">
                              <Label className="font-black text-slate-700 text-xs">Propriedade</Label>
                              <Select value={selectedPropId} onValueChange={(v) => setSelectedProperty(index, v)} disabled={loadingProps}>
                                <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold" style={{ '--primary': primaryColor } as any}>
                                  <SelectValue placeholder={loadingProps ? "Carregando..." : "Selecione ou crie uma nova"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                  <SelectItem value="new"><span className="font-bold">Criar Nova Propriedade</span></SelectItem>
                                  {savedProperties.length > 0 && (
                                    <>
                                      <Separator className="my-2" />
                                      {savedProperties.map((prop: any) => (
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
                            </div>
                          )}

                          <div className="space-y-2 md:col-span-2">
                            <Label className="font-black text-slate-700 text-xs">{labels.propertyName || "Nome da Propriedade"} *</Label>
                            <Input
                              value={comp.property_name || ""}
                              onChange={(e) => updateComponent(index, "property_name", e.target.value)}
                              placeholder="Ex: Fazenda Bela Vista"
                              className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                              style={{ '--primary': primaryColor } as any}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="font-black text-slate-700 text-xs">Estado *</Label>
                            <Select
                              value={comp.state || ""}
                              onValueChange={(v) => {
                                setFormData((prev: any) => {
                                  const newComponents = [...(prev.components || [])];
                                  newComponents[index] = { ...newComponents[index], state: v, city: "" };
                                  return { ...prev, components: newComponents };
                                });
                                geocodeAddress("", v, index);
                              }}
                            >
                              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold" style={{ '--primary': primaryColor } as any}>
                                <SelectValue placeholder="UF" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl font-bold">
                                {stateOptions.map((uf) => (
                                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="font-black text-slate-700 text-xs">Cidade *</Label>
                            <Select
                              value={comp.city || ""}
                              onValueChange={(cityName) => {
                                updateComponent(index, "city", cityName);
                                geocodeAddress(cityName, comp.state, index);
                              }}
                              disabled={!comp.state || loadingCities}
                            >
                              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold" style={{ '--primary': primaryColor } as any}>
                                <SelectValue placeholder={loadingCities ? "Carregando cidades..." : "Selecione a cidade"} />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl font-bold max-h-[300px]">
                                {cities.map((city) => (
                                  <SelectItem key={city.id} value={city.nome} className="font-bold">{city.nome}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-black text-slate-700 text-xs">Localização no mapa</Label>
                          <p className="text-xs text-slate-500 mb-2">Clique no mapa para marcar o pin. Você pode reposicionar o PIN clicando na região desejada.</p>
                          <LocationPicker
                            value={comp.latitude && comp.longitude ? { lat: parseFloat(comp.latitude), lng: parseFloat(comp.longitude) } : null}
                            onChange={(coords) => {
                              setFormData((prev: any) => ({
                                ...prev,
                                components: (prev.components || []).map((c: any, i: number) =>
                                  i === index ? { ...c, latitude: coords.lat.toString(), longitude: coords.lng.toString() } : c
                                )
                              }));
                            }}
                            primaryColor={primaryColor}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="space-y-2">
                              <Label className="font-black text-slate-700 text-xs">Latitude</Label>
                              <Input
                                type="number"
                                step="any"
                                value={comp.latitude ?? ""}
                                onChange={(e) => updateComponent(index, "latitude", e.target.value)}
                                placeholder="Ex: -3.7172"
                                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                                style={{ '--primary': primaryColor } as any}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-black text-slate-700 text-xs">Longitude</Label>
                              <Input
                                type="number"
                                step="any"
                                value={comp.longitude ?? ""}
                                onChange={(e) => updateComponent(index, "longitude", e.target.value)}
                                placeholder="Ex: -38.5433"
                                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                                style={{ '--primary': primaryColor } as any}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                          <div>
                            <p className="text-sm font-black text-slate-800">Altitude e Temperatura (opcional)</p>
                            <p className="text-xs text-slate-500">Habilite para preencher.</p>
                          </div>
                          <Switch
                            checked={showAltTemp}
                            onCheckedChange={(checked) => {
                              setShowAltTempByIndex((prev) => ({ ...prev, [index]: checked }));
                            }}
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>
                        {showAltTemp && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="font-black text-slate-700 text-xs">Altitude (m)</Label>
                              <Input
                                type="number"
                                value={comp.altitude || ""}
                                onChange={(e) => updateComponent(index, "altitude", e.target.value)}
                                placeholder="Ex: 1150"
                                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                                style={{ '--primary': primaryColor } as any}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-black text-slate-700 text-xs">Temp. Média (°C)</Label>
                              <Input
                                type="number"
                                value={comp.average_temperature || ""}
                                onChange={(e) => updateComponent(index, "average_temperature", e.target.value)}
                                placeholder="Ex: 22.5"
                                className="h-12 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                                style={{ '--primary': primaryColor } as any}
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="font-black text-slate-700 text-xs">História da Propriedade (opcional)</Label>
                          <Textarea
                            value={comp.property_description || ""}
                            onChange={(e) => updateComponent(index, "property_description", e.target.value)}
                            placeholder="Conte a história deste local..."
                            className="min-h-[100px] rounded-xl bg-slate-50 border border-slate-200"
                            style={{ '--primary': primaryColor } as any}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-black text-slate-700 text-xs">Fotos da propriedade</Label>
                          <div className="grid grid-cols-3 gap-4">
                            {(comp.photos || []).map((p: string, i: number) => (
                              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm group">
                                <img src={p} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                                  onClick={() => updateComponent(index, "photos", (comp.photos || []).filter((_: any, j: number) => j !== i))}
                                >
                                  <Trash size={18} weight="bold" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              disabled={uploadingPhotoByIndex === index}
                              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50"
                              onClick={() => document.getElementById(`blend-photo-${index}`)?.click()}
                            >
                              {uploadingPhotoByIndex === index ? <CircleNotch size={24} className="animate-spin" /> : <Plus size={24} weight="bold" />}
                              <span className="text-[10px] font-black uppercase">Foto</span>
                            </button>
                            <input id={`blend-photo-${index}`} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, index)} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FormSection>
    </div>
  );
};
