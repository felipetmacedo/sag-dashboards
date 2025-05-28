import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user.store';
import { getInvitationLink, getInvitedUsers, setIndicationValue as setIndicationValueProcess } from '@/processes/invitation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function InvitationContainer() {
  const queryClient = useQueryClient();
  const { userInfo } = useUserStore();
  const [invitationLink, setInvitationLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [indicationValue, setIndicationValue] = useState(userInfo?.request_value || 0);
  const [valueError, setValueError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasOwnRequestValue, setHasOwnRequestValue] = useState(false);

  // Get invitation link on component mount
  useEffect(() => {
    const fetchInvitationLink = async () => {
      try {
        setLoading(true);
        const response = await getInvitationLink();
        setInvitationLink(response.token ? `${window.location.origin}/register?token=${response.token}` : response.link);
      } catch (error) {
        toast.error('Erro ao buscar link de convite');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationLink();
  }, []);

  // Fetch paginated invited users
  const { data: invitedUsersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ['invitedUsers'],
    queryFn: () => getInvitedUsers(),
  });
  
  // Effect to set hasOwnRequestValue based on userInfo
  useEffect(() => {
    if (userInfo?.request_value) {
      setHasOwnRequestValue(true);
    } else {
      setHasOwnRequestValue(false);
    }
  }, [userInfo]);
  
  // Mutation for setting indication value
  const { mutate: setIndicationValueMutation, isPending: isSettingIndicationValue } = useMutation({
    mutationFn: ({ value, users }: { value: number, users: string[] }) => 
      setIndicationValueProcess(value, users),
    onSuccess: () => {
      // Reset form state
      setDialogOpen(false);
      setIndicationValue(0);
      setValueError('');
      setSelectedUsers([]);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['invitedUsers'] });
      
      toast.success('Valor de indicação definido com sucesso!');
    },
    onError: (error: Error & { code?: string }) => {
      if(error.code === 'INDICATION_VALUE_LESS_THAN_REQUEST_VALUE') {
        toast.error(error.message);
      } else {
        toast.error('Erro ao definir valor de indicação');
      }
    }
  });
  
  // Handle setting indication value
  const handleSetIndicationValue = useCallback(() => {
    setIndicationValueMutation({ value: indicationValue, users: selectedUsers });
  }, [indicationValue, selectedUsers, setIndicationValueMutation]);
  
  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    return invitedUsersData?.items?.filter(
      (member) =>
        member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [invitedUsersData?.items, searchQuery]);
  
  // Handle user selection
  const toggleUserSelection = useCallback((userId: string) => {
    const user = invitedUsersData?.items?.find((member) => member.id === userId);
    if (user && user.request_value !== null && user.request_value !== undefined) {
      return; // Don't allow selection if user already has a request_value
    }

    setSelectedUsers((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  }, [invitedUsersData?.items]);
  
  // Handle select all
  const toggleSelectAll = useCallback(() => {
    const selectableUsers = filteredUsers.filter(
      (user) => user.request_value === null || user.request_value === undefined
    );

    if (selectedUsers.length === selectableUsers.length && selectableUsers.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(selectableUsers.map((user) => user.id));
    }
  }, [filteredUsers, selectedUsers.length]);
  
  // Handle input change with validation
  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIndicationValue(Number.parseFloat(e.target.value || '0'));
    setValueError('');
  }, []);

  // Handle copy link to clipboard
  const handleCopyLink = useCallback(() => {
    if (!invitationLink) return;
    
    try {
      const textArea = document.createElement('textarea');
      textArea.value = invitationLink;
      textArea.style.position = 'fixed';  // Prevent scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        toast.success('Link copiado para a área de transferência!');
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } else {
        toast.error('Erro ao copiar link');
      }
    } catch (error) {
      toast.error('Erro ao copiar link');
      console.error(error);
    }
  }, [invitationLink]);

  return {
    invitationLink,
    loading: loading || isUsersLoading,
    copied,
    handleCopyLink,
    userInfo,
    invitedUsers: invitedUsersData?.items || [],
    searchQuery,
    setSearchQuery,
    selectedUsers,
    setSelectedUsers,
    indicationValue,
    setIndicationValue,
    valueError,
    setValueError,
    dialogOpen,
    setDialogOpen,
    hasOwnRequestValue,
    filteredUsers,
    toggleUserSelection,
    toggleSelectAll,
    handleValueChange,
    handleSetIndicationValue,
    isSettingIndicationValue
  };
} 