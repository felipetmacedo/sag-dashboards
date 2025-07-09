import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdimplencia } from '@/processes/adimplencia';
import { useLojasStore } from '@/stores/lojas.store';
import { startOfMonth, endOfMonth } from 'date-fns';

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

export default function useAdimplenciaContainer() {
	// Default to current month
	const currentDate = new Date();
	const [startDate, setStartDate] = useState<Date>(startOfMonth(currentDate));
	const [endDate, setEndDate] = useState<Date>(endOfMonth(currentDate));
	const lojas = useLojasStore((state) => state.lojas);
	const [selectedLoja, setSelectedLoja] = useState<string | null>(null);
	const [selectedParcelas, setSelectedParcelas] = useState<string[]>([]);
	const [searchFilter, setSearchFilter] = useState<string>('');

	const {
		data: adimplenciaRaw,
		isLoading,
		refetch,
		error,
		isError,
	} = useQuery({
		queryKey: [
			'adimplencia',
			startDate.toISOString().slice(0, 10),
			endDate.toISOString().slice(0, 10),
			selectedLoja,
		],
		queryFn: () =>
			fetchAdimplencia({
				DT_INICIO: startDate.toISOString().slice(0, 10),
				DT_FINAL: endDate.toISOString().slice(0, 10),
				codhda: selectedLoja
					? [selectedLoja]
					: lojas?.map((l) => l.codhda),
			}),
		refetchOnWindowFocus: false,
	});

	// Compute available parcelas from data
	const availableParcelas = useMemo(() => {
		if (!adimplenciaRaw) return [];
		const unique = Array.from(
			new Set(adimplenciaRaw.map((row) => row.parcela))
		);
		return unique.sort();
	}, [adimplenciaRaw]);

	// Filter and stats
	const filteredData = useMemo(() => {
		if (!adimplenciaRaw) return [];
		return adimplenciaRaw.filter((item) => {
			// Filter by parcelas if any are selected
			if (selectedParcelas.length > 0 && !selectedParcelas.includes(item.parcela))
				return false;
			// Filter by search
			if (!searchFilter) return true;
			return (
				String(item.nomeVendedor ?? '').toLowerCase().includes(searchFilter.toLowerCase()) ||
				String(item.codhda ?? '').toLowerCase().includes(searchFilter.toLowerCase()) ||
				String(item.cpfVendedor ?? '').includes(searchFilter)
			);
		});
	}, [adimplenciaRaw, selectedParcelas, searchFilter]);

	const stats = useMemo(() => {
		if (!filteredData.length) {
			return {
				totalPropostas: 0,
				totalPago: 0,
				totalPendente: 0,
				percentualAdimplencia: 0,
			};
		}
		const totalPropostas = filteredData.reduce(
			(sum, item) => sum + (item.totalPropostas || 0),
			0
		);
		const totalPago = filteredData.reduce(
			(sum, item) => sum + (item.totalPago || 0),
			0
		);
		const totalPendente = filteredData.reduce(
			(sum, item) => sum + (item.totalPendente || 0),
			0
		);
		const percentualAdimplencia =
			totalPropostas > 0 ? (totalPago / totalPropostas) * 100 : 0;
		return {
			totalPropostas,
			totalPago,
			totalPendente,
			percentualAdimplencia,
		};
	}, [filteredData]);

	return {
		data: filteredData,
		stats,
		isLoading,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		lojas,
		selectedLoja,
		setSelectedLoja,
		selectedParcelas,
		setSelectedParcelas,
		availableParcelas,
		searchFilter,
		setSearchFilter,
		refetch,
		error,
		isError,
	};
}
