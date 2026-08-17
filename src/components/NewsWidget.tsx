/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  imageUrl: string | null;
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data.news || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-ch2 animate-pulse rounded-2xl h-72 border border-ch2/50"></div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return <div className="text-ch4 text-center font-medium py-8">Haberler yüklenemedi.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {news.map(item => (
        <a 
          key={item.id} 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="group bg-white border border-ch2 hover:border-ch4 rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(120,149,178,0.2)]"
        >
          <div className="relative w-full h-40 sm:h-48 bg-ch2 overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent"></div>
          </div>
          <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white relative z-10">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug mb-3 group-hover:text-ch4 transition-colors line-clamp-3">
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 mt-auto font-medium">
              {new Date(item.pubDate).toLocaleDateString('tr-TR', { 
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
