import React, { useState } from 'react';

import useAdimplenciaContainer from './Adimplencia.container';
import { AdimplenciaParametersControl } from './components/AdimplenciaParametersControl';
import { AdimplenciaStatsCards } from './components/AdimplenciaStatsCards';
import { AdimplenciaTable } from './components/AdimplenciaTable';
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Download, ChevronUp, ChevronDown, List, TrendingUp } from 'lucide-react';
import { exportToCsv } from '@/utils/export-to-csv';
import { exportAdimplenciaPdf } from '@/utils/adimplencia-pdf';

const Adimplencia: React.FC = () => {
	const {
		data,
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

	} = useAdimplenciaContainer();

	const [open, setOpen] = useState(false);
	// For display, get current loja name or fallback
	const displayLoja = selectedLoja
		? lojas?.find((l) => l.codhda === selectedLoja)?.empresa || selectedLoja
		: 'Todas as Lojas';

	// PDF Export handler
	const handleExportPdf = async () => {
		if (!data || data.length === 0) return;
		// Prepare per-parcela summary (grouped by parcela)
		const parcelasSummaryMap = new Map<string, { totalPropostas: number; totalPago: number; totalPendente: number; }>();
		data.forEach(item => {
			if (!parcelasSummaryMap.has(item.parcela)) {
				parcelasSummaryMap.set(item.parcela, { totalPropostas: 0, totalPago: 0, totalPendente: 0 });
			}
			const s = parcelasSummaryMap.get(item.parcela)!;
			s.totalPropostas += item.totalPropostas || 0;
			s.totalPago += item.totalPago || 0;
			s.totalPendente += item.totalPendente || 0;
		});
		const parcelasSummary = Array.from(parcelasSummaryMap.entries()).map(([parcela, s]) => ({
			parcela,
			totalPropostas: s.totalPropostas,
			totalPago: s.totalPago,
			totalPendente: s.totalPendente,
			percentualAdimplencia: s.totalPropostas > 0 ? (s.totalPago / s.totalPropostas) * 100 : 0,
		}));
		const period = `${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : ''} - ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : ''}`;
		await exportAdimplenciaPdf({
			loja: displayLoja,
			period,
			selectedParcelas,
			parcelasSummary,
			exportDate: '2025-07-09 10:25',
		});
	};

	// Export CSV handler
	const handleExport = () => {
		if (!data || data.length === 0) return;
		const headers = [
			{ label: 'Nome Vendedor', key: 'nomeVendedor' },
			{ label: 'Cód. Loja', key: 'codhda' },
			{ label: 'CPF Vendedor', key: 'cpfVendedor' },
			{ label: 'Parcela', key: 'parcela' },
			{ label: 'Total Propostas', key: 'totalPropostas' },
			{ label: 'Total Pago', key: 'totalPago' },
			{ label: 'Total Pendente', key: 'totalPendente' },
			{ label: '% Adimplência', key: 'percentualAdimplencia' },
		];
		exportToCsv({
			data: data.map((row) => ({
				...row,
				percentualAdimplencia: `${row.percentualAdimplencia.toFixed(
					1
				)}%`,
			})),
			headers,
			filename: `adimplencia_${displayLoja
				.replace(/\s+/g, '_')
				.toLowerCase()}`,
		});
	};

	return (
		<div className="flex flex-col gap-8 p-4 w-full min-h-screen">
			<div className="container mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div className="flex items-center gap-2">
					<TrendingUp className="inline-block" />
					<Collapsible open={open} onOpenChange={setOpen}>
						<CollapsibleTrigger asChild>
							<button className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2 hover:underline focus:outline-none bg-transparent">
								Adimplência - {displayLoja}
								{open ? (
									<ChevronUp size={18} />
								) : (
									<ChevronDown size={18} />
								)}
							</button>
						</CollapsibleTrigger>
						<CollapsibleContent className="z-10 relative">
							<div className="absolute left-0 right-0 md:right-auto md:w-[340px] z-10 bg-white rounded shadow p-2 border">
								<ul className="space-y-1">
									<li>
										<button
											className={`w-full text-left px-2 py-1 rounded ${
												!selectedLoja
													? 'bg-purple-100 font-semibold'
													: 'hover:bg-gray-100'
											}`}
											onClick={() => {
												setSelectedLoja(null);
												setOpen(false);
											}}
										>
											Todas as Lojas
										</button>
									</li>
									{lojas?.map((loja) => (
										<li key={loja.codhda}>
											<button
												className={`w-full text-left px-2 py-1 rounded ${
													selectedLoja === loja.codhda
														? 'bg-purple-100 font-semibold'
														: 'hover:bg-gray-100'
												}`}
												onClick={() => {
													setSelectedLoja(
														loja.codhda
													);
													setOpen(false);
												}}
											>
												{loja.empresa}
											</button>
										</li>
									))}
								</ul>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>
				<Button
					variant="outline"
					className="flex items-center gap-2 bg-green-100"
					onClick={handleExport}
					disabled={isLoading || !data || data.length === 0}
				>
					<Download size={16} />
					Exportar CSV
				</Button>
			</div>
			<main className="container mx-auto gap-4 flex flex-col">
				<AdimplenciaParametersControl
					startDate={startDate}
					setStartDate={date => { if (date) setStartDate(date); }}
					endDate={endDate}
					setEndDate={date => { if (date) setEndDate(date); }}
					selectedParcelas={selectedParcelas}
					setSelectedParcelas={setSelectedParcelas}
					availableParcelas={availableParcelas}
					searchFilter={searchFilter}
					setSearchFilter={setSearchFilter}
					isLoading={isLoading}
				/>
				<AdimplenciaStatsCards
					stats={stats}
					data={data}
					isLoading={isLoading}
				/>
				<AdimplenciaTable
					data={data}
					isLoading={isLoading}
					searchFilter={searchFilter}
				/>
			</main>
		</div>
	);
};

export default Adimplencia;
