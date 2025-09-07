'use client'

import { useState } from 'react'
import { ArrowLeft, Sparkles, RefreshCw, Download, Share2, Zap } from 'lucide-react'
import Link from 'next/link'

export default function GeneratePage() {
  const [currentStep, setCurrentStep] = useState(1) // 1: fetch news, 2: generate meme, 3: result
  const [loading, setLoading] = useState(false)
  const [newsArticles, setNewsArticles] = useState([])
  const [selectedNews, setSelectedNews] = useState(null)
  const [generatedMeme, setGeneratedMeme] = useState(null)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      setNewsArticles(data.articles)
      setCurrentStep(2)
    } catch (error) {
      console.error('Error fetching news:', error)
      // Mock data for demo
      setNewsArticles([
        {
          id: 1,
          title: "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
          source: "Reuters",
          time: "2 hours ago"
        },
        {
          id: 2,
          title: "Tech Giants Face New Regulations in European Union Privacy Laws",
          source: "BBC",
          time: "4 hours ago"
        },
        {
          id: 3,
          title: "International Trade Tensions Rise Amid Currency Fluctuations",
          source: "Financial Times",
          time: "6 hours ago"
        }
      ])
      setCurrentStep(2)
    }
    setLoading(false)
  }

  const generateMeme = async (newsItem) => {
    setSelectedNews(newsItem)
    setLoading(true)
    try {
      const response = await fetch('/api/generate-headline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news: newsItem.title })
      })
      const data = await response.json()
      setGeneratedMeme({
        ...data,
        originalNews: newsItem.title,
        source: newsItem.source
      })
      setCurrentStep(3)
    } catch (error) {
      console.error('Error generating meme:', error)
      // Mock data for demo
      setGeneratedMeme({
        headline: "Scientists Discover Politicians' Promises Have Half-Life Shorter Than Radioactive Elements",
        thumbnail: "🧪⚡",
        originalNews: newsItem.title,
        source: newsItem.source,
        spicyLevel: 8
      })
      setCurrentStep(3)
    }
    setLoading(false)
  }

  const shareOrDownload = (action) => {
    if (action === 'share') {
      if (navigator.share) {
        navigator.share({
          title: generatedMeme.headline,
          text: `Check out this spicy political meme! "${generatedMeme.headline}"`,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(`"${generatedMeme.headline}" - Generated at GeoPolitiMemes`)
        alert('Meme copied to clipboard!')
      }
    } else {
      // Download functionality would go here
      alert('Download feature coming soon!')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </Link>
        
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Meme Generator
          </h1>
          <p className="text-gray-300 mb-8">Transform boring news into viral gold</p>
          
          {/* Progress Steps */}
          <div className="flex justify-center space-x-4 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className={`flex items-center ${step < 3 ? 'mr-4' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'glass-effect text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ml-4 transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        {/* Step 1: Start */}
        {currentStep === 1 && (
          <div className="text-center">
            <div className="meme-card max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🌍⚡</div>
              <h2 className="text-2xl font-bold mb-4">Ready to Create Some Chaos?</h2>
              <p className="text-gray-300 mb-8">
                I'll fetch the latest news and turn it into satirical gold. 
                Buckle up for some spicy takes on current events!
              </p>
              <button 
                onClick={fetchNews}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto pulse-glow disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Fetching News...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Fetch Latest News</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select News */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">Choose Your Victim... I Mean, News Article</h2>
            <div className="grid gap-4 md:gap-6">
              {newsArticles.map((article) => (
                <div key={article.id} className="meme-card hover:scale-[1.01] cursor-pointer" onClick={() => generateMeme(article)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 leading-tight">{article.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{article.time}</span>
                      </div>
                    </div>
                    <div className="ml-4 opacity-70 hover:opacity-100 transition-opacity">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {loading && (
              <div className="text-center mt-8">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xl gradient-text">Generating satirical masterpiece...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Generated Meme */}
        {currentStep === 3 && generatedMeme && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">🔥 Your Meme is Ready! 🔥</h2>
            
            {/* Meme Display */}
            <div className="meme-card max-w-3xl mx-auto mb-8">
              <div className="text-6xl mb-6">{generatedMeme.thumbnail}</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                {generatedMeme.headline}
              </h3>
              
              <div className="glass-effect rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400 mb-2">Original News:</p>
                <p className="text-gray-200 italic">"{generatedMeme.originalNews}"</p>
                <p className="text-xs text-gray-500 mt-2">Source: {generatedMeme.source}</p>
              </div>
              
              {/* Spicy Level */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="text-sm text-gray-400">Spicy Level:</span>
                <div className="flex space-x-1">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${
                      i < generatedMeme.spicyLevel ? 'bg-red-500' : 'bg-gray-600'
                    }`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-red-400">{generatedMeme.spicyLevel}/10 🌶️</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button 
                onClick={() => shareOrDownload('share')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Meme</span>
              </button>
              
              <button 
                onClick={() => shareOrDownload('download')}
                className="glass-effect hover:neon-glow px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
            
            {/* Create Another */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => {
                  setCurrentStep(1)
                  setGeneratedMeme(null)
                  setSelectedNews(null)
                  setNewsArticles([])
                }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Another</span>
              </button>
              
              <Link href="/">
                <button className="glass-effect hover:neon-glow px-6 py-3 rounded-full font-semibold transition-all duration-300">
                  Back to Feed
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}