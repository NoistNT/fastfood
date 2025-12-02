import OrdersDashboard from '@/modules/dashboard/components/orders-dashboard';

interface Props {
  searchParams: Promise<{ date: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { date } = await searchParams;
  const formatedDate = new Date(date || new Date());

  return <OrdersDashboard date={formatedDate} />;
}
