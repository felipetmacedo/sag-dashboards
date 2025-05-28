import { Plus, Edit, Trash2 } from 'lucide-react';
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
	Dialog,
	DialogContent,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { DatePicker } from '@/components/ui/date-picker';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { addDays } from 'date-fns';

import ListsContainer from './Lists.container';
import { ListForm } from '@/components/list';

export default function Lists() {
	const {
		lists,
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		status,
		setStatus,
		handleEditList,
		handleCancelForm,
		editingList,
		showForm,
		setShowForm,
		canCreateList,
		isLoading,
		createMutation,
		updateMutation,
		deleteMutation,
		page,
		totalPages,
		handlePageChange
	} = ListsContainer();

	const navigate = useNavigate();
	
	// Handle status filter change
	const handleStatusChange = (value: string) => {
		setStatus(value === 'all' ? null : value);
	};
	
	// Clear all filters
	const clearFilters = () => {
		setStartDate(null);
		setEndDate(null);
		setStatus(null);
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
						<PaginationLink 
							className="cursor-default pointer-events-none"
						>...</PaginationLink>
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
						<PaginationLink 
							className="cursor-default pointer-events-none"
						>...</PaginationLink>
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

	// Função para renderizar a badge do status apropriado
	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'expirada':
				return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Expirada</Badge>;
			case 'aberta':
				return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Aberta</Badge>;
			case 'enviada':
				return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Enviada</Badge>;
			case 'finalizada':
				return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Finalizada</Badge>;
			default:
				return <Badge variant="outline">{status}</Badge>;
		}
	};


	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-apollo-gray-dark">
					Gerenciamento de Listas
				</h2>
				{canCreateList && (
					<Button 
						className="flex items-center"
						onClick={() => setShowForm(true)}
					>
						<Plus className="h-5 w-5 mr-2" />
						Nova Lista
					</Button>
				)}
			</div>

			{/* Filters */}
			<div className="mb-4">
				<div className="flex flex-col md:flex-row gap-4 items-end">
					<div className="w-full md:w-1/3">
						<label className="block text-sm font-medium mb-1">Status</label>
						<Select value={status || 'all'} onValueChange={handleStatusChange}>
							<SelectTrigger>
								<SelectValue placeholder="Filtrar por status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos</SelectItem>
								<SelectItem value="Aberta">Aberta</SelectItem>
								<SelectItem value="Enviada">Enviada</SelectItem>
								<SelectItem value="Expirada">Expirada</SelectItem>
								<SelectItem value="Finalizada">Finalizada</SelectItem>
							</SelectContent>
						</Select>
					</div>
					
					<div className="w-full md:w-1/3">
						<label className="block text-sm font-medium mb-1">Data inicial</label>
						<DatePicker
							value={startDate}
							onChange={(date) => {
								setStartDate(date ? date.toISOString() : null);
								// If end date is not set or before start date, set it to start date + 7 days
								if (date && (!endDate || new Date(endDate) < date)) {
									setEndDate(addDays(date, 7).toISOString());
								}
							}}
							placeholder="Data inicial"
						/>
					</div>
					
					<div className="w-full md:w-1/3">
						<label className="block text-sm font-medium mb-1">Data final</label>
						<DatePicker
							value={endDate}
							onChange={(date) => setEndDate(date ? date.toISOString() : null)}
							placeholder="Data final"
						/>
					</div>
					
					<div>
						<Button 
							variant="outline" 
							onClick={clearFilters}
							className="h-10"
						>
							Limpar filtros
						</Button>
					</div>
				</div>
			</div>
			
			<div className="rounded-md border overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-50">
						<TableRow>
							<TableHead>Nome</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Data de Vencimento</TableHead>
							<TableHead>Criada em</TableHead>
							<TableHead>Quantidade de nomes</TableHead>
							<TableHead className="text-center">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center py-4"
								>
									Carregando...
								</TableCell>
							</TableRow>
						) : lists.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={6}
									className="text-center py-4"
								>
									Nenhuma lista encontrada
								</TableCell>
							</TableRow>
						) : (
							lists.map((list) => (
								<TableRow key={list.id}>
									<TableCell>{list.name}</TableCell>
									<TableCell>{getStatusBadge(list.status)}</TableCell>
									<TableCell>{new Date(list.due_date).toLocaleDateString('pt-BR')}</TableCell>
									<TableCell>{new Date(list.createdAt).toLocaleDateString('pt-BR')}</TableCell>
									<TableCell>{list.requests_count}</TableCell>
									<TableCell>
										<div className="flex justify-center space-x-2">
											<Button
												onClick={() => handleEditList(list)}
												variant="ghost"
												size="icon"
												className="h-8 w-8 p-0"
											>
												<Edit className="h-4 w-4 text-apollo-yellow" />
											</Button>
											{!list.requests_count && (
												<Button
													onClick={() => deleteMutation.mutateAsync(list.id)}
													variant="ghost"
													size="icon"
													className="h-8 w-8 p-0"
													disabled={isLoading}
												>
													<Trash2 className="h-4 w-4 text-red-500" />
												</Button>
											)}
											<Button
												variant="secondary"
												className="h-8 w-24 p-0"
												onClick={() => navigate(`/lists/${list.id}`)}
											>
												Ver nomes
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			
			<Dialog open={showForm} onOpenChange={setShowForm}>
				<DialogContent className="max-w-4xl">
					<ListForm
						list={editingList}
						createMutation={createMutation.mutateAsync}
						updateMutation={updateMutation.mutateAsync}
						onCancel={handleCancelForm}
					/>
				</DialogContent>
			</Dialog>
			
			{/* Pagination */}
			<div className="mt-6 mb-4 flex justify-center">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious 
								onClick={() => handlePageChange(Math.max(1, page - 1))}
								className={page === 1 || isLoading ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
						
						{renderPaginationItems()}
						
						<PaginationItem>
							<PaginationNext 
								onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
								className={page === totalPages || isLoading ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
} 