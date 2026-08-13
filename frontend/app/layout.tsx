import localFont from 'next/font/local';
import { headers } from 'next/headers';
import Link from 'next/link';
import { BarChart3, GraduationCap, Headphones, LifeBuoy, UsersRound } from 'lucide-react';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = {
  variable: '--font-public-sans',
};

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/', label: 'Tutor', icon: Headphones },
  { href: '/learners', label: 'Learners', icon: UsersRound },
  { href: '/escalations', label: 'Teacher Help', icon: LifeBuoy },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="overflow-x-hidden bg-slate-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 z-50 flex w-full flex-row items-center justify-between border-b border-white/10 bg-slate-950/85 px-4 py-3 shadow-2xl backdrop-blur-xl md:px-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20 transition-transform group-hover:scale-105">
                <GraduationCap className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none tracking-tight text-slate-100">
                  Learning Companion
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Voice learning platform
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] p-1 text-xs font-semibold shadow-inner md:flex">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="size-3.5" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="md:hidden">
              <Link
                href="/analytics"
                className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-2 text-xs font-bold text-slate-100"
              >
                Platform
              </Link>
            </div>
          </header>

          {children}
          <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2">
            <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
