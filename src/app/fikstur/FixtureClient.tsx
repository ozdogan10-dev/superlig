'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function FixtureClient({ weeks }: { weeks: Record<number, any[]> }) {
  const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b);
  const [currentWeek, setCurrentWeek] = useState(weekNumbers[0] || 1);

  const handlePrev = () => {
    const currentIndex = weekNumbers.indexOf(currentWeek);
    if (currentIndex > 0) setCurrentWeek(weekNumbers[currentIndex - 1]);
  };

  const handleNext = () => {
    const currentIndex = weekNumbers.indexOf(currentWeek);
    if (currentIndex < weekNumbers.length - 1) setCurrentWeek(weekNumbers[currentIndex + 1]);
  };

  const currentMatches = weeks[currentWeek] || [];

  return (
    <div className="bg-white border border-ch2 rounded-3xl overflow-hidden shadow-sm">
      {/* Header / Nav */}
      <div className="bg-ch1 p-6 flex items-center justify-between border-b border-ch2">
        <button 
          onClick={handlePrev}
          disabled={currentWeek === weekNumbers[0]}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-ch2 disabled:opacity-30 transition-all text-slate-800 font-bold border border-ch2 shadow-sm"
        >
          &larr;
        </button>
        <h2 className="text-2xl font-bold text-slate-800 tracking-wide">
          {currentWeek}. Hafta
        </h2>
        <button 
          onClick={handleNext}
          disabled={currentWeek === weekNumbers[weekNumbers.length - 1]}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white hover:bg-ch2 disabled:opacity-30 transition-all text-slate-800 font-bold border border-ch2 shadow-sm"
        >
          &rarr;
        </button>
      </div>

      {/* Matches List */}
      <div className="divide-y divide-ch2/50">
        {currentMatches.map((match: any) => (
          <Link key={match.id} href={`/mac/${match.id}`} className="block hover:bg-ch1/30 transition-colors group">
            <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Home Team */}
              <div className="flex items-center gap-4 flex-1 justify-end w-full sm:w-auto">
                <span className="font-bold text-slate-700 text-lg text-right group-hover:text-ch4 transition-colors">{match.homeTeam.name}</span>
                {match.homeTeam.logoUrl ? (
                  <Image src={match.homeTeam.logoUrl} alt={match.homeTeam.name} width={40} height={40} className="object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-ch1 border border-ch2 rounded-full flex items-center justify-center text-xs">🛡️</div>
                )}
              </div>

              {/* Score / Date */}
              <div className="flex flex-col items-center justify-center min-w-[120px] bg-white rounded-xl py-2 px-4 border border-ch2 shadow-sm">
                {(match.homeScore !== null && match.awayScore !== null) ? (
                  <>
                    <div className="text-2xl font-black text-slate-800 tracking-wider">
                      {match.homeScore} - {match.awayScore}
                    </div>
                    {match.date && (
                      <div className="text-[11px] text-slate-500 font-medium text-center mt-0.5">
                        {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(match.date))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm font-medium text-slate-500 text-center">
                    {match.date ? new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(match.date)) : 'v'}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-4 flex-1 justify-start w-full sm:w-auto">
                {match.awayTeam.logoUrl ? (
                  <Image src={match.awayTeam.logoUrl} alt={match.awayTeam.name} width={40} height={40} className="object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-ch1 border border-ch2 rounded-full flex items-center justify-center text-xs">🛡️</div>
                )}
                <span className="font-bold text-slate-700 text-lg text-left group-hover:text-ch4 transition-colors">{match.awayTeam.name}</span>
              </div>

            </div>
          </Link>
        ))}
        {currentMatches.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium">Bu haftaya ait maç bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
