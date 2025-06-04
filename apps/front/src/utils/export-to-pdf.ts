import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
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
	showHtml?: boolean; // Se verdadeiro, exibe o HTML na página em vez de gerar PDF
	containerId?: string; // ID do container onde o HTML será exibido
}

/**
 * Exporta dados JSON para um arquivo PDF e o exibe diretamente na página ou o disponibiliza para download.
 * @param params - Objeto contendo os dados, cabeçalhos e configurações do PDF.
 * @returns Uma Promise que resolve com o URL do blob do PDF quando displayInPage é true
 */
export const exportToPdf = ({
	data,
	headers,
	filename = 'export',
	title,
	subtitle,
	showHtml = false,
	containerId = 'pdf-preview-container',
}: ExportToPdfParams): Promise<string | void | HTMLElement> => {
	return new Promise((resolve, reject) => {
		// Verifica se há dados para exportar
		if (!data || data.length === 0) {
			toast.error('Nenhum dado para exportar');
			reject('Nenhum dado para exportar');
			return;
		}

		// Verifica se os cabeçalhos foram fornecidos
		if (!headers || headers.length === 0) {
			toast.error('Cabeçalhos não fornecidos');
			reject('Cabeçalhos não fornecidos');
			return;
		}

		// Criando elemento para renderizar a tabela HTML
		const tempDiv = document.createElement('div');

		if (!showHtml) {
			// Se não estiver exibindo HTML, criar fora da tela
			tempDiv.style.position = 'absolute';
			tempDiv.style.left = '-9999px';
			tempDiv.style.top = '0px';
			// Apenas anexa ao body quando não estiver mostrando em um modal
			document.body.appendChild(tempDiv);
		} else {
			// Se estiver exibindo HTML, aplicar estilos adequados para o conteúdo do modal
			// Não anexa ao body aqui, será usado apenas para preparar o conteúdo
			tempDiv.id = 'html-preview';
			tempDiv.style.width = '100%';
			tempDiv.style.margin = 'auto';
			tempDiv.style.overflow = 'auto';
		}

		// Estilos CSS para a tabela
		const styles = `
                .pdf-container {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    max-width: 700px;
                    margin: 0 auto; /* Center the PDF content */
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
		const subtitleHtml = subtitle
			? `<div class="pdf-subtitle">${subtitle}</div>`
			: '';

		// Cria cabeçalhos da tabela
		const headerRow = headers
			.map((header) => `<th>${header.label}</th>`)
			.join('');

		// Cria linhas da tabela a partir dos dados
		const dataRows = data
			.map((item) => {
				const cells = headers
					.map((header) => {
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

		// Cria o rodapé com a data e logo daligo
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

		// Insere o HTML no div
		tempDiv.innerHTML = htmlContent;

		// Se apenas queremos mostrar o HTML, retornamos o elemento ou o anexamos ao container
		if (showHtml) {
			// Criar um modal usando shadcn UI classes e DOM API diretamente
			const dialogOverlay = document.createElement('div');
			dialogOverlay.className =
				'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';
			dialogOverlay.setAttribute('data-state', 'open');

			const dialogContent = document.createElement('div');
			dialogContent.className =
				'fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl max-h-[80vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-auto';
			dialogContent.setAttribute('data-state', 'open');

			// Close button
			const closeButton = document.createElement('button');
			closeButton.className =
				'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground';
			closeButton.innerHTML =
				'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
			closeButton.setAttribute('aria-label', 'Close');

			// Header
			const dialogHeader = document.createElement('div');
			dialogHeader.className =
				'flex flex-col space-y-1.5 text-center sm:text-left';

			// Title
			if (title) {
				const dialogTitle = document.createElement('h2');
				dialogTitle.className =
					'text-lg font-semibold leading-none tracking-tight';
				dialogTitle.textContent = title;
				dialogHeader.appendChild(dialogTitle);
			}

			// Subtitle
			if (subtitle) {
				const dialogDescription = document.createElement('p');
				dialogDescription.className = 'text-sm text-muted-foreground';
				dialogDescription.textContent = subtitle;
				dialogHeader.appendChild(dialogDescription);
			}

			// Content area for our HTML table
			const contentDiv = document.createElement('div');
			contentDiv.id = 'pdf-dialog-content';
			contentDiv.innerHTML = htmlContent;

			// Footer with download button
			const dialogFooter = document.createElement('div');
			dialogFooter.className =
				'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4';

			const downloadButton = document.createElement('button');
			downloadButton.className =
				'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2';
			downloadButton.textContent = 'Baixar PDF';

			dialogFooter.appendChild(downloadButton);

			// Assemble the dialog
			dialogContent.appendChild(closeButton);
			dialogContent.appendChild(dialogHeader);
			dialogContent.appendChild(contentDiv);
			dialogContent.appendChild(dialogFooter);

			// Create a root element for our dialog
			const dialogRoot = document.createElement('div');
			dialogRoot.id = 'pdf-dialog-root';
			dialogRoot.className = 'dialog-portal-root';
			dialogRoot.appendChild(dialogOverlay);
			dialogRoot.appendChild(dialogContent);

			// Append to body
			document.body.appendChild(dialogRoot);

			// Download button functionality
			downloadButton.addEventListener('click', () => {
				// Converte o HTML para PDF e faz download
				html2canvas(contentDiv, {
					scale: 2,
					logging: false,
					useCORS: true,
				}).then((canvas) => {
					const imgData = canvas.toDataURL('image/png');
					const pdf = new jsPDF({
						orientation: 'p',
						unit: 'mm',
						format: 'a4',
					});

					// Center the content in the PDF
					const pageWidth = pdf.internal.pageSize.getWidth();

					const imgProps = pdf.getImageProperties(imgData);
					const pdfWidth = pdf.internal.pageSize.getWidth() * 0.9; // 90% of page width to leave margins
					const pdfHeight =
						(imgProps.height * pdfWidth) / imgProps.width;
					const xOffset = (pageWidth - pdfWidth) / 2; // Center horizontally

					// Add the image centered on the page
					pdf.addImage(
						imgData,
						'PNG',
						xOffset,
						10,
						pdfWidth,
						pdfHeight
					);
					pdf.save(`${filename}.pdf`);

					toast.success('PDF gerado com sucesso', {
						description: 'O download do PDF foi iniciado',
					});
				});
			});

			// Close functionality
			const closeDialog = () => {
				// Add transition
				dialogOverlay.setAttribute('data-state', 'closed');
				dialogContent.setAttribute('data-state', 'closed');

				// Remove after animation
				setTimeout(() => {
					if (dialogRoot.parentNode) {
						document.body.removeChild(dialogRoot);
					}
					// Ensure any other references to tempDiv are cleaned up
					if (tempDiv.parentNode) {
						tempDiv.parentNode.removeChild(tempDiv);
					}
				}, 300);
			};

			closeButton.addEventListener('click', closeDialog);
			dialogOverlay.addEventListener('click', closeDialog);

			toast.success('Relatório gerado com sucesso', {
				description: 'O relatório está sendo exibido em uma janela',
			});

			resolve(dialogRoot);
			return;
		} else if (containerId) {
			const container = document.getElementById(containerId);
			if (container) {
				container.innerHTML = '';
				container.appendChild(tempDiv);

				toast.success('HTML gerado com sucesso', {
					description:
						'A visualização HTML está sendo exibida na página',
				});

				resolve(tempDiv);
				return;
			} else {
				// Se o container não existir, cria um
				const newContainer = document.createElement('div');
				newContainer.id = containerId;
				document.body.appendChild(newContainer);
				newContainer.appendChild(tempDiv);

				toast.success('HTML gerado com sucesso', {
					description:
						'A visualização HTML está sendo exibida na página',
				});

				resolve(tempDiv);
				return;
			}
		} else {
			// Já anexamos o tempDiv ao body no início da função quando !showHtml
			// Não precisamos anexar novamente aqui

			toast.success('HTML gerado com sucesso', {
				description: 'A visualização HTML está sendo exibida na página',
			});

			resolve(tempDiv);
			return;
		}
	});
};

/**
 * Cria um elemento de visualização de PDF embutido na página.
 * @param pdfUrl - URL do PDF a ser exibido
 * @param containerId - ID do elemento HTML onde o PDF será exibido
 * @returns O elemento criado
 */
export const createPdfViewer = (
	pdfUrl: string,
	containerId: string
): HTMLElement => {
	const container = document.getElementById(containerId);
	if (!container) {
		toast.error('Contêiner para exibição do PDF não encontrado');
		throw new Error('Contêiner para exibição do PDF não encontrado');
	}

	// Limpa o contêiner
	container.innerHTML = '';

	// Cria um iframe para exibir o PDF
	const iframe = document.createElement('iframe');
	iframe.src = pdfUrl;
	iframe.style.width = '100%';
	iframe.style.height = '100%';
	iframe.style.minHeight = '600px';
	iframe.style.border = '1px solid #ccc';
	iframe.style.position = 'relative';
	iframe.style.top = '-999999px';

	container.appendChild(iframe);

	return iframe;
};
