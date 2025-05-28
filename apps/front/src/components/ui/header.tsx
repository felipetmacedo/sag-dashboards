import { Link } from 'react-router-dom';
import { Button } from './button';

export function Header() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
			<nav
				className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
				aria-label="Global"
			>
				<div className="flex lg:flex-1">
					<Link to="/" className="-m-1.5 p-1.5">
						<span className="sr-only">Apollo</span>
						<img
							className="h-8 w-auto"
							src="/logo-apollo.png"
							alt="Apollo"
						/>
					</Link>
				</div>

				<div className="hidden lg:flex lg:gap-x-12">
					<Link
						to="/about"
						className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
					>
						Funcionalidades
					</Link>
					<Link
						to="/pricing"
						className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600"
					>
						Planos e Preços
					</Link>
				</div>

				<div className="hidden lg:flex lg:flex-1 lg:justify-end">
					<Button asChild variant="default">
						<Link to="/login">Acessar o Apollo</Link>
					</Button>
				</div>
			</nav>
		</header>
	);
}
