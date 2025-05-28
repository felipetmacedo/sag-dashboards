import { useState } from 'react';

interface AddressResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export function useAddressLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const lookupAddress = async (cep: string): Promise<AddressResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: AddressResponse = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }
      
      return data;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  return { lookupAddress, loading, error };
} 