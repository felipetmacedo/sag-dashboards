import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface AdimplenciaParametersControlProps {
  startDate: Date;
  setStartDate: (date: Date | null) => void;
  endDate: Date;
  setEndDate: (date: Date | null) => void;
  selectedParcela: string | null;
  setSelectedParcela: (parcela: string | null) => void;
  availableParcelas: string[];
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const AdimplenciaParametersControl = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedParcela,
  setSelectedParcela,
  searchFilter,
  setSearchFilter,
  availableParcelas,
  isLoading = false,
}: AdimplenciaParametersControlProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Filtros</span>
          {isLoading && <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 w-full">
          <div>
            <Label className="mb-1 block">Buscar</Label>
            <Input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Nome, codhda, CPF..."
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label className="mb-1 block">Filtro por Parcela</Label>
            <Select
              value={selectedParcela ?? 'all'}
              onValueChange={val => setSelectedParcela(val === 'all' ? null : val)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as Parcelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Parcelas</SelectItem>
                {availableParcelas.map((p: string) => (
                  <SelectItem key={p} value={p}>
                    {p}ª Parcela
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="w-full">
              <Label className="mb-1 block">Data Inicial</Label>
              <DatePicker
                value={startDate}
                onChange={date => { if (date) setStartDate(date); }}
                placeholder="Data inicial"
              />
            </div>
            <div className="w-full">
              <Label className="mb-1 block">Data Final</Label>
              <DatePicker
                value={endDate}
                onChange={date => { if (date) setEndDate(date); }}
                placeholder="Data final"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
