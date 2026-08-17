import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export const revalidate = 0; // Disable caching

export default async function TeamDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const team = await prisma.team.findUnique({
    where: { id: params.id },
    include: {
      stadium: true,
      players: {
        orderBy: { name: 'asc' }
      },
      homeMatches: {
        include: { awayTeam: true },
        orderBy: { week: 'asc' }
      },
      awayMatches: {
        include: { homeTeam: true },
        orderBy: { week: 'asc' }
      }
    }
  });

  if (!team) {
    notFound();
  }

  // Combine matches to show fixture
  const allMatches = [...team.homeMatches, ...team.awayMatches].sort((a, b) => (a.week || 0) - (b.week || 0));

  return (
    <main className="min-h-screen bg-slate-900 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="mb-12">
          <Link href="/takimlar" className="text-blue-400 hover:text-blue-300 transition-colors mb-6 inline-block font-medium">
            &larr; Takımlara Dön
          </Link>
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="w-32 h-32 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-xl flex-shrink-0">
              {team.logoUrl ? (
                <Image src={team.logoUrl} alt={team.name} width={80} height={80} className="object-contain" />
              ) : (
                <span className="text-5xl">🛡️</span>
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-extrabold text-white mb-2">{team.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 font-medium">
                <span className="flex items-center gap-2"><span className="text-lg">🏟️</span> {team.stadium?.name ?? 'Stadyum Belirtilmemiş'}</span>
                <span className="flex items-center gap-2"><span className="text-lg">👔</span> {team.manager ?? 'Teknik Direktör Belirtilmemiş'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Oyuncu Kadrosu */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🏃</span> Takım Kadrosu ({team.players.length})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.players.length > 0 ? team.players.map(player => (
                  <div key={player.id} className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                    <span className="font-semibold text-white">{player.name}</span>
                    {player.goals > 0 && (
                      <span className="text-sm px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-md font-bold">
                        {player.goals} Gol
                      </span>
                    )}
                  </div>
                )) : (
                  <p className="text-slate-400 col-span-2 py-4">Kadro bilgisi bulunamadı.</p>
                )}
              </div>
            </div>
          </div>

          {/* Fikstür */}
          <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📅</span> Takım Fikstürü
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {allMatches.map(m => {
                  const isHome = m.homeTeamId === team.id;
                  const opponent = 'awayTeam' in m ? m.awayTeam.name : m.homeTeam.name;
                  const scoreDisplay = m.homeScore !== null ? (isHome ? `${m.homeScore} - ${m.awayScore}` : `${m.awayScore} - ${m.homeScore}`) : 'v';
                  
                  return (
                    <div key={m.id} className="flex flex-col bg-black/20 rounded-xl p-3 border border-white/5 text-sm">
                      <span className="text-xs text-slate-500 mb-1">{m.week}. Hafta</span>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium truncate flex-1 ${isHome ? 'text-white' : 'text-slate-400'}`}>
                          {isHome ? team.name : opponent}
                        </span>
                        <span className="font-bold text-white bg-white/10 px-2 py-1 rounded mx-2">
                          {scoreDisplay}
                        </span>
                        <span className={`font-medium truncate flex-1 text-right ${!isHome ? 'text-white' : 'text-slate-400'}`}>
                          {!isHome ? team.name : opponent}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
