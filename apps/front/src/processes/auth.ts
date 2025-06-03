import { toast } from 'sonner';
import axios from 'axios';

export async function getUserLojas({
	usuario,
	senha,
}: {
	usuario: string;
	senha: string;
}) {
	const response = await axios.post(
		'https://webhook.n8n.sagzap.com.br/webhook/api-dashboard-login',
		{
			user: usuario,
			pass: senha,
		}
	);

	if (!response.data.lojas) {
		toast.error('Erro ao buscar lojas');
		return [];
	}
	
	return response.data.lojas;
}