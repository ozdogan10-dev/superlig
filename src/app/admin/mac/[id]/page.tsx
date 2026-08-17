import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import MatchAdminClient from './MatchAdminClient';

const prisma = new PrismaClient();

export default async function AdminMatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  if (cookieStore.get('admin_token')?.value !== 'true') {
    redirect('/admin/login');
  }

  const { id } = await params;
  
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: {
        include: { players: { orderBy: { name: 'asc' } } }
      },
      awayTeam: {
        include: { players: { orderBy: { name: 'asc' } } }
      },
      events: {
        include: { player: true },
        orderBy: { minute: 'asc' }
      },
      lineups: {
        include: { player: true }
      }
    }
  });

  if (!match) {
    return <div className="p-8 text-white">Maç bulunamadı.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Maç Detaylarını Düzenle</h1>
          <Link href="/admin" className="text-blue-400 hover:underline">Geri Dön</Link>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl mb-8 flex justify-between items-center text-2xl font-bold">
          <div className="flex-1 text-right">{match.homeTeam.name}</div>
          <div className="px-8 text-4xl text-blue-400">
            {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
          </div>
          <div className="flex-1 text-left">{match.awayTeam.name}</div>
        </div>

        {/* Client component to handle interactive forms */}
        <MatchAdminClient match={match} />

      </div>
    </div>
  );
}
