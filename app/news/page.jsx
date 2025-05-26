'use client'

import React from 'react'
import { useState } from 'react';
import Link from 'next/link';

const page = () => {

  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample news data - replace with your actual data
  const newsData = [
    {
      id: 1,
      title: "The Rise of AI in Podcast Production: How Technology is Reshaping Audio Content",
      excerpt: "Discover how artificial intelligence is revolutionizing podcast creation, from automated editing to voice synthesis and content optimization.",
      category: "technology",
      author: "Sarah Mitchell",
      date: "2024-05-15",
      readTime: "5 min read",
      image: "/api/placeholder/600/300",
      featured: true
    },
    {
      id: 2,
      title: "Spotify Announces New Monetization Features for Podcast Creators",
      excerpt: "The streaming giant unveils enhanced revenue sharing models and subscriber-only content options for podcasters worldwide.",
      category: "industry",
      author: "Mike Johnson",
      date: "2024-05-12",
      readTime: "3 min read",
      image: "/api/placeholder/600/300",
      featured: false
    },
    {
      id: 3,
      title: "Interview Techniques That Transform Ordinary Conversations",
      excerpt: "Master the art of compelling interviews with these proven strategies used by top podcast hosts to create engaging dialogue.",
      category: "tips",
      author: "Emma Rodriguez",
      date: "2024-05-10",
      readTime: "7 min read",
      image: "/api/placeholder/600/300",
      featured: false
    },
    {
      id: 4,
      title: "Breaking: Major Podcast Network Acquires Independent Creator Platform",
      excerpt: "Industry consolidation continues as established networks expand their reach by acquiring smaller, creator-focused platforms.",
      category: "industry",
      author: "David Chen",
      date: "2024-05-08",
      readTime: "4 min read",
      image: "/api/placeholder/600/300",
      featured: false
    },
    {
      id: 5,
      title: "The Psychology of Sound: Why Certain Voices Go Viral",
      excerpt: "Scientists reveal the acoustic properties that make some podcast voices more engaging and memorable than others.",
      category: "research",
      author: "Dr. Lisa Thompson",
      date: "2024-05-05",
      readTime: "6 min read",
      image: "/api/placeholder/600/300",
      featured: false
    },
    {
      id: 6,
      title: "Equipment Guide 2024: Best Microphones Under $200",
      excerpt: "Our comprehensive review of budget-friendly microphones that deliver professional-quality audio for emerging podcasters.",
      category: "equipment",
      author: "Tech Review Team",
      date: "2024-05-03",
      readTime: "8 min read",
      image: "/api/placeholder/600/300",
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All News', count: newsData.length },
    { id: 'industry', name: 'Industry', count: newsData.filter(item => item.category === 'industry').length },
    { id: 'technology', name: 'Technology', count: newsData.filter(item => item.category === 'technology').length },
    { id: 'tips', name: 'Tips & Guides', count: newsData.filter(item => item.category === 'tips').length },
    { id: 'equipment', name: 'Equipment', count: newsData.filter(item => item.category === 'equipment').length },
    { id: 'research', name: 'Research', count: newsData.filter(item => item.category === 'research').length }
  ];

  const filteredNews = selectedCategory === 'all' 
    ? newsData 
    : newsData.filter(item => item.category === selectedCategory);

  const featuredNews = newsData.find(item => item.featured);
  const regularNews = newsData.filter(item => !item.featured);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      industry: 'bg-green-100 text-green-800',
      tips: 'bg-purple-100 text-purple-800',
      equipment: 'bg-orange-100 text-orange-800',
      research: 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Podcast
              <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                {" "}News
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Stay updated with the latest trends, insights, and breaking news from the podcasting world
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article */}
      {selectedCategory === 'all' && featuredNews && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                FEATURED
              </span>
            </div>
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="relative h-64 lg:h-full overflow-hidden">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredNews.category)}`}>
                    {featuredNews.category.charAt(0).toUpperCase() + featuredNews.category.slice(1)}
                  </span>
                  <span className="text-gray-500 text-sm">{featuredNews.readTime}</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors duration-300">
                  {featuredNews.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {featuredNews.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {featuredNews.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{featuredNews.author}</p>
                      <p className="text-gray-500 text-sm">{formatDate(featuredNews.date)}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/news/${featuredNews.id}`}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {(selectedCategory === 'all' ? regularNews : filteredNews).map((article, index) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span>{formatDate(article.date)}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors duration-300 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      {article.author.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{article.author}</span>
                  </div>
                  
                  <Link 
                    href={`/news/${article.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline transition-colors duration-200"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Load More Articles
          </button>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Never Miss a Story
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Get the latest podcast news and insights delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full border-0 focus:ring-4 focus:ring-white/20 focus:outline-none text-gray-900"
            />
            <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page
