'use client';
import { useRouter } from 'next/navigation';

import DatePicker from '@/modules/dashboard/components/date-picker';

export default function DatePickerClient({ date }: { date: Date }) {
  const router = useRouter();

  const handleDateChange = (date: Date | undefined) => {
    if (date) router.push(`/dashboard?date=${date.toISOString()}`);
    else router.push('/dashboard');
  };

  return (
    <DatePicker
      date={date}
      setDate={handleDateChange}
    />
  );
}
