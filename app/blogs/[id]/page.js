import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

// Fetch blog post data
async function getBlogPost(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog?id=${id}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Generate metadata for SEO (optional but recommended)
export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.id);
  
  if (!post) {
    return {
      title: 'Post Not Found'
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
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

// Format date function
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Main page component
export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.id);
  
  if (!post) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/blogs" 
            className="text-[#5E5ADB] hover:underline font-medium"
          >
            ← Back to Blogs
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
            {post.title}
          </h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            {post.author && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {post.author.charAt(0)}
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
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        )}
        
        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: post.content }}
            className="text-gray-800 leading-relaxed"
          />
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
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
              className="text-[#5E5ADB] hover:underline font-medium"
            >
              ← All Posts
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