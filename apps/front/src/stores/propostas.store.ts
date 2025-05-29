import { create } from 'zustand';

export interface Proposta {
	ID: number;
	COD_PLANO: string;
	COD_CONCESS: string;
	NUM_PROPOSTA: string;
	DIG_PROPOSTA: string;
	ST_SINC_SAG: string;
	NOME_PLANO: string;
	NUM_GRUPO: string;
	NUM_COTA: string;
	REP_COTA: string;
	DIG_COTA: string;
	NRO_CONTRATO: string;
	SERIE_CONTRATO: string;
	DIG_CONTRATO: string;
	CPF_VENDEDOR: string;
	NOME_VENDEDOR: string | null;
	NOMECONSORCIADO: string;
	SEXO: string;
	PESSOA: string | null;
	CPFCNPCONSORCIADO: string;
	TIPO_DOC: string;
	NUMDOC: string;
	DATAEMISSAO: string;
	ORGAOEMISSOR: string;
	DATANASCIMENTO: string;
	ESTADOCIVIL: string;
	RENDAMENSAL: string;
	CBOPROFISSAO: string;
	NOMEPROFISSAO: string;
	NOMERESPONSAVELLEGAL: string | null;
	CPFRESPONSAVEL: string | null;
	RGRESPONSALVEL: string | null;
	TIPOLOGRADOURO: string | null;
	DSCLOGRADOURO: string;
	NUMEROLOGRADOURO: string;
	COMPLEMENTO_LOG: string;
	REFERENCIA_LOG: string;
	BAIRRO_LOG: string;
	CEP_LOG: string;
	CIDADE_LOG: string;
	UF_LOG: string;
	PRIORIDADEENDERECO: string | null;
	UF_ADICIONAL: string;
	CEP_ADICIONAL: string;
	TPLOG_ADICIONAL: string | null;
	LOG_ADICIONAL: string;
	NUMERO_ADICIONAL: string;
	COMPL_ADICIONAL: string;
	BAIRRO_ADICIONAL: string;
	CIDADE_ADICIONAL: string;
	DDD_RES: string;
	FONE_RES: string;
	DDD_CELULAR: string;
	FONE_CELULAR: string;
	DDD_COMERCIAL: string;
	FONE_COMERCIAL: string;
	DDD_RECADO: string;
	FONE_RECADO: string;
	NOME_CONTATO: string | null;
	EMAIL: string;
	DATA_DIGITACAO: string;
	BORDERO_ORIGEM: string | null;
	NUM_BORDERO: string;
	DT_BORDERO: string;
	VENCIMENTO: number;
	DATA_VENDA: string;
	VALOR_BEM: string | null;
	VALOR_SEM_SEGURO: string | null;
	VALOR_COM_SEGURO: string | null;
	VALOR_PARCELA: string;
	VALOR_TAXA_ADM: string | null;
	PERC_TX_ADM: string;
	PERC_TX_ADESAO: string;
	PERC_SEGURO: string;
	PERC_PAG_MENSAL: string;
	PERC_FUNDORESERVA: string;
	PLANO_VENDAS: string;
	INDICADO_NOVO_REP: string;
	PRAZO: number;
	NUM_PARTICIPANTES: number;
	COD_PRODUTO: string | null;
	CODIGOMODELO: string;
	ESPECIE: string | null;
	ORIGEM: string | null;
	NUMBANCO: string | null;
	NUMCHEQUE: string | null;
	PERMITE_DIV_LISTA: string | null;
	ENVIO_SMS: string;
	OPCAOLANCELIVRE: number;
	OPCAOLANCEFIXO: number;
	VLRLANCELIVRE: string;
	PERLANCELIVRE: string;
	AMORTIZACAOLANCE: string | null;
	PERCLICENCIAMENTO: string;
	VALOR_MAX_LICENCIAMENTO: string | null;
	VALOR_BEM_BASE: string;
	VALOR_CREDITO_BASE: string;
	PRAZO_BASE: number;
	DATA_CADASTRO: string;
	USER_CADASTRO: string | null;
	LEGISLACAO: string | null;
	FRETE: string | null;
	CRED_REDUZIDO: string | null;
	CK_PB: string | null;
	EXCLUIDO: string | null;
	USER_EXCLUIDO: string | null;
	DATA_EXCLUSAO: string | null;
	DTCOMISSAO_DIGIT: string | null;
	BLOCK_COMISSAO: string | null;
	XML: string | null;
	DT_CONTEMPLACAO: string | null;
	DT_CAN: string | null;
	VDA: string | null;
	VDA_NF: string | null;
	ASE: string | null;
	ASE_NF: string | null;
	AS4: string | null;
	AS5: string | null;
	AS4_NF: string | null;
	AS5_NF: string | null;
	PFT: string | null;
	PFT_NF: string | null;
	AS2: string | null;
	AS2_NF: string | null;
	DV: string | null;
	ATU_STATUS: string;
	DT_SINC_STATUS: string;
	STATUS_ANT: string;
	ATU_CREDITOS: string | null;
	TP_PLANO: string | null;
	PERC_PAGO: string | null;
	PERC_ATRASO: string | null;
	DT_PAG_LANCE: string | null;
	PERC_LANCE: string | null;
	VALOR_LANCE: string | null;
	TIPO_CONTEMPLACAO: string | null;
	ASS_PART: string | null;
	MOTIVOS_REJEICAO: string | null;
	FIRST_ASS_PART: string | null;
	FIRST_DTASS: string | null;
	TX_SEGURO: string | null;
	CREDITO_REF: string | null;
	VALOR_CREDITO_REF: string | null;
	DTC_VDA: string | null;
	DTC_AS2: string | null;
	DTC_ASE: string | null;
	DTC_AS4: string | null;
	DTC_AS5: string | null;
	DTC_PFT: string | null;
	TIPOCONTA: string | null;
	ST_SINC_NUMCONTRATO: string | null;
	DT_SINC_SAG: string | null;
	DT_SINC_COMISSAO: string | null;
	ST_SINC_DEALERNET: string | null;
	NOVO_REP: string | null;
	DATA_PROCESSADA: string | null;
	ID_CONTATO_WHATSAPP: string | null;
	NUMERO_WHATSAPP: string | null;
	DT_SINC_WHATSAPP: string | null;
	DT_PRIMEIRO_CONTATO: string | null;
	MSN_SINC_WHATSAPP: string | null;
	ID_ENVIO_1A_ASSEMB: string | null;
	DT_ENVIO_1A_ASSEMB: string | null;
	DT_ENTREGA_1A_ASSEMB: string | null;
	QTD_ERROS_GERAR_BOLETO: string | null;
	FORMA_PGTO: string;
}

interface PropostasState {
	propostas: Proposta[];
	setPropostas: (propostas: Proposta[]) => void;
  salesPerDay: (start: string, end: string) => { current: { data: string; qtd: number; acumulado: number }[]; previous: { data: string; qtd: number; acumulado: number }[] };
  salesPerCity: (start: string, end: string) => { city: string; qtd: number; perc: string }[];
  salesPerModel: (start: string, end: string) => { model: string; qtd: number; perc: string }[];
}

import _ from 'lodash';

export const usePropostasStore = create<PropostasState>((set, get) => ({
	propostas: [],
	setPropostas: (propostas) => set({ propostas }),

	// 1. Sales per day in selected range, with daily and accumulated sales, and previous month comparison
	salesPerDay: (start: string, end: string) => {
		const propostas = get().propostas;
		// Filter for selected range
		const filtered = propostas.filter(
			(p) => p.DATA_VENDA >= start && p.DATA_VENDA <= end
		);
		// Group by day
		const grouped = _.groupBy(filtered, 'DATA_VENDA');
		// Sort days
		const days = _.sortBy(Object.keys(grouped));
		let acumulado = 0;
		const result = days.map((day: string) => {
			const qtd = grouped[day].length;
			acumulado += qtd;
			return { data: day, qtd, acumulado };
		});
		// Previous month comparison
		const [startYear, startMonth] = start.split('-').map(Number);
		const prevMonth = new Date(startYear, startMonth - 2, 1); // JS months 0-based
		const prevStart = prevMonth.toISOString().slice(0, 10);
		const prevEnd = new Date(
			prevMonth.getFullYear(),
			prevMonth.getMonth() + 1,
			0
		)
			.toISOString()
			.slice(0, 10);
		const prevFiltered = propostas.filter(
			(p) => p.DATA_VENDA >= prevStart && p.DATA_VENDA <= prevEnd
		);
		const prevGrouped = _.groupBy(prevFiltered, 'DATA_VENDA');
		const prevDays = _.sortBy(Object.keys(prevGrouped));
		let prevAcumulado = 0;
		const prevResult = prevDays.map((day: string) => {
			const qtd = prevGrouped[day].length;
			prevAcumulado += qtd;
			return { data: day, qtd, acumulado: prevAcumulado };
		});
		return { current: result, previous: prevResult };
	},

	// 2. Sales per city in selected range, with percentage
	salesPerCity: (start: string, end: string) => {
		const propostas = get().propostas.filter(
			(p) => p.DATA_VENDA >= start && p.DATA_VENDA <= end
		);
		const grouped = _.groupBy(propostas, 'CIDADE_LOG');
		const total = propostas.length;
		return Object.entries(grouped)
			.map(([city, arr]) => ({
				city,
				qtd: arr.length,
				perc: total ? ((arr.length / total) * 100).toFixed(2) : '0.00',
			}))
			.sort((a, b) => b.qtd - a.qtd);
	},

	// 3. Propostas per CODIGOMODELO (model), with name, sales, and percentage
	salesPerModel: (start: string, end: string) => {
		const propostas = get().propostas.filter(
			(p) => p.DATA_VENDA >= start && p.DATA_VENDA <= end
		);
		const grouped = _.groupBy(propostas, 'CODIGOMODELO');
		const total = propostas.length;
		return Object.entries(grouped)
			.map(([model, arr]) => ({
				model: model.trim(),
				qtd: arr.length,
				perc: total ? ((arr.length / total) * 100).toFixed(2) : '0.00',
			}))
			.sort((a, b) => b.qtd - a.qtd);
	},
}));
