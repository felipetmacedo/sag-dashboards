import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropostas } from '@/processes/propostas';
import type { Proposta } from '@/stores/propostas.store';
import { startOfMonth, endOfMonth } from 'date-fns';

export type RankingType = 'vendor' | 'model' | 'city';

export interface ProductSales {
	model: string;
	qtd: number;
	percent: number;
}

export interface RankingRow {
	key: string | null;
	qtd: number;
	percent: number;
	population?: number;
	med12?: number;
	// Vendor specific fields
	valorTotal?: number;
	ticketMedio?: number;
	products?: ProductSales[];
}

// Define which Proposta keys are used for each ranking type
const keyMap: { [type in RankingType]: keyof Proposta } = {
	vendor: 'NOME_VENDEDOR',
	model: 'CODIGOMODELO', // Updated to use CODIGOMODELO as requested
	city: 'CIDADE_LOG',
};

// Labels for each ranking type
export const rankingTypeLabels: { [type in RankingType]: string } = {
	vendor: 'Vendedor',
	model: 'Modelo',
	city: 'Cidade',
};

// Helper function to calculate total value from propostas
const calculateTotalValue = (propostas: Proposta[]): number => {
	return propostas.reduce((total, p) => {
		// Parse the value from string to number, defaulting to 0 if invalid
		const value = p.VALOR_PARCELA ? parseFloat(p.VALOR_PARCELA) : 0;
		return total + value;
	}, 0);
};

// Helper function to get product breakdown for a vendor
const getProductBreakdown = (propostas: Proposta[]): ProductSales[] => {
	// Group by model
	const grouped: Record<string, Proposta[]> = {};
	
	propostas.forEach(p => {
		const model = p.CODIGOMODELO || 'Não informado';
		if (!grouped[model]) {
			grouped[model] = [];
		}
		grouped[model].push(p);
	});

	const total = propostas.length;
	const products = Object.entries(grouped).map(([model, items]) => ({
		model,
		qtd: items.length,
		percent: total ? (items.length / total) * 100 : 0
	}));

	// Sort by quantity descending
	return products.sort((a, b) => b.qtd - a.qtd);
};

export default function useRanking() {
	// Default to current month
	const currentDate = new Date();
	const [startDate, setStartDate] = useState<Date>(startOfMonth(currentDate));
	const [endDate, setEndDate] = useState<Date>(endOfMonth(currentDate));
	const [rankingType, setRankingType] = useState<RankingType>('city');
	// Selected item for detailed view
	const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
		],
		queryFn: () =>
			fetchPropostas({
				DT_INICIO: startDate.toISOString().slice(0, 10),
				DT_FINAL: endDate.toISOString().slice(0, 10),
			}),
		refetchOnWindowFocus: false,
	});

	// Ensure propostas is always an array
	const propostas = useMemo(() => Array.isArray(propostasRaw) ? propostasRaw : [], [propostasRaw]);

	const key = keyMap[rankingType];
	const start = startDate.toISOString().slice(0, 10);
	const end = endDate.toISOString().slice(0, 10);

	const data = useMemo(() => {
		// Filter by date
		const filtered = propostas.filter(
			(p) => p.DT_BORDERO >= start && p.DT_BORDERO <= end
		);

		// Group by selected key (can be null)
		const grouped: Record<string, Proposta[]> = {};
		const nullGroup: Proposta[] = [];

		filtered.forEach((p) => {
			const groupKey = p[key];
			if (
				groupKey === null ||
				groupKey === undefined ||
				groupKey === ''
			) {
				nullGroup.push(p);
			} else {
				// Ensure groupKey is treated as string for Record keys
				const keyAsString = String(groupKey);
				if (!grouped[keyAsString]) {
					grouped[keyAsString] = [];
				}
				grouped[keyAsString].push(p);
			}
		});

		const total = filtered.length;
		const rows: RankingRow[] = Object.entries(grouped).map(
			([k, items]) => {
				const baseRow = {
					key: k,
					qtd: items.length,
					percent: total ? (items.length / total) * 100 : 0,
				};

				// Add vendor-specific data if this is a vendor ranking
				if (rankingType === 'vendor') {
					const valorTotal = calculateTotalValue(items);
					const ticketMedio = items.length > 0 ? valorTotal / items.length : 0;
					const products = getProductBreakdown(items);

					return {
						...baseRow,
						valorTotal,
						ticketMedio,
						products
					};
				}

				return baseRow;
			}
		);

		if (nullGroup.length > 0) {
			const nullRow: RankingRow = {
				key: null,
				qtd: nullGroup.length,
				percent: total ? (nullGroup.length / total) * 100 : 0,
			};

			// Add vendor-specific data for null group if this is a vendor ranking
			if (rankingType === 'vendor') {
				const valorTotal = calculateTotalValue(nullGroup);
				const ticketMedio = nullGroup.length > 0 ? valorTotal / nullGroup.length : 0;
				const products = getProductBreakdown(nullGroup);

				nullRow.valorTotal = valorTotal;
				nullRow.ticketMedio = ticketMedio;
				nullRow.products = products;
			}

			rows.push(nullRow);
		}

		// Sort descending by qtd
		rows.sort((a, b) => b.qtd - a.qtd);
		return rows;
	}, [propostas, key, start, end, rankingType]);

	// Get detailed data for a specific item
	const selectedItemData = useMemo(() => {
		if (!selectedItem) return null;

		// Find the item in the data
		return data.find(item => item.key === selectedItem) || null;
	}, [data, selectedItem]);

	// Prepare export data based on current view
	const exportData = useMemo(() => {
		return data.map(item => ({
			[rankingTypeLabels[rankingType]]: item.key === null ? 'Não informado' : item.key,
			Quantidade: item.qtd,
			Percentual: `${item.percent.toFixed(2)}%`,
			...(rankingType === 'vendor' ? {
				'Valor Total': item.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
				'Ticket Médio': item.ticketMedio?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'
			} : {}),
			...(rankingType === 'city' ? {
				'População': item.population || '-',
				'Med. 12': item.med12 || '-'
			} : {})
		}));
	}, [data, rankingType, rankingTypeLabels]);

	// Generate headers for CSV export
	const exportHeaders = useMemo(() => {
		const baseHeaders = [
			{ label: rankingTypeLabels[rankingType], key: rankingTypeLabels[rankingType] },
			{ label: 'Quantidade', key: 'Quantidade' },
			{ label: 'Percentual', key: 'Percentual' },
		];

		if (rankingType === 'vendor') {
			baseHeaders.push(
				{ label: 'Valor Total', key: 'Valor Total' },
				{ label: 'Ticket Médio', key: 'Ticket Médio' }
			);
		} else if (rankingType === 'city') {
			baseHeaders.push(
				{ label: 'População', key: 'População' },
				{ label: 'Med. 12', key: 'Med. 12' }
			);
		}

		return baseHeaders;
	}, [rankingType, rankingTypeLabels]);

	return {
		data,
		rankingType,
		setRankingType,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		rankingTypeLabels,
		selectedItem,
		setSelectedItem,
		selectedItemData,
		exportData,
		exportHeaders,
		isLoading,
		refetch,
		error,
		isError
	};
}
