import Link from 'next/link'

export default async function Footer() {
  return (
    <footer className="mt-4 flex w-full flex-col items-center gap-y-0.5 border-t-2 py-4 text-muted-foreground lg:py-4 lg:pr-10">
      <span className="text-sm">Made with ❤️ by</span>
      <Link
        className="text-sky-400 hover:underline dark:text-cyan-500/90"
        href="https://github.com/NoistNT"
        target="_blank"
      >
        Ariel Piazzano
      </Link>
    </footer>
  )
}
