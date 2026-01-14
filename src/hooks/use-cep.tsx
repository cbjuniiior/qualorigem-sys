import { useState, useCallback } from 'react';
import { fetchCEPData, CEPData } from '@/utils/cep-api';
import { toast } from 'sonner';

export const useCEP = (onCEPData?: (data: CEPData) => void) => {
  const [loading, setLoading] = useState(false);
  const [cepData, setCepData] = useState<CEPData | null>(null);

  const searchCEP = useCallback(async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return;
    }
    
    setLoading(true);
    try {
      const data = await fetchCEPData(cep);
      if (data) {
        setCepData(data);
        if (onCEPData) {
          onCEPData(data);
        }
      } else {
        toast.error('CEP não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar dados do CEP');
    } finally {
      setLoading(false);
    }
  }, [onCEPData]);

  return { searchCEP, loading, cepData };
};
