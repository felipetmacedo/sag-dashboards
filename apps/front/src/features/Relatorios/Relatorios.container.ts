import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPropostas } from '@/processes/propostas';
import type { Proposta } from '@/types/proposta';
import { startOfMonth, endOfMonth, format, startOfYear, endOfYear, parse, isAfter, isBefore, isEqual, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Report types
export type ReportType = 'daily' | 'dailyByVendor' | 'monthly' | 'monthlyByVendor';

// Report header type
export interface ReportHeader {
  label: string;
  key: string;
}

// Daily sales report interface
export interface DailySales {
  data: string;
  quantidade: number;
  acumulado: number;
  mediaAcumulada: number;
}

// Daily sales by vendor report interface
export interface DailySalesByVendor {
  vendedor: string;
  [date: string]: string | number; // Dynamic date columns and total
}

// Monthly sales report interface
export interface MonthlySales {
  mes: string;
  quantidade: number;
  acumulado: number;
}

// Monthly sales by vendor report interface
export interface MonthlySalesByVendor {
  vendedor: string;
  [month: string]: string | number; // Dynamic month columns and total
}

export default function RelatoriosContainer() {
  // Default to current month
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = currentDate.getFullYear();
  
  // Fetch data for the full year to support all report types
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  
  const { data: propostasRaw, isLoading } = useQuery({
    queryKey: [
      'relatorios-propostas',
      yearStart.toISOString().slice(0, 10),
      yearEnd.toISOString().slice(0, 10),
    ],
    queryFn: () =>
      fetchPropostas({
        DT_INICIO: yearStart.toISOString().slice(0, 10),
        DT_FINAL: yearEnd.toISOString().slice(0, 10),
      }),
    refetchOnWindowFocus: false,
  });

  // Format the current month name for display
  const currentMonthName = useMemo(() => {
    return format(currentDate, 'MMMM yyyy', { locale: ptBR });
  }, [currentDate]);
  
  // Format the current year for display
  const currentYearDisplay = useMemo(() => {
    return format(currentDate, 'yyyy');
  }, [currentDate]);

  // Generate daily sales report for current month
  const dailySalesReport = useMemo(() => {
    if (!propostasRaw) return [];
    
    // Get all days in the current month
    const days = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
    
    // Initialize the report with zero sales for all days
    const dailyReport: Record<string, DailySales> = {};
    days.forEach(day => {
      const dateStr = format(day, 'dd/MM/yyyy');
      dailyReport[dateStr] = {
        data: dateStr,
        quantidade: 0,
        acumulado: 0,
        mediaAcumulada: 0
      };
    });
    
    // Count sales per day
    let accumulatedSales = 0;
    let dayCount = 0;
    
    propostasRaw.forEach((proposta: Proposta) => {
      // Parse date from DT_BORDERO field
      if (!proposta.DT_BORDERO) return;
      
      try {
        const propostaDate = parse(proposta.DT_BORDERO, 'yyyy-MM-dd', new Date());
        
        // Check if the date is within the current month
        if (
          (isAfter(propostaDate, startOfMonth(currentDate)) || isEqual(propostaDate, startOfMonth(currentDate))) &&
          (isBefore(propostaDate, endOfMonth(currentDate)) || isEqual(propostaDate, endOfMonth(currentDate)))
        ) {
          const dateStr = format(propostaDate, 'dd/MM/yyyy');
          if (dailyReport[dateStr]) {
            dailyReport[dateStr].quantidade += 1;
          }
        }
      } catch (err) {
        console.error('Error parsing date:', proposta.DT_BORDERO);
      }
    });
    
    // Calculate accumulation and averages
    const result = Object.values(dailyReport);
    result.sort((a, b) => {
      const dateA = parse(a.data, 'dd/MM/yyyy', new Date());
      const dateB = parse(b.data, 'dd/MM/yyyy', new Date());
      return dateA.getTime() - dateB.getTime();
    });
    
    // Calculate accumulation and moving average
    result.forEach(day => {
      if (day.quantidade > 0) {
        accumulatedSales += day.quantidade;
        dayCount += 1;
        day.acumulado = accumulatedSales;
        day.mediaAcumulada = parseFloat((accumulatedSales / dayCount).toFixed(2));
      } else {
        day.acumulado = accumulatedSales;
        day.mediaAcumulada = dayCount > 0 ? parseFloat((accumulatedSales / dayCount).toFixed(2)) : 0;
      }
    });
    
    return result;
  }, [propostasRaw, currentDate]);

  // Generate daily sales by vendor report
  const dailySalesByVendorReport = useMemo(() => {
    if (!propostasRaw) return [];
    
    // Create a map to aggregate sales by vendor and date
    const salesMap: Record<string, Record<string, number>> = {};
    const allDates = new Set<string>();
    
    propostasRaw.forEach((proposta: Proposta) => {
      // Parse date from DT_BORDERO field
      if (!proposta.DT_BORDERO || !proposta.NOME_VENDEDOR) return;
      
      try {
        const propostaDate = parse(proposta.DT_BORDERO, 'yyyy-MM-dd', new Date());
        
        // Check if the date is within the current month
        if (
          (isAfter(propostaDate, startOfMonth(currentDate)) || isEqual(propostaDate, startOfMonth(currentDate))) &&
          (isBefore(propostaDate, endOfMonth(currentDate)) || isEqual(propostaDate, endOfMonth(currentDate)))
        ) {
          const dateStr = format(propostaDate, 'dd'); // Just day number
          const vendorName = proposta.NOME_VENDEDOR || 'Não informado';
          
          allDates.add(dateStr);
          
          // Initialize vendor entry if not exists
          if (!salesMap[vendorName]) {
            salesMap[vendorName] = {};
          }
          
          // Increment date count for vendor
          salesMap[vendorName][dateStr] = (salesMap[vendorName][dateStr] || 0) + 1;
        }
      } catch (err) {
        console.error('Error parsing date:', proposta.DT_BORDERO);
      }
    });
    
    // Get all dates in order
    const sortedDates = Array.from(allDates).sort((a, b) => {
      return parseInt(a) - parseInt(b);
    });
    
    // Convert the aggregated data to the required format
    const vendorDailySales: DailySalesByVendor[] = [];
    
    // Create a record for each vendor
    Object.keys(salesMap).forEach(vendorName => {
      const vendorRow: DailySalesByVendor = { vendedor: vendorName };
      
      // Add all dates as columns
      let total = 0;
      sortedDates.forEach(dateStr => {
        const qty = salesMap[vendorName][dateStr] || 0;
        vendorRow[dateStr] = qty;
        total += qty;
      });
      
      // Add total column
      vendorRow['Total'] = total;
      
      vendorDailySales.push(vendorRow);
    });
    
    // Sort by vendor name
    vendorDailySales.sort((a, b) => a.vendedor.localeCompare(b.vendedor));
    
    return vendorDailySales;
  }, [propostasRaw, currentDate]);

  // Generate monthly sales report for current year
  const monthlySalesReport = useMemo(() => {
    if (!propostasRaw) return [];
    
    // Initialize monthly data
    const monthlyData: Record<string, MonthlySales> = {};
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(currentYear, month, 1);
      const monthKey = format(monthDate, 'MM-yyyy');
      monthlyData[monthKey] = {
        mes: format(monthDate, 'MMMM', { locale: ptBR }),
        quantidade: 0,
        acumulado: 0
      };
    }
    
    // Count sales per month
    propostasRaw.forEach((proposta: Proposta) => {
      if (!proposta.DT_BORDERO) return;
      
      try {
        const propostaDate = parse(proposta.DT_BORDERO, 'yyyy-MM-dd', new Date());
        
        // Check if the date is within the current year
        if (propostaDate.getFullYear() === currentYear) {
          const monthKey = format(propostaDate, 'MM-yyyy');
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].quantidade += 1;
          }
        }
      } catch (err) {
        console.error('Error parsing date:', proposta.DT_BORDERO);
      }
    });
    
    // Calculate accumulation
    const result = Object.values(monthlyData);
    let accumulated = 0;
    
    result.forEach(month => {
      accumulated += month.quantidade;
      month.acumulado = accumulated;
    });
    
    return result;
  }, [propostasRaw, currentYear]);

  // Generate monthly sales by vendor report for current year
  const monthlySalesByVendorReport = useMemo(() => {
    if (!propostasRaw) return [];
    
    // Create a map to aggregate sales by vendor and month
    const salesMap: Record<string, Record<string, number>> = {};
    const monthsMap: Record<number, string> = {};
    
    propostasRaw.forEach((proposta: Proposta) => {
      if (!proposta.DT_BORDERO || !proposta.NOME_VENDEDOR) return;
      
      try {
        const propostaDate = parse(proposta.DT_BORDERO, 'yyyy-MM-dd', new Date());
        
        // Check if the date is within the current year
        if (propostaDate.getFullYear() === currentYear) {
          const monthNum = propostaDate.getMonth();
          // Use numerical month representation (1-12) for column headers
          const monthNumber = (monthNum + 1).toString();
          const vendorName = proposta.NOME_VENDEDOR || 'Não informado';
          
          // Store month name for reference
          monthsMap[monthNum] = monthNumber;
          
          // Initialize vendor entry if not exists
          if (!salesMap[vendorName]) {
            salesMap[vendorName] = {};
          }
          
          // Increment month count for vendor
          salesMap[vendorName][monthNumber] = (salesMap[vendorName][monthNumber] || 0) + 1;
        }
      } catch (err) {
        console.error('Error parsing date:', proposta.DT_BORDERO);
      }
    });
    
    // Get all months in order
    const sortedMonths = Object.keys(monthsMap)
      .map(m => parseInt(m))
      .sort((a, b) => a - b)
      .map(m => monthsMap[m]);
    
    // Convert the aggregated data to the required format
    const vendorMonthlySales: MonthlySalesByVendor[] = [];
    
    // Create a record for each vendor
    Object.keys(salesMap).forEach(vendorName => {
      const vendorRow: MonthlySalesByVendor = { vendedor: vendorName };
      
      // Add all months as columns
      let total = 0;
      sortedMonths.forEach(monthNum => {
        const qty = salesMap[vendorName][monthNum] || 0;
        vendorRow[monthNum] = qty;
        total += qty;
      });
      
      // Add total column
      vendorRow['Total'] = total;
      
      vendorMonthlySales.push(vendorRow);
    });
    
    // Sort by vendor name
    vendorMonthlySales.sort((a, b) => a.vendedor.localeCompare(b.vendedor));
    
    return vendorMonthlySales;
  }, [propostasRaw, currentYear]);

  // Generate headers for daily sales report
  const dailySalesHeaders: ReportHeader[] = [
    { label: 'Data', key: 'data' },
    { label: 'Quantidade', key: 'quantidade' },
    { label: 'Acumulado', key: 'acumulado' },
    { label: 'Média Acumulada', key: 'mediaAcumulada' }
  ];

  // Generate headers for daily sales by vendor report dynamically
  const dailySalesByVendorHeaders = useMemo(() => {
    if (!dailySalesByVendorReport || dailySalesByVendorReport.length === 0) {
      return [{ label: 'Vendedor', key: 'vendedor' }];
    }

    // Get all column keys from the first row
    const sampleRow = dailySalesByVendorReport[0];
    const headers: ReportHeader[] = [];

    // Add vendedor header first
    headers.push({ label: 'Vendedor', key: 'vendedor' });

    // Add date headers (skip 'vendedor' key)
    Object.keys(sampleRow)
      .filter(key => key !== 'vendedor')
      .sort((a, b) => {
        // Keep 'Total' at the end
        if (a === 'Total') return 1;
        if (b === 'Total') return -1;
        return parseInt(a) - parseInt(b);
      })
      .forEach(key => {
        const label = key === 'Total' ? 'Total' : key;
        headers.push({ label, key });
      });

    return headers;
  }, [dailySalesByVendorReport]);

  // Generate headers for monthly sales report
  const monthlySalesHeaders: ReportHeader[] = [
    { label: 'Mês', key: 'mes' },
    { label: 'Quantidade', key: 'quantidade' },
    { label: 'Acumulado', key: 'acumulado' }
  ];

  // Generate headers for monthly sales by vendor report dynamically
  const monthlySalesByVendorHeaders = useMemo(() => {
    if (!monthlySalesByVendorReport || monthlySalesByVendorReport.length === 0) {
      return [{ label: 'Vendedor', key: 'vendedor' }];
    }

    // Get all column keys from the first row
    const sampleRow = monthlySalesByVendorReport[0];
    const headers: ReportHeader[] = [];

    // Add vendedor header first
    headers.push({ label: 'Vendedor', key: 'vendedor' });

    // Add month headers (skip 'vendedor' key)
    Object.keys(sampleRow)
      .filter(key => key !== 'vendedor')
      .sort((a, b) => {
        // Keep 'Total' at the end
        if (a === 'Total') return 1;
        if (b === 'Total') return -1;
        return parseInt(a) - parseInt(b);
      })
      .forEach(key => {
        const label = key === 'Total' ? 'Total' : key;
        headers.push({ label, key });
      });

    return headers;
  }, [monthlySalesByVendorReport]);

  return {
    isLoading,
    currentMonthName,
    currentYearDisplay,
    dailySalesReport,
    dailySalesHeaders,
    dailySalesByVendorReport,
    dailySalesByVendorHeaders,
    monthlySalesReport,
    monthlySalesHeaders,
    monthlySalesByVendorReport,
    monthlySalesByVendorHeaders
  };
}
