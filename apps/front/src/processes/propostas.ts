import { useTokenStore } from '@/stores/token.store';
import { usePropostasStore } from '@/stores/propostas.store';
import axios from 'axios';

export async function fetchPropostas({
	DT_INICIO,
	DT_FINAL,
}: {
	DT_INICIO: string;
	DT_FINAL: string;
}) {
	const tokenStore = useTokenStore.getState();
	const propostaStore = usePropostasStore.getState();
	const token = tokenStore.token;
	if (!token) throw new Error('Token não encontrado');

	const response = await axios.post('https://n8n.sagzap.com.br/webhook/propostas', {
		codhda: token,
		dataInicial: DT_INICIO,
		dataFinal: DT_FINAL,
		token: '73f4eaa45b90a00e8834d951074ba042',
	});
	propostaStore.setPropostas(response.data.propostas);
	return response.data.propostas;
}
