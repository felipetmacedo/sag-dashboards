'use client';

import {
	ArrowLeft,
	Search,
	Loader2,
	CheckCircle,
	RefreshCw,
	Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

import ListViewContainer from './ListView.container';

interface StatusIconProps {
	status: string;
	className?: string;
}

// Status icon mapping
const StatusIcon = ({ status, className = '' }: StatusIconProps) => {
	const baseClass = `inline-block ${className}`;

	switch (status) {
		case 'andamento':
			return (
				<RefreshCw
					className={`${baseClass} text-amber-500 animate-spin`}
					size={16}
				/>
			);
		case 'limpo':
			return (
				<CheckCircle
					className={`${baseClass} text-green-500`}
					size={16}
				/>
			);
		default:
			return null;
	}
};

interface StatusDropdownProps {
	status: boolean;
	onStatusChange: (field: string, value: boolean) => void;
	field: string;
	disabled?: boolean;
}

// Status dropdown component
const StatusDropdown = ({ status, onStatusChange, field, disabled }: StatusDropdownProps) => {
	const options = [
		{ value: false, label: 'Em Andamento' },
		{ value: true, label: 'Limpo' },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild disabled={disabled} className='text-center'>
				<Button
					variant="ghost"
					className="h-8 justify-center flex items-center text-center"
				>
					<StatusIcon status={status ? 'limpo' : 'andamento'} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="center">
				{options.map((option) => (
					<DropdownMenuItem
						key={option.value.toString()}
						onClick={() => onStatusChange(field, option.value)}
						className="cursor-pointer"
					>
						<StatusIcon status={option.value ? 'limpo' : 'andamento'} />
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default function ListView() {
	const {
		list,
		searchTerm,
		hasPermission,
		setSearchTerm,
		handleSaveRequest,
		canUpdateRequest,
		isLoading,
		page,
		totalPages,
		handlePageChange,
	} = ListViewContainer();

	const navigate = useNavigate();

	// Function to handle status change
	const handleStatusChange = (requestId: string, field: string, newStatus: boolean) => {
		const request = list?.requests?.items.find((r) => r.id === requestId);
		if (request) {
			const updatedRequest = { 
				id: requestId,
				[field]: newStatus 
			};
			handleSaveRequest(updatedRequest);
		}
	};

	// Generate pagination items
	const renderPaginationItems = () => {
		const items = [];

		// Calculate start and end pages to show (show 5 page numbers max)
		let startPage = Math.max(1, page - 2);
		const endPage = Math.min(totalPages, startPage + 4);

		// Adjust if we're near the end
		if (endPage - startPage < 4 && totalPages > 5) {
			startPage = Math.max(1, endPage - 4);
		}

		// First page
		if (startPage > 1) {
			items.push(
				<PaginationItem key="1">
					<PaginationLink
						isActive={page === 1}
						onClick={() => handlePageChange(1)}
					>
						1
					</PaginationLink>
				</PaginationItem>
			);

			// Add ellipsis if there's a gap
			if (startPage > 2) {
				items.push(
					<PaginationItem key="ellipsis-1">
						<PaginationLink className="cursor-default pointer-events-none">
							...
						</PaginationLink>
					</PaginationItem>
				);
			}
		}

		// Page numbers
		for (let i = startPage; i <= endPage; i++) {
			items.push(
				<PaginationItem key={i}>
					<PaginationLink
						isActive={page === i}
						onClick={() => handlePageChange(i)}
					>
						{i}
					</PaginationLink>
				</PaginationItem>
			);
		}

		// Last page
		if (endPage < totalPages) {
			// Add ellipsis if there's a gap
			if (endPage < totalPages - 1) {
				items.push(
					<PaginationItem key="ellipsis-2">
						<PaginationLink className="cursor-default pointer-events-none">
							...
						</PaginationLink>
					</PaginationItem>
				);
			}

			items.push(
				<PaginationItem key={totalPages}>
					<PaginationLink
						isActive={page === totalPages}
						onClick={() => handlePageChange(totalPages)}
					>
						{totalPages}
					</PaginationLink>
				</PaginationItem>
			);
		}

		return items;
	};

	if (!hasPermission('READ', 'LISTS')) {
		return <div>Unauthorized</div>;
	}

	return (
		<div className="p-4">
			<Button
				variant="ghost"
				onClick={() => navigate('/lists')}
			>
				<ArrowLeft className="h-5 w-5 mr-2" />
				Voltar para listas
			</Button>

			<div className="flex justify-between items-center mb-4">
				<div>
					<h2 className="text-2xl font-bold text-apollo-gray-dark">
						{list?.name || 'Carregando...'}
					</h2>
				</div>

                <div className="flex items-center gap-2">
				<Card className="bg-amber-50 border-amber-200 shadow-sm">
					<CardContent className="p-4 flex flex-col items-center">
						<span className="text-amber-600 font-medium text-sm">
							Total de nomes
						</span>
						<span className="text-3xl font-bold text-amber-700">
							{list?.requests_count || 0}
						</span>
					</CardContent>
				</Card>

                <Button className="bg-green-50 border-green-200 border text-green-700 shadow-sm w-40 h-[90px] flex flex-col items-center justify-center hover:bg-green-100">
                    <Download className="h-5 w-5 mb-1" />
                    <span>Exportar</span>
                </Button>

                </div>

                
			</div>

			{/* Search only */}
			<div className="mb-4">
				<div className="flex flex-col md:flex-row gap-4 items-end">
					<div className="w-full">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Pesquisar por nome, documento, email ou telefone"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-8"
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-md border bg-white shadow-sm overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-50">
						<TableRow>
							<TableHead >Nome</TableHead>
							<TableHead>Nº Documento</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Telefone</TableHead>
							<TableHead>Serasa</TableHead>
							<TableHead>Boa Vista</TableHead>
							<TableHead>Cenprot</TableHead>
							<TableHead>SPC</TableHead>
							<TableHead>QUOD</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-center py-4"
								>
									<Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
									<span className="mt-2 block text-sm text-muted-foreground">
										Carregando...
									</span>
								</TableCell>
							</TableRow>
						) : list?.requests?.items.length === 0 ||
						  !list?.requests?.items ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-center py-4"
								>
									Nenhum nome encontrado
								</TableCell>
							</TableRow>
						) : (
							list?.requests?.items.map((request) => (
								<TableRow
									key={request.id}
									className="hover:bg-gray-50"
								>
									<TableCell className="font-medium">
										{request.name}
									</TableCell>
									<TableCell>
										{request.cpf_cnpj || '-'}
									</TableCell>
									<TableCell>
										{request.email || '-'}
									</TableCell>
									<TableCell>{request.phone}</TableCell>
									<TableCell>
										<StatusDropdown
											status={request.is_serasa_clean ? true : false}
											onStatusChange={(field, value) =>
												handleStatusChange(
													request.id,
													field,
													value
												)
											}
											field="is_serasa_clean"
											disabled={!canUpdateRequest}
										/>
									</TableCell>
									<TableCell>
										<StatusDropdown
											status={request.is_boa_vista_clean ? true : false}
											onStatusChange={(field, value) =>
												handleStatusChange(
													request.id,
													field,
													value
												)
											}
											field="is_boa_vista_clean"
											disabled={!canUpdateRequest}
										/>
									</TableCell>
									<TableCell>
										<StatusDropdown
											status={request.is_cenprot_clean ? true : false}
											onStatusChange={(field, value) =>
												handleStatusChange(
													request.id,
													field,
													value
												)
											}
											field="is_cenprot_clean"
											disabled={!canUpdateRequest}
										/>
									</TableCell>
									<TableCell>
										<StatusDropdown
											status={request.is_spc_clean ? true : false}
											onStatusChange={(field, value) =>
												handleStatusChange(
													request.id,
													field,
													value
												)
											}
											field="is_spc_clean"
											disabled={!canUpdateRequest}
										/>
									</TableCell>
									<TableCell>
										<StatusDropdown
											status={request.is_quod_clean ? true : false}
											onStatusChange={(field, value) =>
												handleStatusChange(
													request.id,
													field,
													value
												)
											}
											field="is_quod_clean"
											disabled={!canUpdateRequest}
										/>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="mt-6 mb-4 flex justify-center">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() =>
									handlePageChange(Math.max(1, page - 1))
								}
								className={
									page === 1 || isLoading
										? 'pointer-events-none opacity-50'
										: ''
								}
							/>
						</PaginationItem>

						{renderPaginationItems()}

						<PaginationItem>
							<PaginationNext
								onClick={() =>
									handlePageChange(
										Math.min(totalPages, page + 1)
									)
								}
								className={
									page === totalPages || isLoading
										? 'pointer-events-none opacity-50'
										: ''
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
