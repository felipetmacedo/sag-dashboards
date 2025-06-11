import { useMemo, useState, useCallback } from 'react';
import { Download, ChevronUp, ChevronDown, List } from 'lucide-react';
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

import VendasContainer, { RankingRow } from './Checkup.container';
import type { Proposta } from '@/types/proposta';
import { exportToCsv } from '@/utils/export-to-csv';
import { Input } from '@/components/ui/input';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function Checkup() {
	const [open, setOpen] = useState(false);
	const {
		data,
		rankingType,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
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

	// Table sorting state - default sort by quantity descending
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'qtd', desc: true },
	]);

	// Define columns based on ranking type
	const columns = useMemo<ColumnDef<RankingRow & Partial<Proposta>>[]>(() => {
		// Base columns for all ranking types
		const baseColumns: ColumnDef<RankingRow & Partial<Proposta>>[] = [
			{
				accessorKey: 'CODHDA',
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
							Codhda
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
					const value = row.getValue('CODHDA');
					console.log(value);
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'proposta',
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
							Proposta
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
					const numProposta = row.original.NUM_PROPOSTA as
						| string
						| undefined;
					const digProposta = row.original.DIG_PROPOSTA as
						| string
						| undefined;
					return (
						<div className="font-medium">
							{numProposta} - {digProposta}
						</div>
					);
				},
			},
			{
				accessorKey: 'STATUS',
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
							Status
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
					const value = row.getValue('STATUS');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'NOME_PLANO',
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
							Nome_plano
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
					const value = row.getValue('NOME_PLANO');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'grupoCota',
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
							Grupo/cota/rd
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
					const numGrupo = row.original.NUM_GRUPO as
						| string
						| null
						| undefined;
					const numCota = row.original.NUM_COTA as
						| string
						| null
						| undefined;
					const repCota = row.original.REP_COTA as
						| string
						| null
						| undefined;
					const digCota = row.original.DIG_COTA as
						| string
						| null
						| undefined;
					return (
						<div className="font-medium">
							{numGrupo || '-'}/{numCota || '-'}/{repCota || '-'}/
							{digCota || '-'}
						</div>
					);
				},
			},
			{
				accessorKey: 'CPFCNPCONSORCIADO',
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
							CPF cliente
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
					const value = row.getValue('CPFCNPCONSORCIADO');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'NOMECONSORCIADO',
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
							Nome
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
					const value = row.getValue('NOMECONSORCIADO');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'DATA_VENDA',
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
							Data venda
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
					const value = row.getValue('DATA_VENDA');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'DT_BORDERO',
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
							Data bordero
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
					const value = row.getValue('DT_BORDERO');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
			{
				accessorKey: 'CPF_VENDEDOR',
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
							CPF vendedor
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
					const value = row.getValue('CPF_VENDEDOR');
					return (
						<div className="font-medium">
							{value === null ? 'Não informado' : value}
						</div>
					);
				},
			},
		];

		return baseColumns;
	}, []);

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
							<List className="inline-block" />
							<CollapsibleTrigger asChild>
								<button className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2 hover:underline focus:outline-none">
									Todas Propostas - {displayLoja}
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
								Valor
							</label>
							<Input 
								placeholder={'Buscar por qualquer campo'} 
								value={searchFilter}
								onChange={(e) => setSearchFilter(e.target.value)}
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

			<Card className="mb-6">
				<CardHeader className="pb-3">
					<CardTitle>Resumo</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						<div className="text-4xl font-bold">{data.length}</div>
						<div className="text-muted-foreground">Propostas no período</div>
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
