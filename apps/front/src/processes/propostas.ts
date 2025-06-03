import { useLojasStore } from '@/stores/lojas.store';
import { toast } from 'sonner';
import axios from 'axios';

export async function fetchPropostas({
	DT_INICIO,
	DT_FINAL,
	tokens
}: {
	DT_INICIO: string;
	DT_FINAL: string;
	tokens?: string[];
}) {
	const lojasStore = useLojasStore.getState();
	const lojas = lojasStore.lojas;

	if (!lojas) {
		toast.error('Lojas não encontradas');
		return [];
	}

	const lojasTokens = lojas.map((loja) => loja.token_whatsapp);

	const response = await axios.post(
		'https://webhook.n8n.sagzap.com.br/webhook/propostas',
		{
			dataInicial: DT_INICIO,
			dataFinal: DT_FINAL,
			tokens: tokens ? tokens : lojasTokens
		}
	);

	if (!response.data[0].propostas) {
		toast.error('Erro ao buscar propostas');
		return [];
	}

	return response.data[0].propostas;
}
