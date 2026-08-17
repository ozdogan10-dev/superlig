import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import NewsWidget from '@/components/NewsWidget';

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function Home() {
  const allMatches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true
    }
  });

  const now = new Date();
  
  const futureMatches = allMatches
    .filter(m => m.homeScore === null && m.date && m.date > now)
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());

  const nextWeek = futureMatches.length > 0 ? futureMatches[0].week : 1;
  const matchesToDisplay = allMatches.filter(m => m.week === nextWeek);

  return (
    <main className="min-h-screen bg-ch1 pb-20 pt-12">
      <div className="container mx-auto px-4">
        
        {/* Next Matches Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-ch4 rounded-full inline-block"></span>
              {nextWeek}. Hafta Fikstürü
            </h2>
            <Link href="/fikstur" className="text-sm font-semibold text-ch4 hover:text-slate-700 transition-colors uppercase tracking-wider bg-ch2 px-4 py-2 rounded-lg shadow-sm">
              Tüm Fikstür &rarr;
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchesToDisplay.map(m => (
              <Link href={`/mac/${m.id}`} key={m.id} className="bg-white border border-ch2 hover:border-ch3 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                <div className="text-xs text-ch4 font-semibold mb-4 uppercase tracking-wider flex justify-between border-b border-ch2/50 pb-2">
                  <span>{m.date ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(m.date)) : 'TBA'}</span>
                  <span>{m.date ? new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' }).format(new Date(m.date)) : ''}</span>
                </div>
                <div className="space-y-4 flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 text-lg truncate w-[70%] group-hover:text-ch4 transition-colors" title={m.homeTeam.name}>{m.homeTeam.name}</span>
                    {m.homeTeam.logoUrl ? <Image src={m.homeTeam.logoUrl} alt="" width={32} height={32} className="object-contain" /> : <span className="text-xl">🛡️</span>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 text-lg truncate w-[70%] group-hover:text-ch4 transition-colors" title={m.awayTeam.name}>{m.awayTeam.name}</span>
                    {m.awayTeam.logoUrl ? <Image src={m.awayTeam.logoUrl} alt="" width={32} height={32} className="object-contain" /> : <span className="text-xl">🛡️</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-ch3 rounded-full inline-block"></span>
              Sıcak Gelişmeler
            </h2>
          </div>
          
          {/* Client component wrapper for News */}
          <NewsWidget />
        </section>

      </div>
    </main>
  );
}
