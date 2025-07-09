import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { MultiSelect } from '@/components/multi-select';
import { DatePicker } from '@/components/ui/date-picker';

interface AdimplenciaParametersControlProps {
  startDate: Date;
  setStartDate: (date: Date | null) => void;
  endDate: Date;
  setEndDate: (date: Date | null) => void;
  selectedParcelas: string[];
  setSelectedParcelas: (parcelas: string[]) => void;
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
  selectedParcelas,
  setSelectedParcelas,
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
            <div className="w-full">
              <MultiSelect
                options={availableParcelas.map(p => ({ label: p, value: p }))}
                defaultValue={selectedParcelas}
                onValueChange={setSelectedParcelas}
                placeholder="Selecione parcelas"
                disabled={isLoading}
              />
            </div>
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
