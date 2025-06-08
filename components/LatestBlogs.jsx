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
      const response = await fetch('/api/blog?limit=3&sort=latest');
      
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
          {displayPosts.map((post) => (
            <div
              key={post._id || post.id}
              className="rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative">
                <Image
                  src={post.image?.url || post.image}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
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
                  {post.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt || post.description}
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
                  href={post.link || `/blogs/${post.slug || post._id || post.id}`}
                  className="text-[#5E5ADB] font-semibold text-sm hover:underline transition-colors duration-200"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // No posts state
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600">Check back soon for the latest updates!</p>
        </div>
      )}
    </section>
  );
};

export default LatestBlogs;