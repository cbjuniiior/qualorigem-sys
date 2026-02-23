import { Quotes, ChatCircleText } from "@phosphor-icons/react";

interface LotObservationsProps {
  /** Notas do Especialista / Observações Sensoriais (sensory_notes) - exibido abaixo da análise sensorial */
  expertNotes?: string | null;
  /** Relato do Produtor (lot_observations) */
  lotObservations?: string | null;
}

const ObservationBlock = ({
  title,
  content,
  icon: Icon,
}: {
  title: string;
  content: string;
  icon: React.ComponentType<{ className?: string; weight?: "duotone" }>;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative z-10">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors">
          <Icon className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-gray-600 transition-colors" weight="duotone" />
        </div>
      </div>
      <div className="flex-1">
        <h2 className="text-lg md:text-xl font-black text-gray-900 mb-2 md:mb-3 tracking-tight">
          {title}
        </h2>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-500 leading-relaxed whitespace-pre-line text-sm md:text-base font-medium italic">
            "{content}"
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const LotObservations = ({ expertNotes, lotObservations }: LotObservationsProps) => {
  const hasExpert = expertNotes && expertNotes.trim().length > 0;
  const hasRelato = lotObservations && lotObservations.trim().length > 0;
  if (!hasExpert && !hasRelato) return null;

  return (
    <div className="mb-8 md:mb-12 space-y-8 md:space-y-12">
      {hasExpert && (
        <ObservationBlock
          title="Notas do Especialista / Observações Sensoriais"
          content={expertNotes!}
          icon={ChatCircleText}
        />
      )}
      {hasRelato && (
        <ObservationBlock
          title="Relato do Produtor"
          content={lotObservations!}
          icon={Quotes}
        />
      )}
    </div>
  );
};
