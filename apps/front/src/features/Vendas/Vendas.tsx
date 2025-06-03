import { useMemo, useState, useCallback } from 'react';
import { Download, ChevronUp, ChevronDown, Banknote } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import VendasContainer, { RankingRow } from './Vendas.container';
import { exportToCsv } from '@/utils/export-to-csv';
import { Input } from '@/components/ui/input';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function Vendas() {
	const [open, setOpen] = useState(false);
	const {
		data,
		rankingType,
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
		displayLoja,
	} = VendasContainer();

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

	// Extract all unique status values from data for vendor ranking
	const uniqueStatuses = useMemo(() => {
		if (rankingType !== 'vendor' || !data.length) return [];

		// Create a map to store statuses by name to avoid duplicates
		const statusMap = new Map<string, string>();

		data.forEach((item) => {
			if (item.plans && item.plans.length > 0) {
				item.plans.forEach((plan) => {
					// Normalize status name to avoid case differences or whitespace issues
					const normalizedName = plan.plan.trim();
					statusMap.set(normalizedName, normalizedName);
				});
			}
		});

		// Convert map values to array and sort
		return Array.from(statusMap.values()).sort();
	}, [data, rankingType]);

	// Helper to find status data for a vendor
	const getVendorStatusData = useCallback(
		(item: RankingRow, statusName: string) => {
			if (!item.plans) return { qtd: 0, percent: 0 };
			const statusItem = item.plans.find(
				(p: { plan: string; qtd: number; percent: number }) =>
					p.plan.trim() === statusName
			);
			return statusItem
				? { qtd: statusItem.qtd, percent: statusItem.percent }
				: { qtd: 0, percent: 0 };
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
				cell: ({ row }) => {
					const qtd = row.original.qtd;
					const percent = row.original.percent;
					return (
						<div className="text-right">
							{qtd} ({formatPercent(percent)})
						</div>
					);
				},
				accessorFn: (row) => {
					return row.qtd;
				},
			},
		];

		// Add vendor-specific columns
		if (rankingType === 'vendor') {
			// Add valor total, ticket médio, etc.
			baseColumns.push({
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
							{value !== undefined ? formatCurrency(value) : '-'}
						</div>
					);
				},
			});

			uniqueStatuses.forEach((statusName) => {
				baseColumns.push({
					id: `status-${statusName}`,
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
								{statusName}
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
						const statusData = getVendorStatusData(
							item,
							statusName
						);
						return (
							<div className="text-right">
								{statusData.qtd} (
								{statusData.percent.toFixed(2)}%)
							</div>
						);
					},
					accessorFn: (row) => {
						return getVendorStatusData(row, statusName).qtd;
					},
				});
			});
		}

		return baseColumns;
	}, [
		rankingType,
		rankingTypeLabels,
		uniqueStatuses,
		formatCurrency,
		formatPercent,
		getVendorStatusData,
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

	return (
		<div className="p-4">
			<div className="mb-6">
				<div className="flex items-center justify-between mb-2 gap-4 md:flex-row flex-col">
					<Collapsible open={open} onOpenChange={setOpen}>
						<div className="flex items-center gap-2 relative">
							<Banknote className="inline-block" />
							<CollapsibleTrigger asChild>
								<button className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2 hover:underline focus:outline-none">
									Qualidade Vendas por Vendedor - {displayLoja}
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
						<div className="w-full md:w-1/3">
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

						<div className="w-full md:w-1/3">
							<label className="text-sm font-medium mb-1 block">
								Data Inicial
							</label>
							<DatePicker
								value={startDate}
								onChange={handleStartDateChange}
							/>
						</div>

						<div className="w-full md:w-1/3">
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
