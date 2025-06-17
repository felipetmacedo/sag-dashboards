import { useMemo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { AdimplenciaRow } from '../Adimplencia.container';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	SortingState,
	ColumnDef,
} from '@tanstack/react-table';

interface AdimplenciaTableProps {
	data: AdimplenciaRow[];
	isLoading?: boolean;
	searchFilter: string;
}

export const AdimplenciaTable = ({
	data,
	isLoading = false,
	searchFilter,
}: AdimplenciaTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'percentualAdimplencia', desc: true },
	]);

	// Badge rendering logic
	const getAdimplenciaBadge = useCallback((percentual: number) => {
		if (percentual >= 90) {
			return (
				<Badge
					variant="default"
					className="bg-green-500 hover:bg-green-600"
				>
					Excelente
				</Badge>
			);
		} else if (percentual >= 70) {
			return (
				<Badge
					variant="secondary"
					className="bg-yellow-500 hover:bg-yellow-600 text-white"
				>
					Boa
				</Badge>
			);
		} else if (percentual >= 50) {
			return (
				<Badge
					variant="secondary"
					className="bg-orange-500 hover:bg-orange-600 text-white"
				>
					Regular
				</Badge>
			);
		} else {
			return <Badge variant="destructive">Baixa</Badge>;
		}
	}, []);

	// Columns definition following Ranking.tsx pattern
	const columns = useMemo<ColumnDef<AdimplenciaRow>[]>(
		() => [
			{
				accessorKey: 'nomeVendedor',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Vendedor
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => {
					const value = info.getValue();
					return (
						<span>
							{typeof value === 'number'
								? value.toLocaleString('pt-BR')
								: String(value ?? '')}
						</span>
					);
				},
			},
			{
				accessorKey: 'codhda',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Loja
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => <span>{info.getValue()}</span>,
			},
			{
				accessorKey: 'parcela',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Parcela
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => <span>{info.getValue()}</span>,
			},
			{
				accessorKey: 'totalPropostas',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Propostas
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => <span>{info.getValue()}</span>,
				meta: { align: 'right' },
			},
			{
				accessorKey: 'totalPago',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Pago
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => <span>{info.getValue()}</span>,
				meta: { align: 'right' },
			},
			{
				accessorKey: 'totalPendente',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						Pendente
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => <span>{info.getValue()}</span>,
				meta: { align: 'right' },
			},
			{
				accessorKey: 'percentualAdimplencia',
				header: ({ column }) => (
					<Button
						variant="ghost"
						className="px-0 font-medium text-xs"
						onClick={() =>
							column.toggleSorting(column.getIsSorted() === 'asc')
						}
					>
						% Adimplência
						{column.getIsSorted() === 'asc' ? (
							<ArrowUp className="ml-2 h-4 w-4" />
						) : column.getIsSorted() === 'desc' ? (
							<ArrowDown className="ml-2 h-4 w-4" />
						) : (
							<ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
						)}
					</Button>
				),
				cell: (info) => {
					const value = info.getValue();
					return (
						<span>
							{typeof value === 'number'
								? value.toFixed(1) + '%'
								: ''}
						</span>
					);
				},
				meta: { align: 'right' },
				sortingFn: 'basic',
			},
			{
				id: 'status',
				header: () => <span>Status</span>,
				cell: (info) =>
					getAdimplenciaBadge(
						info.row.original.percentualAdimplencia
					),
			},
		],
		[getAdimplenciaBadge]
	);

	// Filter data by searchFilter (client-side)
	const filteredData = useMemo(() => {
		if (!searchFilter) return data;
		return data.filter(
			(item) =>
				String(item.nomeVendedor ?? '')
					.toLowerCase()
					.includes(searchFilter.toLowerCase()) ||
				String(item.codhda ?? '')
					.toLowerCase()
					.includes(searchFilter.toLowerCase()) ||
				String(item.cpfVendedor ?? '').includes(searchFilter)
		);
	}, [data, searchFilter]);

	const table = useReactTable({
		data: filteredData,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualSorting: false,
		debugTable: false,
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Detalhamento por Vendedor</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Detalhamento por Vendedor</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											className="whitespace-nowrap"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
															.header,
														header.getContext()
												  )}
										</TableHead>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow key={row.id}>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className="whitespace-nowrap"
											>
												{flexRender(
													cell.column.columnDef.cell,
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
										className="text-center"
									>
										Nenhum dado encontrado.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
};
