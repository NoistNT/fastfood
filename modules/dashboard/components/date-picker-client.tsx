'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useDashboard } from '@/store/use-dashboard';
import DatePicker from '@/modules/dashboard/components/date-picker';

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
    const formattedDate = newDate ?? new Date();
    setDate(formattedDate);

    if (date) router.push(`/dashboard?date=${formattedDate.toISOString()}`);
    else router.push('/dashboard');
  };

  return (
    <DatePicker
      date={date}
      setDate={handleDateChange}
    />
  );
}
