'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDayKey, toBusinessDateKey } from '@/lib/dates';
import { Button } from '@/modules/core/ui/button';
import { Calendar } from '@/modules/core/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/core/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const t = useTranslations('Features.dashboard.date_picker');
  const locale = useLocale();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('justify-center text-left', !date && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            formatDayKey(toBusinessDateKey(date), {
              locale,
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })
          ) : (
            <span>{t('pick_a_date')}</span>
          )}
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
