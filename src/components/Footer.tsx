import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full flex items-center justify-center gap-4 p-4 border-t z-10 bg-background">
      <span>© {new Date().getFullYear()} Robert Shirts</span>
      <Link
        href="https://github.com/robertjshirts/place"
        className="hover:underline"
      >
        GitHub
      </Link>
      <Link href="https://x.com/callanjerel" className="hover:underline">
        X
      </Link>
    </footer>
  );
}
