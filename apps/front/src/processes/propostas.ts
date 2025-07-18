import { useLojasStore } from '@/stores/lojas.store';
import { toast } from 'sonner';
import axios from 'axios';
import { Proposta } from '@/types/proposta';

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
		'https://n8n.48tnew.sagzap.com.br/webhook/propostas',
		{
			dataInicial: DT_INICIO,
			dataFinal: DT_FINAL,
			tokens: tokens ? tokens : lojasTokens
		}
	);

	console.log(response.data[0].propostas)

	if (!response.data[0].propostas) {
		toast.error('Erro ao buscar propostas');
		return [];
	}

	response.data[0].propostas.forEach((proposta: Proposta) => {
		proposta.NOME_VENDEDOR = proposta?.NOME_VENDEDOR?.trim().split(' ').slice(0, 3).join(' ') || null;
	});

	return response.data[0].propostas;
}
