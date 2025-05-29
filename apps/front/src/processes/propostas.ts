import { useTokenStore } from '@/stores/token.store';
import { toast } from 'sonner';
import axios from 'axios';

export async function fetchPropostas({
	DT_INICIO,
	DT_FINAL,
}: {
	DT_INICIO: string;
	DT_FINAL: string;
}) {
	const tokenStore = useTokenStore.getState();
	const token = tokenStore.token;
	if (!token) {
		toast.error('Token não encontrado');
		return [];
	}

	const response = await axios.post(
		'https://n8n.sagzap.com.br/webhook/propostas',
		{
			codhda: token,
			dataInicial: DT_INICIO,
			dataFinal: DT_FINAL,
			token: '73f4eaa45b90a00e8834d951074ba042',
		}
	);
	if (!response.data.propostas) {
		toast.error('Erro ao buscar propostas');
		return [];
	}
	return response.data.propostas;
}
