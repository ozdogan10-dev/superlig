'use client';

import { useState } from 'react';
import { updateMatchScore } from './actions';
import { useRouter } from 'next/navigation';

export default function MatchRow({ match }: { match: any }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? '');
  const [awayScore, setAwayScore] = useState(match.awayScore ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    const h = homeScore === '' ? null : parseInt(homeScore);
    const a = awayScore === '' ? null : parseInt(awayScore);
    
    await updateMatchScore(match.id, h, a);
    
    setIsSaving(false);
    router.refresh();
  };

  return (
    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
      <td className="py-3 px-4 text-slate-400">{match.week}. Hafta</td>
      <td className="py-3 px-4 text-slate-400">
        {match.date ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(match.date)) : '-'}
      </td>
      <td className="py-3 px-4 text-right font-medium text-white">{match.homeTeam.name}</td>
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <input 
            type="number" 
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-500">-</span>
          <input 
            type="number" 
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-12 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </td>
      <td className="py-3 px-4 font-medium text-white">{match.awayTeam.name}</td>
      <td className="py-3 px-4 text-right flex flex-col gap-2 items-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-medium disabled:opacity-50"
        >
          {isSaving ? 'Kaydediliyor...' : 'Skor Güncelle'}
        </button>
        <button 
          onClick={() => router.push(`/admin/mac/${match.id}`)}
          className="text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-medium"
        >
          Olayları Düzenle
        </button>
      </td>
    </tr>
  );
}
