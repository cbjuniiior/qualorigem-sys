import { Badge } from "@/components/ui/badge";
import { Calendar, Scales, Leaf, Tag, Users, User, Building, Info, Mountains, Thermometer } from "@phosphor-icons/react";

interface LotInfoSectionProps {
  loteData: {
    name: string;
    code: string;
    category: string;
    harvest_year: string;
    quantity: number | null;
    unit: string | null;
    variety?: string;
    seals_quantity?: number | null;
    image_url: string | null;
    altitude?: number | null;
    average_temperature?: number | null;
    characteristics?: Array<{
      id: string;
      value: string;
      characteristics: {
        name: string;
      };
    }>;
  };
  isBlend: boolean;
  blendComponents: Array<{
    id: string;
    producers?: { 
      name: string;
      profile_picture_url?: string | null;
    };
    component_percentage: number;
  }>;
  producer?: {
    id: string;
    name: string;
    profile_picture_url?: string | null;
  };
  industry?: {
    id: string;
    name: string;
    logo_url?: string | null;
    city?: string | null;
    state?: string | null;
  };
  producerName?: string;
  associations?: any[];
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

export const LotInfoSection = ({ loteData, isBlend, blendComponents, producer, producerName, industry, associations, branding }: LotInfoSectionProps) => {
  const primaryColor = branding?.primaryColor || '#16a34a';
  const secondaryColor = branding?.secondaryColor || '#22c55e';
  const accentColor = branding?.accentColor || '#10b981';

  return (
    <div className="mb-12 lg:mb-24 pt-12 border-t border-slate-100">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase tracking-widest">Informações Técnicas</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Detalhamento completo do lote</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {/* Safra */}
        <TechnicalCard 
          icon={<Calendar size={24} weight="duotone" />} 
          label="Safra" 
          value={loteData.harvest_year} 
          color={primaryColor} 
        />

        {/* Quantidade */}
        <TechnicalCard 
          icon={<Scales size={24} weight="duotone" />} 
          label="Volume Total" 
          value={`${loteData.quantity} ${loteData.unit}`} 
          color={secondaryColor} 
        />

        {/* Variedade */}
        {loteData.variety && (
          <TechnicalCard 
            icon={<Leaf size={24} weight="duotone" />} 
            label="Variedade" 
            value={loteData.variety} 
            color={accentColor} 
          />
        )}

        {/* Características Dinâmicas */}
        {loteData.characteristics?.map((char) => (
          <TechnicalCard 
            key={char.id}
            icon={<Info size={24} weight="duotone" />} 
            label={char.characteristics.name} 
            value={char.value} 
            color={secondaryColor} 
          />
        ))}
      </div>
    </div>
  );
};

const TechnicalCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 shadow-sm"
      style={{ backgroundColor: `${color}10`, color }}
    >
      <div className="scale-90">{icon}</div>
    </div>
    <div className="text-left">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-black text-slate-900 leading-tight">{value}</p>
    </div>
  </div>
);
