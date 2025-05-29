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
	const PIE_COLORS = ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40', '#2ecc40'];
	const TIPO_COLORS = ['#ff6384', '#4b5cff'];

	// Date state as ISO strings for DatePicker compatibility (like Requests.tsx)
	const startDateString = startDate ? startDate.toISOString() : null;
	const endDateString = endDate ? endDate.toISOString() : null;

	return (
		<div className="flex flex-col gap-8 p-8 w-full min-h-screen">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-extrabold tracking-tight text-gray-800 drop-shadow-lg">Dashboard de Vendas</h1>
				<div className="flex gap-4 items-end">
					<div className="w-40">
						<DatePicker
							value={startDateString}
							onChange={(date) => {
								if (date) setStartDate(new Date(date));
							}}
							placeholder="Data inicial"
						/>
					</div>
					<div className="w-40">
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
				<div className="text-center py-10 text-lg text-gray-500 animate-pulse">Carregando dados...</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{/* Pie Chart - Tipo de Proposta */}
					<div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-pink-400">
						<h2 className="text-xl font-bold mb-2 text-pink-600 tracking-tight">Tipo de Proposta</h2>
						<ResponsiveContainer width="100%" height={260}>
							<PieChart>
								<Pie
									data={tipoPropostaPie}
									dataKey="value"
									nameKey="tipo"
									cx="50%"
									cy="50%"
									outerRadius={90}
									label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
								>
									{tipoPropostaPie.map((entry: any, idx: number) => (
										<Cell key={`tipo-cell-${idx}`} fill={TIPO_COLORS[idx % TIPO_COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(value: number, name: string, props: any) => [`${value} propostas`, name]} />
								<Legend formatter={(value, entry, idx) => {
									const item = tipoPropostaPie[idx];
									return (
										<span className="flex items-center gap-2">
											<span className="font-semibold capitalize">{item.tipo}</span>
											<span className="text-gray-500">{item.perc}%</span>
										</span>
									);
								}} />
							</PieChart>
						</ResponsiveContainer>
					</div>

					{/* Pie Chart - Vendas por Produto */}
					<div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-400">
						<h2 className="text-xl font-bold mb-2 text-blue-600 tracking-tight">Vendas por Produto</h2>
						<ResponsiveContainer width="100%" height={260}>
							<PieChart>
								<Pie
									data={productPie}
									dataKey="sales"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={90}
									label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
								>
									{productPie.map((entry: any, idx: number) => (
										<Cell key={`prod-cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
									))}
								</Pie>
								<Tooltip formatter={(value: number, name: string, props: any) => [`${value} vendas`, name]} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>

					{/* Bar Chart - Comparativo 5 anos */}
					<div className="bg-white rounded-2xl shadow-xl p-6 col-span-full border-t-4 border-purple-400">
						<h2 className="text-xl font-bold mb-2 text-purple-600 tracking-tight">Comparativo de Vendas (Últimos 5 anos)</h2>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart
								data={comparativeData}
								margin={{
									top: 20,
									right: 30,
									left: 0,
									bottom: 5,
								}}
							>
								<XAxis dataKey="year" tick={{ fontWeight: 600, fill: '#7c3aed' }} />
								<YAxis tick={{ fontWeight: 600, fill: '#7c3aed' }} />
								<Tooltip formatter={(value: number) => `${value} vendas`} />
								<Legend />
								<Bar
									dataKey="sales"
									fill="#a78bfa"
									name="Vendas"
									radius={[8, 8, 0, 0]}
									barSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}
		</div>
	);
}
