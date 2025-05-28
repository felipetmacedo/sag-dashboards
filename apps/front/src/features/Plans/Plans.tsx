import { PricingCard } from '@components/princing-card';
import { GraduationCap, Send, Search } from 'lucide-react';

const plans = [
	{
		name: 'Start',
		price: 197,
		description:
			'Ideal para afiliados iniciantes que querem começar a vender!',
		users: '01 Usuário',
		features: [
			{ text: 'Sistema de envio de nomes', icon: Send },
			{ text: 'Pesquisa em tempo real', icon: Search },
			{ text: 'Treinamento - Academia de negócios', icon: GraduationCap },
		],
		color: 'bg-amber-50 hover:bg-amber-100',
		textColor: 'text-gray-800',
	}
];

export default function Pricing() {
	return (
		<section className="bg-gradient-to-br from-gray-50 to-white">
			<div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
				<div className="my-10 text-center">
					<h2 className="mb-6 text-4xl font-bold text-gray-800">
						Escolha o Plano Ideal
					</h2>
					<p className="mx-auto max-w-3xl text-xl text-gray-600">
						Soluções flexíveis para impulsionar seu crescimento como
						afiliado
					</p>
				</div>

				<div className="flex items-center justify-center">
					{plans.map((plan) => (
						<PricingCard
							key={plan.name}
							plan={plan}
							onSelect={() => {}}
						/>
					))}
				</div>
			</div>
		</section>
	);
};