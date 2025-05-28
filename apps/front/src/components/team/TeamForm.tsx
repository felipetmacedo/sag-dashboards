import React, { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InputMask from 'react-input-mask';

// Form utilities
import {
	createRequiredStringField,
	createEmailField,
	createOptionalStringField,
} from '@/utils/form-utils';

// Address lookup
import { useAddressLookup } from '@/hooks/useAddressLookup';

interface TeamFormProps {
	team?: TeamFormData | null;
	onSave: (team: TeamFormData) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
}

export interface TeamFormData {
	cnpj: string;
	name: string;
	email: string;
	cep: string;
	address: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
}

// Create a zod schema that matches TeamFormData using utility functions
const teamFormSchema = z.object({
	cnpj: createRequiredStringField('CNPJ'),
	name: createRequiredStringField('Nome'),
	email: createEmailField(),
	cep: createRequiredStringField('CEP'),
	address: createRequiredStringField('Endereço'),
	number: createRequiredStringField('Número'),
	complement: createOptionalStringField(),
	neighborhood: createRequiredStringField('Bairro'),
	city: createRequiredStringField('Cidade'),
	state: createRequiredStringField('Estado'),
});

// Form schema type that matches TeamFormData
type TeamFormSchema = z.infer<typeof teamFormSchema>;

const TeamForm: React.FC<TeamFormProps> = ({ team, onSave, onCancel, isSubmitting = false }) => {
	const { lookupAddress, loading: loadingAddress } = useAddressLookup();

	// Initialize form with Zod schema
	const form = useForm<TeamFormSchema>({
		resolver: zodResolver(teamFormSchema),
		defaultValues: {
			cnpj: team?.cnpj || '',
			name: team?.name || '',
			email: team?.email || '',
			cep: team?.cep || '',
			address: team?.address || '',
			number: team?.number || '',
			complement: team?.complement || '',
			neighborhood: team?.neighborhood || '',
			city: team?.city || '',
			state: team?.state || '',
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

	// Handle form submission using useCallback
	const handleSubmit = useCallback(
		(data: TeamFormSchema) => {
			onSave(data as TeamFormData);
		},
		[onSave]
	);

	// Cancel form with useCallback
	const handleCancel = useCallback(() => {
		onCancel();
	}, [onCancel]);

	return (
		<div className="p-2">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="space-y-6"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<FormField
							control={form.control}
							name="cnpj"
							render={({ field }) => (
								<FormItem>
									<FormLabel>CNPJ</FormLabel>
									<FormControl>
										<InputMask mask="99.999.999/9999-99" {...field}>
											{(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => <Input placeholder="00.000.000/0000-00" {...inputProps} />}
										</InputMask>
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
									<FormLabel>Nome do Líder</FormLabel>
									<FormControl>
										<Input
											placeholder="Digite o nome do líder"
											{...field}
										/>
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
									<FormLabel>E-mail</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="email@exemplo.com"
											{...field}
										/>
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
										<Input
											placeholder="Rua, Avenida, etc."
											{...field}
										/>
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
									<FormLabel>Complemento</FormLabel>
									<FormControl>
										<Input
											placeholder="Sala, Andar, etc."
											{...field}
										/>
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
										<Input
											placeholder="Centro"
											{...field}
										/>
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
										<Input
											placeholder="São Paulo"
											{...field}
										/>
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
										<Input
											placeholder="SP"
											maxLength={2}
											{...field}
											onChange={(e) =>
												field.onChange(
													e.target.value.toUpperCase()
												)
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex justify-end space-x-4 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleCancel}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									{team ? 'Atualizando...' : 'Salvando...'}
								</>
							) : (
								<>{team ? 'Atualizar' : 'Salvar'}</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
};

export default TeamForm;
