"use client";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  value: Date | string | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder }) => {
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={[
            "w-full justify-start text-left font-normal",
            !dateValue && "text-muted-foreground"
          ].filter(Boolean).join(" ")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? format(dateValue, "PPP") : <span>{placeholder || "Selecione a data"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={(selected: Date | undefined) => onChange(selected ?? null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
