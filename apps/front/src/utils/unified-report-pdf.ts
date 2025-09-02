import jsPDF from 'jspdf';

export type Align = 'left' | 'right' | 'center';

export interface UnifiedPdfColumn {
  header: string;
  field: string; // key in the row object
  width?: number; // mm, optional. If omitted, auto distributes remaining space
  align?: Align; // defaults to 'left'
}

export interface UnifiedPdfSection {
  title: string;
  subtitle?: string; // optional smaller text under title
  columns: UnifiedPdfColumn[];
  // Rows are simple records with string/number values for the provided fields
  rows: Array<Record<string, string | number | null | undefined>>;
}

export interface UnifiedPdfData {
  loja: string;
  period: string; // already formatted (e.g., 01/01/2024 a 31/01/2024)
  sections: UnifiedPdfSection[]; // e.g., Ranking, Vendas, Checkup
}

// Renders a unified, styled PDF report composed of multiple sections (tables)
export async function exportUnifiedReportPdf(
  data: UnifiedPdfData,
  filename = 'relatorio_comercial.pdf'
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const marginBottom = 15;

  // Brand/styling palette (aligned with existing Dashboard PDF)
  const green = { r: 76, g: 175, b: 80 };
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
  pdf.text(
    `Gerado em: ${now.toLocaleDateString('pt-BR')}, ${now.toLocaleTimeString('pt-BR')}`,
    rx,
    24,
    { align: 'right' }
  );

  // Content start
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  let y = 45;

  // Helper for pagination
  const ensureSpace = (needed: number, sectionTitle?: string) => {
    if (y > pageHeight - marginBottom - needed) {
      pdf.addPage();
      // continuation header (thin header strip)
      if (sectionTitle) {
        pdf.setFillColor(green.r, green.g, green.b);
        pdf.rect(0, 0, pageWidth, 12, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(`${sectionTitle} (cont.)`, marginLeft, 9);
        pdf.setTextColor(0, 0, 0);
      }
      y = 22;
    }
  };

  // Draw a single table section
  const drawSection = (section: UnifiedPdfSection) => {
    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    ensureSpace(12, section.title);
    pdf.text(section.title, marginLeft, y);
    y += 6;
    if (section.subtitle) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      ensureSpace(10, section.title);
      pdf.setTextColor(gray.r, gray.g, gray.b);
      pdf.text(section.subtitle, marginLeft, y);
      pdf.setTextColor(0, 0, 0);
      y += 4;
    }
    y += 2;

    // Compute column widths
    const availableWidth = pageWidth - marginLeft - marginRight;
    const explicitSum = section.columns.reduce((s, c) => s + (c.width || 0), 0);
    const unspecified = section.columns.filter((c) => !c.width).length || 0;
    const autoWidth = unspecified > 0 ? Math.max((availableWidth - explicitSum) / unspecified, 20) : 0;

    // Header row styling
    const headerHeight = 8;
    ensureSpace(headerHeight + 4, section.title);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(marginLeft, y, availableWidth, headerHeight, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);

    let x = marginLeft;
    section.columns.forEach((col) => {
      const colWidth = col.width || autoWidth;
      const align: Align = col.align || 'left';
      // Header text
      const textX = align === 'left' ? x + 2 : align === 'right' ? x + colWidth - 2 : x + colWidth / 2;
      pdf.text(col.header, textX, y + 5, { align });
      x += colWidth;
    });

    y += headerHeight + 2;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);

    const zebra = { r: 252, g: 252, b: 252 };
    const cellPaddingX = 2;
    const cellPaddingY = 2;
    const lineHeight = 4; // line spacing for wrapped text

    // Rows
    section.rows.forEach((row, index) => {
      // Pre-calc wrapped lines for each column to determine row height
      const wrappedPerCol = section.columns.map((col) => {
        const colWidth = col.width || autoWidth;
        const value = row[col.field];
        const raw = value === null || value === undefined ? '-' : String(value);
        const maxTextWidth = Math.max(colWidth - cellPaddingX * 2, 8);
        const lines = pdf.splitTextToSize(raw, maxTextWidth) as string[];
        return { lines, colWidth };
      });

      const maxLines = wrappedPerCol.reduce((m, c) => Math.max(m, c.lines.length), 1);
      const rowHeight = maxLines * lineHeight + cellPaddingY * 2;

      ensureSpace(rowHeight + 2, section.title);

      // Zebra background for the entire row height
      if (index % 2 === 0) {
        pdf.setFillColor(zebra.r, zebra.g, zebra.b);
        pdf.rect(marginLeft, y - 1, availableWidth, rowHeight + 2, 'F');
      }

      // Draw text per column, respecting alignment, over multiple lines
      let colX = marginLeft;
      section.columns.forEach((col, colIndex) => {
        const colWidth = col.width || autoWidth;
        const align: Align = col.align || 'left';
        const { lines } = wrappedPerCol[colIndex];

        lines.forEach((line, i) => {
          const baseY = y + cellPaddingY + (i + 1) * lineHeight;
          const textX =
            align === 'left'
              ? colX + cellPaddingX
              : align === 'right'
              ? colX + colWidth - cellPaddingX
              : colX + colWidth / 2;
          pdf.text(line, textX, baseY, { align });
        });

        colX += colWidth;
      });

      y += rowHeight;
    });

    y += 8; // spacing after section
  };

  // Sections rendering
  data.sections.forEach((section) => {
    drawSection(section);
  });

  // Footer on all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(gray.r, gray.g, gray.b);
    pdf.text('SAG Dashboards - Comercial', marginLeft, pageHeight - 8);
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, pageHeight - 8, { align: 'right' });
  }

  const safeLoja = data.loja?.replace(/\s+/g, '_').toLowerCase() || 'loja';
  const defaultName = `relatorio_${safeLoja}.pdf`;
  pdf.save(filename || defaultName);
}
