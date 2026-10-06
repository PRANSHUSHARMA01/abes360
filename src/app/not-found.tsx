import Link from 'next/link';
import { CalendarDays, FileText, Home, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f7] px-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-sm">
        <HelpCircle className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-base text-zinc-500">
        The page you are looking for doesn’t exist or has been moved. Let&apos;s get you back on track with your classes.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="apple-primary-button">
          <Home className="h-4 w-4" /> Go to Dashboard
        </Link>
        <Link href="/timetable" className="apple-secondary-button">
          <CalendarDays className="h-4 w-4" /> Timetable
        </Link>
        <Link href="/notes" className="apple-secondary-button">
          <FileText className="h-4 w-4" /> Notes Library
        </Link>
      </div>
    </div>
  );
}
