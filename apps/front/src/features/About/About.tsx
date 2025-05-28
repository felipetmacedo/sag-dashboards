import { ArrowRight, Play } from 'lucide-react';
import { Header } from '@/components/ui/header';

export function About() {
	return (
		<>
			<Header />
			<div className="relative">
				{/* Background Image with Overlay */}
				<div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
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
							Ajude seus clientes a recuperarem o nome e a tranquilidade.
						</h1>
						<p className="text-xl text-gray-200 mb-4">
							O vendedor conta com o sistema Apollo para limpar o nome de seus clientes e ajudá-los a voltar a ter crédito no mercado.
						</p>
						<p className="text-lg text-gray-300 mb-8">
							Com tecnologia de ponta, o vendedor regulariza o CPF dos clientes e resolve pendências financeiras de forma simples, rápida e segura. Tudo em um só lugar, acessível de onde estiver.
						</p>

						<div className="flex flex-col sm:flex-row gap-4">
							<button className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl text-apollo-gray-dark bg-[#FDB913] hover:bg-[#FDB913]/90 transition-colors">
								Experimente
								<ArrowRight className="ml-2 h-5 w-5" />
							</button>

							<button className="inline-flex items-center justify-center px-8 py-4 border-2 border-[#FDB913] text-lg font-medium rounded-xl text-white hover:bg-[#FDB913]/10 transition-colors">
								<Play className="mr-2 h-5 w-5" />
								Conheça o Apollo
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
