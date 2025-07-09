import { jsPDF } from 'jspdf';

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
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 18;

  // Title
  doc.setFontSize(22);
  doc.setTextColor('#a259fa');
  doc.text(`Adimplência - ${data.loja}`, 15, y);
  y += 10;
  doc.setFontSize(12);
  doc.setTextColor('#333');
  doc.text(`Período: ${data.period}`, 15, y);
  y += 7;
  doc.text(`Exportado em: ${data.exportDate}`, 15, y);
  y += 7;
  doc.text(`Parcelas selecionadas: ${data.selectedParcelas.length > 0 ? data.selectedParcelas.join(', ') : 'Todas'}`, 15, y);
  y += 10;

  // Table header
  doc.setFontSize(13);
  doc.setTextColor('#a259fa');
  doc.text('Parcela', 15, y);
  doc.text('Propostas', 45, y);
  doc.text('Pagas', 80, y);
  doc.text('Pendentes', 110, y);
  doc.text('% Adimplência', 150, y);
  y += 7;
  doc.setDrawColor('#a259fa');
  doc.line(15, y, 195, y);
  y += 3;

  doc.setFontSize(12);
  data.parcelasSummary.forEach((parcela) => {
    doc.setTextColor('#333');
    doc.text(`${parcela.parcela}ª`, 15, y);
    doc.text(`${parcela.totalPropostas}`, 45, y);
    doc.setTextColor('#2ecc40');
    doc.text(`${parcela.totalPago}`, 80, y);
    doc.setTextColor('#e74c3c');
    doc.text(`${parcela.totalPendente}`, 110, y);
    doc.setTextColor('#2980b9');
    doc.text(`${parcela.percentualAdimplencia.toFixed(1)}%`, 150, y);
    y += 7;
    if (y > 275) {
      doc.addPage();
      y = 18;
    }
  });

  doc.save(filename);
}
