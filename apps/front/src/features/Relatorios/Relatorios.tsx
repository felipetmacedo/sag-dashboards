import { Download, BarChart3, LineChart, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportToCsv } from '@/utils/export-to-csv';
import { exportToPdf } from '@/utils/export-to-pdf';

import RelatoriosContainer from './Relatorios.container';

export default function Relatorios() {
	const {
		isLoading,
		currentMonthName,
		currentYearDisplay,
		dailySalesReport,
		dailySalesHeaders,
		dailySalesByVendorReport,
		dailySalesByVendorHeaders,
		monthlySalesReport,
		monthlySalesHeaders,
		monthlySalesByVendorReport,
		monthlySalesByVendorHeaders,
	} = RelatoriosContainer();

	// Export daily sales report
	const handleExportDailySales = () => {
		exportToCsv({
			data: dailySalesReport,
			headers: dailySalesHeaders,
			filename: `venda_diaria_${format(new Date(), 'MMM-yyyy', {
				locale: ptBR,
			})}`,
		});
	};

	// Export daily sales report as PDF
	const handleExportDailySalesPdf = () => {
		exportToPdf({
			data: dailySalesReport,
			headers: dailySalesHeaders,
			filename: `venda_diaria_${format(new Date(), 'MMM-yyyy', {
				locale: ptBR,
			})}`,
			title: 'Relatório de Venda Diária',
			subtitle: `${currentMonthName}`,
		});
	};

	// Export daily sales by vendor report
	const handleExportDailySalesByVendor = () => {
		exportToCsv({
			data: dailySalesByVendorReport,
			headers: dailySalesByVendorHeaders,
			filename: `venda_diaria_por_vendedor_${format(
				new Date(),
				'MMM-yyyy',
				{ locale: ptBR }
			)}`,
		});
	};

	// Export daily sales by vendor report as PDF
	const handleExportDailySalesByVendorPdf = () => {
		exportToPdf({
			data: dailySalesByVendorReport,
			headers: dailySalesByVendorHeaders,
			filename: `venda_diaria_por_vendedor_${format(
				new Date(),
				'MMM-yyyy',
				{ locale: ptBR }
			)}`,
			title: 'Relatório de Venda Diária por Vendedor',
			subtitle: `${currentMonthName}`,
		});
	};

	// Export monthly sales report
	const handleExportMonthlySales = () => {
		exportToCsv({
			data: monthlySalesReport,
			headers: monthlySalesHeaders,
			filename: `venda_mensal_${currentYearDisplay}`,
		});
	};

	// Export monthly sales report as PDF
	const handleExportMonthlySalesPdf = () => {
		exportToPdf({
			data: monthlySalesReport,
			headers: monthlySalesHeaders,
			filename: `venda_mensal_${currentYearDisplay}`,
			title: 'Relatório de Venda Mensal',
			subtitle: `${currentYearDisplay}`,
		});
	};

	// Export monthly sales by vendor report
	const handleExportMonthlySalesByVendor = () => {
		exportToCsv({
			data: monthlySalesByVendorReport,
			headers: monthlySalesByVendorHeaders,
			filename: `venda_mensal_por_vendedor_${currentYearDisplay}`,
		});
	};

	// Export monthly sales by vendor report as PDF
	const handleExportMonthlySalesByVendorPdf = () => {
		exportToPdf({
			data: monthlySalesByVendorReport,
			headers: monthlySalesByVendorHeaders,
			filename: `venda_mensal_por_vendedor_${currentYearDisplay}`,
			title: 'Relatório de Venda Mensal por Vendedor',
			subtitle: `${currentYearDisplay}`,
		});
	};

	return (
		<div className="p-4">
			<div className="mb-6">
				<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
					<h1 className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2">
						<BarChart3 className="inline-block" /> Relatórios
					</h1>
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Loading skeleton */}
					{[...Array(4)].map((_, index) => (
						<Card key={index} className="animate-pulse">
							<CardHeader className="pb-3">
								<div className="h-6 w-1/2 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 w-3/4 bg-gray-200 rounded"></div>
							</CardHeader>
							<CardContent>
								<div className="h-10 w-full bg-gray-200 rounded"></div>
							</CardContent>
							<CardFooter>
								<div className="h-8 w-1/3 bg-gray-200 rounded"></div>
							</CardFooter>
						</Card>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Daily Sales Report Card */}
					<Card>
						<CardHeader>
							<CardTitle>Venda Diária</CardTitle>
							<CardDescription>
								Relatório de vendas diárias de{' '}
								{currentMonthName}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground mb-4">
								Este relatório contém informações sobre as
								vendas diárias do mês atual, incluindo
								quantidade, acumulado e média acumulada.
							</div>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold">
										{dailySalesReport.reduce(
											(sum, item) =>
												sum + item.quantidade,
											0
										)}
									</div>
									<div className="text-sm text-muted-foreground">
										Total de vendas
									</div>
								</div>
								<div className="flex items-center gap-2 text-blue-600">
									<LineChart size={20} />
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Button
								onClick={handleExportDailySales}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<Download size={16} />
								CSV
							</Button>
							<Button
								onClick={handleExportDailySalesPdf}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<FileText size={16} />
								PDF
							</Button>
						</CardFooter>
					</Card>

					{/* Daily Sales by Vendor Report Card */}
					<Card>
						<CardHeader>
							<CardTitle>Venda Diária por Vendedor</CardTitle>
							<CardDescription>
								Relatório de vendas diárias por vendedor de{' '}
								{currentMonthName}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground mb-4">
								Este relatório detalha as vendas diárias de cada
								vendedor no mês atual.
							</div>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold">
										{
											new Set(
												dailySalesByVendorReport.map(
													(item) => item.vendedor
												)
											).size
										}
									</div>
									<div className="text-sm text-muted-foreground">
										Vendedores ativos
									</div>
								</div>
								<div className="flex items-center gap-2 text-green-600">
									<Users size={20} />
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Button
								onClick={handleExportDailySalesByVendor}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<Download size={16} />
								CSV
							</Button>
							<Button
								onClick={handleExportDailySalesByVendorPdf}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<FileText size={16} />
								PDF
							</Button>
						</CardFooter>
					</Card>

					{/* Monthly Sales Report Card */}
					<Card>
						<CardHeader>
							<CardTitle>Venda Mensal</CardTitle>
							<CardDescription>
								Relatório de vendas mensais de{' '}
								{currentYearDisplay}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground mb-4">
								Este relatório apresenta as vendas mensais do
								ano atual, com valores acumulados.
							</div>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold">
										{monthlySalesReport.reduce(
											(sum, item) =>
												sum + item.quantidade,
											0
										)}
									</div>
									<div className="text-sm text-muted-foreground">
										Total de vendas no ano
									</div>
								</div>
								<div className="flex items-center gap-2 text-indigo-600">
									<BarChart3 size={20} />
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Button
								onClick={handleExportMonthlySales}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<Download size={16} />
								CSV
							</Button>
							<Button
								onClick={handleExportMonthlySalesPdf}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<FileText size={16} />
								PDF
							</Button>
						</CardFooter>
					</Card>

					{/* Monthly Sales by Vendor Report Card */}
					<Card>
						<CardHeader>
							<CardTitle>Venda Mensal por Vendedor</CardTitle>
							<CardDescription>
								Relatório de vendas mensais por vendedor de{' '}
								{currentYearDisplay}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-sm text-muted-foreground mb-4">
								Este relatório detalha as vendas mensais de cada
								vendedor no ano atual.
							</div>
							<div className="flex items-center justify-between">
								<div>
									<div className="text-2xl font-bold">
										{
											new Set(
												monthlySalesByVendorReport.map(
													(item) => item.vendedor
												)
											).size
										}
									</div>
									<div className="text-sm text-muted-foreground">
										Vendedores com vendas no ano
									</div>
								</div>
								<div className="flex items-center gap-2 text-purple-600">
									<Users size={20} />
								</div>
							</div>
						</CardContent>
						<CardFooter className="flex gap-2">
							<Button
								onClick={handleExportMonthlySalesByVendor}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<Download size={16} />
								CSV
							</Button>
							<Button
								onClick={handleExportMonthlySalesByVendorPdf}
								variant="outline"
								className="flex-1 flex items-center justify-center gap-2"
							>
								<FileText size={16} />
								PDF
							</Button>
						</CardFooter>
					</Card>
				</div>
			)}
		</div>
	);
}
