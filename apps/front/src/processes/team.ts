import api from "@/api";

export interface TeamCreateData {
  cnpj: string;
  name: string;
  email: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface TeamUpdateData extends Partial<TeamCreateData> {
  id: string;
}

export interface TeamResponse {
  id: string;
  cnpj: string;
  name: string;
  email: string;
  address: {
    id: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    address: string;
    number: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTeamsResponse {
  items: TeamResponse[];
  total: number;
  page: number;
  totalPages: number;
  itemsPerPage: number;
}

export const createTeam = async (data: TeamCreateData): Promise<TeamResponse> => {
  const response = await api.post('/team', data);
  return response.data;
};

export const getTeams = async (page: number = 1, itemsPerPage: number = 10): Promise<PaginatedTeamsResponse> => {
  const response = await api.get('/team/all', {
    params: {
      page,
      items_per_page: itemsPerPage
    }
  });
  return response.data;
};

export const getTeamById = async (id: string): Promise<TeamResponse> => {
  const response = await api.get(`/team/${id}`);
  return response.data;
};

export const updateTeam = async (data: TeamUpdateData): Promise<TeamResponse> => {
  const response = await api.put(`/team/${data.id}`, data);
  return response.data;
};

export const deleteTeam = async (id: string): Promise<void> => {
  await api.delete(`/team/${id}`);
}; 