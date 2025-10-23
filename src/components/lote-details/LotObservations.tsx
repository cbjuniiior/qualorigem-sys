import { Quotes } from "@phosphor-icons/react";

interface LotObservationsProps {
  lotObservations?: string | null;
}

export const LotObservations = ({ lotObservations }: LotObservationsProps) => {
  if (!lotObservations) return null;

  return (
    <div className="mb-12">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Quotes className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Observações sobre o Lote
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {lotObservations}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
