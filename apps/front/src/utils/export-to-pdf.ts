import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

interface PdfHeader {
    label: string; // Nome da coluna no PDF (exibido no arquivo)
    key: string; // Chave correspondente no objeto JSON
}

interface ExportToPdfParams {
    data: any[]; // Dados no formato JSON - allows any report type
    headers: PdfHeader[]; // Cabeçalhos do PDF
    filename?: string; // Nome do arquivo (opcional, com valor padrão)
    title?: string; // Título do relatório
    subtitle?: string; // Subtítulo do relatório
    displayInPage?: boolean; // Se verdadeiro, exibe o PDF na página atual ao invés de baixá-lo
}

/**
 * Exporta dados JSON para um arquivo PDF e o exibe diretamente na página ou o disponibiliza para download.
 * @param params - Objeto contendo os dados, cabeçalhos e configurações do PDF.
 * @returns Uma Promise que resolve com o URL do blob do PDF quando displayInPage é true
 */
export const exportToPdf = ({ 
    data, 
    headers, 
    filename = "export", 
    title, 
    subtitle,
    displayInPage = false
}: ExportToPdfParams): Promise<string | void> => {
    return new Promise((resolve, reject) => {
        try {
            // Verifica se há dados para exportar
            if (!data || data.length === 0) {
                toast.error("Nenhum dado para exportar");
                reject("Nenhum dado para exportar");
                return;
            }

            // Verifica se os cabeçalhos foram fornecidos
            if (!headers || headers.length === 0) {
                toast.error("Cabeçalhos não fornecidos");
                reject("Cabeçalhos não fornecidos");
                return;
            }

            // Criando elemento temporário para renderizar a tabela HTML
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            document.body.appendChild(tempDiv);
            
            // Estilos CSS para a tabela
            const styles = `
                .pdf-container {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 700px;
                }
                .pdf-title {
                    font-size: 18px;
                    text-align: center;
                    margin-bottom: 8px;
                    font-weight: bold;
                }
                .pdf-subtitle {
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 16px;
                    color: #666;
                }
                .pdf-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }
                .pdf-table th {
                    background-color: #444;
                    color: white;
                    font-weight: bold;
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                .pdf-table td {
                    padding: 8px;
                    border: 1px solid #ddd;
                }
                .pdf-table tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
                .pdf-footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                }
            `;
            
            // Cria HTML para título e subtítulo
            const titleHtml = title ? `<div class="pdf-title">${title}</div>` : '';
            const subtitleHtml = subtitle ? `<div class="pdf-subtitle">${subtitle}</div>` : '';
            
            // Cria cabeçalhos da tabela
            const headerRow = headers
                .map(header => `<th>${header.label}</th>`)
                .join('');
            
            // Cria linhas da tabela a partir dos dados
            const dataRows = data
                .map(item => {
                    const cells = headers
                        .map(header => {
                            const value = item[header.key];
                            // Formata números quando necessário
                            if (typeof value === 'number') {
                                if (header.key === 'mediaAcumulada') {
                                    return `<td>${value.toFixed(2)}</td>`;
                                }
                                return `<td>${value}</td>`;
                            }
                            return `<td>${value ?? ''}</td>`;
                        })
                        .join('');
                    return `<tr>${cells}</tr>`;
                })
                .join('');
                
            // Cria o rodapé com a data
            const currentDate = new Date().toLocaleDateString('pt-BR');
            const footerHtml = `<div class="pdf-footer">Relatório gerado em ${currentDate}</div>`;
            
            // Monta o HTML completo
            const htmlContent = `
                <style>${styles}</style>
                <div class="pdf-container">
                    ${titleHtml}
                    ${subtitleHtml}
                    <table class="pdf-table">
                        <thead>
                            <tr>${headerRow}</tr>
                        </thead>
                        <tbody>
                            ${dataRows}
                        </tbody>
                    </table>
                    ${footerHtml}
                </div>
            `;
            
            // Insere o HTML no div temporário
            tempDiv.innerHTML = htmlContent;
            
            // Converte o HTML em canvas
            html2canvas(tempDiv, {
                scale: 2, // Aumenta a qualidade
                logging: false,
                useCORS: true
            }).then(canvas => {
                // Remove o div temporário do DOM após renderizar
                document.body.removeChild(tempDiv);
                
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });
                
                // Calcula as dimensões para ajustar ao tamanho do PDF
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                
                // Adiciona a imagem do HTML renderizado ao PDF
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                
                if (displayInPage) {
                    // Gera um Blob do PDF para exibir na página
                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);
                    
                    toast.success("PDF gerado com sucesso", {
                        description: "O PDF está sendo exibido na página"
                    });
                    
                    resolve(pdfUrl);
                } else {
                    // Salva o PDF para download
                    pdf.save(`${filename}.pdf`);
                    
                    toast.success("PDF gerado com sucesso", {
                        description: "O download do PDF foi iniciado"
                    });
                    
                    resolve();
                }
            }).catch(err => {
                document.body.removeChild(tempDiv); // Limpa em caso de erro
                console.error('Error converting HTML to canvas:', err);
                toast.error("Erro ao gerar o PDF");
                reject(err);
            });
            
        } catch (error) {
            toast.error("Erro ao exportar para PDF");
            console.error("Erro ao exportar para PDF:", error);
            reject(error);
        }
    });
};

/**
 * Cria um elemento de visualização de PDF embutido na página.
 * @param pdfUrl - URL do PDF a ser exibido
 * @param containerId - ID do elemento HTML onde o PDF será exibido
 * @returns O elemento criado
 */
export const createPdfViewer = (pdfUrl: string, containerId: string): HTMLElement => {
    const container = document.getElementById(containerId);
    if (!container) {
        toast.error("Contêiner para exibição do PDF não encontrado");
        throw new Error("Contêiner para exibição do PDF não encontrado");
    }
    
    // Limpa o contêiner
    container.innerHTML = '';
    
    // Cria um iframe para exibir o PDF
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = '1px solid #ccc';
    
    container.appendChild(iframe);
    
    return iframe;
};
