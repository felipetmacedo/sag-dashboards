import api from '@/api'

export interface User {
  id: string
  email: string
  name: string
  phone_number: string
  document?: string
  cep?: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  isAdmin: boolean
  permissions: object[]
  team: {
    plan_status: string
    name: string
  }
}

export interface PaginatedUsersResponse {
  items: User[];
  total: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  phone_number?: string
  document?: string
  cep?: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  oldPassword?: string
  newPassword?: string
  confirmNewPassword?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  phone_number?: string
  document: string
  cep: string
  address: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export const getUserInfo = async (): Promise<User | null> => {
  try {
      const { data } = await api.get<User>('/user/info');

      return data
    } catch {
      return null
  }
}

export const updateUser = async (userId: string, payload: UpdateUserPayload): Promise<User> => {
  const { data } = await api.put<User>(`/user/${userId}`, payload);

  return data;
}

export const updateUserProfile = async (payload: UpdateUserPayload): Promise<User> => {
  const { data } = await api.put<User>('/user', payload);

  return data;
}

export interface UserFilters {
  name?: string;
  document?: string;
  email?: string;
  phone_number?: string;
  city?: string;
  state?: string;
}

export const getUsers = async (
  page: number = 1,
  itemsPerPage: number = 10,
  filters: UserFilters = {}
): Promise<PaginatedUsersResponse> => {
  const { data } = await api.get<PaginatedUsersResponse>('/user', {
    params: {
      page,
      items_per_page: itemsPerPage,
      ...filters
    }
  });
  return data;
}

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await api.post<User>('/user', payload);
  return data;
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  await api.delete(`/user/${userId}`);
  return true;
}
