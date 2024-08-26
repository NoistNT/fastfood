import Link from 'next/link'

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-neutral-800 p-4 text-white">
      <Link href="/products">
        <h1 className="text-2xl font-bold hover:text-neutral-300">Fastfood</h1>
      </Link>
    </header>
  )
}
