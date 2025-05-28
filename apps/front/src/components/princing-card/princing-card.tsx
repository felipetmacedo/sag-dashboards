import React from 'react';

interface PricingCardProps {
	plan: {
		name: string;
		price: number;
		description: string;
		users: string;
		features: Array<{
			text: string;
			icon: React.ElementType;
		}>;
		color: string;
		textColor: string;
		popular?: boolean;
	};
	onSelect: () => void;
}

export default function PricingCard({ plan, onSelect }: PricingCardProps) {
	return (
		<div
			className={`rounded-2xl p-8 ${plan.color} ${plan.textColor} relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
		>
			{plan.popular && (
				<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
					<span className="bg-apollo-yellow text-apollo-gray-dark px-6 py-1.5 rounded-full text-sm font-semibold shadow-md">
						Mais Popular
					</span>
				</div>
			)}
			<div className="mb-8 space-y-4">
				<h3 className="text-2xl font-bold">{plan.name}</h3>
				<p className="text-sm opacity-90">{plan.description}</p>
				<div className="flex items-baseline pt-2">
					<span className="text-4xl font-bold">R$ {plan.price}</span>
					<span className="ml-2 text-sm opacity-80">/mês</span>
				</div>
				<div className="text-sm font-medium opacity-90 border-b border-current pb-4 pt-2">
					{plan.users}
				</div>
			</div>

			<ul className="space-y-5 mb-8">
				{plan.features.map((feature, index) => {
					const Icon = feature.icon;
					return (
						<li key={index} className="flex items-center space-x-3">
							<Icon className="h-5 w-5 flex-shrink-0" />
							<span className="text-sm">{feature.text}</span>
						</li>
					);
				})}
			</ul>

			<button
				onClick={onSelect}
				className={`w-full py-3.5 px-6 rounded-lg font-medium transition-all duration-300
          ${
				plan.name === 'Enterprise'
					? 'bg-white text-apollo-gray-dark hover:bg-white/90 transform hover:scale-105'
					: 'bg-apollo-yellow text-apollo-gray-dark hover:bg-opacity-90 transform hover:scale-105'
			}`}
			>
				Selecionar {plan.name}
			</button>
		</div>
	);
}
