import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import MatchRow from './MatchRow';
import LogoutButton from './LogoutButton';

const prisma = new PrismaClient();

export const revalidate = 0; // Disable caching

export default async function AdminDashboard() {
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

  const teamCount = await prisma.team.count();
  const playerCount = await prisma.player.count();
  const matchCount = matches.length;
  const playedMatches = matches.filter(m => m.homeScore !== null).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {/* Admin Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <h1 className="text-xl font-bold text-white">Yönetim Paneli</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">Siteye Dön</Link>
          <LogoutButton />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Toplam Takım</h3>
            <p className="text-3xl font-bold text-white">{teamCount}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Kayıtlı Oyuncu</h3>
            <p className="text-3xl font-bold text-white">{playerCount}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Toplam Maç</h3>
            <p className="text-3xl font-bold text-white">{matchCount}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-medium mb-2">Oynanan Maç</h3>
            <p className="text-3xl font-bold text-blue-400">{playedMatches}</p>
          </div>
        </div>

        {/* Fixture Editor */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-xl font-bold text-white">Fikstür ve Skor Düzenleme</h2>
          </div>
          
          <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-800 z-10">
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
                  <th className="pb-3 px-4">Hafta</th>
                  <th className="pb-3 px-4">Tarih</th>
                  <th className="pb-3 px-4 text-right">Ev Sahibi</th>
                  <th className="pb-3 px-4 text-center">Skor</th>
                  <th className="pb-3 px-4">Deplasman</th>
                  <th className="pb-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {matches.map(m => (
                  <MatchRow key={m.id} match={m} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
