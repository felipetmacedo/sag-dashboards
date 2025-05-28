import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
	User,
	CreateUserPayload,
	UpdateUserPayload
} from '@/processes/user';

// Interface for our component
export interface UserRow {
	id: string;
	name: string;
	email: string;
	phone_number: string;
	document: string;
	address: string;
	number: string;
	complement: string;
	neighborhood: string;
	city: string;
	state: string;
	cep: string;
	createdAt: string;
}

// Form data for user creation/editing
export interface UserFormData {
	id?: string;
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

// Convert API response to our component format
const userToUserRow = (user: User): UserRow => {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		phone_number: user.phone_number || '',
		document: user.document || '',
		address: user.address || '',
		number: user.number || '',
		complement: user.complement || '',
		neighborhood: user.neighborhood || '',
		city: user.city || '',
		state: user.state || '',
		cep: user.cep || '',
		createdAt: new Date().toISOString(), // We don't have createdAt from API, this is a placeholder
	};
};

export default function UsersContainer() {
	const { userInfo } = useUserStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [editingUser, setEditingUser] = useState<UserRow | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [page, setPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const queryClient = useQueryClient();

	// Use react-query to fetch users with pagination and filtering
	const { data, isLoading } = useQuery({
		queryKey: ['users', page, itemsPerPage, searchTerm],
		queryFn: () => getUsers(page, itemsPerPage, {
			name: searchTerm,
			document: searchTerm,
			email: searchTerm,
			phone_number: searchTerm,
		}),
	});

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('Usuário criado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao criar usuário');
			console.error(error);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (params: { id: string; data: UpdateUserPayload }) => 
			updateUser(params.id, params.data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('Usuário atualizado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao atualizar usuário');
			console.error(error);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['users'] });
			toast.success('Usuário excluído com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao excluir usuário');
			console.error(error);
		},
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

	// Memoized permission checks
	const canCreateUser = useMemo(
		() => hasPermission('CREATE', 'USERS'),
		[hasPermission]
	);
	
	const canUpdateUser = useMemo(
		() => hasPermission('UPDATE', 'USERS'),
		[hasPermission]
	);
	
	const canDeleteUser = useMemo(
		() => hasPermission('DELETE', 'USERS'),
		[hasPermission]
	);

	// Set search term with useCallback
	const handleSetSearchTerm = useCallback((value: string) => {
		setSearchTerm(value);
	}, []);

	// Show/hide form with useCallback
	const handleShowForm = useCallback((value: boolean) => {
		setShowForm(value);
		if (!value) {
			setEditingUser(null);
		}
	}, []);

	// Edit user handler
	const handleEditUser = useCallback(
		(user: UserRow) => {
			if (!canUpdateUser) {
				toast.error('Você não tem permissão para editar usuários.');
				return;
			}

			setEditingUser(user);
			setShowForm(true);
		},
		[canUpdateUser]
	);

	// Delete user handler
	const handleDeleteUser = useCallback(
		async (id: string) => {
			if (!canDeleteUser) {
				toast.error('Você não tem permissão para excluir usuários.');
				return;
			}

			try {
				deleteMutation.mutate(id);
			} catch (error) {
				toast.error('Erro ao excluir usuário');
				console.error(error);
			}
		},
		[canDeleteUser, deleteMutation]
	);

	// Form submission handler
	const handleSaveUser = useCallback(
		async (data: UserFormData) => {
			// Check permissions based on whether editing or creating
			if (editingUser && !canUpdateUser) {
				toast.error('Você não tem permissão para editar usuários.');
				return;
			} else if (!editingUser && !canCreateUser) {
				toast.error('Você não tem permissão para criar usuários.');
				return;
			}

			try {
				if (editingUser) {
					// Update existing user
					const updatePayload: UpdateUserPayload = {
						name: data.name,
						email: data.email,
						phone_number: data.phone_number,
						document: data.document,
						cep: data.cep,
						address: data.address,
						number: data.number,
						complement: data.complement,
						neighborhood: data.neighborhood,
						city: data.city,
						state: data.state
					};

					updateMutation.mutate({ id: editingUser.id, data: updatePayload });
				} else {
					// Create new user
					const createPayload: CreateUserPayload = {
						name: data.name,
						email: data.email,
						phone_number: data.phone_number,
						document: data.document,
						cep: data.cep,
						address: data.address,
						number: data.number,
						complement: data.complement,
						neighborhood: data.neighborhood,
						city: data.city,
						state: data.state
					};

					createMutation.mutate(createPayload);
				}

				setShowForm(false);
				setEditingUser(null);
			} catch (error) {
				toast.error(
					editingUser
						? 'Erro ao atualizar usuário'
						: 'Erro ao criar usuário'
				);
				console.error(error);
			}
		},
		[editingUser, canCreateUser, canUpdateUser, createMutation, updateMutation]
	);

	// Handle page change
	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	// Handle page size change
	const handleItemsPerPageChange = useCallback((newPageSize: number) => {
		setItemsPerPage(newPageSize);
		setPage(1); // Reset to first page when changing page size
	}, []);

	// Derive users array from the paginated response
	const users = useMemo(() => {
		if (!data) return [];
		return data.items.map(userToUserRow);
	}, [data]);

	return {
		users,
		loading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
		searchTerm,
		setSearchTerm: handleSetSearchTerm,
		handleEditUser,
		handleDeleteUser,
		handleSaveUser,
		handleCancelForm: () => setShowForm(false),
		editingUser,
		showForm,
		setShowForm: handleShowForm,
		canCreateUser,
		canUpdateUser,
		canDeleteUser,
		page,
		itemsPerPage,
		handlePageChange,
		handleItemsPerPageChange,
		totalItems: data?.total || 0,
		totalPages: data?.totalPages || 1
	};
} 