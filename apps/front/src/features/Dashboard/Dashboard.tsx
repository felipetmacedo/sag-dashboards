'use client';
import { useState } from 'react';
import useDashboardContainer from './Dashboard.container';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Legend,
	LabelList,
} from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
	const {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		loading,
		productPie,
		tipoPropostaPie,
		propostasLastTwoYearsChart,
		totalPropostas,
		totalFaturamento,
		errorCurrent,
		errorLastTwoYears,
		lojas,
		selectedLoja,
		setSelectedLoja,
	} = useDashboardContainer();

	const [open, setOpen] = useState(false);
	const selectedLojaObj = lojas?.find(l => l.token_whatsapp === selectedLoja);
	const displayLoja = selectedLojaObj ? selectedLojaObj.empresa : 'Todas as Lojas';
	// Color palette for charts
	const PIE_COLORS = [
		'#ff6384',
		'#36a2eb',
		'#ffcd56',
		'#4bc0c0',
		'#9966ff',
		'#ff9f40',
		'#2ecc40',
	];
	const TIPO_COLORS = ['#ff6384', '#4b5cff'];

	// Date state as ISO strings for DatePicker compatibility (like Requests.tsx)
	const startDateString = startDate ? startDate.toISOString() : null;
	const endDateString = endDate ? endDate.toISOString() : null;

	return (
		<div className="flex flex-col gap-8 p-8 w-full min-h-screen">
			<div className="flex items-center justify-between mb-2 gap-4 md:flex-row flex-col">
				<Collapsible open={open} onOpenChange={setOpen}>
					<div className="flex items-center gap-2 relative">
						<LayoutDashboard className="inline-block" />
						<CollapsibleTrigger asChild>
							<button className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2 hover:underline focus:outline-none">
								Dashboard - {displayLoja}
								{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
							</button>
						</CollapsibleTrigger>
					</div>
					<CollapsibleContent className="z-10 relative">
						<div className="absolute left-0 right-0 md:right-auto md:w-[340px] z-10 bg-white rounded shadow p-2 border">
							<ul className="space-y-1">
								<li>
									<button
										className={`w-full text-left px-2 py-1 rounded ${!selectedLoja ? 'bg-purple-100 font-semibold' : 'hover:bg-gray-100'}`}
										onClick={() => { setSelectedLoja(null); setOpen(false); }}
									>
										Todas as Lojas
									</button>
								</li>
								{lojas?.map(loja => (
									<li key={loja.token_whatsapp}>
										<button
											className={`w-full text-left px-2 py-1 rounded ${selectedLoja === loja.token_whatsapp ? 'bg-purple-100 font-semibold' : 'hover:bg-gray-100'}`}
											onClick={() => { setSelectedLoja(loja.token_whatsapp); setOpen(false); }}
										>
											{loja.empresa}
										</button>
									</li>
								))}
							</ul>
						</div>
					</CollapsibleContent>
				</Collapsible>
				<div className="flex gap-4">
					<div className="w-46">
						<DatePicker
							value={startDateString}
							onChange={(date) => {
								if (date) {
									const newStartDate = new Date(date);
									setStartDate(newStartDate);
									// Check if the new range exceeds 2 years
									if (endDate) {
										const twoYearsFromStart = new Date(newStartDate);
										twoYearsFromStart.setFullYear(twoYearsFromStart.getFullYear() + 2);
										if (endDate > twoYearsFromStart) {
											setEndDate(twoYearsFromStart);
										}
									}
								}
							}}
							placeholder="Data inicial"
						/>
					</div>
					<div className="w-46">
						<DatePicker
							value={endDateString}
							onChange={(date) => {
								if (date) {
									const newEndDate = new Date(date);
									setEndDate(newEndDate);
									
									// Check if the new range exceeds 2 years
									if (startDate) {
										const twoYearsBeforeEnd = new Date(newEndDate);
										twoYearsBeforeEnd.setFullYear(twoYearsBeforeEnd.getFullYear() - 2);
										
										// If start date is more than 2 years before end date, adjust start date
										if (startDate < twoYearsBeforeEnd) {
											setStartDate(twoYearsBeforeEnd);
										}
									}
								}
							}}
							placeholder="Data final"
						/>
					</div>
				</div>
			</div>
			{loading ? (
				<div className="space-y-8">
					{/* Skeleton loading for summary cards */}
					<div className="grid grid-cols-2 gap-8 mb-8">
						<div className="bg-white p-6 rounded-sm shadow-md animate-pulse border-t-4 border-purple-400">
							<div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
							<div className="h-8 bg-gray-200 rounded w-1/3"></div>
						</div>
						<div className="bg-white p-6 rounded-sm shadow-md animate-pulse border-t-4 border-green-400">
							<div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
							<div className="h-8 bg-gray-200 rounded w-1/3"></div>
						</div>
					</div>
					{/* Skeleton loading for charts */}
					<div className="grid grid-cols-2 gap-8">
						{/* Skeleton for first chart */}
						<div className="bg-white rounded-sm shadow-xl p-6 border-t-4 border-pink-400 w-full flex flex-row">
							<div className="h-64 bg-gray-100 rounded-full w-64 mx-auto animate-pulse"></div>
							<div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
						</div>
						{/* Skeleton for second chart */}
						<div className="bg-white rounded-sm shadow-xl p-6 border-t-4 border-blue-400 w-full flex flex-row">
							<div className="h-64 bg-gray-100 rounded-full w-64 mx-auto animate-pulse"></div>
							<div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
						</div>
					</div>

					{/* Skeleton loading for bottom chart */}
					<div className="bg-white rounded-sm shadow-xl p-6 border-t-4 border-purple-400">
						<div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
						<div className="h-80 bg-gray-100 rounded animate-pulse"></div>
					</div>

					{/* Error message if needed */}
					{errorCurrent || errorLastTwoYears ? (
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<p className="text-red-600">
								Erro ao carregar dados:{' '}
								{errorCurrent?.message ||
									errorLastTwoYears?.message}
							</p>
						</div>
					) : null}
				</div>
			) : (
				<div className="space-y-8">
					{/* Top row - 2 column grid for summary cards */}
					<div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
						<div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-purple-400">
							<h2 className="text-lg font-semibold text-gray-700 mb-2">
								Total de Propostas
							</h2>
							<p className="text-3xl font-bold text-purple-600">
								{totalPropostas.toLocaleString('pt-BR')}
							</p>
							<p className="text-sm text-gray-500 mt-2">
								No período de {format(startDate, 'dd/MM/yyyy')}{' '}
								a {format(endDate, 'dd/MM/yyyy')}
							</p>
						</div>
						<div className="bg-white p-6 rounded-sm shadow-md border-t-4 border-green-400">
							<h2 className="text-lg font-semibold text-gray-700 mb-2">
								Total de Faturamento
							</h2>
							<p className="text-3xl font-bold text-green-600">
								{new Intl.NumberFormat('pt-BR', {
									style: 'currency',
									currency: 'BRL',
								}).format(totalFaturamento)}
							</p>
							<p className="text-sm text-gray-500 mt-2">
								No período de {format(startDate, 'dd/MM/yyyy')}{' '}
								a {format(endDate, 'dd/MM/yyyy')}
							</p>
						</div>
					</div>

					{/* Top row - 2 column grid for pie charts */}
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						{/* Pie Chart - Tipo de Proposta */}
						<div className="bg-white rounded-sm shadow-xl p-6 border-t-4 border-pink-400 w-full">
							<h2 className="text-xl font-bold mb-4 text-pink-600 tracking-tight text-center">
								Tipo de Proposta
							</h2>
							<div className="flex items-center justify-center">
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={tipoPropostaPie}
											dataKey="value"
											nameKey="tipo"
											cx="40%"
											cy="50%"
											outerRadius={80}
											label={({ percent }) =>
												`${(percent * 100).toFixed(0)}%`
											}
										>
											{tipoPropostaPie.map(
												(
													entry: {
														tipo: string;
														value: number;
													},
													idx: number
												) => (
													<Cell
														key={`tipo-cell-${idx}`}
														fill={
															TIPO_COLORS[
																idx %
																	TIPO_COLORS.length
															]
														}
													/>
												)
											)}
										</Pie>
										<Tooltip
											formatter={(
												value: number,
												name: string
											) => [`${value} propostas`, name]}
										/>
										<Legend
											verticalAlign="middle"
											align="right"
											layout="vertical"
											iconType="circle"
											wrapperStyle={{
												paddingLeft: '20px',
												fontSize: '14px',
											}}
											formatter={(value, entry, idx) => {
												const item =
													tipoPropostaPie[idx];
												return (
													<span className="flex flex-col">
														<span className="font-semibold capitalize">
															{item.tipo}
														</span>
														<span className="text-gray-500 text-sm">
															{item.perc}%
														</span>
													</span>
												);
											}}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>

						{/* Pie Chart - Vendas por Produto */}
						<div className="bg-white rounded-sm shadow-xl p-6 border-t-4 border-blue-400">
							<h2 className="text-xl font-bold mb-4 text-blue-600 tracking-tight text-center">
								Vendas por Produto
							</h2>
							<div className="flex items-center justify-center">
								<ResponsiveContainer width="100%" height={300}>
									<PieChart>
										<Pie
											data={productPie}
											dataKey="sales"
											nameKey="name"
											cx="40%"
											cy="50%"
											outerRadius={80}
											label={({ name, percent }) =>
												`${(percent * 100).toFixed(0)}%`
											}
										>
											{productPie.map(
												(entry: any, idx: number) => (
													<Cell
														key={`prod-cell-${idx}`}
														fill={
															PIE_COLORS[
																idx %
																	PIE_COLORS.length
															]
														}
													/>
												)
											)}
										</Pie>
										<Tooltip
											formatter={(
												value: number,
												name: string
											) => [`${value} vendas`, name]}
										/>
										<Legend
											verticalAlign="middle"
											align="right"
											layout="vertical"
											iconType="circle"
											wrapperStyle={{
												paddingLeft: '20px',
												fontSize: '14px',
											}}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>

					{/* Bottom row - Full width bar chart */}
					<div className="bg-white rounded-sm shadow-xl p-6 border-t-4 border-purple-400">
						<h2 className="text-xl font-bold mb-2 text-purple-600 tracking-tight">
							Comparativo de Vendas (Últimos 2 anos)
						</h2>
						<ResponsiveContainer width="100%" height={340}>
							<BarChart
								data={propostasLastTwoYearsChart}
								margin={{
									top: 20,
									right: 30,
									left: 0,
									bottom: 5,
								}}
								barGap={4}
							>
								<XAxis
									dataKey="month"
									tick={{ fontWeight: 600, fill: '#7c3aed' }}
									label={{
										value: 'Mês',
										position: 'insideBottom',
										offset: -2,
									}}
								/>
								<YAxis
									tick={{ fontWeight: 600, fill: '#7c3aed' }}
								/>
								<Tooltip
									formatter={(
										value: number,
										name: string
									) => [`${value} vendas`, name]}
									labelFormatter={(label) => `Mês: ${label}`}
								/>
								<Legend />
								{/* Stacked bars for each year, using distinct colors and a slight shadow for 3D effect */}
								{Object.keys(
									propostasLastTwoYearsChart[0] || {}
								)
									.filter((key) => key !== 'month')
									.map((year, idx) => (
										<Bar
											key={year}
											dataKey={year}
											stackId="a"
											name={year}
											fill={
												[
													'#a78bfa',
													'#36a2eb',
													'#ff6384',
													'#ffcd56',
													'#4bc0c0',
												][idx % 5]
											}
											barSize={24}
											style={{
												filter: 'drop-shadow(1px 2px 2px rgba(80,80,80,0.10))',
											}}
										>
											<LabelList
												dataKey={year}
												position="center"
												fontSize={11}
												fill="#ffffff"
												fontWeight="bold"
												formatter={(value: number) =>
													value > 0 ? value : ''
												}
											/>
										</Bar>
									))}
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}
		</div>
	);
}
