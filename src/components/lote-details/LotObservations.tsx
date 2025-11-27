import { Quotes } from "@phosphor-icons/react";

interface LotObservationsProps {
  lotObservations?: string | null;
}

export const LotObservations = ({ lotObservations }: LotObservationsProps) => {
  if (!lotObservations) return null;

  return (
    <div className="mb-12 md:mb-16">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
        {/* Elemento decorativo de fundo */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 md:w-32 md:h-32 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors">
              <Quotes className="h-6 w-6 md:h-8 md:w-8 text-gray-400 group-hover:text-gray-600 transition-colors" weight="duotone" />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4 tracking-tight">
              Observações do Especialista
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base md:text-lg font-light italic">
                "{lotObservations}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
