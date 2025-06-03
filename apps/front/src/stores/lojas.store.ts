import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Loja {
	codhda: string;
	empresa: string;
	token_whatsapp: string;
}

interface LojaState {
	lojas: Loja[] | null;
	setLojas: (lojas: Loja[]) => void;
	clearLojas: () => void;
}

export const useLojasStore = create<LojaState>()(
	persist(
		(set) => ({
			lojas: null,

			setLojas: (lojas) =>
				set({
					lojas,
				}),

			clearLojas: () =>
				set({
					lojas: null,
				}),
		}),
		{
			name: 'lojas-storage',
		}
	)
);
