import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropostas } from '@/processes/propostas';
import type { Proposta } from '@/types/proposta';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useLojasStore } from '@/stores/lojas.store';

export type RankingType = 'vendor' | 'model' | 'city';

export interface ProductSales {
	model: string;
	qtd: number;
	percent: number;
}

export interface TipoCount {
	tipo: 'NOVA' | 'REPOSICAO';
	value: number;
	perc: number;
}

export interface PlanSales {
	plan: string;
	qtd: number;
	percent: number;
}

export interface RankingRow extends Proposta {
	key?: string | null;
	qtd?: number;
	percent?: number;
	population?: number;
	med12?: number;
	// Vendor specific fields
	valorTotal?: number;
	ticketMedio?: number;
	products?: ProductSales[];
	// New fields for enhanced vendor ranking
	plans?: PlanSales[];
	tipoBreakdown?: TipoCount[];
}

// Define interface for the export data
export interface VendorExportData {
	Vendedor: string;
	Quantidade?: number;
	Percentual?: string;
	'Valor Total'?: string;
	'Ticket Médio'?: string;
	NOVA?: number;
	REPOSICAO?: number;
	[key: string]: string | number | undefined; // Allow dynamic plan and model columns with specific types
}

// Labels for each ranking type
export const rankingTypeLabels: { [type in RankingType]: string } = {
	vendor: 'Vendedor',
	model: 'Modelo',
	city: 'Cidade',
};

export default function CheckupContainer() {
	// Default to current month
	const currentDate = new Date();
	const [startDate, setStartDate] = useState<Date>(startOfMonth(currentDate));
	const [endDate, setEndDate] = useState<Date>(endOfMonth(currentDate));
	const [rankingType, setRankingType] = useState<RankingType>('vendor');
	// Selected item for detailed view
	const [selectedItem, setSelectedItem] = useState<string | null>(null);
	// Search filter
	const [searchFilter, setSearchFilter] = useState<string>('');
	const lojas = useLojasStore((state) => state.lojas);
	const [selectedLoja, setSelectedLoja] = useState<string | null>(null);

	const displayLoja = useMemo(() => {
		if (!selectedLoja) return 'Todas as Lojas';
		const loja = lojas?.find((l) => l.token_whatsapp === selectedLoja);
		return loja?.empresa || 'Todas as Lojas';
	}, [selectedLoja, lojas]);

	const {
		data: propostasRaw,
		isLoading,
		refetch,
		error,
		isError,
	} = useQuery({
		queryKey: [
			'ranking-propostas',
			startDate.toISOString().slice(0, 10),
			endDate.toISOString().slice(0, 10),
			selectedLoja,
		],
		queryFn: () =>
			fetchPropostas({
				DT_INICIO: startDate.toISOString().slice(0, 10),
				DT_FINAL: endDate.toISOString().slice(0, 10),
				tokens: selectedLoja ? [selectedLoja] : undefined,
			}),
		refetchOnWindowFocus: false,
	});

	const data = useMemo(() => {
		if (!propostasRaw) return [];

		// Instead of grouping, convert each Proposta directly to a RankingRow
		const rows: RankingRow[] = propostasRaw.map((proposta: Proposta) => {
			// Return the proposta directly as a RankingRow (since RankingRow extends Proposta)
			return {
				...proposta,
				// We can keep some of the old fields for compatibility
				key: proposta.ID.toString(),
				qtd: 1,
				percent: 100 / propostasRaw.length
			};
		});

		// Apply search filter if provided
		if (searchFilter.trim()) {
			const filter = searchFilter.toLowerCase().trim();
			return rows.filter((row) => {
				// Search across multiple fields
				const searchableFields = [
					row.NOME_VENDEDOR,
					row.NOMECONSORCIADO,
					row.NUM_PROPOSTA,
					row.STATUS,
					row.NOME_PLANO,
					row.CPF_VENDEDOR,
					row.CPFCNPCONSORCIADO
				].filter(Boolean).map(field => field?.toString().toLowerCase() || '');
				
				return searchableFields.some(field => field.includes(filter));
			});
		}

		return rows;
	}, [propostasRaw, searchFilter]);

	// Prepare export data based on current view
	const exportData = useMemo(() => {
		// Return all propostas as export data
		return data.map((proposta) => {
			return {
				'COD_PLANO': proposta.COD_PLANO || '',
				'Num_proposta+dig_proposta': `${proposta.NUM_PROPOSTA || ''}${proposta.DIG_PROPOSTA || ''}`,
				'Status': proposta.STATUS || '',
				'Nome_plano': proposta.NOME_PLANO || '',
				'Grupo/cota/rd': `${proposta.NUM_GRUPO || '-'}/${proposta.NUM_COTA || '-'}/${proposta.REP_COTA || '-'}/${proposta.DIG_COTA || '-'}`,
				'CPF cliente': proposta.CPFCNPCONSORCIADO || '',
				'Nome': proposta.NOMECONSORCIADO || '',
				'Data venda': proposta.DATA_VENDA || '',
				'Data bordero': proposta.DT_BORDERO || '',
				'CPF vendedor': proposta.CPF_VENDEDOR || ''
			};
		});
	}, [data]);

	// Generate headers for CSV export
	const exportHeaders = useMemo(() => {
		// Create headers for the specific fields we want to export
		return [
			{ label: 'COD_PLANO', key: 'COD_PLANO' },
			{ label: 'Num_proposta+dig_proposta', key: 'Num_proposta+dig_proposta' },
			{ label: 'Status', key: 'Status' },
			{ label: 'Nome_plano', key: 'Nome_plano' },
			{ label: 'Grupo/cota/rd', key: 'Grupo/cota/rd' },
			{ label: 'CPF cliente', key: 'CPF cliente' },
			{ label: 'Nome', key: 'Nome' },
			{ label: 'Data venda', key: 'Data venda' },
			{ label: 'Data bordero', key: 'Data bordero' },
			{ label: 'CPF vendedor', key: 'CPF vendedor' }
		];
	}, []);

	return {
		data,
		isLoading,
		isError,
		error,
		rankingType,
		setRankingType,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		selectedItem,
		setSelectedItem,
		searchFilter,
		setSearchFilter,
		refetch,
		rankingTypeLabels,
		propostasRaw,
		exportData,
		exportHeaders,
		lojas,
		selectedLoja,
		setSelectedLoja,
		displayLoja,
	};
}
