import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="flex items-center justify-center gap-4 p-4 border-t">
      <span>© {new Date().getFullYear()} Robert Shirts</span>
      <Link href="https://github.com/robertjshirts/place" className="hover:underline">
        GitHub
      </Link>
      <Link href="https://x.com/callanjerel" className="hover:underline">
        Twitter
      </Link>
    </footer>
  );
}
