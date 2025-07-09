import { jsPDF } from 'jspdf';

export interface DashboardPdfData {
  loja: string;
  period: string;
  totalPropostas: number;
  totalFaturamento: number;
  topVendors: { name: string; sales: number }[];
  topMotors: { name: string; sales: number }[];
  topPlanos: { name: string; sales: number }[];
  tipoPropostaPie: { tipo: string; value: number; perc: number }[];
  productPie: { name: string; sales: number; perc?: number }[];
}

export async function exportDashboardPdf(data: DashboardPdfData, filename = 'dashboard.pdf') {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 18;

  // Title
  doc.setFontSize(22);
  doc.setTextColor('#a259fa');
  doc.text(`Dashboard - ${data.loja}`, 15, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor('#333');
  doc.text(`Período: ${data.period}`, 15, y);
  y += 12;

  // Totals
  doc.setFontSize(16);
  doc.setTextColor('#a259fa');
  doc.text(`Total de Propostas:`, 15, y);
  doc.setTextColor('#000');
  doc.text(`${data.totalPropostas}`, 80, y); // move further right

  doc.setFontSize(16);
  doc.setTextColor('#2ecc40');
  doc.text(`Total de Faturamento:`, 110, y);
  doc.setTextColor('#000');
  // Place value right after label, not below
  const fatLabelWidth = doc.getTextWidth('Total de Faturamento:');
  doc.text(`${data.totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 110 + fatLabelWidth + 4, y);
  y += 14;

  // TOP 5 Vendedores
  doc.setFontSize(14);
  doc.setTextColor('#333');
  doc.text('TOP 5 Vendedores', 15, y);
  y += 7;
  doc.setFontSize(11);
  for (let i = 0; i < 5; i++) {
    doc.setTextColor('#a259fa');
    doc.text(`${i + 1}.`, 15, y);
    doc.text(`${data.topVendors[i]?.name || '-'}`, 23, y);
    doc.setTextColor('#000');
    doc.text(`${data.topVendors[i]?.sales ?? '-'}`, 195, y, { align: 'right' }); // align far right
    y += 6;
  }
  y += 6;

  // TOP 5 Motos
  doc.setFontSize(14);
  doc.setTextColor('#333');
  doc.text('TOP 5 Motos', 15, y);
  y += 7;
  doc.setFontSize(11);
  for (let i = 0; i < 5; i++) {
    doc.setTextColor('#36a2eb');
    doc.text(`${i + 1}.`, 15, y);
    doc.text(`${data.topMotors[i]?.name || '-'}`, 23, y);
    doc.setTextColor('#000');
    doc.text(`${data.topMotors[i]?.sales ?? '-'}`, 195, y, { align: 'right' }); // align far right
    y += 6;
  }
  y += 6;

  // TOP 5 Planos
  doc.setFontSize(14);
  doc.setTextColor('#333');
  doc.text('TOP 5 Planos', 15, y);
  y += 7;
  doc.setFontSize(11);
  for (let i = 0; i < 5; i++) {
    doc.setTextColor('#ffcd56');
    doc.text(`${i + 1}.`, 15, y);
    doc.text(`${data.topPlanos[i]?.name || '-'}`, 23, y);
    doc.setTextColor('#000');
    doc.text(`${data.topPlanos[i]?.sales ?? '-'}`, 195, y, { align: 'right' }); // align far right
    y += 6;
  }
  y += 8;

  // Pie Data as Tables
  doc.setFontSize(13);
  doc.setTextColor('#ff6384');
  doc.text('Tipo de Proposta', 15, y);
  y += 6;
  doc.setFontSize(11);
  data.tipoPropostaPie.forEach((item) => {
    doc.setTextColor('#000');
    doc.text(`${item.tipo}:`, 18, y);
    doc.setTextColor('#ff6384');
    doc.text(`${item.value} (${item.perc}%)`, 50, y);
    y += 5;
  });
  y += 4;

  doc.setFontSize(13);
  doc.setTextColor('#36a2eb');
  doc.text('Vendas por Produto', 15, y);
  y += 6;
  doc.setFontSize(11);
  data.productPie.forEach((item) => {
    doc.setTextColor('#000');
    doc.text(`${item.name}:`, 18, y);
    doc.setTextColor('#36a2eb');
    doc.text(`${item.sales}${item.perc !== undefined ? ` (${item.perc}%)` : ''}`, 60, y);
    y += 5;
  });

  doc.save(filename);
}
