import api from '@/api'
import { List } from './list';

export interface Request {
  id: string;
  cpf_cnpj: string;
  name: string;
  phone?: string;
  status?: string;
  email?: string;
  list: List;
  is_serasa_clean?: boolean;
  is_boa_vista_clean?: boolean;
  is_cenprot_clean?: boolean;
  is_spc_clean?: boolean;
  is_quod_clean?: boolean;
  created_at: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface UpdateRequestPayload {
  cpf_cnpj: string;
  name: string;
  phone?: string;
  email?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface ChangeStatusPayload {
  is_serasa_clean?: boolean;
  is_boa_vista_clean?: boolean;
  is_cenprot_clean?: boolean;
  is_spc_clean?: boolean;
  is_quod_clean?: boolean;  
}

export interface CreateRequestPayload {
  cpf_cnpj: string;
  name: string;
  phone?: string;
  email?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export interface RequestListQueryParams {
  page?: number;
  itemsPerPage?: number;
  searchTerm?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  listId?: number;
}

export interface RequestListResponse {
  items: Request[];
  requests_count: number;
  pending_count: number;
  signed_count: number;
  sent_count: number;
  clean_count: number;
  totalPages: number;
  itemsPerPage: number;
}

export const getRequests = async (params: RequestListQueryParams): Promise<RequestListResponse> => {
  const { data } = await api.get<RequestListResponse>('/request', { params });
  return data;
} 

export const createRequest = async (payload: CreateRequestPayload): Promise<Request> => {
  const { data } = await api.post<Request>('/request', payload);
  return data;
}

export const updateRequest = async (requestId: string, payload: UpdateRequestPayload): Promise<Request> => {
  const { data } = await api.put<Request>(`/request/${requestId}`, payload);
  return data;
}

export const changeStatus = async (requestId: string, payload: ChangeStatusPayload): Promise<Request> => {
  const { data } = await api.put<Request>(`/request/${requestId}/status`, payload);
  return data;
}

export const getRequestById = async (requestId: string): Promise<Request> => {
  const { data } = await api.get<Request>(`/request/${requestId}`);
  return data;
}

export const deleteRequest = async (requestId: string): Promise<boolean> => {
  await api.delete(`/request/${requestId}`);
  return true;
}