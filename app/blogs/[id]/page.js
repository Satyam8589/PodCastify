import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import BlogImage from './BlogImage'; // Import from separate file

// Fetch blog post data with better error handling
async function getBlogPost(id) {
  try {
    // Use absolute URL for Vercel deployment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';
    
    console.log(`Fetching blog post from: ${baseUrl}/api/blog?id=${id}`);
    
    const response = await fetch(`${baseUrl}/api/blog?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
      // Add timeout for Vercel
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch blog post: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const result = await response.json();
    console.log('API Response:', result);
    
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Generate static params for better Vercel deployment (optional)
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/blog`);
    
    if (!response.ok) {
      return [];
    }
    
    const result = await response.json();
    const posts = result.success ? result.data : [];
    
    return posts.map((post) => ({
      id: post.slug || post._id || post.id?.toString() || '',
    })).filter(param => param.id !== '');
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO with better error handling
export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.id);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }
  
  return {
    title: post.title || 'Blog Post',
    description: post.excerpt || post.description || 'Read this blog post',
    openGraph: {
      title: post.title || 'Blog Post',
      description: post.excerpt || post.description || 'Read this blog post',
      images: post.image ? [{ url: post.image }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title || 'Blog Post',
      description: post.excerpt || post.description || 'Read this blog post',
      images: post.image ? [post.image] : [],
    },
  };
}

// Get category color function (same as your component)
function getCategoryColor(category) {
  const colors = {
    'getting-started': 'bg-green-100 text-green-800',
    'storytelling': 'bg-purple-100 text-purple-800',
    'branding': 'bg-pink-100 text-pink-800',
    'monetization': 'bg-yellow-100 text-yellow-800',
    'interviews': 'bg-blue-100 text-blue-800',
    'psychology': 'bg-red-100 text-red-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
}

// Format date function with error handling
function formatDate(dateString) {
  try {
    if (!dateString) return 'No date';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

// Main page component with better error handling
export default async function BlogPostPage({ params }) {
  // Decode the ID parameter to handle URL encoding
  const decodedId = decodeURIComponent(params.id);
  console.log(`Blog post page requested for ID: ${decodedId}`);
  
  const post = await getBlogPost(decodedId);
  
  if (!post) {
    console.log(`Blog post not found for ID: ${decodedId}`);
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/blogs" 
            className="text-[#5E5ADB] hover:underline font-medium inline-flex items-center gap-2"
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Blogs
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
                {post.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
          )}
          
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1C1C24] mb-4 leading-tight">
            {post.title || 'Untitled Post'}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{post.author}</span>
              </div>
            )}
            
            {post.date && (
              <>
                <span className="text-gray-400">•</span>
                <span>{formatDate(post.date)}</span>
              </>
            )}
            
            {post.readTime && (
              <>
                <span className="text-gray-400">•</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
          
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}
        </header>
        
        {/* Featured Image */}
        {post.image && (
          <div className="mb-8">
            <BlogImage
              src={post.image}
              alt={post.title || 'Blog post image'}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              priority={true}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content ? (
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="text-gray-800 leading-relaxed"
            />
          ) : (
            <div className="text-gray-600 italic">
              No content available for this post.
            </div>
          )}
        </div>
        
        {/* Tags */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link 
              href="/blogs" 
              className="text-[#5E5ADB] hover:underline font-medium inline-flex items-center gap-2"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              All Posts
            </Link>
            
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(post.updatedAt || post.date)}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}