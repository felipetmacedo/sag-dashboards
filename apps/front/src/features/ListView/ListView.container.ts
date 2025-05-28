import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useUserStore } from '@/stores/user.store';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getListById } from '@/processes/list';
import { changeStatus, Request } from '@/processes/request';

// Interface for a request row
export interface RequestRow {
  id: string;
  name: string;
  document_number: string;
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
  is_serasa_clean?: boolean;
  is_boa_vista_clean?: boolean;
  is_cenprot_clean?: boolean;
  is_spc_clean?: boolean;
  is_quod_clean?: boolean;
}

export default function ListViewContainer() {
  const { id: listId } = useParams<{ id: string }>();
  const { userInfo } = useUserStore();
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['list', listId, page, itemsPerPage, searchTerm],
    queryFn: () => getListById(listId!, {
      page,
      itemsPerPage,
      searchTerm
    }),
    enabled: !!listId,
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
  const canUpdateRequest = hasPermission('UPDATE', 'LISTS');

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; data: RequestFormData }) => {
      const data = await changeStatus(params.id, params.data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['list', listId] });
      setEditingRequest(null);
      toast.success('Nome atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar nome');
      console.error(error);
    },
  });

  // Form submit handler
  const handleSaveRequest = useCallback(
    async (data: RequestFormData) => {
      // Check permission for updating
      if (!canUpdateRequest) {
        toast.error('Você não tem permissão para editar nomes.');
        return;
      }

      try {
        if (data.id) {
          // Update existing request
          await updateMutation.mutateAsync({
            id: data.id,
            data: data
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [canUpdateRequest, updateMutation]
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

  return {
    list: data,
    page,
    hasPermission,
    setPage,
    itemsPerPage,
    setItemsPerPage,
    searchTerm,
    setSearchTerm: handleSearch,
    editingRequest,
    setEditingRequest,
    handleSaveRequest,
    canUpdateRequest,
    isLoading,
    updateMutation,
    handlePageChange,
    totalPages: data?.requests?.totalPages || 1
  };
}