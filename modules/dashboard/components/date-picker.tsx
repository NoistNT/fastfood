'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/modules/core/ui/button';
import { Calendar } from '@/modules/core/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/core/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const t = useTranslations('Features.dashboard.date_picker');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-center text-left tracking-tight',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(new Date(date), 'E, d MMM - yyyy') : <span>{t('pick_a_date')}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
