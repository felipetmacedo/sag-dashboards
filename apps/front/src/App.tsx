import { Outlet } from 'react-router-dom';
import { SideBar } from '@/components/sidebar';
import { useLojasStore } from './stores/lojas.store';

function App() {
	const { lojas } = useLojasStore();

	if (!lojas) {
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
			<div className="flex h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none] bg-background">
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
