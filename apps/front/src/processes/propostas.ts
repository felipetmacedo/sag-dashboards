import { useLojasStore } from '@/stores/lojas.store';
import { toast } from 'sonner';
import axios from 'axios';
import { Proposta } from '@/types/proposta';

export async function fetchPropostas({
	DT_INICIO,
	DT_FINAL,
	codhda
}: {
	DT_INICIO: string;
	DT_FINAL: string;
	codhda?: string[];
}) {
	const lojasStore = useLojasStore.getState();
	const lojas = lojasStore.lojas;

	if (!lojas) {
		toast.error('Lojas não encontradas');
		return [];
	}

	const lojasCodhda = lojas.map((loja) => loja.codhda);

	const response = await axios.post(
		'https://n8n.48tnew.sagzap.com.br/webhook/propostas',
		{
			dataInicial: DT_INICIO,
			dataFinal: DT_FINAL,
			codhda: codhda ? codhda : lojasCodhda
		}
	);

	if (!response.data[0].propostas) {
		toast.error('Erro ao buscar propostas');
		return [];
	}

	response.data[0].propostas.forEach((proposta: Proposta) => {
		proposta.NOME_VENDEDOR = proposta?.NOME_VENDEDOR?.trim().split(' ').slice(0, 3).join(' ') || null;
	});

	return response.data[0].propostas;
}
