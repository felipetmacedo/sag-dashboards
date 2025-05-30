import { toast } from "sonner";

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
}

/**
 * Exporta dados JSON para um arquivo PDF utilizando HTML e a funcionalidade de impressão do navegador.
 * @param params - Objeto contendo os dados, cabeçalhos e nome do arquivo.
 */
export const exportToPdf = ({ 
    data, 
    headers, 
    filename = "export", 
    title, 
    subtitle 
}: ExportToPdfParams): void => {
    try {
        // Verifica se há dados para exportar
        if (!data || data.length === 0) {
            toast.error("Nenhum dado para exportar");
            return;
        }

        // Verifica se os cabeçalhos foram fornecidos
        if (!headers || headers.length === 0) {
            toast.error("Cabeçalhos não fornecidos");
            return;
        }

        // Cria um elemento HTML para exibir os dados em formato de tabela
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            toast.error("Não foi possível abrir a janela de impressão", {
                description: "Verifique se os pop-ups estão permitidos no navegador"
            });
            return;
        }

        // Estilos CSS para o documento
        const styles = `
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1 {
                font-size: 20px;
                text-align: center;
                margin-bottom: 10px;
            }
            h2 {
                font-size: 16px;
                text-align: center;
                margin-bottom: 20px;
                color: #666;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th {
                background-color: #444;
                color: white;
                font-weight: bold;
                padding: 8px;
                text-align: left;
                border: 1px solid #ddd;
            }
            td {
                padding: 8px;
                border: 1px solid #ddd;
            }
            tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
        `;

        // Converte os dados para formato de tabela HTML
        const headerRow = headers.map(header => `<th>${header.label}</th>`).join('');
        
        const dataRows = data.map(item => {
            const cells = headers.map(header => {
                const value = item[header.key];
                // Formata números quando necessário
                if (typeof value === 'number') {
                    if (header.key === 'mediaAcumulada') {
                        return `<td>${value.toFixed(2)}</td>`;
                    }
                    return `<td>${value}</td>`;
                }
                return `<td>${value ?? ''}</td>`;
            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');

        // Cria o conteúdo HTML completo
        const currentDate = new Date().toLocaleDateString('pt-BR');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>${styles}</style>
            </head>
            <body>
                ${title ? `<h1>${title}</h1>` : ''}
                ${subtitle ? `<h2>${subtitle}</h2>` : ''}
                <table>
                    <thead>
                        <tr>${headerRow}</tr>
                    </thead>
                    <tbody>
                        ${dataRows}
                    </tbody>
                </table>
                <div class="footer">
                    Relatório gerado em ${currentDate}
                </div>
            </body>
            </html>
        `;

        // Escreve o conteúdo HTML na janela de impressão
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();

        // Adiciona listener para fechar a janela após impressão
        printWindow.onafterprint = () => {
            printWindow.close();
        };

        // Aguarda carregamento do documento antes de imprimir
        setTimeout(() => {
            printWindow.print();
            // Se o usuário cancelar a impressão, a janela permanecerá aberta
        }, 500);
        
        toast.success("PDF gerado com sucesso", {
            description: "Selecione 'Salvar como PDF' na janela de impressão"
        });
        
    } catch (error) {
        toast.error("Erro ao exportar para PDF");
        console.error("Erro ao exportar para PDF:", error);
    }
};
