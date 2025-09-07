// /app/api/generate-headline/route.js
import Groq from "groq-sdk";
import JSON5 from "json5";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { news } = await request.json();
    if (!news) return Response.json({ error: "Missing news" }, { status: 400 });

    const prompt = `You are an elite satirical meme generator with razor-sharp wit and deep political insight. Transform this serious news headline into a devastatingly funny, satirical meme that exposes the absurdity of modern politics and society.

Original news: "${news}"

Requirements:
- Maximum comedic impact - make it absolutely hilarious
- Use biting satire, clever wordplay, and unexpected twists
- Employ irony, hyperbole, and absurdist humor
- Reference popular memes, internet culture, or generational humor when relevant
- Make politicians and institutions look ridiculous through humor, not hatred
- Sound like it belongs on the spiciest political meme pages
- Keep under 120 characters for maximum shareability
- Be fearlessly witty - don't hold back on the satire

Humor techniques to employ:
- Unexpected juxtapositions
- Mock-serious tone applied to ridiculous situations  
- References to popular culture/memes
- Exaggeration to the point of absurdity
- Clever puns and wordplay
- "This is fine" energy applied to chaos

Response format:
{
  "headline": "Your devastatingly satirical headline",
  "thumbnail": "🤡💰",
  "spicyLevel": 8,
  "reasoning": "Brief explanation of the satirical angle"
}

SpicyLevel: 1-10 (aim for 7-9 for maximum viral potential)
Be ruthlessly funny - satire should make people laugh while making them think.

Respond only with the JSON, no additional text.
`;

    const completion = await groq.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const text = completion.choices?.[0]?.message?.content || "";
    let generatedMeme;

    try {
      const clean = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
     generatedMeme = JSON5.parse(clean);
    } catch (e) {
      console.error("parse fail; raw:", text);
      generatedMeme = {
        headline: `Breaking: Local Experts Confirm "${news}" Actually More Complicated Than Twitter Thread Suggests`,
        thumbnail: "🧠💭",
        spicyLevel: 6,
      };
    }

    // sanitize
    return Response.json({
      headline: String(generatedMeme.headline || "").slice(0, 140),
      thumbnail: generatedMeme.thumbnail || "🏛️💬",
      spicyLevel: Number.isFinite(generatedMeme.spicyLevel)
        ? generatedMeme.spicyLevel
        : 5,
    });
  } catch (error) {
    console.error("generate-headline error:", error);
    return Response.json({
      headline:
        "Scientists Discover Politicians’ Promises Decay Faster Than Bananas",
      thumbnail: "🍌⏱️",
      spicyLevel: 7,
    });
  }
}
