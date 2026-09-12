import OrdersDashboard from '@/modules/dashboard/components/orders-dashboard';
import { findAllWithPages } from '@/modules/orders/actions/actions';
import { businessDayFromKey } from '@/lib/dates';

interface Props {
  searchParams: Promise<{ date?: string; page?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { date, page } = await searchParams;
  // Day keys (?date=YYYY-MM-DD) resolve to business-midnight instants;
  // legacy ISO instants fall through to the previous behavior.
  const dayWindow = date ? businessDayFromKey(date) : null;
  const formatedDate = dayWindow ? dayWindow.start : new Date(date ?? new Date());
  const currentPage = page ? parseInt(page) : 1;
  const offset = (currentPage - 1) * 10;
  const limit = 10;

  const { orders, total } = await findAllWithPages(formatedDate, limit, offset);
  const totalPages = Math.ceil(total / 10);

  return (
    <OrdersDashboard
      date={formatedDate}
      orders={orders}
      totalPages={totalPages}
    />
  );
}
