'use client';

import { useState } from 'react';
import { addMatchEvent, removeMatchEvent } from './actions';
import { useRouter } from 'next/navigation';

export default function MatchAdminClient({ match }: { match: any }) {
  const router = useRouter();
  const [eventType, setEventType] = useState('GOAL');
  const [minute, setMinute] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId || !minute) return;
    setIsSubmitting(true);
    await addMatchEvent(match.id, playerId, eventType, minute);
    setIsSubmitting(false);
    setMinute('');
    setPlayerId('');
    router.refresh();
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    await removeMatchEvent(eventId);
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Olay Ekleme Formu */}
      <div className="bg-slate-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Yeni Olay Ekle</h2>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Olay Tipi</label>
            <select 
              value={eventType} 
              onChange={e => setEventType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
            >
              <option value="GOAL">Gol</option>
              <option value="YELLOW_CARD">Sarı Kart</option>
              <option value="RED_CARD">Kırmızı Kart</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Dakika</label>
            <input 
              type="text" 
              placeholder="Örn: 45 veya 90+2"
              value={minute}
              onChange={e => setMinute(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Oyuncu</label>
            <select 
              value={playerId} 
              onChange={e => setPlayerId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white"
            >
              <option value="">Oyuncu Seçin...</option>
              <optgroup label={match.homeTeam.name}>
                {match.homeTeam.players.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
              <optgroup label={match.awayTeam.name}>
                {match.awayTeam.players.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !playerId || !minute}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            {isSubmitting ? 'Ekleniyor...' : 'Ekle'}
          </button>
        </form>
      </div>

      {/* Mevcut Olaylar */}
      <div className="bg-slate-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Maç Olayları</h2>
        {match.events.length === 0 ? (
          <p className="text-slate-400 text-sm">Henüz maç olayı girilmemiş.</p>
        ) : (
          <ul className="space-y-3">
            {match.events.map((event: any) => (
              <li key={event.id} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="text-blue-400 font-mono font-bold w-12">{event.minute}&apos;</span>
                  <span className="text-xl">
                    {event.type === 'GOAL' && '⚽'}
                    {event.type === 'YELLOW_CARD' && '🟨'}
                    {event.type === 'RED_CARD' && '🟥'}
                  </span>
                  <span>{event.player.name}</span>
                </div>
                <button 
                  onClick={() => handleRemoveEvent(event.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
