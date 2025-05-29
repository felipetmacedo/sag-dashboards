import { useTokenStore } from '@/stores/token.store';
import { usePropostasStore } from '@/stores/propostas.store';
import axios from 'axios';

// Fetch propostas from the external API and store in the propostas store
export async function fetchPropostas({ DT_INICIO, DT_FINAL }: { DT_INICIO: string, DT_FINAL: string }) {
  const tokenStore = useTokenStore.getState();
  const propostaStore = usePropostasStore.getState();
  const token = tokenStore.token;
  if (!token) throw new Error('Token não encontrado');

  const response = await axios({
    method: 'get',
    url: `http://webservice.sfssistemas.com.br:8085/ZAP/webservice.potiguar.propostas.rule?sys=ZAP&CODHDA=${token}&DT_INICIO=${DT_INICIO}&DT_FINAL=${DT_FINAL}&token=73f4eaa45b90a00e8834d951074ba042`,
    withCredentials: false,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  propostaStore.setPropostas(response.data);
  return response.data;
}