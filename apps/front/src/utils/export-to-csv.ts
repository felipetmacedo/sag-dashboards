import { toast } from "sonner";
import Papa from "papaparse";

interface CsvHeader {
    label: string; // Nome da coluna no CSV (exibido no arquivo)
    key: string; // Chave correspondente no objeto JSON
}

interface ExportToCsvParams {
    data: any[]; // Dados no formato JSON - aceita qualquer tipo de relatório
    headers: CsvHeader[]; // Cabeçalhos do CSV
    filename?: string; // Nome do arquivo (opcional, com valor padrão)
}

/**
 * Exporta dados JSON para um arquivo CSV e dispara o download.
 * @param params - Objeto contendo os dados, cabeçalhos e nome do arquivo.
 */
export const exportToCsv = ({ data, headers, filename = "export" }: ExportToCsvParams): void => {
    try {
        // Verifica se há dados para exportar
        if (!data || data.length === 0) {
            return;
        }

        // Verifica se os cabeçalhos foram fornecidos
        if (!headers || headers.length === 0) {
            toast.error("Cabeçalhos não fornecidos")
            return;
        }

        // Converte os dados JSON para CSV usando o papaparse
        const csvContent = Papa.unparse({
            fields: headers.map((header) => header.label),
            data: data.map((item) =>
                headers.map((header) => item[header.key] ?? "") // Garante que valores undefined/null sejam strings vazias
            ),
        });

        // Cria um Blob com o conteúdo do CSV
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        // Cria uma URL temporária para o Blob
        const url = URL.createObjectURL(blob);

        // Cria um link temporário para download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
            "download",
            `${filename}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        toast.error("Erro ao exportar para CSV")
        console.error("Erro ao exportar para CSV:", error);
    }
};
