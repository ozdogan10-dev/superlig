import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';
import { calculateStandings } from '@/lib/calculateStandings';

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function StandingsPage() {
  const teams = await prisma.team.findMany();
  const allMatches = await prisma.match.findMany({
    include: {
      homeTeam: true,
      awayTeam: true
    }
  });

  const standings = calculateStandings(teams, allMatches);

  return (
    <main className="min-h-screen bg-ch1 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Süper Lig Puan Durumu</h1>
          <p className="text-ch4 mt-2 font-medium">2026-2027 Sezonu Canlı Tablosu</p>
        </div>

        <section className="bg-white border border-ch2 rounded-3xl p-4 sm:p-6 shadow-sm">
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-ch2/50">
                  <th className="pb-4 pl-2 font-semibold">Sıra</th>
                  <th className="pb-4 font-semibold">Takım</th>
                  <th className="pb-4 text-center font-semibold">O</th>
                  <th className="pb-4 text-center font-semibold">G</th>
                  <th className="pb-4 text-center font-semibold">B</th>
                  <th className="pb-4 text-center font-semibold">M</th>
                  <th className="pb-4 text-center font-semibold">A</th>
                  <th className="pb-4 text-center font-semibold">Y</th>
                  <th className="pb-4 text-center font-semibold">Av</th>
                  <th className="pb-4 text-center font-bold text-slate-800 text-sm">P</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {standings.map((team, index) => {
                  let rankColor = '';
                  if (index === 0) rankColor = 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400';
                  else if (index < 4) rankColor = 'bg-ch3/30 text-ch4';
                  else if (index > 14) rankColor = 'bg-red-100 text-red-600';

                  return (
                    <tr key={team.teamId} className="border-b border-ch2/30 hover:bg-ch1/50 transition-colors group">
                      <td className="py-4 pl-2 text-slate-500 font-medium">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${rankColor}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-700 group-hover:text-ch4 transition-colors whitespace-nowrap">
                        <Link href={`/takimlar/${team.teamId}`} className="flex items-center gap-3">
                          {team.logoUrl ? (
                            <Image src={team.logoUrl} alt={team.teamName} width={28} height={28} className="object-contain" />
                          ) : (
                            <span className="text-lg w-7 text-center">🛡️</span>
                          )}
                          <span>{team.teamName}</span>
                        </Link>
                      </td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.played}</td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.won}</td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.drawn}</td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.lost}</td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.goalsFor}</td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.goalsAgainst}</td>
                      <td className="py-4 text-center text-slate-500 font-medium">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                      <td className="py-4 text-center font-black text-slate-800 text-base">{team.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-yellow-100 ring-1 ring-yellow-400 rounded-sm"></span> Şampiyonlar Ligi</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-ch3/30 rounded-sm"></span> Avrupa Kupaları</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-100 rounded-sm"></span> Düşme Hattı</div>
          </div>
        </section>
      </div>
    </main>
  );
}
