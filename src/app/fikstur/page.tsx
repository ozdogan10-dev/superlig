import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import FixtureClient from './FixtureClient';

const prisma = new PrismaClient();

export default async function FiksturPage() {
  const matches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true,
    },
    orderBy: [
      { week: 'asc' },
      { date: 'asc' }
    ]
  });

  // Group matches by week
  const weeks: Record<number, any[]> = {};
  matches.forEach(m => {
    if (m.week) {
      if (!weeks[m.week]) weeks[m.week] = [];
      weeks[m.week].push(m);
    }
  });

  return (
    <main className="min-h-screen bg-ch1 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Fikstür</h1>
          <Link href="/" className="text-ch4 hover:text-slate-700 font-medium transition-colors">
            Ana Sayfaya Dön &rarr;
          </Link>
        </div>

        <FixtureClient weeks={weeks} />

      </div>
    </main>
  );
}
