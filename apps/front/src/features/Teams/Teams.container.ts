import { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user.store';
import { TeamFormData } from '@/components/team/TeamForm';
import {
	createTeam,
	getTeams,
	deleteTeam,
	updateTeam,
	TeamResponse
} from '@/processes/team';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the Team interface to match our UI needs and API response
export interface Team {
	id: string;
	cnpj: string;
	name: string;
	email: string;
	address: {
		number: string;
		complement?: string;
		neighborhood: string;
		city: string;
		state: string;
		cep: string;
		address?: string;
	};
	created_at: string;
	updated_at: string;
}

// Utility function to convert TeamResponse to Team interface
const teamResponseToTeam = (teamResponse: TeamResponse): Team => {
	// Ensure valid date conversion
	const safeDate = (dateStr: string | undefined): string => {
		if (!dateStr) return new Date().toISOString();

		// No need for try/catch, just check if the date is valid
		const date = new Date(dateStr);
		// Check if date is valid
		if (!isNaN(date.getTime())) {
			return date.toISOString();
		}
		return new Date().toISOString();
	};

	return {
		id: teamResponse.id,
		cnpj: teamResponse.cnpj,
		name: teamResponse.name,
		email: teamResponse.email,
		address: {
			number: teamResponse.address.number || '',
			complement: teamResponse.address.complement || '',
			neighborhood: teamResponse.address.neighborhood || '',
			city: teamResponse.address.city || '',
			state: teamResponse.address.state || '',
			cep: teamResponse.address.cep || '',
			address: teamResponse.address.address || ''
		},
		created_at: safeDate(teamResponse.createdAt),
		updated_at: safeDate(teamResponse.updatedAt),
	};
};

export default function TeamsContainer() {
	const { userInfo } = useUserStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [page, setPage] = useState(1);
	const [itemsPerPage] = useState(10);
	const queryClient = useQueryClient();

	// Use react-query to fetch teams with pagination
	const { data, isLoading } = useQuery({
		queryKey: ['teams', page, itemsPerPage],
		queryFn: () => getTeams(page, itemsPerPage),
	});

	// Directly manage pagination state
	const currentPage = page;
	const currentTotalPages = data?.totalPages || 1;

	// Create mutation
	const createMutation = useMutation({
		mutationFn: createTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			toast.success('Líder criado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao criar líder');
			console.error(error);
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: updateTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			toast.success('Líder atualizado com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao atualizar líder');
			console.error(error);
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: deleteTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['teams'] });
			toast.success('Líder excluído com sucesso!');
		},
		onError: (error) => {
			toast.error('Erro ao excluir líder');
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
	const canCreateTeam = useMemo(
		() => hasPermission('CREATE', 'TEAMS'),
		[hasPermission]
	);
	const canUpdateTeam = useMemo(
		() => hasPermission('UPDATE', 'TEAMS'),
		[hasPermission]
	);
	const canDeleteTeam = useMemo(
		() => hasPermission('DELETE', 'TEAMS'),
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
			setEditingTeam(null);
		}
	}, []);

	// Edit team handler
	const handleEditTeam = useCallback(
		(team: Team) => {
			if (!canUpdateTeam) {
				toast.error('Você não tem permissão para editar líderes.');
				return;
			}

			setEditingTeam(team);
			setShowForm(true);
		},
		[canUpdateTeam]
	);

	// Delete team handler
	const handleDeleteTeam = useCallback(
		async (id: string) => {
			if (!canDeleteTeam) {
				toast.error('Você não tem permissão para excluir líderes.');
				return;
			}

			try {
				deleteMutation.mutate(id);
			} catch (error) {
				toast.error('Erro ao excluir líder');
				console.error(error);
			}
		},
		[canDeleteTeam, deleteMutation]
	);

	// Form submission handler
	const handleSaveTeam = useCallback(
		async (data: TeamFormData) => {
			// Check permissions based on whether editing or creating
			if (editingTeam && !canUpdateTeam) {
				toast.error('Você não tem permissão para editar líderes.');
				return;
			} else if (!editingTeam && !canCreateTeam) {
				toast.error('Você não tem permissão para criar líderes.');
				return;
			}

			try {
				if (editingTeam) {
					// Update existing team
					updateMutation.mutate({
						id: editingTeam.id,
						...data,
					});
				} else {
					// Create new team
					createMutation.mutate(data);
				}

				setShowForm(false);
				setEditingTeam(null);
			} catch (error) {
				toast.error(
					editingTeam
						? 'Erro ao atualizar líder'
						: 'Erro ao criar líder'
				);
				console.error(error);
			}
		},
		[editingTeam, canCreateTeam, canUpdateTeam, createMutation, updateMutation]
	);

	// Cancel form handler
	const handleCancelForm = useCallback(() => {
		setShowForm(false);
		setEditingTeam(null);
	}, []);

	// Handle page change
	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	// Derive teams array from the paginated response
	const teams = useMemo(() => {
		if (!data) return [];
		return data.items.map(teamResponseToTeam);
	}, [data]);

	// Memoize the filtered teams to avoid recalculation on every render
	const filteredTeams = useMemo(
		() =>
			teams.filter(
				(team) =>
					team.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					team.cnpj
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					team.email
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					(team.address.city + ' ' + team.address.state)
						.toLowerCase()
						.includes(searchTerm.toLowerCase())
			),
		[teams, searchTerm]
	);

	return {
		teams: filteredTeams,
		loading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
		searchTerm,
		setSearchTerm: handleSetSearchTerm,
		handleEditTeam,
		handleDeleteTeam,
		handleSaveTeam,
		handleCancelForm,
		editingTeam,
		showForm,
		setShowForm: handleShowForm,
		canCreateTeam,
		canUpdateTeam,
		canDeleteTeam,
		page: currentPage,
		itemsPerPage,
		handlePageChange,
		totalItems: data?.total || 0,
		totalPages: currentTotalPages
	};
}
