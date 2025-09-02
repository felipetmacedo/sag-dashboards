import jsPDF from 'jspdf';

export interface AdimplenciaParcelaSummary {
  parcela: string;
  totalPropostas: number;
  totalPago: number;
  totalPendente: number;
  percentualAdimplencia: number;
}

export interface AdimplenciaPdfData {
  loja: string;
  period: string;
  selectedParcelas: string[];
  parcelasSummary: AdimplenciaParcelaSummary[];
  exportDate: string; // e.g. '2025-07-09 10:25'
}

export async function exportAdimplenciaPdf(data: AdimplenciaPdfData, filename = 'adimplencia.pdf') {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const marginBottom = 15;

  // Colors (match dashboard visual style)
  const green = { r: 76, g: 175, b: 80 };
  const blue = { r: 33, g: 150, b: 243 };
  const red = { r: 244, g: 67, b: 54 };
  const gray = { r: 158, g: 158, b: 158 };

  // Header background
  pdf.setFillColor(green.r, green.g, green.b);
  pdf.rect(0, 0, pageWidth, 35, 'F');

  // Header title and metadata
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text(`SAG Dashboards - Adimplência`, marginLeft, 20);

  pdf.setFontSize(10);
  const rightX = pageWidth - marginRight;
  pdf.text(`Loja: ${data.loja}`, rightX, 10, { align: 'right' });
  pdf.text(`Período: ${data.period}`, rightX, 17, { align: 'right' });
  pdf.text(`Gerado em: ${data.exportDate}`, rightX, 24, { align: 'right' });

  // Reset text style for content
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');

  let y = 45;

  // Compute overall totals
  const totals = data.parcelasSummary.reduce(
    (acc, p) => {
      acc.totalPropostas += p.totalPropostas;
      acc.totalPago += p.totalPago;
      acc.totalPendente += p.totalPendente;
      return acc;
    },
    { totalPropostas: 0, totalPago: 0, totalPendente: 0 }
  );
  const perc = totals.totalPropostas > 0 ? (totals.totalPago / totals.totalPropostas) * 100 : 0;

  // Summary cards
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Resumo Geral', marginLeft, y);
  y += 8;

  const cardWidth = 40;
  const cardHeight = 22;
  const cardGap = 8;
  let x = marginLeft;

  // Card: Total Propostas (blue)
  pdf.setFillColor(blue.r, blue.g, blue.b);
  pdf.rect(x, y, cardWidth, cardHeight, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`${totals.totalPropostas.toLocaleString('pt-BR')}`, x + cardWidth / 2, y + 11, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('Total Propostas', x + cardWidth / 2, y + 18, { align: 'center' });

  x += cardWidth + cardGap;

  // Card: Pagas (green)
  pdf.setFillColor(green.r, green.g, green.b);
  pdf.rect(x, y, cardWidth, cardHeight, 'F');
  pdf.setFontSize(14);
  pdf.text(`${totals.totalPago.toLocaleString('pt-BR')}`, x + cardWidth / 2, y + 11, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('Pagas', x + cardWidth / 2, y + 18, { align: 'center' });

  x += cardWidth + cardGap;

  // Card: Pendentes (red)
  pdf.setFillColor(red.r, red.g, red.b);
  pdf.rect(x, y, cardWidth, cardHeight, 'F');
  pdf.setFontSize(14);
  pdf.text(`${totals.totalPendente.toLocaleString('pt-BR')}`, x + cardWidth / 2, y + 11, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('Pendentes', x + cardWidth / 2, y + 18, { align: 'center' });

  x += cardWidth + cardGap;

  // Card: % Adimplência (green)
  pdf.setFillColor(green.r, green.g, green.b);
  pdf.rect(x, y, cardWidth, cardHeight, 'F');
  pdf.setFontSize(14);
  pdf.text(`${perc.toFixed(1)}%`, x + cardWidth / 2, y + 11, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('% Adimplência', x + cardWidth / 2, y + 18, { align: 'center' });

  // Move below cards
  y += cardHeight + 12;
  pdf.setTextColor(0, 0, 0);

  // Selected parcelas info
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const parcelasLabel = data.selectedParcelas?.length
    ? data.selectedParcelas.join(', ')
    : 'Todas';
  pdf.text(`Parcelas selecionadas: ${parcelasLabel}`, marginLeft, y);
  y += 8;

  // Section: Resumo por Parcela
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Resumo por Parcela', marginLeft, y);
  y += 8;

  // Table header
  pdf.setFontSize(9);
  pdf.setTextColor(green.r, green.g, green.b);
  pdf.text('Parcela', marginLeft, y);
  pdf.text('Propostas', marginLeft + 40, y);
  pdf.text('Pagas', marginLeft + 85, y);
  pdf.text('Pendentes', marginLeft + 115, y);
  pdf.text('%', marginLeft + 165, y);
  y += 4;
  pdf.setDrawColor(green.r, green.g, green.b);
  pdf.line(marginLeft, y, pageWidth - marginRight, y);
  y += 6;

  // Table rows
  const ensureSpace = (needed: number) => {
    if (y > pageHeight - marginBottom - needed) {
      pdf.addPage();
      // header band on new page
      pdf.setFillColor(green.r, green.g, green.b);
      pdf.rect(0, 0, pageWidth, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo por Parcela (cont.)', marginLeft, 9);
      pdf.setTextColor(0, 0, 0);
      y = 22;
    }
  };

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  data.parcelasSummary
    .slice()
    .sort((a, b) => a.parcela.localeCompare(b.parcela))
    .forEach((p) => {
      ensureSpace(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${p.parcela}ª`, marginLeft, y);

      pdf.text(`${p.totalPropostas}`, marginLeft + 40, y);

      pdf.setTextColor(green.r, green.g, green.b);
      pdf.text(`${p.totalPago}`, marginLeft + 85, y);

      pdf.setTextColor(red.r, red.g, red.b);
      pdf.text(`${p.totalPendente}`, marginLeft + 115, y);

      pdf.setTextColor(green.r, green.g, green.b);
      pdf.text(`${p.percentualAdimplencia.toFixed(1)}%`, marginLeft + 165, y);

      pdf.setTextColor(0, 0, 0);
      y += 7;
    });

  // Totals row line
  ensureSpace(14);
  pdf.setDrawColor(gray.r, gray.g, gray.b);
  pdf.line(marginLeft, y, pageWidth - marginRight, y);
  y += 6;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Totais', marginLeft, y);
  pdf.text(`${totals.totalPropostas}`, marginLeft + 40, y);
  pdf.setTextColor(green.r, green.g, green.b);
  pdf.text(`${totals.totalPago}`, marginLeft + 85, y);
  pdf.setTextColor(red.r, red.g, red.b);
  pdf.text(`${totals.totalPendente}`, marginLeft + 115, y);
  pdf.setTextColor(green.r, green.g, green.b);
  pdf.text(`${perc.toFixed(1)}%`, marginLeft + 165, y);
  pdf.setTextColor(0, 0, 0);

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(gray.r, gray.g, gray.b);
    pdf.text('SAG Dashboards - Adimplência', marginLeft, pageHeight - 8);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, pageHeight - 8, { align: 'right' });
  }

  // Filename
  const safeLoja = data.loja?.replace(/\s+/g, '_').toLowerCase() || 'loja';
  const defaultName = `adimplencia_${safeLoja}.pdf`;
  pdf.save(filename || defaultName);
}
