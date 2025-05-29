'use client';

import useDashboardContainer from './Dashboard.container';
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
} from 'recharts';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
	const {
		startDate,
		setStartDate,
		endDate,
		setEndDate,
		loading,
		productPie,
		tipoPropostaPie,
		comparativeData,
	} = useDashboardContainer();

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
			<div className="flex items-center justify-between mb-2 ">
				<h1 className="text-2xl font-bold text-apollo-gray-dark flex items-center gap-2">
					<LayoutDashboard className="inline-block" /> Dashboard
				</h1>
				<div className="flex gap-4">
					<div className="w-46">
						<DatePicker
							value={startDateString}
							onChange={(date) => {
								if (date) setStartDate(new Date(date));
							}}
							placeholder="Data inicial"
						/>
					</div>
					<div className="w-46">
						<DatePicker
							value={endDateString}
							onChange={(date) => {
								if (date) setEndDate(new Date(date));
							}}
							placeholder="Data final"
						/>
					</div>
				</div>
			</div>
			{loading ? (
				<div className="text-center py-10 text-lg text-gray-500 animate-pulse">
					Carregando dados...
				</div>
			) : (
				<div className="space-y-8">
					{/* Top row - 2 column grid for pie charts */}
					<div className="grid grid-cols-2 gap-8">
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
												(entry: any, idx: number) => (
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
												name: string,
												props: any
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
								data={comparativeData}
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
								{Object.keys(comparativeData[0] || {})
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
											radius={[3, 3, 0, 0]}
											barSize={24}
											style={{
												filter: 'drop-shadow(1px 2px 2px rgba(80,80,80,0.10))',
											}}
										/>
									))}
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}
		</div>
	);
}
