import { Outlet } from 'react-router-dom';
import { SideBar } from '@/components/sidebar';
import { useTokenStore } from '@/stores/token.store';

function App() {
	const { token } = useTokenStore();

	if (!token) {
		return (
			<>
				<div className="flex h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
					Not Found
				</div>
			</>
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
