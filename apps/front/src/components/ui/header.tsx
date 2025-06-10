import { Link } from 'react-router-dom';
import { Button } from './button';

export function Header() {
	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
			<nav
				className="mx-auto flex max-w-7xl items-center justify-between p-2 lg:px-8"
				aria-label="Global"
			>
				<div className="flex lg:flex-1">
					<img className="h-20 w-20" src="/logo-sag.png" alt="SAG" />
				</div>

				<div className="hidden lg:flex lg:flex-1 lg:justify-end">
					<Button asChild variant="default" className="bg-primary">
						<Link to="/login">Acessar dashboards</Link>
					</Button>
				</div>
			</nav>
		</header>
	);
}
