/**
 * Componente de Input com máscara
 */

import { Input } from "@/components/ui/input";
import { InputHTMLAttributes, forwardRef } from "react";
import { maskPhone, maskCEP, maskCPFCNPJ, maskCurrency } from "@/utils/masks";

export type MaskType = 'phone' | 'cep' | 'cpf-cnpj' | 'currency';

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask?: MaskType;
  onChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, onChange, onBlur, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      let maskedValue = inputValue;
      
      if (mask === 'phone') {
        maskedValue = maskPhone(inputValue);
      } else if (mask === 'cep') {
        maskedValue = maskCEP(inputValue);
      } else if (mask === 'cpf-cnpj') {
        maskedValue = maskCPFCNPJ(inputValue);
      } else if (mask === 'currency') {
        maskedValue = maskCurrency(inputValue);
      }
      
      if (onChange) {
        onChange(maskedValue);
      }
    };
    
    return (
      <Input
        ref={ref}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        {...props}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
