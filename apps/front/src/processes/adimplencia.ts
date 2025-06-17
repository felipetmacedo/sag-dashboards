import axios from "axios";

export interface FetchAdimplenciaParams {
	DT_INICIO: string; // e.g. '2024-01-01'
	DT_FINAL: string; // e.g. '2024-01-31'
	codhda?: string[]; // array of loja codes (optional)
}

export interface AdimplenciaRow {
	codhda: string;
	cpfVendedor: string;
	nomeVendedor: string;
	parcela: string;
	totalPropostas: number;
	totalPago: number;
	totalPendente: number;
	percentualAdimplencia: number;
}

// Example fetch function. Adjust URL and params as needed.
export async function fetchAdimplencia(
	params: FetchAdimplenciaParams
): Promise<AdimplenciaRow[]> {
	const { DT_INICIO, DT_FINAL, codhda } = params;

    const response = await axios.post(
        'https://webhook.n8n.48tnew.sagzap.com.br/webhook/adimplencia',
        {
            dataInicial: DT_INICIO,
            dataFinal: DT_FINAL,
            codhda: codhda ?? []
        }
    );

    // The API returns an envelope with a 'propostas' array inside
    const apiEnvelope = response.data;
    if (Array.isArray(apiEnvelope)) {
        // If the response is an array, take the first element (as in the working example)
        const propostas = apiEnvelope[0]?.propostas || [];
        return propostas.map((item: any) => ({
            codhda: item.CODHDA,
            cpfVendedor: item.CPF_VENDEDOR,
            nomeVendedor: (item.NOME_VENDEDOR?.trim() || ''),
            parcela: item.parcela,
            totalPropostas: item["Total Propostas"] || 0,
            totalPago: item.Paga || 0,
            totalPendente: item.Pendente || 0,
            percentualAdimplencia: parseFloat(item["% Adimplencia"]) || 0,
        }));
    } else if (apiEnvelope && Array.isArray(apiEnvelope.propostas)) {
        // Defensive fallback: if it's a single object
        return apiEnvelope.propostas.map((item: any) => ({
            codhda: item.CODHDA,
            cpfVendedor: item.CPF_VENDEDOR,
            nomeVendedor: (item.NOME_VENDEDOR?.trim() || ''),
            parcela: item.parcela,
            totalPropostas: item["Total Propostas"] || 0,
            totalPago: item.Paga || 0,
            totalPendente: item.Pendente || 0,
            percentualAdimplencia: parseFloat(item["% Adimplencia"]) || 0,
        }));
    } else {
        // No data or unexpected shape
        return [];
    }
}
