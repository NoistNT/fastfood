import Link from 'next/link'

import { Button } from '@/modules/core/ui/button'

export default function Page() {
  return (
    <div className="flex h-[90vh] items-center justify-center">
      <Link href="/products">
        <Button variant="default">Get Started</Button>
      </Link>
    </div>
  )
}
