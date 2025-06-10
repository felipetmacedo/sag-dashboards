import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import {
	LogOut,
	LayoutDashboard,
	BarChart3,
	FileSpreadsheet,
	Banknote,
	List,
	Store,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SagLogo from '@/assets/img/logo-sag.png';
import { motion } from 'framer-motion';
import { useLojasStore } from '@/stores/lojas.store';
import { useQueryClient } from '@tanstack/react-query';

// Define a common interface for all navigation links
interface NavLink {
	label: string;
	href: string;
	icon: React.ReactNode;
	action?: () => Promise<void> | void;
}

export default function SideBar({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [open, setOpen] = useState(true);
	const { lojas, clearLojas } = useLojasStore();
	const queryClient = useQueryClient();

	const handleLogout = async () => {
		clearLojas();
		queryClient.clear();
		navigate('/login');
		toast.success('Deslogado com sucesso!');
	};

	// Combine standard links with permission-based links
	const standardLinks: NavLink[] = [
		{
			label: 'Dashboard',
			href: '/dashboard',
			icon: (
				<LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: 'Rankings',
			href: '/ranking',
			icon: (
				<BarChart3 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: 'Vendas',
			href: '/vendas',
			icon: (
				<Banknote className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: 'Propostas',
			href: '/propostas',
			icon: (
				<List className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: 'Relatórios',
			href: '/relatorios',
			icon: (
				<FileSpreadsheet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
		},
		{
			label: 'Logout',
			href: '#',
			icon: (
				<LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
			),
			action: handleLogout,
		},
	];

	// Combine all links
	const links = [...standardLinks];

	return (
		<div
			className={cn(
				'flex flex-col md:flex-row dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 overflow-hidden',
				'h-screen w-screen'
			)}
		>
			<Sidebar open={open} setOpen={setOpen}>
				<SidebarBody className="justify-between gap-10 bg-secondary">
					<div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
						<div className="relative h-6">
							<motion.div
								animate={{
									opacity: open ? 1 : 0,
									display: open ? 'block' : 'none',
								}}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<Logo />
							</motion.div>
							<motion.div
								animate={{
									opacity: open ? 0 : 1,
									display: open ? 'none' : 'block',
								}}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								<LogoIcon />
							</motion.div>
						</div>
						<div className="mt-4 flex flex-col gap-2 ml-1">
							{links.map((link, idx) => {
								const { action, ...linkWithoutAction } = link;

								if (action) {
									return (
										<div key={idx} onClick={action}>
											<SidebarLink
												link={linkWithoutAction}
											/>
										</div>
									);
								}

								return (
									<SidebarLink
										key={idx}
										link={linkWithoutAction}
									/>
								);
							})}
						</div>
					</div>
					{open && lojas && lojas.length > 0 && (
						<div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
							<div className="space-y-1 px-3">
								{lojas.map((loja) => (
									<div 
										key={loja.codhda} 
										className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium w-full"
									>
										<Store className="h-4 w-4 flex-shrink-0" />
										{open && <span className="truncate">{loja.empresa}</span>}
									</div>
								))}
							</div>
						</div>
					)}
				</SidebarBody>
			</Sidebar>
			{children}
		</div>
	);
}

export const Logo = () => (
	<Link to="#" className="flex items-center justify-start h-full">
		<img src={SagLogo} alt="logo" className="h-10 object-contain" />
	</Link>
);

export const LogoIcon = () => (
	<div className="flex items-center justify-center h-full">
		<img src={SagLogo} alt="logo" className="h-10 w-10 object-contain" />
	</div>
);
