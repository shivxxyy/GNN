// /app/api/memes/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET() {
  try {
    const { data: memes, error: memesErr } = await supabase
      .from('memes')
      .select('id, article_link, headline, thumbnail, spicy_level, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (memesErr) throw memesErr;

    const links = (memes || []).map(m => m.article_link);
    if (links.length === 0) return Response.json({ items: [] });

    const { data: articles, error: artErr } = await supabase
      .from('news_articles')
      .select('link, title, img, source, time')
      .in('link', links);

    if (artErr) throw artErr;

    const map = new Map(articles.map(a => [a.link, a]));
    const items = memes.map(m => {
      const a = map.get(m.article_link) || {};
      return {
        id: m.id,
        link: m.article_link,
        headline: m.headline,
        thumbnail: m.thumbnail,
        spicyLevel: m.spicy_level,
        createdAt: m.created_at,
        originalNews: a.title || '',
        img: a.img || null,
        source: a.source || '',
        time: a.time || null
      };
    });

    return Response.json({ items });
  } catch (e) {
    console.error('memes feed error', e);
    return Response.json({ items: [] }, { status: 200 });
  }
}
