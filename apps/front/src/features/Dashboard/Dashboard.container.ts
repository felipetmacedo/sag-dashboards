import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropostas } from '@/processes/propostas';
import type { Proposta } from '@/types/proposta';
import { useLojasStore } from '@/stores/lojas.store';

export default function useDashboardContainer() {
	const [startDate, setStartDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [endDate, setEndDate] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + 1, 0);
	});

	const lojas = useLojasStore(state => state.lojas);
	const [selectedLoja, setSelectedLoja] = useState<string | null>(null);

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
			selectedLoja,
		],
		queryFn: () =>
			fetchPropostas({
				DT_INICIO: startDate.toISOString().slice(0, 10),
				DT_FINAL: endDate.toISOString().slice(0, 10),
				codhda: selectedLoja ? [selectedLoja] : undefined,
			}),
		refetchOnWindowFocus: false,
	});

	// Ensure propostas is always an array
	const propostas = useMemo(() => Array.isArray(propostasRaw) ? propostasRaw : [], [propostasRaw]);

	// Calculate total number of proposals and total revenue in the filtered period
	const { totalPropostas, totalFaturamento } = useMemo(() => {
		const filteredPropostas = propostas.filter((p: Proposta) => {
			const tokenMatch = selectedLoja ? p.CODHDA === selectedLoja : true;
			return p.DT_BORDERO && tokenMatch;
		});
		const total = filteredPropostas.length;
		const faturamento = filteredPropostas.reduce((sum: number, p: Proposta) => {
			return sum + (Number(p.VALOR_CREDITO_BASE) || 0);
		}, 0);
		return { totalPropostas: total, totalFaturamento: faturamento };
	}, [propostas, selectedLoja]);

	// Selector for Tipo de Proposta (NOVA vs REPOSICAO)
	const tipoPropostaPie = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter(
			(p: Proposta) => {
				const tokenMatch = selectedLoja ? p.CODHDA === selectedLoja : true;
				return p.DT_BORDERO >= start && p.DT_BORDERO <= end && tokenMatch;
			}
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
	}, [startDate, endDate, propostas, selectedLoja]);

	// Memoized chart data
	const productPie = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter(
			(p: Proposta) => {
				const tokenMatch = selectedLoja ? p.CODHDA === selectedLoja : true;
				return p.DT_BORDERO >= start && p.DT_BORDERO <= end && tokenMatch;
			}
		);
		const grouped: Record<string, number> = {};
		filtered.forEach((p: Proposta) => {
			const plan = (p.NOME_PLANO || '').trim();
			if (!plan) return;
			grouped[plan] = (grouped[plan] || 0) + 1;
		});
		return Object.entries(grouped)
			.map(([name, sales]) => ({ name, sales }))
			.sort((a, b) => b.sales - a.sales)
			.slice(0, 10);
	}, [startDate, endDate, propostas, selectedLoja]);

	// Top 5 Vendors
	const topVendors = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter((p: Proposta) => {
			const tokenMatch = selectedLoja ? p.CODHDA === selectedLoja : true;
			return p.DT_BORDERO >= start && p.DT_BORDERO <= end && tokenMatch;
		});
		const grouped: Record<string, number> = {};
		filtered.forEach((p: Proposta) => {
			const vendor = (p.NOME_VENDEDOR || '').trim();
			if (!vendor) return;
			grouped[vendor] = (grouped[vendor] || 0) + 1;
		});
		return Object.entries(grouped)
			.map(([name, sales]) => ({ name, sales }))
			.sort((a, b) => b.sales - a.sales)
			.slice(0, 10);
	}, [startDate, endDate, propostas, selectedLoja]);

	// Top 5 Motors
	const topMotors = useMemo(() => {
		const start = startDate.toISOString().slice(0, 10);
		const end = endDate.toISOString().slice(0, 10);
		const filtered = propostas.filter((p: Proposta) => {
			const tokenMatch = selectedLoja ? p.CODHDA === selectedLoja : true;
			return p.DT_BORDERO >= start && p.DT_BORDERO <= end && tokenMatch;
		});
		const grouped: Record<string, number> = {};
		filtered.forEach((p: Proposta) => {
			const motor = (p.CODIGOMODELO || '').trim();
			if (!motor) return;
			grouped[motor] = (grouped[motor] || 0) + 1;
		});
		return Object.entries(grouped)
			.map(([name, sales]) => ({ name, sales }))
			.sort((a, b) => b.sales - a.sales)
			.slice(0, 10);
	}, [startDate, endDate, propostas, selectedLoja]);

	return {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		loading: loadingCurrent,
		propostas,
		productPie,
		tipoPropostaPie,
		totalPropostas,
		totalFaturamento,
		topVendors,
		topMotors,
		refetchCurrent,
		errorCurrent,
		isErrorCurrent,
		lojas,
		selectedLoja,
		setSelectedLoja,
	};
}
