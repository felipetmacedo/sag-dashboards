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
		const value = p.VALOR_CREDITO_BASE ? parseFloat(p.VALOR_CREDITO_BASE) : 0;
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

// Helper function to get plan breakdown for a vendor
const getPlanBreakdown = (propostas: Proposta[]): PlanSales[] => {
	// Group by plan name
	const grouped: Record<string, Proposta[]> = {};
	
	propostas.forEach(p => {
		const plan = p.NOME_PLANO || 'Não informado';
		if (!grouped[plan]) {
			grouped[plan] = [];
		}
		grouped[plan].push(p);
	});

	const total = propostas.length;
	const plans = Object.entries(grouped).map(([plan, items]) => ({
		plan,
		qtd: items.length,
		percent: total ? (items.length / total) * 100 : 0
	}));

	// Sort by quantity descending
	return plans.sort((a, b) => b.qtd - a.qtd);
};

// Helper function to get NOVA vs REPOSICAO breakdown
const getTipoBreakdown = (propostas: Proposta[]): TipoCount[] => {
	const total = propostas.length;
	const counts = propostas.reduce(
		(acc: Record<'NOVA' | 'REPOSICAO', number>, p: Proposta) => {
			let tipo: 'NOVA' | 'REPOSICAO' = 'REPOSICAO';
			if (p.INDICADO_NOVO_REP === 'N') tipo = 'NOVA';
			else if (p.INDICADO_NOVO_REP === 'R') tipo = 'REPOSICAO';
			acc[tipo] = (acc[tipo] || 0) + 1;
			return acc;
		},
		{ NOVA: 0, REPOSICAO: 0 } as Record<'NOVA' | 'REPOSICAO', number>
	);

	return [
		{
			tipo: 'NOVA',
			value: counts.NOVA,
			perc: total ? Math.round((counts.NOVA / total) * 100) : 0,
		},
		{
			tipo: 'REPOSICAO',
			value: counts.REPOSICAO,
			perc: total ? Math.round((counts.REPOSICAO / total) * 100) : 0,
		},
	];
};

export default function useRanking() {
	const lojas = useLojasStore(state => state.lojas);
	const [selectedLoja, setSelectedLoja] = useState<string | null>(null);

	const displayLoja = useMemo(() => {
		if (!selectedLoja) return 'Todas as Lojas';
		const loja = lojas?.find(l => l.token_whatsapp === selectedLoja);
		return loja?.empresa || 'Todas as Lojas';
	}, [selectedLoja, lojas]);

	// Default to current month
	const currentDate = new Date();
	const [startDate, setStartDate] = useState<Date>(startOfMonth(currentDate));
	const [endDate, setEndDate] = useState<Date>(endOfMonth(currentDate));
	const [rankingType, setRankingType] = useState<RankingType>('vendor');
	// Selected item for detailed view
	const [selectedItem, setSelectedItem] = useState<string | null>(null);
	// Search filter
	const [searchFilter, setSearchFilter] = useState<string>('');

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
			selectedLoja
		],
		queryFn: () =>
			fetchPropostas({
				DT_INICIO: startDate.toISOString().slice(0, 10),
				DT_FINAL: endDate.toISOString().slice(0, 10),
				tokens: selectedLoja ? [selectedLoja] : undefined
			}),
		refetchOnWindowFocus: false,
	});

	const data = useMemo(() => {
		if (!propostasRaw) return [];

		// Get the key to group by based on ranking type
		const key = keyMap[rankingType];

		// Group by the selected key
		const grouped: Record<string, Proposta[]> = {};
		const nullGroup: Proposta[] = [];

		propostasRaw.forEach((p: Proposta) => {
			const value = p[key];
			if (value === null || value === undefined || value === '') {
				nullGroup.push(p);
				return;
			}

			if (!grouped[value]) {
				grouped[value] = [];
			}
			grouped[value].push(p);
		});

		const total = propostasRaw.length;
		const rows: RankingRow[] = Object.entries(grouped).map(([k, items]) => {
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
				const plans = getPlanBreakdown(items);
				const tipoBreakdown = getTipoBreakdown(items);

				return {
					...baseRow,
					valorTotal,
					ticketMedio,
					products,
					plans,
					tipoBreakdown
				};
			}

			return baseRow;
		});

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
				const plans = getPlanBreakdown(nullGroup);
				const tipoBreakdown = getTipoBreakdown(nullGroup);

				nullRow.valorTotal = valorTotal;
				nullRow.ticketMedio = ticketMedio;
				nullRow.products = products;
				nullRow.plans = plans;
				nullRow.tipoBreakdown = tipoBreakdown;
			}

			rows.push(nullRow);
		}

		// Sort rows by quantity descending
		rows.sort((a, b) => b.qtd - a.qtd);

		// Apply search filter if provided
		if (searchFilter.trim()) {
			const filter = searchFilter.toLowerCase().trim();
			return rows.filter(row => {
				const key = row.key?.toString().toLowerCase() || '';
				return key.includes(filter);
			});
		}

		return rows;
	}, [propostasRaw, rankingType, searchFilter]);

	// Get vendor data for export
	const getVendorData = (vendorName: string | null) => {
		if (!vendorName || !propostasRaw) return [];

		// Filter propostas for the specific vendor
		return propostasRaw.filter((p: Proposta) => p.NOME_VENDEDOR === vendorName);
	};

	// Prepare export data based on current view
	const exportData = useMemo(() => {

		// For vendor type with plans, create a consolidated structure with one row per vendor
		if (rankingType === 'vendor') {
			// Create a map to store vendor data by vendor name
			const vendorMap = new Map<string, VendorExportData>();
			
			data.forEach(item => {
				const vendorName = item.key === null ? 'Não informado' : item.key.toString();
				
				// Initialize vendor data if not exists
				if (!vendorMap.has(vendorName)) {
					vendorMap.set(vendorName, {
						'Vendedor': vendorName,
						'Quantidade': item.qtd,
						'Percentual': `${item.percent.toFixed(2)}%`,
						'Valor Total': item.valorTotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
						'Ticket Médio': item.ticketMedio?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00',
						'NOVA': item.tipoBreakdown?.find(t => t.tipo === 'NOVA')?.value || 0,
						'REPOSICAO': item.tipoBreakdown?.find(t => t.tipo === 'REPOSICAO')?.value || 0
					});
				}

				const vendorData = vendorMap.get(vendorName)!;

				// Add plans as columns
				if (item.plans && item.plans.length > 0) {
					item.plans.forEach(plan => {
						const planName = plan.plan || 'Não informado';
						vendorData[planName] = plan.qtd;
					});
				}
			});

			return Array.from(vendorMap.values());
		} else {
			// For city and model types, use the original format
			return data.map(item => ({
				[rankingTypeLabels[rankingType]]: item.key === null ? 'Não informado' : item.key,
				Quantidade: item.qtd,
				Percentual: `${item.percent.toFixed(2)}%`,
				...(rankingType === 'city' ? {
					'População': item.population || '-',
					'Med. 12': item.med12 || '-'
				} : {})
			}));
		}
	}, [data, rankingType]);

	// Generate headers for CSV export
	const exportHeaders = useMemo(() => {
		if (rankingType === 'vendor') {
			// Get all unique keys from the export data to create dynamic headers
			const allKeys = new Set<string>();
			exportData.forEach(item => {
				Object.keys(item).forEach(key => allKeys.add(key));
			});

			// Create headers in a specific order
			const baseHeaders = [
				{ label: 'Vendedor', key: 'Vendedor' },
				{ label: 'Quantidade', key: 'Quantidade' },
				{ label: 'Percentual', key: 'Percentual' },
				{ label: 'Valor Total', key: 'Valor Total' },
				{ label: 'Ticket Médio', key: 'Ticket Médio' },
				{ label: 'NOVA', key: 'NOVA' },
				{ label: 'REPOSICAO', key: 'REPOSICAO' },
			];

			// Add plan headers - now just using the plan name directly
			const planHeaders = Array.from(allKeys)
				.filter(key => !baseHeaders.some(header => header.key === key))
				.filter(key => !['Vendedor', 'Quantidade', 'Percentual', 'Valor Total', 'Ticket Médio', 'NOVA', 'REPOSICAO'].includes(key))
				.map(key => ({ label: key, key }));

			return [...baseHeaders, ...planHeaders];
		} else {
			// Original headers for city and model
			const baseHeaders = [
				{ label: rankingTypeLabels[rankingType], key: rankingTypeLabels[rankingType] },
				{ label: 'Quantidade', key: 'Quantidade' },
				{ label: 'Percentual', key: 'Percentual' },
			];

			if (rankingType === 'city') {
				baseHeaders.push(
					{ label: 'População', key: 'População' },
					{ label: 'Med. 12', key: 'Med. 12' }
				);
			}

			return baseHeaders;
		}
	}, [rankingType, exportData]);

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
		getVendorData,
		exportData,
		exportHeaders,
		lojas,
		selectedLoja,
		setSelectedLoja,
		displayLoja
	};
}
