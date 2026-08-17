'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/puan-durumu', label: 'Puan Durumu' },
    { href: '/fikstur', label: 'Fikstür' },
    { href: '/takimlar', label: 'Takımlar' },
    { href: '/istatistikler', label: 'İstatistikler' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-ch2 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 sm:h-28 py-2">
          {/* Logo */}
          <Link href="/" className="flex items-center group h-full">
            <div className="relative w-48 h-full sm:w-64 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Trendyol Süper Lig" fill className="object-contain object-left" priority />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 ${
                    isActive 
                      ? 'bg-ch4 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-ch4 hover:bg-ch1'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex flex-1 ml-4 overflow-x-auto pb-1 hide-scrollbar items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 whitespace-nowrap text-xs rounded-lg font-bold transition-all ${
                    isActive 
                      ? 'bg-ch4 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-ch4 hover:bg-ch1'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
