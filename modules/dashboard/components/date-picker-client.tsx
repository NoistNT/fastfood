'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useDashboard } from '@/store/use-dashboard';
import DatePicker from '@/modules/dashboard/components/date-picker';
import { businessDayFromKey, toDateKey } from '@/lib/dates';

interface Props {
  initialDate: string;
}

export default function DatePickerClient({ initialDate }: Props) {
  const router = useRouter();
  const { date, setDate } = useDashboard();

  useEffect(() => {
    setDate(new Date(initialDate));
  }, [initialDate, setDate]);

  const handleDateChange = (newDate: Date | undefined) => {
    // Normalize to the clicked calendar day as a business-midnight instant:
    // the store then always denotes a business day, so the button (business
    // key) and the query (day key) agree in every browser timezone. The
    // query carries the day key, never an instant — a browser-local midnight
    // ISO string would land on the neighboring business day east of UTC.
    const key = toDateKey(newDate ?? new Date());
    const normalized = businessDayFromKey(key)?.start ?? newDate ?? new Date();
    setDate(normalized);

    if (date) router.push(`/dashboard?date=${key}`);
    else router.push('/dashboard');
  };

  return (
    <DatePicker
      date={date}
      setDate={handleDateChange}
    />
  );
}
