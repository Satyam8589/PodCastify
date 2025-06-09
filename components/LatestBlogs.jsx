"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const LatestBlogs = ({ posts }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the latest blog posts from the same API used by PodcastBlog
  const fetchLatestPosts = async () => {
    try {
      setLoading(true);
      
      // Use absolute URL for Vercel deployment
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/blog?limit=3&sort=latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache control for better reliability
        cache: 'no-cache'
      });
      
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
      console.error('Error fetching latest blog posts:', err);
      setError(err.message);
      // Fallback to props if API fails
      if (posts && Array.isArray(posts)) {
        const latestFromProps = posts.length > 3
          ? posts.slice(-3).reverse()
          : [...posts].reverse();
        setBlogPosts(latestFromProps);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  // Determine which posts to display
  const getDisplayPosts = () => {
    // If we have fetched posts from API, use those
    if (blogPosts.length > 0) {
      return blogPosts.slice(0, 3);
    }
    
    // Fallback to props if provided
    if (posts && Array.isArray(posts)) {
      const latestFromProps = posts.length > 3
        ? posts.slice(-3).reverse()
        : [...posts].reverse();
      return latestFromProps;
    }
    
    return [];
  };

  const displayPosts = getDisplayPosts();

  // Format date function (same as PodcastBlog)
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get category color function (same as PodcastBlog)
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

  // Generate the correct URL for each post - FIXED VERSION
  const getPostUrl = (post) => {
    // Debug: Log the post data to see what we're working with
    console.log('Generating URL for post:', post);
    
    // Priority order: 
    // 1. Use direct link if provided and valid
    if (post.link && post.link.trim() !== '' && post.link.startsWith('/')) {
      return post.link;
    }
    
    // 2. Use slug if available (most reliable for dynamic routing)
    if (post.slug && post.slug.trim() !== '') {
      return `/blogs/${encodeURIComponent(post.slug)}`;
    }
    
    // 3. Use _id if available (MongoDB ObjectId or similar)
    if (post._id && post._id.trim() !== '') {
      return `/blogs/${encodeURIComponent(post._id)}`;
    }
    
    // 4. Use id if available (fallback)
    if (post.id && post.id.toString().trim() !== '') {
      return `/blogs/${encodeURIComponent(post.id)}`;
    }
    
    // 5. Last resort - use title as slug
    if (post.title && post.title.trim() !== '') {
      const titleSlug = post.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return `/blogs/${encodeURIComponent(titleSlug)}`;
    }
    
    // Final fallback to blogs page
    console.warn('Post missing valid URL identifiers, redirecting to blogs page:', post);
    return '/blogs';
  };

  // Handle click with error handling
  const handlePostClick = (e, post) => {
    const url = getPostUrl(post);
    
    // If URL is just '/blogs', prevent default and handle gracefully
    if (url === '/blogs') {
      e.preventDefault();
      console.warn('Invalid post URL, staying on blogs page');
      // Optionally show a toast or alert
      if (typeof window !== 'undefined') {
        alert('This post is not available. Please try again later.');
      }
      return false;
    }
  };

  return (
    <section className="px-4 md:px-12 lg:px-24 py-12 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C24]">
          Latest Blogs
        </h2>
        <Link
          href="/blogs"
          className="text-sm text-[#5E5ADB] font-semibold hover:underline"
        >
          Read All →
        </Link>
      </div>

      {loading ? (
        // Loading state
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white animate-pulse">
              <div className="w-full h-48 bg-gray-300"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayPosts.length > 0 ? (
        // Posts grid
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayPosts.map((post) => {
            const postUrl = getPostUrl(post);
            const postKey = post._id || post.id || post.slug || `post-${Math.random()}`;
            
            return (
              <div
                key={postKey}
                className="rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative">
                  <Image
                    src={post.image?.url || post.image || '/placeholder-blog.jpg'}
                    alt={post.title || 'Blog post'}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-blog.jpg';
                    }}
                  />
                  {post.category && (
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    {post.date && <span>{formatDate(post.date)}</span>}
                    {post.readTime && (
                      <>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-black mb-2 leading-tight">
                    {post.title || 'Untitled Post'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt || post.description || 'No description available.'}
                  </p>
                  
                  {post.author && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-600">{post.author}</span>
                    </div>
                  )}
                  
                  <Link
                    href={postUrl}
                    onClick={(e) => handlePostClick(e, post)}
                    className="inline-block text-[#5E5ADB] font-semibold text-sm hover:underline transition-colors duration-200"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // No posts state
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600">Check back soon for the latest updates!</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">Error: {error}</p>
          )}
        </div>
      )}
    </section>
  );
};

export default LatestBlogs;