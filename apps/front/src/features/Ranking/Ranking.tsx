import React, { useMemo } from 'react';
import { BarChart3, Download } from 'lucide-react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

import useRanking, { RankingType } from './Ranking.container';
import { exportToCsv } from '@/utils/export-to-csv';
import { Input } from '@/components/ui/input';

export default function Ranking() {
	const {
		data,
		rankingType,
		setRankingType,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		rankingTypeLabels,
		exportData,
		exportHeaders,
		isLoading,
		searchFilter,
		setSearchFilter,
	} = useRanking();

	// Wrapper functions to handle the type conversion
	const handleStartDateChange = (date: Date | null) => {
		if (date) setStartDate(date);
	};

	const handleEndDateChange = (date: Date | null) => {
		if (date) setEndDate(date);
	};

	// Format percentage for display
	const formatPercent = (value: number) => {
		return `${value.toFixed(2)}%`;
	};

	// Format currency for display
	const formatCurrency = (value: number) => {
		return value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		});
	};

	// Handle export to CSV
	const handleExport = () => {
		exportToCsv({
			data: exportData,
			headers: exportHeaders,
			filename: `ranking_${rankingType}_${format(
				startDate,
				'dd-MM-yyyy'
			)}_a_${format(endDate, 'dd-MM-yyyy')}`,
		});
	};

	// Extract all unique plan names from data for vendor ranking
	const uniquePlans = useMemo(() => {
		if (rankingType !== 'vendor' || !data.length) return [];
		
		const plansSet = new Set<string>();
		data.forEach(item => {
			if (item.plans && item.plans.length > 0) {
				item.plans.forEach(plan => {
					plansSet.add(plan.plan);
				});
			}
		});
		
		return Array.from(plansSet).sort();
	}, [data, rankingType]);

	// Helper to find plan quantity for a vendor
	const getVendorPlanQtd = (item: any, planName: string) => {
		if (!item.plans) return 0;
		const plan = item.plans.find(p => p.plan === planName);
		return plan ? plan.qtd : 0;
	};

	return (
		<div className="p-4">
			<div className="mb-6">
				<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
					<h1 className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2">
						<BarChart3 className="inline-block" /> Rankings
					</h1>
					<Button
						variant="outline"
						className="flex items-center gap-2 bg-green-100"
						onClick={handleExport}
					>
						<Download size={16} />
						Exportar CSV
					</Button>
				</div>
			</div>

			<Card className="mb-6">
				<CardHeader className="pb-3">
					<CardTitle>Filtros</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="w-full md:w-1/4">
							<label className="text-sm font-medium mb-1 block">
								Tipo de Ranking
							</label>
							<Select
								value={rankingType}
								onValueChange={(value) =>
									setRankingType(value as RankingType)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecione o tipo de ranking" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(rankingTypeLabels).map(
										([value, label]) => (
											<SelectItem
												key={value}
												value={value}
											>
												{label}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="w-full md:w-1/4">
							<label className="text-sm font-medium mb-1 block">
								{rankingTypeLabels[rankingType]}
							</label>
							<Input
								placeholder={`Buscar por ${rankingTypeLabels[
									rankingType
								].toLowerCase()}...`}
								value={searchFilter}
								onChange={(e) =>
									setSearchFilter(e.target.value)
								}
							/>
						</div>

						<div className="w-full md:w-1/4">
							<label className="text-sm font-medium mb-1 block">
								Data Inicial
							</label>
							<DatePicker
								value={startDate}
								onChange={handleStartDateChange}
							/>
						</div>

						<div className="w-full md:w-1/4">
							<label className="text-sm font-medium mb-1 block">
								Data Final
							</label>
							<DatePicker
								value={endDate}
								onChange={handleEndDateChange}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle>
						Ranking por {rankingTypeLabels[rankingType]} -{' '}
						{format(startDate, 'dd/MM/yyyy')} até{' '}
						{format(endDate, 'dd/MM/yyyy')}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-3">
							{/* Table skeleton */}
							<div className="overflow-x-auto">
								<div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-4"></div>
								<div className="space-y-2">
									<div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
									{[...Array(5)].map((_, index) => (
										<div
											key={index}
											className="h-12 w-full bg-gray-200 rounded animate-pulse"
										></div>
									))}
								</div>
							</div>
						</div>
					) : data.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">
								Nenhum dado encontrado para o período
								selecionado.
							</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											{rankingTypeLabels[rankingType]}
										</TableHead>
										{rankingType === 'city' && (
											<TableHead>População</TableHead>
										)}
										{rankingType === 'city' && (
											<TableHead>Med. 12</TableHead>
										)}
										<TableHead className="text-right">
											QTD.
										</TableHead>
										<TableHead className="text-right">
											%
										</TableHead>
										{rankingType === 'vendor' && (
											<>
												<TableHead className="text-right">
													Valor Total
												</TableHead>
												<TableHead className="text-right">
													Ticket Médio
												</TableHead>
												<TableHead className="text-right">
													NOVA
												</TableHead>
												<TableHead className="text-right">
													REPOSICAO
												</TableHead>
												{/* Add plan headers for vendor type */}
												{uniquePlans.map(plan => (
													<TableHead key={plan} className="text-right">
														{plan}
													</TableHead>
												))}
											</>
										)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.map((item, index) => (
										<TableRow key={index}>
											<TableCell className="font-medium">
												{item.key === null
													? 'Não informado'
													: item.key}
											</TableCell>
											{rankingType === 'city' && (
												<TableCell>
													{item.population || '-'}
												</TableCell>
											)}
											{rankingType === 'city' && (
												<TableCell>
													{item.med12 || '-'}
												</TableCell>
											)}
											<TableCell className="text-right">
												{item.qtd}
											</TableCell>
											<TableCell className="text-right">
												{formatPercent(item.percent)}
											</TableCell>
											{rankingType === 'vendor' &&
												item.valorTotal !==
													undefined && (
													<>
														<TableCell className="text-right">
															{formatCurrency(
																item.valorTotal
															)}
														</TableCell>
														<TableCell className="text-right">
															{formatCurrency(
																item.ticketMedio ||
																	0
															)}
														</TableCell>
														<TableCell className="text-right">
															{item.tipoBreakdown
																? item.tipoBreakdown.find(
																		(t) =>
																			t.tipo ===
																			'NOVA'
																  )?.value || 0
																: 0}
														</TableCell>
														<TableCell className="text-right">
															{item.tipoBreakdown
																? item.tipoBreakdown.find(
																		(t) =>
																			t.tipo ===
																			'REPOSICAO'
																  )?.value || 0
																: 0}
														</TableCell>
														{/* Add plan data cells for vendor type */}
														{uniquePlans.map(plan => (
															<TableCell key={`${index}-${plan}`} className="text-right">
																{getVendorPlanQtd(item, plan)}
															</TableCell>
														))}
													</>
												)}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}