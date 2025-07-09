import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface AdimplenciaDataItem {
	parcela: string;
	totalPropostas: number;
	totalPago: number;
	totalPendente: number;
	[nome: string]: any; // for any extra fields, if needed
}

interface AdimplenciaStats {
	totalPropostas: number;
	totalPago: number;
	totalPendente: number;
	percentualAdimplencia: number;
}

interface ParcelaStats {
	parcela: string;
	totalPropostas: number;
	totalPago: number;
	totalPendente: number;
	percentualAdimplencia: number;
}

interface AdimplenciaStatsCardsProps {
	stats: AdimplenciaStats;
	data: AdimplenciaDataItem[];
	isLoading?: boolean;
	selectedParcelas?: string[];
}

export const AdimplenciaStatsCards = ({
	stats,
	data,
	isLoading = false,
	selectedParcelas = [],
}: AdimplenciaStatsCardsProps) => {
	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('pt-BR').format(num);
	};

	const formatPercentage = (num: number) => {
		return `${num.toFixed(1)}%`;
	};

	const getParcelaStats = () => {
		const parcelaMap = new Map();

		data.forEach((item) => {
			if (!parcelaMap.has(item.parcela)) {
				parcelaMap.set(item.parcela, {
					totalPropostas: 0,
					totalPago: 0,
					totalPendente: 0,
				});
			}

			const current = parcelaMap.get(item.parcela);
			current.totalPropostas += item.totalPropostas || 0;
			current.totalPago += item.totalPago || 0;
			current.totalPendente += item.totalPendente || 0;
		});

		return Array.from(parcelaMap.entries())
			.map(([parcela, stats]) => ({
				parcela,
				...stats,
				percentualAdimplencia:
					stats.totalPropostas > 0
						? (stats.totalPago / stats.totalPropostas) * 100
						: 0,
			}))
			.sort((a, b) => a.parcela.localeCompare(b.parcela));
	};

	const shouldShowParcelaStats = () => {
		return selectedParcelas.length > 0 && data.length > 0;
	};

	const parcelaStats: ParcelaStats[] = shouldShowParcelaStats() ? getParcelaStats() : [];
	// removed unused hasMultipleParcelas

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<div className="h-4 bg-gray-300 rounded w-20"></div>
								<div className="h-4 w-4 bg-gray-300 rounded"></div>
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
								<div className="h-3 bg-gray-200 rounded w-24"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Stats Cards Principais */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Propostas
						</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(stats.totalPropostas)}
						</div>
						<p className="text-xs text-muted-foreground">
							Todas as propostas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Pago
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(stats.totalPago)}
						</div>
						<p className="text-xs text-muted-foreground">
							Propostas pagas
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Total Pendente
						</CardTitle>
						<Clock className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatNumber(stats.totalPendente)}
						</div>
						<p className="text-xs text-muted-foreground">
							Propostas pendentes
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							% Adimplência
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatPercentage(stats.percentualAdimplencia)}
						</div>
						<p className="text-xs text-muted-foreground">
							Percentual geral
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Estatísticas por parcela */}
			{parcelaStats.length > 0 && (
				<div className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Estatísticas por Parcela</CardTitle>
						</CardHeader>
						<CardContent>
							<table className="w-full">
								<thead>
									<tr>
										<th>Parcela</th>
										<th>Propostas</th>
										<th>Pagas</th>
										<th>Pendentes</th>
										<th>% Adimplência</th>
									</tr>
								</thead>
								<tbody>
									{parcelaStats.map((parcela: ParcelaStats) => (
										<tr key={parcela.parcela}>
											<td>{parcela.parcela}ª Parcela</td>
											<td>{formatNumber(parcela.totalPropostas)}</td>
											<td className="text-green-600">
												{formatNumber(parcela.totalPago)}
											</td>
											<td className="text-red-600">
												{formatNumber(parcela.totalPendente)}
											</td>
											<td className="font-bold">
												{formatPercentage(parcela.percentualAdimplencia)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};
