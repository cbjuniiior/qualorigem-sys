import { Quotes } from "@phosphor-icons/react";

interface LotObservationsProps {
  lotObservations?: string | null;
}

export const LotObservations = ({ lotObservations }: LotObservationsProps) => {
  if (!lotObservations) return null;

  return (
    <div className="mb-8 md:mb-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
        {/* Elemento decorativo de fundo */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative z-10">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-gray-200 transition-colors">
              <Quotes className="h-5 w-5 md:h-6 md:w-6 text-gray-400 group-hover:text-gray-600 transition-colors" weight="duotone" />
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-black text-gray-900 mb-2 md:mb-3 tracking-tight">
              Observações do Especialista
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-500 leading-relaxed whitespace-pre-line text-sm md:text-base font-medium italic">
                "{lotObservations}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
