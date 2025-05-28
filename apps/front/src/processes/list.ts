import api from '@/api'
import { Request } from '@/processes/request';

export interface List {
  id: string;
  name: string;
  status?: string;
  due_date?: string;
  createdAt?: string;
  updatedAt?: string;
  requests_count?: number;
  is_deleted?: boolean;
}

export interface UpdateListPayload {
  name?: string;
  status?: string;
  due_date?: string;
}

export interface CreateListPayload {
  name: string;
  status?: string;
  due_date?: string;
}

export interface ListViewResponse {
  created_at: string;
  id: string;
  name: string;
  requests_count: number;
  status: string;
  due_date: string;
  requests: {
    items: Request[];
    totalPages: number;
    itemsPerPage: number;
  }
}

export interface GetListsResponse {
  items: List[];
  totalPages: number;
  itemsPerPage: number;
}

export const getLists = async (page = 1, itemsPerPage = 10, filters: Record<string, any> = {}): Promise<GetListsResponse> => {
  const params = { page, items_per_page: itemsPerPage, ...filters };
  const { data } = await api.get<GetListsResponse>('/list', { params });
  return data;
}

export const createList = async (payload: CreateListPayload): Promise<List> => {
  const { data } = await api.post<List>('/list', payload);
  return data;
}

export const updateList = async (listId: string, payload: UpdateListPayload): Promise<List> => {
  const { data } = await api.put<List>(`/list/${listId}`, payload);
  return data;
}

export const deleteList = async (listId: string): Promise<boolean> => {
  await api.delete(`/list/${listId}`);
  return true;
}

export const getListById = async (listId: string, params: Record<string, any> = {}): Promise<ListViewResponse> => {
  const { data } = await api.get(`/list/${listId}`, { params });
  return data;
} 