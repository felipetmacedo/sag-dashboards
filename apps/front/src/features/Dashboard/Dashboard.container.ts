import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropostas } from '@/processes/propostas';
import { usePropostasStore } from '@/stores/propostas.store';

export default function useDashboardContainer() {
	const [startDate, setStartDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [endDate, setEndDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 0);
	});
	const propostas = usePropostasStore(state => state.propostas);

	const { isLoading: loadingCurrent, refetch: refetchCurrent } = useQuery({
		queryKey: [
			'propostas',
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

	// Query for comparative data for last 5 years
	const {
		data: comparativeData = [],
		isLoading: loadingComparative,
		refetch: refetchComparative,
	} = useQuery({
		queryKey: ['propostas-comparative-5y'],
		queryFn: async () => {
			const now = new Date();
			const results = [];
			for (let month = 1; month <= 12; month++) {
				const monthStr = String(month).padStart(2, '0');
				const data = {};
				for (let i = 0; i < 2; i++) {
					const year = now.getFullYear() - i;
					const dtInicio = `${year}-${monthStr}-01`;
					const dtFinal = `${year}-${monthStr}-31`;
					// Use the store's selector after proposals are set
					const { salesPerDay } = usePropostasStore.getState();
					const sales = salesPerDay(dtInicio, dtFinal).current.reduce(
						(acc: number, d: { qtd: number }) => acc + d.qtd,
						0
					);
					data[year] = sales;
				}
				results.push({ month: monthStr, ...data });
			}
			return results;
		},
		refetchOnWindowFocus: false,
	});

	// Get selectors from the store
	const { salesPerDay, salesPerCity } = usePropostasStore();

	// Selector for Tipo de Proposta (NOVA vs REPOSICAO)
	const tipoPropostaPie = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter(
			(p) => p.DT_BORDERO >= start && p.DT_BORDERO <= end
		);
		const total = filtered.length;
		const counts = filtered.reduce(
			(acc, p) => {
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
	}, [startDate, endDate, propostas]);

	// Memoized chart data
	const productPie = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter(
			(p) => p.DT_BORDERO >= start && p.DT_BORDERO <= end
		);
		const grouped: Record<string, number> = {};
		filtered.forEach((p) => {
			const plan = (p.NOME_PLANO || '').trim();
			if (!plan) return;
			grouped[plan] = (grouped[plan] || 0) + 1;
		});
		return Object.entries(grouped).map(([name, sales]) => ({
			name,
			sales,
		}));
	}, [startDate, endDate, propostas]);
	const cityPie = useMemo(
		() =>
			salesPerCity(
				startDate.toISOString().slice(0, 10),
				endDate.toISOString().slice(0, 10)
			),
		[startDate, endDate, salesPerCity]
	);
	const dayChart = useMemo(
		() =>
			salesPerDay(
				startDate.toISOString().slice(0, 10),
				endDate.toISOString().slice(0, 10)
			),
		[startDate, endDate, salesPerDay]
	);

	return {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		loading: loadingCurrent || loadingComparative,
		productPie,
		cityPie,
		dayChart,
		tipoPropostaPie,
		comparativeData,
		refetchCurrent,
		refetchComparative,
	};
}
