import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import InputMask from 'react-input-mask';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAddressLookup } from '@/hooks/useAddressLookup';

// Form utilities
import {
  createRequiredStringField,
  createEmailField,
  createOptionalStringField,
} from '@/utils/form-utils';

// Form validation schema
const formSchema = z.object({
  id: z.string().optional(),
  name: createRequiredStringField('Nome'),
  email: createEmailField(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
  phone_number: createOptionalStringField(),
  document: createRequiredStringField('CPF/CNPJ'),
  cep: createRequiredStringField('CEP'),
  address: createRequiredStringField('Endereço'),
  number: createRequiredStringField('Número'),
  complement: createOptionalStringField(),
  neighborhood: createRequiredStringField('Bairro'),
  city: createRequiredStringField('Cidade'),
  state: createRequiredStringField('Estado'),
});

// Define the form data type from the schema
type FormData = z.infer<typeof formSchema>;

export interface UserFormData {
  name: string;
  email: string;
  phone_number?: string;
  document: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface UserFormProps {
  user: UserFormData | null;
  onSave: (data: UserFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isSubmitting }) => {
  const { lookupAddress, loading: loadingAddress } = useAddressLookup();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      document: user?.document || '',
      cep: user?.cep || '',
      address: user?.address || '',
      number: user?.number || '',
      complement: user?.complement || '',
      neighborhood: user?.neighborhood || '',
      city: user?.city || '',
      state: user?.state || '',
    },
  });

  // Handle CEP lookup
  const handleCepLookup = useCallback(
    async (cep: string) => {
      // Check if CEP has the right format before making the API call
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length === 8) {
        // Added a guard to avoid unnecessary lookups when the form is already filled
        const currentAddress = form.getValues('address');
        const currentNeighborhood = form.getValues('neighborhood');
        if (!currentAddress || !currentNeighborhood) {
          const address = await lookupAddress(cleanCep);
          if (address) {
            form.setValue('address', address.logradouro || '');
            form.setValue('neighborhood', address.bairro || '');
            form.setValue('city', address.localidade || '');
            form.setValue('state', address.uf || '');
          }
        }
      }
    },
    [form, lookupAddress]
  );

  // Watch CEP value for auto-lookup
  const cepValue = form.watch('cep');
  useEffect(() => {
    // Only trigger lookup when CEP is exactly 9 characters and contains a hyphen
    const formattedCep = cepValue.replace(/\D/g, '');
    if (cepValue.length === 9 && cepValue.includes('-') && formattedCep.length === 8) {
      handleCepLookup(cepValue);
    }
  }, [cepValue, handleCepLookup]);

  const handleSubmit = useCallback(
		(data: UserFormData) => {
			onSave(data as UserFormData);
		},
		[onSave]
	);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF/CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00 ou 00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <InputMask mask="(99)99999-9999" {...field}>
                    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => <Input placeholder="(00) 00000-0000" {...inputProps} />}
                  </InputMask>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <InputMask mask="99999-999" {...field}>
                    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => <Input placeholder="00000-000" {...inputProps} className={loadingAddress ? 'bg-gray-100' : ''} />}
                  </InputMask>
                </FormControl>
                {loadingAddress && (
                  <p className="text-xs text-gray-500">
                    Buscando endereço...
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Rua, Avenida, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apto, Sala, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Bairro" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Input placeholder="UF" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 

export default UserForm;