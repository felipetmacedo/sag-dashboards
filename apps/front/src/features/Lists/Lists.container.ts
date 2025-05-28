import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user.store';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getLists, createList, updateList, List, CreateListPayload, UpdateListPayload, deleteList } from '@/processes/list';

// Interface para nosso componente
export interface ListRow {
	id: string;
	name: string;
	status: string;
	due_date: Date;
	createdAt: string;
	updatedAt: string;
	requests_count: number;
}

// Dados do formulário para criação/edição de listas
export interface ListFormData {
	id?: string;
	name: string;
	status: string;
	due_date: Date;
}

// Converter resposta da API para o formato do nosso componente
const listToListRow = (list: List): ListRow => {
	return {
		id: list.id,
		name: list.name,
		status: list.status || '',
		due_date: new Date(list.due_date || new Date()),
		createdAt: list.createdAt || new Date().toISOString(),
		updatedAt: list.updatedAt || new Date().toISOString(),
		requests_count: list.requests_count || 0,
	};
};

export default function ListsContainer() {
	const { userInfo } = useUserStore();
	const [editingList, setEditingList] = useState<List | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [startDate, setStartDate] = useState<string | null>(null);
	const [endDate, setEndDate] = useState<string | null>(null);

	const queryClient = useQueryClient();

	const [status, setStatus] = useState<string | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ['lists', page, itemsPerPage, startDate, endDate, status],
		queryFn: () => getLists(page, itemsPerPage, {
			start_date: startDate,
			end_date: endDate,
			status: status,
		}),
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createList,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['lists'] });
			setShowForm(false);
			setEditingList(null);
			toast.success('Lista criada com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao criar lista');
			console.error(error);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (params: { id: string; data: UpdateListPayload }) => 
			updateList(params.id, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['lists'] });
			setShowForm(false);
			setEditingList(null);
			toast.success('Lista atualizada com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao atualizar lista');
			console.error(error);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteList,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['lists'] });
			toast.success('Lista excluída com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao excluir lista');
			console.error(error);
		},
	});


	const lists = (data?.items || []).map(listToListRow);

	// Verificar se o usuário tem permissão específica
	const hasPermission = useCallback(
		(permissionName: string, module: string) => {
			if (!userInfo?.permissions) return false;
			return userInfo.permissions.some(
				(perm) => perm.name === permissionName && perm.module === module
			);
		},
		[userInfo]
	);

	// Permissões memorizadas
	const canCreateList = hasPermission('CREATE', 'LISTS');
	const canUpdateList = hasPermission('UPDATE', 'LISTS');

	// Mostrar/esconder formulário com useCallback
	const handleShowForm = useCallback((value: boolean) => {
		setShowForm(value);
		if (!value) {
			setEditingList(null);
		}
	}, []);

	// Handler de edição de lista
	const handleEditList = useCallback(
		(list: ListRow) => {
			setEditingList(list as unknown as List);
			setShowForm(true);
		},
		[setEditingList, setShowForm]
	);

	// Handler de envio do formulário
	const handleSaveList = useCallback(
		async (data: ListFormData) => {
			// Verificar permissões com base em se está editando ou criando
			if (editingList && !canUpdateList) {
				toast.error('Você não tem permissão para editar listas.');
				return;
			} else if (!editingList && !canCreateList) {
				toast.error('Você não tem permissão para criar listas.');
				return;
			}

			try {

				if (editingList) {
					// Atualizar lista existente
					const updatePayload: UpdateListPayload = {
						name: data.name,
						status: data.status,
						due_date: data.due_date.toISOString(),
					};

					await updateList(editingList.id, updatePayload);
					toast.success('Lista atualizada com sucesso!');
				} else {
					// Criar nova lista
					const createPayload: CreateListPayload = {
						name: data.name,
						status: data.status,
						due_date: data.due_date.toISOString(),
					};

					await createList(createPayload);
					toast.success('Lista criada com sucesso!');
				}

				// Refetch lists after create/update
				await queryClient.invalidateQueries({ queryKey: ['lists'] });
				setShowForm(false);
				setEditingList(null);

			} catch (error) {
				toast.error(
					editingList
						? 'Erro ao atualizar lista'
						: 'Erro ao criar lista'
				);
				console.error(error);
			}
		},
		[editingList, canCreateList, canUpdateList, queryClient]
	);

	// Handler de cancelamento do formulário
	const handleCancelForm = useCallback(() => {
		setShowForm(false);
		setEditingList(null);
	}, []);

	// Memorizar as listas filtradas para evitar recálculo em cada renderização
	// Handle page change
	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	// Handle page size change
	const handleItemsPerPageChange = useCallback((newPageSize: number) => {
		setItemsPerPage(newPageSize);
		setPage(1); // Reset to first page when changing page size
	}, []);

	return {
		lists,
		page,
		setPage,
		itemsPerPage,
		setItemsPerPage,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		status,
		setStatus,
		editingList,
		setEditingList,
		showForm,
		setShowForm: handleShowForm,
		hasPermission,
		handleEditList,
		handleSaveList,
		handleCancelForm,
		canCreateList,
		canUpdateList,
		isLoading,
		createMutation,
		updateMutation,
		deleteMutation,
		handlePageChange,
		handleItemsPerPageChange,
		totalPages: data?.totalPages || 1
	};
}