import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@/components/ui/date-picker';
import { z } from 'zod';
import { useCallback } from 'react';
import { MutationFunction } from '@tanstack/react-query';

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

// Form utilities
import { CreateListPayload, UpdateListPayload, List } from '@/processes/list';

// Form validation schema
const formSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Nome'),
	status: z.string(),
	due_date: z.date().refine(
		(val) => {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			return val > today;
		},
		{ message: 'A data de vencimento deve ser maior que hoje.' }
	),
});

// Define the form data type from the schema
type FormData = z.infer<typeof formSchema>;

export interface ListFormData {
	name: string;
	status: string;
	due_date: Date;
}

interface ListFormProps {
	list: List | null;
	createMutation: MutationFunction<unknown, CreateListPayload>;
	updateMutation: MutationFunction<
		List,
		{ id: string; data: UpdateListPayload }
	>;
	onCancel: () => void;
}

const ListForm: React.FC<ListFormProps> = ({
	list,
	createMutation,
	updateMutation,
	onCancel,
}) => {
	const isEditing = !!list?.id;
	const listId = list?.id || '';

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: list?.name || '',
			status: list?.status || 'Aberta',
			due_date: list?.due_date ? new Date(list.due_date) : new Date(),
		},
	});

	const handleSubmit = useCallback(
		async (data: FormData) => {
			try {
				if (isEditing && listId) {
					await updateMutation({
						id: listId,
						data: {
							name: data.name,
							status: data.status,
							due_date:
								data.due_date instanceof Date
									? data.due_date.toISOString()
									: data.due_date,
						},
					});
				} else {
					await createMutation({
						name: data.name,
						status: data.status,
						due_date:
							data.due_date instanceof Date
								? data.due_date.toISOString()
								: data.due_date,
					});
				}
			} catch (error) {
				console.error('Error submitting form:', error);
			}
		},
		[isEditing, updateMutation, createMutation, listId]
	);

	const statusOptions = [
		{ value: 'Aberta', label: 'Aberta' },
		{ value: 'Enviada', label: 'Enviada' },
		{ value: 'Expirada', label: 'Expirada' },
		{ value: 'Finalizada', label: 'Finalizada' },
	];

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-6"
			>
				<h2 className="text-xl font-bold">
					{isEditing ? 'Editar Lista' : 'Criar Lista'}
				</h2>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input
										placeholder="Lista Especial de Natal"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Selecione o status" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{statusOptions.map((option) => (
											<SelectItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="due_date"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Data de Vencimento</FormLabel>
								<FormControl>
									<DatePicker
										value={field.value}
										onChange={field.onChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="flex justify-end space-x-4">
					<Button type="button" variant="outline" onClick={onCancel}>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={form.formState.isSubmitting}
					>
						<span>
							{isEditing ? 'Salvar Alterações' : 'Criar Lista'}
						</span>
					</Button>
				</div>
			</form>
		</Form>
	);
};

export default ListForm;
