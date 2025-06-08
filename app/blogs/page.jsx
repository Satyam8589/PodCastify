'use client';

import { useState, useEffect } from 'react';

const PodcastBlog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('blog'); // 'blog' or 'post'
  const [currentPost, setCurrentPost] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'storytelling', name: 'Storytelling', icon: '📖' },
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'monetization', name: 'Monetization', icon: '💰' },
    { id: 'interviews', name: 'Interviews', icon: '🎤' },
    { id: 'psychology', name: 'Psychology', icon: '🧠' }
  ];

  // Fetch blog posts from API
  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`/api/blog?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setBlogPosts(result.data || []);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch blog posts');
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError(err.message);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts on component mount and when filters change
  useEffect(() => {
    fetchBlogPosts();
  }, [selectedCategory, searchTerm]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchBlogPosts();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter and sort posts
  const featuredPost = selectedCategory === 'all' 
    ? blogPosts.find(post => post.featured) 
    : null;
  
  const regularPosts = selectedCategory === 'all' 
    ? blogPosts.filter(post => !post.featured)
    : blogPosts;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'getting-started': 'bg-green-100 text-green-800',
      'storytelling': 'bg-purple-100 text-purple-800',
      'branding': 'bg-pink-100 text-pink-800',
      'monetization': 'bg-yellow-100 text-yellow-800',
      'interviews': 'bg-blue-100 text-blue-800',
      'psychology': 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleReadMore = (post) => {
    setCurrentPost(post);
    setCurrentView('post');
  };

  const handleBackToBlog = () => {
    setCurrentView('blog');
    setCurrentPost(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchTerm(''); // Clear search when changing categories
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      <span className="ml-3 text-gray-600">Loading posts...</span>
    </div>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <button 
        onClick={fetchBlogPosts}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300"
      >
        Try Again
      </button>
    </div>
  );

  // Individual Post View
  if (currentView === 'post' && currentPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={handleBackToBlog}
              className="text-white hover:text-gray-200 mb-6 flex items-center gap-2 transition-colors duration-200"
            >
              ← Back to Blog
            </button>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentPost.category)}`}>
                {categories.find(cat => cat.id === currentPost.category)?.icon} {currentPost.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="text-gray-300 text-sm">{currentPost.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {currentPost.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  {currentPost.author.charAt(0)}
                </div>
                <span>{currentPost.author}</span>
              </div>
              <span>•</span>
              <span>{formatDate(currentPost.date)} at {currentPost.time}</span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <img
              src={currentPost.image?.url || currentPost.image}
              alt={currentPost.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="p-8 md:p-12">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: currentPost.content }}
              />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentPost.tags?.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {currentPost.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{currentPost.author}</p>
                      <p className="text-gray-500 text-sm">Published on {formatDate(currentPost.date)} at {currentPost.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackToBlog}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Read More Posts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Blog List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Podcast
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                {" "}Blog
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
              Insights, tips, and stories from the world of podcasting
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-6 py-4 pl-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300">
                  🔍
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              disabled={loading}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error State */}
      {error && !loading && <ErrorMessage />}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Featured Post */}
          {featuredPost && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden group hover:shadow-3xl transition-all duration-500">
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✨ FEATURED
                  </span>
                </div>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 lg:h-full overflow-hidden">
                    <img
                      src={featuredPost.image?.url || featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(featuredPost.category)}`}>
                        {categories.find(cat => cat.id === featuredPost.category)?.icon} {featuredPost.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-gray-500 text-sm">{featuredPost.readTime}</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-violet-600 transition-colors duration-300">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags?.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {featuredPost.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{featuredPost.author}</p>
                          <p className="text-gray-500 text-sm">{formatDate(featuredPost.date)} at {featuredPost.time}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleReadMore(featuredPost)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 rounded-full font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        Read Article
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Blog Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {regularPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {regularPosts.map((post, index) => (
                  <article
                    key={post._id || post.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image?.url || post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {categories.find(cat => cat.id === post.category)?.icon} {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span>{formatDate(post.date)} at {post.time}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-violet-600 transition-colors duration-300">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {post.author.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{post.author}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleReadMore(post)}
                          className="text-violet-600 hover:text-violet-800 font-medium text-sm hover:underline transition-colors duration-200 flex items-center gap-1"
                        >
                          Read More →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* No Results Message */
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No posts match "${searchTerm}". Try adjusting your search.`
                    : 'No posts available in this category.'
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with Our Blog
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Get the latest insights and tips delivered directly to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full border-0 focus:ring-4 focus:ring-white/20 focus:outline-none text-gray-900 bg-white/90 backdrop-blur-sm"
            />
            <button className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-full font-bold hover:from-pink-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastBlog;