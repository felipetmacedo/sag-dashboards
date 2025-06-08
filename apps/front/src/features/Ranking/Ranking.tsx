import React, { useMemo, useState, useCallback } from 'react';
import { BarChart3, Download, ChevronUp, ChevronDown } from 'lucide-react';

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
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table';

import useRanking, { RankingType, RankingRow } from './Ranking.container';
import { exportToCsv } from '@/utils/export-to-csv';
import { Input } from '@/components/ui/input';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

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
		lojas,
		selectedLoja,
		setSelectedLoja,
	} = useRanking();

	// Wrapper functions to handle the type conversion
	const handleStartDateChange = (date: Date | null) => {
		if (date) setStartDate(date);
	};

	const handleEndDateChange = (date: Date | null) => {
		if (date) setEndDate(date);
	};

	// Format percentage for display - using useCallback to avoid dependency issues in useMemo
	const formatPercent = useCallback((value: number) => {
		return `${value.toFixed(2)}%`;
	}, []);

	// Format currency for display - using useCallback to avoid dependency issues in useMemo
	const formatCurrency = useCallback((value: number) => {
		return value.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		});
	}, []);

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

		// Create a map to store plans by name to avoid duplicates
		const plansMap = new Map<string, string>();

		data.forEach((item) => {
			if (item.plans && item.plans.length > 0) {
				item.plans.forEach((plan) => {
					// Normalize plan name to avoid case differences or whitespace issues
					const normalizedName = plan.plan.trim();
					plansMap.set(normalizedName, normalizedName);
				});
			}
		});

		// Convert map values to array and sort
		return Array.from(plansMap.values()).sort();
	}, [data, rankingType]);

	// Helper to find plan quantity for a vendor
	const getVendorPlanQtd = useCallback(
		(item: RankingRow, planName: string) => {
			if (!item.plans) return 0;
			const plan = item.plans.find(
				(p: { plan: string; qtd: number }) => p.plan.trim() === planName
			);
			return plan ? plan.qtd : 0;
		},
		[]
	);

	// Table sorting state - default sort by quantity descending
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'qtd', desc: true },
	]);

	// Define columns based on ranking type
	const columns = useMemo<ColumnDef<RankingRow>[]>(() => {
		// Base columns for all ranking types
		const baseColumns: ColumnDef<RankingRow>[] = [
			{
				accessorKey: 'key',
				header: ({ column }) => (
					<div>
						<Button
							variant="ghost"
							onClick={() =>
								column.toggleSorting(
									column.getIsSorted() === 'asc'
								)
							}
							className="px-0 font-medium text-xs"
						>
							{rankingTypeLabels[rankingType]}
							{column.getIsSorted() &&
								(column.getIsSorted() === 'asc' ? (
									<ChevronUp className="ml-2 h-4 w-4" />
								) : (
									<ChevronDown className="ml-2 h-4 w-4" />
								))}
						</Button>
					</div>
				),
				cell: ({ row }) => {
					const value = row.getValue('key');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'qtd',
				header: ({ column }) => (
					<div className="text-xs px-0">
						<Button
							variant="ghost"
							onClick={() =>
								column.toggleSorting(
									column.getIsSorted() === 'asc'
								)
							}
							className="px-0 font-medium justify-end w-full text-xs"
						>
							<span
								className={
									sorting[0]?.id === 'qtd' ? 'font-bold' : ''
								}
							>
								QTD.
							</span>
							{column.getIsSorted() &&
								(column.getIsSorted() === 'asc' ? (
									<ChevronUp className="ml-2 h-4 w-4" />
								) : (
									<ChevronDown className="ml-2 h-4 w-4" />
								))}
						</Button>
					</div>
				),
				cell: ({ row }) => (
					<div className="text-right">{row.getValue('qtd')}</div>
				),
			},
			{
				accessorKey: 'percent',
				header: ({ column }) => (
					<div className="text-xs px-0">
						<Button
							variant="ghost"
							onClick={() =>
								column.toggleSorting(
									column.getIsSorted() === 'asc'
								)
							}
							className="px-0 font-medium justify-end w-full text-xs"
						>
							<span
								className={
									sorting[0]?.id === 'percent'
										? 'font-bold'
										: ''
								}
							>
								%
							</span>
							{column.getIsSorted() &&
								(column.getIsSorted() === 'asc' ? (
									<ChevronUp className="ml-2 h-4 w-4" />
								) : (
									<ChevronDown className="ml-2 h-4 w-4" />
								))}
						</Button>
					</div>
				),
				cell: ({ row }) => {
					const value = row.getValue<number>('percent');
					return (
						<div className="text-right">{formatPercent(value)}</div>
					);
				},
			},
		];

		// Add vendor-specific columns
		if (rankingType === 'vendor') {
			// Add valor total, ticket médio, etc.
			baseColumns.push(
				{
					accessorKey: 'nomeVendedor',
					header: ({ column }) => (
						<div className="text-xs px-0">
							<Button
								variant="ghost"
								onClick={() =>
									column.toggleSorting(
										column.getIsSorted() === 'asc'
									)
								}
								className="px-0 font-medium justify-end w-full text-xs"
							>
								Nome vendedor
								{column.getIsSorted() &&
									(column.getIsSorted() === 'asc' ? (
										<ChevronUp className="ml-2 h-4 w-4" />
									) : (
										<ChevronDown className="ml-2 h-4 w-4" />
									))}
							</Button>
						</div>
					),
					cell: ({ row }) => {
						const value = row.getValue<string | undefined>(
							'nomeVendedor'
						);
						return (
							<div className="text-right">
								{value !== undefined
									? value
									: '-'}
							</div>
						);
					},
				},
				{
					accessorKey: 'valorTotal',
					header: ({ column }) => (
						<div className="text-xs px-0">
							<Button
								variant="ghost"
								onClick={() =>
									column.toggleSorting(
										column.getIsSorted() === 'asc'
									)
								}
								className="px-0 font-medium justify-end w-full text-xs"
							>
								Valor Total
								{column.getIsSorted() &&
									(column.getIsSorted() === 'asc' ? (
										<ChevronUp className="ml-2 h-4 w-4" />
									) : (
										<ChevronDown className="ml-2 h-4 w-4" />
									))}
							</Button>
						</div>
					),
					cell: ({ row }) => {
						const value = row.getValue<number | undefined>(
							'valorTotal'
						);
						return (
							<div className="text-right">
								{value !== undefined
									? formatCurrency(value)
									: '-'}
							</div>
						);
					},
				},
				{
					accessorKey: 'ticketMedio',
					header: ({ column }) => (
						<div className="text-xs px-0">
							<Button
								variant="ghost"
								onClick={() =>
									column.toggleSorting(
										column.getIsSorted() === 'asc'
									)
								}
								className="px-0 font-medium justify-end w-full text-xs"
							>
								Ticket Médio
								{column.getIsSorted() &&
									(column.getIsSorted() === 'asc' ? (
										<ChevronUp className="ml-2 h-4 w-4" />
									) : (
										<ChevronDown className="ml-2 h-4 w-4" />
									))}
							</Button>
						</div>
					),
					cell: ({ row }) => {
						const value = row.getValue<number | undefined>(
							'ticketMedio'
						);
						return (
							<div className="text-right">
								{value !== undefined
									? formatCurrency(value || 0)
									: '-'}
							</div>
						);
					},
				},
				{
					id: 'nova',
					header: ({ column }) => (
						<div className="text-xs px-0">
							<Button
								variant="ghost"
								onClick={() =>
									column.toggleSorting(
										column.getIsSorted() === 'asc'
									)
								}
								className="px-0 font-medium justify-end w-full text-xs"
							>
								NOVA
								{column.getIsSorted() &&
									(column.getIsSorted() === 'asc' ? (
										<ChevronUp className="ml-2 h-4 w-4" />
									) : (
										<ChevronDown className="ml-2 h-4 w-4" />
									))}
							</Button>
						</div>
					),
					cell: ({ row }) => {
						const item = row.original;
						const value = item.tipoBreakdown
							? item.tipoBreakdown.find(
									(t: { tipo: string; value: number }) =>
										t.tipo === 'NOVA'
							  )?.value || 0
							: 0;
						return <div className="text-right">{value}</div>;
					},
					accessorFn: (row) => {
						return row.tipoBreakdown
							? row.tipoBreakdown.find(
									(t: { tipo: string; value: number }) =>
										t.tipo === 'NOVA'
							  )?.value || 0
							: 0;
					},
				},
				{
					id: 'reposicao',
					header: ({ column }) => (
						<div className="text-xs px-0">
							<Button
								variant="ghost"
								onClick={() =>
									column.toggleSorting(
										column.getIsSorted() === 'asc'
									)
								}
								className="px-0 font-medium justify-end w-full text-xs "
							>
								REPOSICAO
								{column.getIsSorted() &&
									(column.getIsSorted() === 'asc' ? (
										<ChevronUp className="ml-2 h-4 w-4" />
									) : (
										<ChevronDown className="ml-2 h-4 w-4" />
									))}
							</Button>
						</div>
					),
					cell: ({ row }) => {
						const item = row.original;
						const value = item.tipoBreakdown
							? item.tipoBreakdown.find(
									(t: { tipo: string; value: number }) =>
										t.tipo === 'REPOSICAO'
							  )?.value || 0
							: 0;
						return <div className="text-right">{value}</div>;
					},
					accessorFn: (row) => {
						return row.tipoBreakdown
							? row.tipoBreakdown.find(
									(t: { tipo: string; value: number }) =>
										t.tipo === 'REPOSICAO'
							  )?.value || 0
							: 0;
					},
				}
			);

			uniquePlans.forEach((planName) => {
				baseColumns.push({
					id: `plan-${planName}`,
					header: ({ column }) => (
						<div className="text-xs px-0">
							<Button
								variant="ghost"
								onClick={() =>
									column.toggleSorting(
										column.getIsSorted() === 'asc'
									)
								}
								className="px-0 font-medium justify-end w-full text-xs"
							>
								{planName}
								{column.getIsSorted() &&
									(column.getIsSorted() === 'asc' ? (
										<ChevronUp className="ml-2 h-4 w-4" />
									) : (
										<ChevronDown className="ml-2 h-4 w-4" />
									))}
							</Button>
						</div>
					),
					cell: ({ row }) => {
						const item = row.original;
						return (
							<div className="text-right">
								{getVendorPlanQtd(item, planName)}
							</div>
						);
					},
					accessorFn: (row) => {
						return getVendorPlanQtd(row, planName);
					},
				});
			});
		}

		return baseColumns;
	}, [
		rankingType,
		rankingTypeLabels,
		uniquePlans,
		formatCurrency,
		formatPercent,
		getVendorPlanQtd,
		sorting,
	]);

	// Initialize the table
	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getCoreRowModel: getCoreRowModel(),
	});

	const [open, setOpen] = useState(false);
	const selectedLojaObj = lojas?.find(l => l.token_whatsapp === selectedLoja);
	const displayLoja = selectedLojaObj ? selectedLojaObj.empresa : 'Todas as Lojas';

	return (
		<div className="p-4">
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2 gap-4 md:flex-row flex-col">
					<Collapsible open={open} onOpenChange={setOpen}>
						<div className="flex items-center gap-2 relative">
							<BarChart3 className="inline-block" />
							<CollapsibleTrigger asChild>
								<button className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2 hover:underline focus:outline-none">
									Ranking - {displayLoja}
									{open ? (
										<ChevronUp size={18} />
									) : (
										<ChevronDown size={18} />
									)}
								</button>
							</CollapsibleTrigger>
						</div>
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
										<li key={loja.token_whatsapp}>
											<button
												className={`w-full text-left px-2 py-1 rounded ${
													selectedLoja ===
													loja.token_whatsapp
														? 'bg-purple-100 font-semibold'
														: 'hover:bg-gray-100'
												}`}
												onClick={() => {
													setSelectedLoja(
														loja.token_whatsapp
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
									{table
										.getHeaderGroups()
										.map((headerGroup) => (
											<TableRow key={headerGroup.id}>
												{headerGroup.headers.map(
													(header) => (
														<TableHead
															key={header.id}
															className="text-xs"
														>
															{header.isPlaceholder
																? null
																: flexRender(
																		header
																			.column
																			.columnDef
																			.header,
																		header.getContext()
																  )}
														</TableHead>
													)
												)}
											</TableRow>
										))}
								</TableHeader>
								<TableBody>
									{table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map((row) => (
											<TableRow
												key={row.id}
												data-state={
													row.getIsSelected() &&
													'selected'
												}
											>
												{row
													.getVisibleCells()
													.map((cell) => (
														<TableCell
															key={cell.id}
														>
															{flexRender(
																cell.column
																	.columnDef
																	.cell,
																cell.getContext()
															)}
														</TableCell>
													))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className="h-24 text-center"
											>
												Nenhum resultado encontrado.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
