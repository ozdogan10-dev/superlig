import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      stadium: true,
      referees: true,
      events: {
        include: { player: true }
      },
      lineups: {
        include: { player: true }
      }
    }
  });

  if (!match) {
    return <div className="p-8 text-slate-800 text-center font-bold">Maç bulunamadı.</div>;
  }

  // Sort events chronologically (handling strings like "45+2")
  const sortedEvents = [...match.events].sort((a, b) => {
    const minA = parseInt(a.minute) || 0;
    const minB = parseInt(b.minute) || 0;
    if (minA !== minB) return minA - minB;
    
    const extraA = a.minute.includes('+') ? parseInt(a.minute.split('+')[1]) || 0 : 0;
    const extraB = b.minute.includes('+') ? parseInt(b.minute.split('+')[1]) || 0 : 0;
    return extraA - extraB;
  });

  const homeLineup = match.lineups.filter(l => l.teamId === match.homeTeamId);
  const awayLineup = match.lineups.filter(l => l.teamId === match.awayTeamId);

  const homeStarting = homeLineup.filter(l => l.isStartingEleven);
  const homeBench = homeLineup.filter(l => !l.isStartingEleven);
  
  const awayStarting = awayLineup.filter(l => l.isStartingEleven);
  const awayBench = awayLineup.filter(l => !l.isStartingEleven);

  return (
    <main className="min-h-screen bg-ch1 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/fikstur" className="text-ch4 hover:text-slate-600 mb-6 inline-block font-bold transition-colors">
          &larr; Fikstüre Dön
        </Link>

        {/* Scoreboard */}
        <div className="bg-white border border-ch2 rounded-3xl p-8 mb-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ch3 via-ch4 to-ch3"></div>
          
          <div className="text-center mb-6">
            <span className="bg-ch1 text-slate-600 border border-ch2 text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">
              {match.week}. Hafta | {match.date ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(match.date)) : 'Tarih Belli Değil'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 relative z-10">
            {/* Home */}
            <div className="flex-1 flex flex-col items-center gap-4 text-center group">
              <Link href={`/takimlar/${match.homeTeamId}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-ch1 rounded-2xl flex items-center justify-center border border-ch2 shadow-sm p-4 group-hover:scale-105 transition-transform group-hover:border-ch4">
                {match.homeTeam.logoUrl ? (
                  <Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={100} height={100} className="object-contain" />
                ) : (
                  <span className="text-5xl">🛡️</span>
                )}
              </Link>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-ch4 transition-colors">{match.homeTeam.name}</h2>
              {match.homeManager && (
                <div className="text-sm text-slate-500 font-semibold">{match.homeManager}</div>
              )}
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-5xl sm:text-7xl font-black text-slate-800 tracking-tighter">
                {match.homeScore ?? '-'} <span className="text-ch3 font-light mx-2">:</span> {match.awayScore ?? '-'}
              </div>
              {match.stadium && (
                <div className="mt-4 text-slate-500 font-medium text-sm flex items-center gap-1">
                  <span>📍</span> {match.stadium.name}
                </div>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex flex-col items-center gap-4 text-center group">
              <Link href={`/takimlar/${match.awayTeamId}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-ch1 rounded-2xl flex items-center justify-center border border-ch2 shadow-sm p-4 group-hover:scale-105 transition-transform group-hover:border-ch4">
                {match.awayTeam.logoUrl ? (
                  <Image src={match.awayTeam.logoUrl} alt={match.awayTeam.name} width={100} height={100} className="object-contain" />
                ) : (
                  <span className="text-5xl">🛡️</span>
                )}
              </Link>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 group-hover:text-ch4 transition-colors">{match.awayTeam.name}</h2>
              {match.awayManager && (
                <div className="text-sm text-slate-500 font-semibold">{match.awayManager}</div>
              )}
            </div>
          </div>

          {/* Referees */}
          {match.referees.length > 0 && (
            <div className="mt-8 pt-6 border-t border-ch2/50">
              <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest text-center mb-3">Hakemler</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {match.referees.map(ref => (
                  <span key={ref.id} className="bg-ch1 text-slate-600 font-semibold text-xs px-3 py-1 rounded-full border border-ch2">
                    {ref.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Timeline (Maç Olayları) */}
        {sortedEvents.length > 0 && (
          <div className="bg-white border border-ch2 rounded-3xl p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Maç Olayları</h3>
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ch2 transform -translate-x-1/2"></div>
              
              <div className="space-y-6">
                {sortedEvents.map((event) => {
                  const isHome = event.player.teamId === match.homeTeamId;
                  return (
                    <div key={event.id} className={`relative flex items-center ${isHome ? 'justify-start' : 'justify-end'}`}>
                      <div className={`w-1/2 flex items-center gap-3 ${isHome ? 'justify-end pr-8' : 'justify-end pl-8 flex-row-reverse'}`}>
                        <span className="text-slate-700 font-bold">{event.player.name}</span>
                        <span className="text-2xl">
                          {event.type === 'GOAL' && '⚽'}
                          {event.type === 'YELLOW_CARD' && '🟨'}
                          {event.type === 'RED_CARD' && '🟥'}
                        </span>
                      </div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 bg-white border-2 border-ch4 rounded-full w-10 h-10 flex items-center justify-center z-10 text-slate-800 font-bold text-sm shadow-sm">
                        {event.minute}&apos;
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Lineups */}
        {(homeLineup.length > 0 || awayLineup.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Home Lineup */}
            <div className="bg-white rounded-3xl p-6 border border-ch2 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center border-b border-ch2/50 pb-2">İlk 11</h3>
              <ul className="space-y-2 mb-6">
                {homeStarting.map(l => (
                  <li key={l.id} className="text-slate-700 font-medium bg-ch1/50 px-4 py-2 rounded-lg border border-ch2/30">{l.player.name}</li>
                ))}
              </ul>
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center border-b border-ch2/50 pb-2">Yedekler</h3>
              <ul className="space-y-2">
                {homeBench.map(l => (
                  <li key={l.id} className="text-slate-500 text-sm font-medium bg-ch1/30 px-4 py-2 rounded-lg border border-ch2/30">{l.player.name}</li>
                ))}
              </ul>
            </div>

            {/* Away Lineup */}
            <div className="bg-white rounded-3xl p-6 border border-ch2 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center border-b border-ch2/50 pb-2">İlk 11</h3>
              <ul className="space-y-2 mb-6">
                {awayStarting.map(l => (
                  <li key={l.id} className="text-slate-700 font-medium bg-ch1/50 px-4 py-2 rounded-lg border border-ch2/30">{l.player.name}</li>
                ))}
              </ul>
              <h3 className="text-lg font-bold text-slate-800 mb-4 text-center border-b border-ch2/50 pb-2">Yedekler</h3>
              <ul className="space-y-2">
                {awayBench.map(l => (
                  <li key={l.id} className="text-slate-500 text-sm font-medium bg-ch1/30 px-4 py-2 rounded-lg border border-ch2/30">{l.player.name}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
