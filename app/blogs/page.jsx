'use client';

import { useState } from 'react';

const PodcastBlog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('blog'); // 'blog' or 'post'
  const [currentPost, setCurrentPost] = useState(null);

  // Sample blog data - replace with your actual data/API
  const blogPosts = [
    {
      id: 1,
      title: "10 Essential Tips for Starting Your First Podcast",
      excerpt: "Everything you need to know to launch your podcasting journey, from equipment selection to publishing your first episode.",
      content: `
        <h2>Getting Started with Podcasting</h2>
        <p>Starting a podcast can seem overwhelming, but with the right approach, you can create compelling content that resonates with your audience. Here are ten essential tips to help you launch your podcasting journey successfully.</p>
        
        <h3>1. Define Your Niche and Audience</h3>
        <p>Before you record your first episode, it's crucial to understand who you're speaking to and what unique value you're providing. Research your target audience and identify gaps in the current podcast landscape.</p>
        
        <h3>2. Invest in Quality Equipment</h3>
        <p>While you don't need to break the bank, investing in a decent microphone and headphones will significantly improve your audio quality. Consider starting with a USB microphone like the Audio-Technica ATR2100x-USB.</p>
        
        <h3>3. Choose the Right Recording Software</h3>
        <p>Free options like Audacity or GarageBand can get you started, while paid options like Adobe Audition offer more advanced features for editing and post-production.</p>
        
        <h3>4. Plan Your Content Strategy</h3>
        <p>Develop a content calendar and plan your episodes in advance. This helps maintain consistency and ensures you always have fresh ideas for your show.</p>
        
        <h3>5. Focus on Audio Quality</h3>
        <p>Record in a quiet space with minimal echo. Consider using blankets or foam panels to improve your recording environment's acoustics.</p>
      `,
      image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500&h=300&fit=crop",
      category: "getting-started",
      author: "Alex Thompson",
      date: "2024-05-20",
      time: "10:30 AM",
      readTime: "8 min read",
      tags: ["beginner", "tips", "equipment"],
      featured: true
    },
    {
      id: 2,
      title: "The Art of Storytelling in Podcasts",
      excerpt: "Learn how to craft compelling narratives that keep your audience engaged from start to finish.",
      content: `
        <h2>Mastering Podcast Storytelling</h2>
        <p>Great storytelling is what separates good podcasts from exceptional ones. Whether you're hosting interviews, sharing personal experiences, or presenting factual content, the way you structure and deliver your narrative can make all the difference.</p>
        
        <h3>The Power of Structure</h3>
        <p>Every compelling story has a beginning, middle, and end. Start with a hook that grabs attention, build tension or curiosity in the middle, and provide a satisfying resolution or call-to-action at the end.</p>
        
        <h3>Show, Don't Tell</h3>
        <p>Instead of simply stating facts, paint pictures with your words. Use descriptive language, sound effects, and music to create an immersive experience for your listeners.</p>
        
        <h3>Embrace Vulnerability</h3>
        <p>Authentic storytelling often involves sharing personal experiences and emotions. Don't be afraid to be vulnerable – it creates a deeper connection with your audience.</p>
      `,
      image: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=500&h=400&fit=crop",
      category: "storytelling",
      author: "Sarah Johnson",
      date: "2024-05-18",
      time: "2:15 PM",
      readTime: "6 min read",
      tags: ["storytelling", "engagement", "techniques"],
      featured: false
    },
    {
      id: 3,
      title: "Building Your Podcast Brand",
      excerpt: "Create a memorable identity that resonates with your target audience and stands out in a crowded market.",
      content: `
        <h2>Creating a Strong Podcast Brand</h2>
        <p>Your podcast brand is more than just a logo and color scheme – it's the entire experience you create for your listeners. A strong brand helps you stand out in a saturated market and builds loyal audience relationships.</p>
        
        <h3>Visual Identity</h3>
        <p>Your podcast artwork is often the first thing potential listeners see. Make sure it's clear, eye-catching, and representative of your content. Consider hiring a professional designer if budget allows.</p>
        
        <h3>Consistent Voice and Tone</h3>
        <p>Develop a consistent personality for your show. Are you conversational and casual, or more formal and educational? Maintain this tone across all episodes and marketing materials.</p>
        
        <h3>Value Proposition</h3>
        <p>Clearly communicate what makes your podcast unique. What value do you provide that listeners can't get elsewhere? This should be evident in your description and episode content.</p>
      `,
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=250&fit=crop",
      category: "branding",
      author: "Mike Rodriguez",
      date: "2024-05-15",
      time: "9:45 AM",
      readTime: "5 min read",
      tags: ["branding", "marketing", "design"],
      featured: false
    },
    {
      id: 4,
      title: "Monetizing Your Podcast: Beyond Sponsorships",
      excerpt: "Explore diverse revenue streams to turn your passion project into a sustainable business.",
      content: `
        <h2>Diversifying Your Podcast Revenue</h2>
        <p>While sponsorships and ads are common monetization methods, successful podcasters often employ multiple revenue streams to build sustainable businesses around their shows.</p>
        
        <h3>Premium Content and Subscriptions</h3>
        <p>Offer exclusive content, early access, or ad-free episodes through subscription services like Patreon or Apple Podcasts Subscriptions.</p>
        
        <h3>Merchandise and Products</h3>
        <p>Create branded merchandise or develop products related to your podcast's niche. This can include books, courses, or physical products your audience would value.</p>
        
        <h3>Speaking and Consulting</h3>
        <p>Use your podcast as a platform to establish expertise and book speaking engagements or consulting opportunities in your field.</p>
      `,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=350&fit=crop",
      category: "monetization",
      author: "Emma Davis",
      date: "2024-05-12",
      time: "4:20 PM",
      readTime: "7 min read",
      tags: ["monetization", "business", "revenue"],
      featured: false
    },
    {
      id: 5,
      title: "Interview Mastery: Getting the Best from Your Guests",
      excerpt: "Professional techniques to conduct engaging interviews that create memorable content.",
      content: `
        <h2>Conducting Great Podcast Interviews</h2>
        <p>Great interviews are the backbone of many successful podcasts. Learning to ask the right questions and create comfortable environments for your guests will elevate your content significantly.</p>
        
        <h3>Pre-Interview Preparation</h3>
        <p>Research your guest thoroughly. Know their background, recent work, and potential talking points. Prepare thoughtful questions that go beyond surface-level topics.</p>
        
        <h3>Creating Comfortable Environments</h3>
        <p>Start with casual conversation before recording to help your guest relax. Explain your process and what to expect during the interview.</p>
        
        <h3>Active Listening Techniques</h3>
        <p>Don't just wait for your turn to talk. Listen actively to your guest's responses and ask follow-up questions that dig deeper into interesting points.</p>
      `,
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&h=300&fit=crop",
      category: "interviews",
      author: "David Chen",
      date: "2024-05-10",
      time: "11:00 AM",
      readTime: "9 min read",
      tags: ["interviews", "guests", "techniques"],
      featured: false
    },
    {
      id: 6,
      title: "The Psychology of Podcast Listening",
      excerpt: "Understanding how and why people consume audio content to better serve your audience.",
      content: `
        <h2>Understanding Your Podcast Audience</h2>
        <p>To create content that truly resonates, it's essential to understand the psychological factors that drive podcast consumption and listener behavior.</p>
        
        <h3>The Intimacy Factor</h3>
        <p>Podcasts create a unique sense of intimacy between host and listener. This parasocial relationship is powerful and should be nurtured through consistent, authentic communication.</p>
        
        <h3>Multitasking and Attention</h3>
        <p>Most podcast listeners are multitasking while consuming content. Design your episodes with this in mind – use clear transitions, summarize key points, and avoid complex visual references.</p>
        
        <h3>Building Habits and Loyalty</h3>
        <p>Consistency in publishing schedule and content quality helps build listening habits. Loyal listeners often become advocates who share your content with others.</p>
      `,
      image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=450&fit=crop",
      category: "psychology",
      author: "Dr. Lisa Park",
      date: "2024-05-08",
      time: "3:30 PM",
      readTime: "12 min read",
      tags: ["psychology", "audience", "research"],
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Posts', icon: '📚' },
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'storytelling', name: 'Storytelling', icon: '📖' },
    { id: 'branding', name: 'Branding', icon: '🎨' },
    { id: 'monetization', name: 'Monetization', icon: '💰' },
    { id: 'interviews', name: 'Interviews', icon: '🎤' },
    { id: 'psychology', name: 'Psychology', icon: '🧠' }
  ];

  // Filter posts based on category and search
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Sort posts by date and time (latest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB - dateA; // Latest first
  });

  const featuredPost = selectedCategory === 'all' ? sortedPosts.find(post => post.featured) : null;
  const regularPosts = selectedCategory === 'all' 
    ? sortedPosts.filter(post => !post.featured)
    : sortedPosts;

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
              src={currentPost.image}
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
                  {currentPost.tags.map((tag) => (
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
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
                  src={featuredPost.image}
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
                  {featuredPost.tags.map((tag) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
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
                  {post.tags.slice(0, 3).map((tag) => (
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

        {/* No Results Message */}
        {regularPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Load More Button */}
        {regularPosts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-4 rounded-full font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Load More Posts
            </button>
          </div>
        )}
      </div>

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