import jsPDF from 'jspdf';

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
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const marginBottom = 15;

  // Colors
  const green = { r: 76, g: 175, b: 80 };
  const blue = { r: 33, g: 150, b: 243 };
  const purple = { r: 162, g: 89, b: 250 };
  const pink = { r: 255, g: 99, b: 132 };
  const yellow = { r: 255, g: 205, b: 86 };
  const gray = { r: 158, g: 158, b: 158 };

  // Header
  pdf.setFillColor(green.r, green.g, green.b);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('SAG Dashboards - Comercial', marginLeft, 20);
  const now = new Date();
  pdf.setFontSize(10);
  const rx = pageWidth - marginRight;
  pdf.text(`Loja: ${data.loja}`, rx, 10, { align: 'right' });
  pdf.text(`Período: ${data.period}`, rx, 17, { align: 'right' });
  pdf.text(`Gerado em: ${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`, rx, 24, { align: 'right' });

  // Content start
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  let y = 45;

  // Summary cards
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Resumo Geral', marginLeft, y);
  y += 8;

  const cardWidth = pageWidth - marginLeft - marginRight;
  const cardHeight = 24;
  // Single full-width card: Total Propostas
  pdf.setFillColor(purple.r, purple.g, purple.b);
  pdf.rect(marginLeft, y, cardWidth, cardHeight, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(`${data.totalPropostas.toLocaleString('pt-BR')}`, marginLeft + cardWidth / 2, y + 13, { align: 'center' });
  pdf.setFontSize(9);
  pdf.text('Total de Propostas', marginLeft + cardWidth / 2, y + 20, { align: 'center' });

  y += cardHeight + 12;
  pdf.setTextColor(0, 0, 0);

  // Helper for pagination
  const ensureSpace = (needed: number, title?: string) => {
    if (y > pageHeight - marginBottom - needed) {
      pdf.addPage();
      if (title) {
        pdf.setFillColor(green.r, green.g, green.b);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(`${title} (cont.)`, marginLeft, 9);
        pdf.setTextColor(0, 0, 0);
      }
      y = 22;
    }
  };

  // Section: TOP 10 Vendedores
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('TOP 10 Vendedores', marginLeft, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  data.topVendors.slice(0, 10).forEach((item, idx) => {
    ensureSpace(10, 'TOP 10 Vendedores');
    pdf.setTextColor(purple.r, purple.g, purple.b);
    pdf.text(`${idx + 1}.`, marginLeft, y);
    pdf.setTextColor(0, 0, 0);
    const name = item.name.length > 35 ? item.name.slice(0, 32) + '...' : item.name;
    pdf.text(name, marginLeft + 10, y);
    pdf.text(`${item.sales}`, pageWidth - marginRight, y, { align: 'right' });
    y += 6;
  });

  y += 6;

  // Section: TOP 10 Motos
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('TOP 10 Motos', marginLeft, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  data.topMotors.slice(0, 10).forEach((item, idx) => {
    ensureSpace(10, 'TOP 10 Motos');
    pdf.setTextColor(blue.r, blue.g, blue.b);
    pdf.text(`${idx + 1}.`, marginLeft, y);
    pdf.setTextColor(0, 0, 0);
    const name = item.name.length > 35 ? item.name.slice(0, 32) + '...' : item.name;
    pdf.text(name, marginLeft + 10, y);
    pdf.text(`${item.sales}`, pageWidth - marginRight, y, { align: 'right' });
    y += 6;
  });

  y += 6;

  // Section: TOP 10 Planos
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('TOP 10 Planos', marginLeft, y);
  y += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  data.topPlanos.slice(0, 10).forEach((item, idx) => {
    ensureSpace(10, 'TOP 10 Planos');
    pdf.setTextColor(yellow.r, yellow.g, yellow.b);
    pdf.text(`${idx + 1}.`, marginLeft, y);
    pdf.setTextColor(0, 0, 0);
    const name = item.name.length > 35 ? item.name.slice(0, 32) + '...' : item.name;
    pdf.text(name, marginLeft + 10, y);
    pdf.text(`${item.sales}`, pageWidth - marginRight, y, { align: 'right' });
    y += 6;
  });

  y += 8;

  // Section: Tipo de Proposta (compact)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Tipo de Proposta', marginLeft, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  data.tipoPropostaPie.forEach((item) => {
    ensureSpace(8, 'Tipo de Proposta');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${item.tipo}:`, marginLeft, y);
    pdf.setTextColor(pink.r, pink.g, pink.b);
    pdf.text(`${item.value} (${item.perc}%)`, marginLeft + 40, y);
    y += 6;
  });

  y += 6;

  // Section: Vendas por Produto (compact)
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Vendas por Produto', marginLeft, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const totalProductSales = data.productPie.reduce((s, p) => s + (p.sales || 0), 0) || 1;
  data.productPie.slice(0, 10).forEach((item) => {
    ensureSpace(8, 'Vendas por Produto');
    const perc = item.perc ?? Math.round((item.sales / totalProductSales) * 100);
    pdf.setTextColor(0, 0, 0);
    const name = item.name.length > 35 ? item.name.slice(0, 32) + '...' : item.name;
    pdf.text(`${name}:`, marginLeft, y);
    pdf.setTextColor(blue.r, blue.g, blue.b);
    pdf.text(`${item.sales} (${perc}%)`, marginLeft + 60, y);
    y += 6;
  });

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(gray.r, gray.g, gray.b);
    pdf.text('SAG Dashboards - Comercial', marginLeft, pageHeight - 8);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, pageHeight - 8, { align: 'right' });
  }

  const safeLoja = data.loja?.replace(/\s+/g, '_').toLowerCase() || 'loja';
  const defaultName = `dashboard_${safeLoja}.pdf`;
  pdf.save(filename || defaultName);
}
