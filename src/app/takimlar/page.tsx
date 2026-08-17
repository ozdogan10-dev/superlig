import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: {
      name: 'asc'
    },
    include: {
      stadium: true
    }
  });

  return (
    <main className="min-h-screen bg-ch1 py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Süper Lig Takımları
          </h1>
          <p className="text-ch4 mt-2 font-medium">2026-2027 Sezonu Mücadele Eden Ekipler</p>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link key={team.id} href={`/takimlar/${team.id}`} className="group">
              <div className="bg-white border border-ch2 rounded-2xl p-6 shadow-sm hover:border-ch4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full flex flex-col">
                
                {/* Decorative glow inside card */}
                <div className="absolute top-0 left-0 w-full h-1 bg-ch4 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-16 h-16 bg-ch1 rounded-2xl flex items-center justify-center border border-ch2 group-hover:scale-110 transition-transform shadow-sm">
                    {team.logoUrl ? (
                      <Image src={team.logoUrl} alt={team.name} width={48} height={48} className="object-contain" />
                    ) : (
                      <span className="text-3xl">🛡️</span>
                    )}
                  </div>

                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-ch4 transition-colors">
                    {team.name}
                  </h2>
                  <div className="text-sm text-slate-500 font-medium mb-4">
                    {team.stadium?.name || 'Stadyum Bilgisi Yok'}
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-ch2/50 flex justify-between items-center">
                    <span className="text-sm text-slate-500 font-medium">Teknik Direktör</span>
                    <span className="text-sm font-bold text-slate-700">{team.manager || 'Bilinmiyor'}</span>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
