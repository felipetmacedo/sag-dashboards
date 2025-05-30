import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropostas } from '@/processes/propostas';
import type { Proposta } from '@/types/proposta';

export default function useDashboardContainer() {
	const [startDate, setStartDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [endDate, setEndDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 0);
	});

	const {
		data: propostasRaw,
		isLoading: loadingCurrent,
		refetch: refetchCurrent,
		error: errorCurrent,
		isError: isErrorCurrent,
	} = useQuery({
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

	// Ensure propostas is always an array
	const propostas = useMemo(() => Array.isArray(propostasRaw) ? propostasRaw : [], [propostasRaw]);

	// Calculate total number of proposals and total revenue in the filtered period
	const { totalPropostas, totalFaturamento } = useMemo(() => {
		const filteredPropostas = propostas.filter((p: Proposta) => p.DT_BORDERO);
		const total = filteredPropostas.length;
		const faturamento = filteredPropostas.reduce((sum: number, p: Proposta) => {
			return sum + (Number(p.VALOR_CREDITO_BASE) || 0);
		}, 0);
		return { totalPropostas: total, totalFaturamento: faturamento };
	}, [propostas]);

	const {
		data: propostasLastTwoYearsRaw,
		isLoading: loadingLastTwoYears,
		refetch: refetchLastTwoYears,
		error: errorLastTwoYears,
		isError: isErrorLastTwoYears,
	} = useQuery({
		queryKey: ['propostasLastTwoYears'],
		queryFn: () => fetchPropostas({
			DT_INICIO: (() => { const d = new Date(); d.setFullYear(d.getFullYear() - 2); return d.toISOString().slice(0, 10); })(),
			DT_FINAL: new Date().toISOString().slice(0, 10),
		}),
		refetchOnWindowFocus: false,
	});

	// Ensure propostasLastTwoYears is always an array
	const propostasLastTwoYears = useMemo(() => Array.isArray(propostasLastTwoYearsRaw) ? propostasLastTwoYearsRaw : [], [propostasLastTwoYearsRaw]);

	// Selector for Tipo de Proposta (NOVA vs REPOSICAO)
	const tipoPropostaPie = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter(
			(p: Proposta) => p.DT_BORDERO >= start && p.DT_BORDERO <= end
		);
		const total = filtered.length;
		const counts = filtered.reduce(
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
	}, [startDate, endDate, propostas]);

	// Memoized chart data
	const productPie = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter(
			(p: Proposta) => p.DT_BORDERO >= start && p.DT_BORDERO <= end
		);
		const grouped: Record<string, number> = {};
		filtered.forEach((p: Proposta) => {
			const plan = (p.NOME_PLANO || '').trim();
			if (!plan) return;
			grouped[plan] = (grouped[plan] || 0) + 1;
		});
		return Object.entries(grouped).map(([name, sales]) => ({
			name,
			sales,
		}));
	}, [startDate, endDate, propostas]);

		// Aggregate last two years by month/year for the bar chart
	const propostasLastTwoYearsChart = useMemo(() => {
		if (!Array.isArray(propostasLastTwoYears)) return [];
		const now = new Date();
		const currentYear = now.getFullYear();
		const prevYear = currentYear - 1;
		// Initialize chart data for all 12 months
		const chartData = Array.from({ length: 12 }, (_, i) => {
			const month = String(i + 1).padStart(2, '0');
			return { month, [prevYear]: 0, [currentYear]: 0 };
		});
		propostasLastTwoYears.forEach((p: Proposta) => {
			const date = new Date(p.DT_BORDERO);
			if (isNaN(date.getTime())) return;
			const year = date.getFullYear();
			const monthIdx = date.getMonth(); // 0-based
			if ((year === prevYear || year === currentYear) && monthIdx >= 0 && monthIdx < 12) {
				chartData[monthIdx][year] = (chartData[monthIdx][year] || 0) + 1;
			}
		});
		return chartData;
	}, [propostasLastTwoYears]);

	return {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		loading: loadingCurrent || loadingLastTwoYears,
		propostas,
		propostasLastTwoYears,
		propostasLastTwoYearsChart,
		productPie,
		tipoPropostaPie,
		totalPropostas,
		totalFaturamento,
		refetchCurrent,
		refetchLastTwoYears,
		errorCurrent,
		errorLastTwoYears,
		isErrorCurrent,
		isErrorLastTwoYears,
	};
}
