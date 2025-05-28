import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user.store';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import {
	getRequests,
	createRequest,
	Request,
	updateRequest,
	deleteRequest,
} from '@/processes/request';

// Status types for filtering
export type RequestStatus =
	| 'Todos'
	| 'Pendente'
	| 'Assinado'
	| 'Enviado'
	| 'Limpo';

// Interface for a request row
export interface RequestRow {
	id: string;
	name: string;
	cpf_cnpj: string;
	phone: string;
	email: string;
	is_serasa_clean: boolean;
	is_boa_vista_clean: boolean;
	is_cenprot_clean: boolean;
	is_spc_clean: boolean;
	is_quod_clean: boolean;
	createdAt: string;
}

// Form data for editing requests
export interface RequestFormData {
	id?: string;
	cpf_cnpj: string;
	name: string;
	phone?: string;
	email?: string;
	is_serasa_clean?: boolean;
	is_boa_vista_clean?: boolean;
	is_cenprot_clean?: boolean;
	is_spc_clean?: boolean;
	is_quod_clean?: boolean;
}

export default function RequestsContainer() {
	const { userInfo } = useUserStore();
	const [editingRequest, setEditingRequest] = useState<Request | null>(null);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [startDate, setStartDate] = useState<string | null>(null);
	const [endDate, setEndDate] = useState<string | null>(null);
	const [selectedStatus, setSelectedStatus] =
		useState<RequestStatus>('Todos');
	const [showForm, setShowForm] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ['requests', page, itemsPerPage, startDate, endDate, searchTerm, selectedStatus],
		queryFn: () =>
			getRequests({
				page,
				itemsPerPage,
				startDate: startDate || undefined,
				endDate: endDate || undefined,
				searchTerm,
				status: selectedStatus !== 'Todos' ? selectedStatus : undefined,
			}),
	});

	// Check if user has specific permission
	const hasPermission = useCallback(
		(permissionName: string, module: string) => {
			if (!userInfo?.permissions) return false;
			return userInfo.permissions.some(
				(perm) => perm.name === permissionName && perm.module === module
			);
		},
		[userInfo]
	);

	// Memorized permissions
	const canCreateRequest = hasPermission('CREATE', 'REQUESTS');
	const canUpdateRequest = hasPermission('UPDATE', 'REQUESTS');
	const canDeleteRequest = hasPermission('DELETE', 'REQUESTS');

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: async (params: {
			id: string;
			data: RequestFormData;
		}): Promise<Request> => {
			const data = await updateRequest(params.id, params.data);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['requests'] });
			setEditingRequest(null);
			setShowForm(false);
			toast.success('Nome atualizado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao atualizar nome');
			console.error(error);
		},
		});

	// Create mutation
	const createRequestMutation = useMutation({
		mutationFn: async (body: RequestFormData): Promise<Request> => {
			const data = await createRequest(body);
			setEditingRequest(null);
			setShowForm(false);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['requests'] });
			setEditingRequest(null);
			toast.success('Nome criado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao criar nome');
			console.error(error);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string): Promise<boolean> => {
			const data = await deleteRequest(id);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['requests'] });
			toast.success('Nome deletado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao deletar nome');
			console.error(error);
		},
	});

	// Form submit handler
	const handleSaveRequest = useCallback(
		async (data: RequestFormData) => {
			setIsSubmitting(true);
			if (editingRequest?.id) {
				await updateMutation.mutateAsync({ id: editingRequest.id, data });
			} else {
				await createRequestMutation.mutateAsync(data);
			}
			setIsSubmitting(false);
		},
		[updateMutation, createRequestMutation, editingRequest]
	);

	const handleEditRequest = useCallback(
			(request: Request) => {
				setEditingRequest(request);
				setShowForm(true);
			},
			[setEditingRequest, setShowForm]
		);

	// Handle page change
	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	// Handle search
	const handleSearch = useCallback((term: string) => {
		setSearchTerm(term);
		setPage(1); // Reset to first page on search
	}, []);

	// Handle status filter change
	const handleStatusChange = useCallback((status: RequestStatus) => {
		setSelectedStatus(status);
		setPage(1); // Reset to first page on status change
	}, []);

	return {
		requests: data,
		page,
		hasPermission,
		canCreateRequest,
		canUpdateRequest,
		canDeleteRequest,
		setPage,
		itemsPerPage,
		setItemsPerPage,
		searchTerm,
		setSearchTerm: handleSearch,
		editingRequest,
		setEditingRequest,
		handleSaveRequest,
		isLoading,
		isSubmitting,
		deleteMutation,
		handlePageChange,
		totalPages: data?.totalPages || 1,
		selectedStatus,
		handleStatusChange,
		showForm,
		setShowForm,
		handleEditRequest,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
	};
}
