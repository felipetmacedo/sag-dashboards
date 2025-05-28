import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

import { UserForm } from '@/components/user';

import UsersContainer from './Users.container';

export default function Users() {
	const {
		users,
		loading,
		searchTerm,
		setSearchTerm,
		handleEditUser,
		handleDeleteUser,
		handleSaveUser,
		handleCancelForm,
		editingUser,
		showForm,
		setShowForm,
		canCreateUser,
		canUpdateUser,
		canDeleteUser,
		page,
		totalPages,
		handlePageChange
	} = UsersContainer();

	const getUserFormData = () => {
		if (!editingUser) return null;

		return {
			id: editingUser.id,
			name: editingUser.name,
			email: editingUser.email,
			phone_number: editingUser.phone_number,
			document: editingUser.document || '',
			cep: editingUser.cep || '',
			address: editingUser.address || '',
			number: editingUser.number || '',
			complement: editingUser.complement || '',
			neighborhood: editingUser.neighborhood || '',
			city: editingUser.city || '',
			state: editingUser.state || '',
		};
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

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-apollo-gray-dark">
					Usuários
				</h2>
				{canCreateUser && (
					<Dialog open={showForm} onOpenChange={setShowForm}>
						<DialogTrigger asChild>
							<Button 
								className="flex items-center"
								disabled={loading}
							>
								{loading ? (
									<Loader2 className="h-5 w-5 mr-2 animate-spin" />
								) : (
									<Plus className="h-5 w-5 mr-2" />
								)}
								Novo Usuário
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-4xl">
							<UserForm
								user={getUserFormData()}
								onSave={handleSaveUser}
								onCancel={handleCancelForm}
								isSubmitting={loading}
							/>
						</DialogContent>
					</Dialog>
				)}
			</div>

			<div className="mb-6">
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-apollo-gray" />
					<Input
						type="text"
						placeholder="Pesquisar por nome, documento, email ou telefone..."
						className="w-full pl-10 pr-4 py-2"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader className="bg-gray-50">
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Nome</TableHead>
							<TableHead>Documento</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Telefone</TableHead>
							<TableHead>Cidade/UF</TableHead>
							{(canUpdateUser || canDeleteUser) && (
								<TableHead className="text-center">Ações</TableHead>
							)}
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={(canUpdateUser || canDeleteUser) ? 9 : 8}
									className="text-center py-10"
								>
									<div className="flex justify-center items-center">
										<Loader2 className="h-8 w-8 animate-spin text-apollo-yellow" />
										<span className="ml-2">Carregando...</span>
									</div>
								</TableCell>
							</TableRow>
						) : users.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={(canUpdateUser || canDeleteUser) ? 9 : 8}
									className="text-center py-4"
								>
									Nenhum usuário encontrado
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.id}
									</TableCell>
									<TableCell>{user.name}</TableCell>
									<TableCell>{user.document || '-'}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.phone_number || '-'}</TableCell>
									<TableCell>{user.city && user.state ? `${user.city}/${user.state}` : '-'}</TableCell>
									{(canUpdateUser || canDeleteUser) && (
										<TableCell>
											<div className="flex justify-center space-x-2">
												{canUpdateUser && (
													<Button
														onClick={() => handleEditUser(user)}
														variant="ghost"
														size="icon"
														className="h-8 w-8 p-0"
														disabled={loading}
													>
														<Edit className="h-4 w-4 text-apollo-yellow" />
													</Button>
												)}
												{canDeleteUser && (
													<Button
														onClick={() => handleDeleteUser(user.id)}
														variant="ghost"
														size="icon"
														className="h-8 w-8 p-0"
														disabled={loading}
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

			<div className="mt-6 mb-4 flex justify-center">
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious 
								onClick={() => handlePageChange(Math.max(1, page - 1))}
								className={page === 1 || loading ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
						
						{renderPaginationItems()}
						
						<PaginationItem>
							<PaginationNext 
								onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
								className={page === totalPages || loading ? "pointer-events-none opacity-50" : ""}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
} 