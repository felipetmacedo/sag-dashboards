import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/ui/header';
import { Link } from 'react-router-dom';

export function About() {
	return (
		<>
			<Header />
			<div className="flex h">
				{/* Background Image with Overlay */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute inset-0 bg-[#1a1f36]/50" />
					<img
						src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80"
						alt="Apollo Dashboard Analytics"
						className="w-full h-full object-cover object-center"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-[#1a1f36]/60 via-[#1a1f36]/40 to-transparent"></div>
					<div className="absolute inset-0 bg-gradient-to-r from-[#1a1f36]/70 via-[#1a1f36]/30 to-transparent"></div>
				</div>

				{/* Content */}
				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-64">
					<div className="max-w-2xl">
						<h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
							A plataforma completa para dashboards inteligentes.
						</h1>
						<p className="text-xl text-gray-200 mb-4">
							Crie, gerencie e visualize dashboards personalizados para acompanhar os principais indicadores do seu negócio em tempo real.
						</p>
						<p className="text-lg text-gray-300 mb-8">
							Com recursos avançados, integração de dados e visualizações dinâmicas, nossa plataforma facilita a tomada de decisões estratégicas. Tudo em um só lugar, acessível de qualquer dispositivo.
						</p>

						<div className="flex flex-col sm:flex-row gap-4">
							<Link
								to="/login"
								className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-apollo-gray-dark bg-primary hover:bg-primary/90 transition-colors"
							>
								Experimente
								<ArrowRight className="ml-2 h-5 w-5" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
