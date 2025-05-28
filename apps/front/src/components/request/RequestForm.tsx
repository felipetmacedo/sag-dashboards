import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';

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
import { Request } from '@/processes/request';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Form utilities
import {
	createRequiredStringField,
	createOptionalStringField,
} from '@/utils/form-utils';

// Form validation schema
const formSchema = z.object({
	id: z.string().optional(),
	cpf_cnpj: createRequiredStringField('CPF/CNPJ'),
	name: createRequiredStringField('Nome'),
	email: z.string().email('Email inválido'),
	phone: createOptionalStringField(),
	cep: createRequiredStringField('CEP'),
	address: createRequiredStringField('Endereço'),
	number: createRequiredStringField('Número'),
	complement: createRequiredStringField('Complemento'),
	neighborhood: createRequiredStringField('Bairro'),
	city: createRequiredStringField('Cidade'),
	state: createRequiredStringField('Estado'),
});

// Define the form data type from the schema
type FormData = z.infer<typeof formSchema>;

export interface RequestFormData {
	cpf_cnpj: string;
	name: string;
	email: string;
	phone: string;
	cep: string;
	address: string;
	number: string;
	complement: string;
	neighborhood: string;
	city: string;
	state: string;
}

interface RequestFormProps {
	request: Request | null;
	onSave: (data: RequestFormData) => void;
	onCancel: () => void;
	isSubmitting: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({
	request,
	onSave,
	onCancel,
	isSubmitting,
}) => {
	const isEditing = !!request?.id;
	const [alertOpen, setAlertOpen] = useState(false);
	const [isSearchingCep, setIsSearchingCep] = useState(false);

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			cpf_cnpj: request?.cpf_cnpj || '',
			name: request?.name || '',
			email: request?.email || '',
			phone: request?.phone || '',
			cep: request?.cep || '',
			address: request?.address || '',
			number: request?.number || '',
			complement: request?.complement || '',
			neighborhood: request?.neighborhood || '',
			city: request?.city || '',
			state: request?.state || '',
		},
	});

	const handleSubmit = useCallback(() => {
		setAlertOpen(true);
	}, []);

	const confirmSubmit = useCallback(() => {
		const data = form.getValues();
		onSave(data as RequestFormData);
		setAlertOpen(false);
	}, [form, onSave]);

	const searchCepAddress = useCallback(
		async (cep: string) => {
			if (!cep || cep.length !== 8) return;

			try {
				setIsSearchingCep(true);
				const formattedCep = cep.replace(/\D/g, '');
				const response = await fetch(
					`https://viacep.com.br/ws/${formattedCep}/json/`
				);
				const addressData = await response.json();

				if (!addressData.erro) {
					form.setValue('address', addressData.logradouro || '');
					form.setValue('neighborhood', addressData.bairro || '');
					form.setValue('city', addressData.localidade || '');
					form.setValue('state', addressData.uf || '');
				}
			} catch (error) {
				console.error('Error fetching CEP data:', error);
			} finally {
				setIsSearchingCep(false);
			}
		},
		[form]
	);

	useEffect(() => {
		const cepSubscription = form.watch((value, { name }) => {
			if (name === 'cep') {
				const cep = value.cep as string;
				if (cep && cep.replace(/\D/g, '').length === 8) {
					searchCepAddress(cep.replace(/\D/g, ''));
				}
			}
		});

		return () => cepSubscription.unsubscribe();
	}, [form, searchCepAddress]);

	const handleCancel = useCallback(() => {
		form.reset();
		onCancel();
	}, [form, onCancel]);

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-6"
			>
				<h2 className="text-xl font-bold">
					{isEditing ? 'Editar Nome' : 'Novo nome'}
				</h2>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="cpf_cnpj"
						render={({ field }) => (
							<FormItem>
								<FormLabel>CPF/CNPJ</FormLabel>
								<FormControl>
									<Input
										placeholder="000.000.000-00 ou 00.000.000/0000-00"
										{...field}
									/>
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
									<Input
										placeholder="Nome completo"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Telefone</FormLabel>
								<FormControl>
									<Input
										placeholder="(00) 00000-0000"
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
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="email@example.com"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="cep"
						render={({ field }) => (
							<FormItem>
								<FormLabel>CEP</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder="00000-000"
											{...field}
											onChange={(e) => {
												// Format CEP input (00000-000)
												let value =
													e.target.value.replace(
														/\D/g,
														''
													);
												if (value.length > 5) {
													value = value.replace(
														/^(\d{5})(\d)/,
														'$1-$2'
													);
												}
												if (value.length > 9) {
													value = value.substring(
														0,
														9
													);
												}
												field.onChange(value);

												// Auto-search when CEP is complete
												if (
													value.replace(/\D/g, '')
														.length === 8
												) {
													searchCepAddress(
														value.replace(/\D/g, '')
													);
												}
											}}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute right-0 top-0 h-full px-3"
											onClick={() => {
												const cep =
													field.value?.replace(
														/\D/g,
														''
													);
												if (cep && cep.length === 8) {
													searchCepAddress(cep);
												}
											}}
											disabled={isSearchingCep}
										>
											{isSearchingCep ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												<Search className="h-4 w-4" />
											)}
										</Button>
									</div>
								</FormControl>
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
										placeholder="Apartamento, Bloco, etc."
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
									<Input placeholder="Estado" {...field} />
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
						onClick={handleCancel}
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

				<AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Confirmação de Envio
							</AlertDialogTitle>
							<AlertDialogDescription>
								Ao prosseguir, um link para assinatura será
								enviado para o email {form.getValues().email}. A
								plataforma AUTENTIQUE será utilizada para o
								processo de assinatura digital.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setAlertOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								type="button"
								onClick={confirmSubmit}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processando...
									</>
								) : (
									'Confirmar'
								)}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</form>
		</Form>
	);
};

export default RequestForm;
