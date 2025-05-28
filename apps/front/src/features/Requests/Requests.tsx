import {
	Search,
	Loader2,
	CheckCircle,
	RefreshCw,
	Plus,
	ShieldCheck,
	Edit,
	Trash2,
	Banknote,
} from 'lucide-react';

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
import { Card, CardContent } from '@/components/ui/card';
import { RequestForm } from '@/components/request';

import RequestsContainer from './Requests.container';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { addDays } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';

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

export default function Requests() {
	const {
		requests,
		searchTerm,
		hasPermission,
		setSearchTerm,
		handleSaveRequest,
		handleEditRequest,
		setEditingRequest,
		canCreateRequest,
		canUpdateRequest,
		canDeleteRequest,
		isLoading,
		isSubmitting,
		page,
		totalPages,
		handlePageChange,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		deleteMutation,
		selectedStatus,
		handleStatusChange,
		showForm,
		setShowForm,
		editingRequest,
	} = RequestsContainer();

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

	if (!hasPermission('READ', 'REQUESTS')) {
		return <div>Unauthorized</div>;
	}

	return (
		<div className="p-4">
			<div className="mb-6">
				<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
					<h2 className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2">
						Limpa nome <ShieldCheck className="inline-block" />
					</h2>

					<div className="flex flex-wrap gap-2 justify-between md:justify-end">
						<Card
							className={`${
								selectedStatus === 'Todos'
									? 'bg-gray-100 border-gray-300 ring-2 ring-gray-300'
									: 'bg-gray-50 border-gray-200'
							} shadow-sm transition-all duration-200 cursor-pointer hover:bg-gray-100 h-20 flex items-center justify-center w-24`}
							onClick={() => handleStatusChange('Todos')}
						>
							<CardContent className="p-2 flex flex-col items-center justify-center w-full h-full">
								<span className="text-gray-600 font-medium text-xs">
									Total
								</span>
								<span className="text-xl font-bold text-gray-700">
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
									) : (
										requests?.requests_count || 0
									)}
								</span>
							</CardContent>
						</Card>

						<Card
							className={`${
								selectedStatus === 'Pendente'
									? 'bg-amber-100 border-amber-300 ring-2 ring-amber-300'
									: 'bg-amber-50 border-amber-200'
							} shadow-sm transition-all duration-200 cursor-pointer hover:bg-amber-100 h-20 flex items-center justify-center w-24`}
							onClick={() => handleStatusChange('Pendente')}
						>
							<CardContent className="p-2 flex flex-col items-center justify-center w-full h-full">
								<span className="text-amber-600 font-medium text-xs">
									Pendentes
								</span>
								<span className="text-xl font-bold text-amber-700">
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
									) : (
										requests?.pending_count || 0
									)}
								</span>
							</CardContent>
						</Card>

						<Card
							className={`${
								selectedStatus === 'Assinado'
									? 'bg-purple-100 border-purple-300 ring-2 ring-purple-300'
									: 'bg-purple-50 border-purple-200'
							} shadow-sm transition-all duration-200 cursor-pointer hover:bg-purple-100 h-20 flex items-center justify-center w-24`}
							onClick={() => handleStatusChange('Assinado')}
						>
							<CardContent className="p-2 flex flex-col items-center justify-center w-full h-full">
								<span className="text-purple-600 font-medium text-xs">
									Assinados
								</span>
								<span className="text-xl font-bold text-purple-700">
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
									) : (
										requests?.signed_count || 0
									)}
								</span>
							</CardContent>
						</Card>

						<Card
							className={`${
								selectedStatus === 'Enviado'
									? 'bg-blue-100 border-blue-300 ring-2 ring-blue-300'
									: 'bg-blue-50 border-blue-200'
							} shadow-sm transition-all duration-200 cursor-pointer hover:bg-blue-100 h-20 flex items-center justify-center w-24`}
							onClick={() => handleStatusChange('Enviado')}
						>
							<CardContent className="p-2 flex flex-col items-center justify-center w-full h-full">
								<span className="text-blue-600 font-medium text-xs">
									Enviados
								</span>
								<span className="text-xl font-bold text-blue-700">
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
									) : (
										requests?.sent_count || 0
									)}
								</span>
							</CardContent>
						</Card>

						<Card
							className={`${
								selectedStatus === 'Limpo'
									? 'bg-green-100 border-green-300 ring-2 ring-green-300'
									: 'bg-green-50 border-green-200'
							} shadow-sm transition-all duration-200 cursor-pointer hover:bg-green-100 h-20 flex items-center justify-center w-24`}
							onClick={() => handleStatusChange('Limpo')}
						>
							<CardContent className="p-2 flex flex-col items-center justify-center w-full h-full">
								<span className="text-green-600 font-medium text-xs">
									Limpos
								</span>
								<span className="text-xl font-bold text-green-700">
									{isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin mx-auto mt-2" />
									) : (
										requests?.clean_count || 0
									)}
								</span>
							</CardContent>
						</Card>

						{canCreateRequest && (
							<Button
								className="shadow-sm h-20 flex flex-col items-center justify-center w-24"
								onClick={() => setShowForm(true)}
							>
								<Plus className="h-4 w-4 mb-1" />
								<span className="text-xs">Novo</span>
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Search with status indicator */}
			<div className="mb-4">
				<div className="flex flex-col md:flex-row gap-4 items-end">
					<div className="w-full">
						<div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
							<div className="relative w-full">
								<Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Pesquisar por nome, documento, email ou telefone"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-8"
								/>
							</div>

							<div className="w-full md:w-1/3">
								<DatePicker
									value={startDate}
									onChange={(date) => {
										setStartDate(
											date ? date.toISOString() : null
										);
										// If end date is not set or before start date, set it to start date + 7 days
										if (
											date &&
											(!endDate ||
												new Date(endDate) < date)
										) {
											setEndDate(
												addDays(date, 7).toISOString()
											);
										}
									}}
									placeholder="Data inicial"
								/>
							</div>

							<div className="w-full md:w-1/3">
								<DatePicker
									value={endDate}
									onChange={(date) =>
										setEndDate(
											date ? date.toISOString() : null
										)
									}
									placeholder="Data final"
								/>
							</div>
						</div>
						<div className="mt-2 text-sm flex flex-wrap gap-2">
							<span className="font-medium">
								Filtros ativos:{' '}
							</span>
							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
									selectedStatus === 'Pendente'
										? 'bg-amber-100 text-amber-800'
										: selectedStatus === 'Assinado'
										? 'bg-purple-100 text-purple-800'
										: selectedStatus === 'Enviado'
										? 'bg-blue-100 text-blue-800'
										: selectedStatus === 'Limpo'
										? 'bg-green-100 text-green-800'
										: 'bg-gray-100 text-gray-800'
								}`}
							>
								{selectedStatus}
								<button
									className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-xs hover:bg-opacity-20 hover:bg-gray-900"
									onClick={() => handleStatusChange('Todos')}
									title="Limpar filtro"
								>
									×
								</button>
							</span>
							{searchTerm && (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
									Pesquisa: {searchTerm}
									<button
										className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-xs hover:bg-opacity-20 hover:bg-gray-900"
										onClick={() => setSearchTerm('')}
										title="Limpar filtro"
									>
										×
									</button>
								</span>
							)}
							{startDate && endDate && (
								<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
									Período: {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
									<button
										className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-xs hover:bg-opacity-20 hover:bg-gray-900"
										onClick={() => {
											setStartDate(null);
											setEndDate(null);
										}}
										title="Limpar filtro"
									>
										×
									</button>
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-md border bg-white shadow-sm overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-50">
						<TableRow>
							<TableHead>Nome</TableHead>
							<TableHead>Nº Documento</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Telefone</TableHead>
							<TableHead>Criado em</TableHead>
							{(selectedStatus === 'Enviado' ||
								selectedStatus === 'Limpo') && (
								<TableHead>Lista</TableHead>
							)}
							{selectedStatus === 'Todos' && (
								<TableHead>Status</TableHead>
							)}
							{selectedStatus !== 'Enviado' &&
								selectedStatus !== 'Limpo' && (
									<TableHead className="text-center">
										Ações
									</TableHead>
								)}
							{(selectedStatus === 'Enviado' ||
								selectedStatus === 'Limpo') && (
								<>
									<TableHead className="text-center">
										Serasa
									</TableHead>
									<TableHead className="text-center">
										Boa Vista
									</TableHead>
									<TableHead className="text-center">
										Cenprot
									</TableHead>
									<TableHead className="text-center">
										SPC
									</TableHead>
									<TableHead className="text-center">
										QUOD
									</TableHead>
								</>
							)}
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
						) : requests?.items?.length === 0 ||
						  !requests?.items ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-center py-4 "
								>
									Nenhum nome encontrado
								</TableCell>
							</TableRow>
						) : (
							requests?.items?.map((request) => (
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
										{format(
											request.created_at,
											'dd/MM/yyyy'
										)}
									</TableCell>
									{(selectedStatus === 'Enviado' ||
										selectedStatus === 'Limpo') && (
										<TableCell>
											{request?.list?.name || '-'}
										</TableCell>
									)}
									{selectedStatus === 'Todos' && (
										<>
											<TableCell>
												<Badge
													className={`${
														request.status ===
														'Pendente'
															? 'bg-amber-100 text-amber-800'
															: request.status ===
															  'Assinado'
															? 'bg-purple-100 text-purple-800'
															: request.status ===
															  'Enviado'
															? 'bg-blue-100 text-blue-800'
															: request.status ===
															  'Limpo'
															? 'bg-green-100 text-green-800'
															: 'bg-gray-100 text-gray-800'
													}`}
												>
													{request.status}
												</Badge>
											</TableCell>
										</>
									)}
									{(selectedStatus === 'Enviado' ||
										selectedStatus === 'Limpo') && (
										<>
											<TableCell className="text-center">
												<StatusIcon
													status={
														request.is_serasa_clean
															? 'limpo'
															: 'andamento'
													}
												/>
											</TableCell>
											<TableCell className="text-center">
												<StatusIcon
													status={
														request.is_boa_vista_clean
															? 'limpo'
															: 'andamento'
													}
												/>
											</TableCell>
											<TableCell className="text-center">
												<StatusIcon
													status={
														request.is_cenprot_clean
															? 'limpo'
															: 'andamento'
													}
												/>
											</TableCell>
											<TableCell className="text-center">
												<StatusIcon
													status={
														request.is_spc_clean
															? 'limpo'
															: 'andamento'
													}
												/>
											</TableCell>
											<TableCell className="text-center">
												<StatusIcon
													status={
														request.is_quod_clean
															? 'limpo'
															: 'andamento'
													}
												/>
											</TableCell>
										</>
									)}
									{selectedStatus !== 'Enviado' &&
										selectedStatus !== 'Limpo' && (
											<TableCell>
												<div className="flex justify-center space-x-2">
													{canUpdateRequest &&
														request.status ===
															'Pendente' && (
															<Button
																onClick={() =>
																	handleEditRequest(
																		request
																	)
																}
																variant="ghost"
																size="icon"
																className="h-8 w-8 p-0"
															>
																<Edit className="h-4 w-4 text-apollo-yellow" />
															</Button>
														)}
													{canUpdateRequest &&
														request.status ===
															'Assinado' && (
															<Button
																// onClick={() => deleteMutation.mutateAsync(list.id)}
																size="icon"
																variant="ghost"
																className="h-8 w-8 p-0"
																disabled={
																	isLoading
																}
															>
																<Banknote className="h-4 w-4 text-green-500" />
															</Button>
														)}
													{canDeleteRequest &&
														request.status ===
															'Pendente' && (
															<Button
																onClick={() =>
																	deleteMutation.mutateAsync(
																		request.id
																	)
																}
																variant="ghost"
																size="icon"
																className="h-8 w-8 p-0"
																disabled={
																	isLoading
																}
															>
																<Trash2 className="h-4 w-4 text-red-500" />
															</Button>
														)}
												</div>
											</TableCell>
										)}
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

			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent className="max-w-4xl">
					<RequestForm
						request={editingRequest || null}
						onSave={handleSaveRequest}
						onCancel={() => {
							setEditingRequest(null);
							setShowForm(false);
						}}
						isSubmitting={isSubmitting}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
