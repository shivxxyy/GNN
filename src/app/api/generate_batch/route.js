// /app/api/generate-batch/route.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// simple delay
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function generateForArticle(article) {
  // Call our single-item endpoint locally to keep logic in one place
  const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/generate-headline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ news: article.title }),
    cache: 'no-store'
  });
  const data = await resp.json();
  return data;
}

export async function POST(request) {
  try {
    // Find articles that do not have a meme yet
    const { data: articles, error } = await supabase
      .from('news_articles')
      .select('id, title, link, img, time, source')
      .order('time', { ascending: false })
      .limit(40);

    if (error) throw error;

    // Find which links already have memes
    const { data: existingMemes } = await supabase
      .from('memes')
      .select('article_link');

    const existingSet = new Set((existingMemes || []).map(m => m.article_link));
    const backlog = (articles || []).filter(a => a.link && !existingSet.has(a.link));

    // Respect RPM=30 => aim 28/min. Space calls ~2140ms apart.
    const intervalMs = Math.ceil(60000 / 28);

    const results = [];
    for (let i = 0; i < backlog.length; i++) {
      const art = backlog[i];
      // stagger to stay under RPM
      if (i > 0) await sleep(intervalMs);

      try {
        const gen = await generateForArticle(art);
        const insertObj = {
          article_link: art.link,
          headline: gen.headline,
          thumbnail: gen.thumbnail,
          spicy_level: gen.spicyLevel
        };
        const { error: insErr } = await supabase.from('memes').upsert(insertObj, { onConflict: 'article_link' });
        if (insErr) {
          console.error('memes upsert err', insErr);
        } else {
          results.push({ link: art.link, ok: true });
        }
      } catch (e) {
        console.error('batch item error', e);
        results.push({ link: art.link, ok: false, error: e?.message || String(e) });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (e) {
    console.error('generate-batch error', e);
    return Response.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
