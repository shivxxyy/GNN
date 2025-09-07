"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  TrendingUp,
  Share2,
  Heart,
  MessageCircle,
  Plus,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import altimg from "../assets/altimg.png";

export default function HomePage() {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsAndGenerateMemes = async () => {
      setLoading(true);

      try {
        // Step 1: Fetch news (from GeneratePage)
        const response = await fetch("/api/news");
        const data = await response.json();
        const newsArticles = data.articles;

        // Step 2: Generate memes for each news article (from GeneratePage)
        const generatedMemes = await Promise.all(
          newsArticles.slice(0, 15).map(async (newsItem, index) => {
            try {
              const response = await fetch("/api/generate-headline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ news: newsItem.title }),
              });
              const data = await response.json();

              return {
                id: newsItem.id || index + 1,
                headline: data.headline,
                link: newsItem.link, // 👈 add this
                originalNews: newsItem.title,
                votes: Math.floor(Math.random() * 3000) + 100, // Random initial votes
                shares: Math.floor(Math.random() * 800) + 50,
                comments: Math.floor(Math.random() * 200) + 10,
                thumbnail: data.thumbnail || "🌍⚡",
                timeAgo:
                  newsItem.time || `${Math.floor(Math.random() * 12) + 1}h ago`,
                spicyLevel: data.spicyLevel || 5, // Default spicy level if not provided
                img: newsItem.img || data.thumbnail, // Fallback image if not provided
              };
            } catch (error) {
              console.error("Error generating meme:", error);
              // Fallback meme if generation fails
              return {
                id: newsItem.id || index + 1,
                headline: `Breaking: ${newsItem.title}`,
                link: newsItem.link, // 👈 add here too
                originalNews: newsItem.title,
                votes: Math.floor(Math.random() * 1000) + 100,
                shares: Math.floor(Math.random() * 500) + 50,
                comments: Math.floor(Math.random() * 100) + 10,
                thumbnail: "📰⚡",
                timeAgo:
                  newsItem.time || `${Math.floor(Math.random() * 12) + 1}h ago`,
              };
            }
          })
        );

        setMemes(generatedMemes);
      } catch (error) {
        console.error("Error fetching news:", error);
        // Fallback to mock data (your original mock data)
        const mockMemes = [
          {
            id: 1,
            headline:
              "Breaking: Local Politician Discovers Economy Actually Complicated",
            originalNews: "Government announces new economic policies",
            votes: 1337,
            shares: 420,
            comments: 69,
            thumbnail: "🏛️💸",
            timeAgo: "2h ago",
          },
          {
            id: 2,
            headline:
              "Scientists Confirm: Tweets Now Official Foreign Policy Documents",
            originalNews:
              "Social media influence on international relations grows",
            votes: 2456,
            shares: 789,
            comments: 123,
            thumbnail: "🐦📜",
            timeAgo: "4h ago",
          },
          {
            id: 3,
            headline:
              "Nation's Youth Surprisingly Good at Geography After Global Crisis Simulator Goes Viral",
            originalNews:
              "Educational gaming increases political awareness among young people",
            votes: 3124,
            shares: 567,
            comments: 234,
            thumbnail: "🌍🎮",
            timeAgo: "6h ago",
          },
        ];
        setMemes(mockMemes);
      }

      setLoading(false);
    };

    fetchNewsAndGenerateMemes();
  }, []);

  const handleVote = (memeId) => {
    setMemes(
      memes.map((meme) =>
        meme.id === memeId ? { ...meme, votes: meme.votes + 1 } : meme
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl gradient-text">Loading spicy news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b border-white/10 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">bullshit.ai</h1>
              <p className="text-xs text-gray-400">
                Real News, Fake Seriousness
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="floating-animation mb-8">
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              Turns News Into
              <br />
              <span className="text-5xl md:text-7xl">Viral Gold</span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            AI-powered satirical headlines that make geopolitics actually
            entertaining. Because if you're not laughing, you're crying.
          </p>

          {/* Stats */}
          {/* <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-12">
            <div className="glass-effect rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">1.2K+</div>
              <div className="text-sm text-gray-400">Memes Created</div>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">500K+</div>
              <div className="text-sm text-gray-400">Votes Cast</div>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-400">24/7</div>
              <div className="text-sm text-gray-400">News Chaos</div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Trending Section */}
      <section className="px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {memes.map((meme) => (
              <div key={meme.id} className="meme-card">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Thumbnail */}
                  <div className="w-full lg:w-24 h-32 lg:h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                    <img
                      src={meme.img || altimg.src} // <-- use altimg.src
                      alt="meme thumbnail"
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        const img = e.currentTarget;
                        // prevent infinite onError if fallback also fails
                        if (img.dataset.fallback !== "true") {
                          img.dataset.fallback = "true";
                          img.src = altimg.src; // <-- use altimg.src
                        }
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2 leading-tight">
                          {meme.headline}
                        </h4>
                        <p className="text-sm text-gray-400 mb-3">
                          Original: {meme.originalNews}
                        </p>
                        <div className="text-xs text-gray-500">
                          {new Date(meme.timeAgo).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
                        {/* In the actions div, add this button */}
                        <button
                          onClick={() => window.open(meme.link, "_blank")}
                          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 transition-all duration-200 text-purple-400 hover:text-purple-300"
                          title="Read original article"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm font-medium hidden sm:inline">
                            Read
                          </span>
                        </button>
                        <button
                          onClick={() => handleVote(meme.id)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 text-red-400 hover:text-red-300"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {meme.votes}
                          </span>
                        </button>

                        {/* <button className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-all duration-200 text-blue-400 hover:text-blue-300">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {meme.comments}
                          </span>
                        </button> */}

                        <button className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-all duration-200 text-green-400 hover:text-green-300">
                          <Share2 className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {meme.shares}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-8 py-3 rounded-full glass-effect hover:neon-glow transition-all duration-300 font-semibold">
              Come back in 12 hours for more chaos
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-effect border-t border-white/10 px-4 py-8 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            bullshit.ai - Where serious news meets unserious people
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-purple-400 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
