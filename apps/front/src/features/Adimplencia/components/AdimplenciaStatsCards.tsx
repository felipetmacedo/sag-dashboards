import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface AdimplenciaStatsCardsProps {
	stats: any;
	data: any[];
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
		return selectedParcelas.length > 1 && data.length > 0;
	};

	const parcelaStats = shouldShowParcelaStats() ? getParcelaStats() : [];
	const hasMultipleParcelas = parcelaStats.length > 1;

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
			{hasMultipleParcelas && (
				<div className="mt-6">
					<Card>
						<CardHeader>
							<CardTitle>Estatísticas por Parcela</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{parcelaStats.map((parcela: any) => (
									<div
										key={parcela.parcela}
										className="flex flex-col items-center"
									>
										<div className="text-lg font-semibold">
											{parcela.parcela}ª Parcela
										</div>
										<div className="text-2xl font-bold">
											{formatNumber(
												parcela.totalPropostas
											)}
										</div>
										<div className="text-green-600">
											Pago:{' '}
											{formatNumber(parcela.totalPago)}
										</div>
										<div className="text-yellow-600">
											Pendente:{' '}
											{formatNumber(
												parcela.totalPendente
											)}
										</div>
										<div className="text-blue-600">
											Adimplência:{' '}
											{formatPercentage(
												parcela.percentualAdimplencia
											)}
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
};
