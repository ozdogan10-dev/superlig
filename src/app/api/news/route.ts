import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'image', 'enclosure'],
  }
});

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  try {
    // Try TRT Spor Super Lig RSS or General Sports
    const feed = await parser.parseURL('https://www.trthaber.com/spor_articles.rss');
    
    // We only want 6-8 news items for the homepage
    const news = feed.items.slice(0, 8).map(item => {
      // Extract image from enclosure or media:content if available
      let imageUrl = null;
      if (item.enclosure && item.enclosure.url) {
        imageUrl = item.enclosure.url;
      } else if (item['media:content'] && item['media:content'].$) {
        imageUrl = item['media:content'].$.url;
      }

      return {
        id: item.guid || item.link,
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet || item.content,
        imageUrl,
      };
    });

    return NextResponse.json({ news });
  } catch (error) {
    console.error('RSS Fetch error:', error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}
