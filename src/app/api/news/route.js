// /app/api/news/route.js
import { createClient } from '@supabase/supabase-js';

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// simple app state table suggestion:
// create table app_state (key text primary key, value jsonb);
async function getAppState(key) {
  const { data, error } = await supabase.from('app_state').select('value').eq('key', key).single();
  if (error) console.error("getAppState error:", error);
  return data?.value || null;
}
async function setAppState(key, value) {
  const { error } = await supabase.from('app_state').upsert({ key, value });
  if (error) console.error('app_state upsert error', error);
}

async function fetchFromNewsDataIfNeeded() {
  const stateKey = 'newsdata_last_fetch';
  const last = await getAppState(stateKey);
  const now = Date.now();

  if (last && now - last < 15 * 60 * 1000) {
    console.log("Skipping NewsData fetch (throttled). Last:", new Date(last).toISOString());
    return { fetched: false };
  }

  try {
    console.log("Fetching from NewsData...");
    const url = `https://newsdata.io/api/1/latest?apikey=${NEWSDATA_API_KEY}&q=geopolitics`;
    const responseIN = await fetch(url, { cache: 'no-store' });
    const dataIN = await responseIN.json();
    console.log("NewsData raw response:", JSON.stringify(dataIN, null, 2));

    const combined = Array.isArray(dataIN.results) ? dataIN.results : [];
    console.log("Parsed results count:", combined.length);

    const articles = combined
      .filter(item => !!item?.link) // must have link
      .map((item) => ({
        title: item.title || null,
        link: item.link,
        img: item.image_url || null,
        source: item.source_name || null,
        time: item.pubDate || null,
      }));

    console.log("Articles to insert:", articles.length);

    // Upsert into DB (unique on 'link')
    for (const a of articles) {
      const { data, error: upsertError } = await supabase
        .from('news_articles')
        .upsert(a, { onConflict: 'link' })
        .select(); // return inserted row for debugging
      if (upsertError) {
        console.error('news upsert error:', upsertError);
      } else {
        console.log("Inserted/updated article:", data);
      }
    }

    await setAppState(stateKey, now);
    return { fetched: true, count: articles.length };
  } catch (e) {
    console.error('NewsData fetch error', e);
    return { fetched: false, error: e?.message || String(e) };
  }
}

export async function GET() {
  await fetchFromNewsDataIfNeeded();

  const { data: storedArticles, error } = await supabase
    .from('news_articles')
    .select('*')
    .order('time', { ascending: false })
    .limit(50);

  if (error) {
    console.error('fetch from DB error:', error);
    return Response.json({ articles: [] }, { status: 200 });
  }

  console.log("Articles fetched from DB:", storedArticles?.length);

  const articles = (storedArticles || []).map((a) => ({
    id: a.id,
    title: a.title,
    link: a.link,
    img: a.img,
    source: a.source,
    time: a.time,
  }));

  console.log("Articles to return:", articles);

  return Response.json({ articles });
}
