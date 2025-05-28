import { Outlet } from 'react-router-dom';
import { useUserStore } from './stores/user.store';
import { useQuery } from '@tanstack/react-query';
import { getUserInfo } from './processes/user';
import { Loader } from 'lucide-react';
import { SideBar } from '@/components/sidebar';

function App() {
	const { setUserInfo } = useUserStore();

	const { isLoading } = useQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const userInfo = await getUserInfo();

			if (userInfo) {
				setUserInfo({
					...userInfo,
					document: userInfo.document || "",
					address: userInfo.address || "",
					cep: userInfo.cep || "",
					number: userInfo.number || "",
					complement: userInfo.complement || "",
					neighborhood: userInfo.neighborhood || "",
					city: userInfo.city || "",
					state: userInfo.state || "",
					permissions: userInfo.permissions.map((permission: any) => ({
						id: permission.id,
						name: permission.name,
						module: permission.module,
					})),
				});
			}

			return userInfo;
		},
	});

	if (isLoading) {
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-2">
					<Loader className="h-8 w-8 animate-spin" />
					<span className="text-sm text-muted-foreground">
						Carregando informações...
					</span>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
				<SideBar>
					<main className="flex-1 p-4 overflow-y-auto">
						<Outlet />
					</main>
				</SideBar>
			</div>
		</>
	);
}

export default App;
