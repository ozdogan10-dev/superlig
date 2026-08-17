import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export const revalidate = 0; // Disable caching

export default async function StatisticsPage() {
  const topScorers = await prisma.player.findMany({
    where: {
      goals: { gt: 0 }
    },
    orderBy: {
      goals: 'desc'
    },
    include: {
      team: true
    },
    take: 20
  });

  return (
    <main className="min-h-screen bg-ch1 py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
              Lig İstatistikleri
            </h1>
            <p className="text-ch4 mt-2 font-medium">Gol Krallığı ve Öne Çıkan Veriler</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Top Scorers */}
          <div className="bg-white border border-ch2 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-ch2/50">
              <span className="text-3xl">⚽</span>
              <h2 className="text-2xl font-bold text-slate-800">Gol Krallığı</h2>
            </div>
            
            <div className="space-y-4">
              {topScorers.length > 0 ? topScorers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-4 bg-ch1/30 rounded-2xl border border-ch2/50 hover:border-ch3 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                      ${index === 0 ? 'bg-yellow-100 text-yellow-600 border border-yellow-300' : 
                        index === 1 ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-300' :
                        'bg-white text-slate-400 border border-ch2'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-700 group-hover:text-ch4 transition-colors">{player.name}</h3>
                      <Link href={`/takimlar/${player.team.id}`} className="text-sm text-slate-500 hover:text-ch4 transition-colors">
                        {player.team.name}
                      </Link>
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-800">
                    {player.goals}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-500">
                  <span className="text-4xl block mb-2">⏳</span>
                  <p>Henüz gol verisi bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Diğer istatistikler buraya eklenebilir (Asist krallığı vb.) */}
          <div className="space-y-8">
            <div className="bg-white border border-ch2 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center h-64 text-center">
              <span className="text-5xl mb-4">🏆</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Asist Krallığı</h3>
              <p className="text-slate-500">Veriler yakında eklenecektir.</p>
            </div>
            
            <div className="bg-white border border-ch2 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center h-64 text-center">
              <span className="text-5xl mb-4">🧤</span>
              <h3 className="text-xl font-bold text-slate-800 mb-2">En Çok Kurtarış Yapan Kaleciler</h3>
              <p className="text-slate-500">Veriler yakında eklenecektir.</p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
