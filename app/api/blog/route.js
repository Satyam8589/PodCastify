import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// Path to store blog posts
const BLOG_DATA_PATH = join(process.cwd(), 'data', 'blog-posts.json');

// Initialize blog data file if it doesn't exist
async function initializeBlogData() {
  try {
    const dataDir = join(process.cwd(), 'data');
    
    // Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // Create blog data file with initial data if it doesn't exist
    if (!existsSync(BLOG_DATA_PATH)) {
      const initialData = [
        {
          _id: '1',
          title: 'Getting Started with Podcasting: A Complete Beginner\'s Guide',
          excerpt: 'Learn the fundamentals of podcasting, from choosing your niche to recording your first episode.',
          content: '<h2>Welcome to the World of Podcasting</h2><p>Starting a podcast can seem overwhelming, but with the right guidance, anyone can create compelling audio content.</p>',
          category: 'getting-started',
          author: 'Sarah Johnson',
          date: '2024-03-15T09:30:00.000Z',
          time: '09:30 AM',
          readTime: '8 min read',
          image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          tags: ['beginner', 'equipment', 'recording', 'publishing'],
          featured: true,
          createdAt: '2024-03-15T09:30:00.000Z',
          updatedAt: '2024-03-15T09:30:00.000Z'
        }
      ];
      
      await writeFile(BLOG_DATA_PATH, JSON.stringify(initialData, null, 2));
      console.log('Blog data file initialized');
    }
  } catch (error) {
    console.error('Error initializing blog data:', error);
  }
}

// Read blog posts from file
async function readBlogPosts() {
  try {
    await initializeBlogData();
    const data = await readFile(BLOG_DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

// Write blog posts to file
async function writeBlogPosts(posts) {
  try {
    await writeFile(BLOG_DATA_PATH, JSON.stringify(posts, null, 2));
    console.log('Blog posts saved to file');
  } catch (error) {
    console.error('Error writing blog posts:', error);
    throw error;
  }
}

// Helper function to save uploaded files
async function saveFile(file, folder = 'uploads') {
  try {
    const uploadDir = join(process.cwd(), 'public', folder);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${uuidv4()}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
}

// Helper function to check if request has form data
function isFormDataRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  return contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded');
}

// Helper function to parse request data (both JSON and FormData)
async function parseRequestData(request) {
  const contentType = request.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    return await request.json();
  } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === 'tags' && typeof value === 'string') {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = [];
        }
      } else if (key === 'featured') {
        data[key] = value === 'true';
      } else if (value instanceof File) {
        data[key] = value;
      } else {
        data[key] = value;
      }
    }
    
    return data;
  } else {
    throw new Error('Unsupported content type');
  }
}

// GET - Fetch blog posts
export async function GET(request) {
  try {
    console.log('Blog API GET called');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const id = searchParams.get('id');

    let posts = await readBlogPosts();
    
    // If requesting a specific post by ID
    if (id) {
      const post = posts.find(p => p._id === id);
      if (!post) {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: post
      });
    }
    
    // Apply filters
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (featured === 'true') {
      posts = posts.filter(post => post.featured === true);
    }

    // Sort posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`Returning ${posts.length} posts from file storage`);

    return NextResponse.json({
      success: true,
      data: posts,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in blog GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request) {
  try {
    console.log('Blog API POST called');

    const data = await parseRequestData(request);
    
    // Extract fields
    const {
      title,
      excerpt,
      content,
      category,
      author,
      date,
      time,
      readTime,
      featured,
      tags,
      thumbnail
    } = data;

    // Validate required fields
    if (!title || !excerpt || !content || !author || !date || !time || !readTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle thumbnail upload
    let imageUrl = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    
    if (thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
      const uploadedPath = await saveFile(thumbnail, 'blog-images');
      if (uploadedPath) {
        imageUrl = uploadedPath;
      }
    }

    // Create new blog post
    const newPost = {
      _id: uuidv4(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'getting-started',
      author: author.trim(),
      date: new Date(date + 'T' + time).toISOString(),
      time: time,
      readTime: readTime.trim(),
      image: imageUrl,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Read existing posts and add new one
    const existingPosts = await readBlogPosts();
    const updatedPosts = [newPost, ...existingPosts];
    
    // Save to file
    await writeBlogPosts(updatedPosts);

    console.log('New blog post created and saved:', newPost.title);

    return NextResponse.json({
      success: true,
      message: 'Blog post published successfully!',
      data: newPost
    });

  } catch (error) {
    console.error('Error in blog POST API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create blog post'
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing blog post
export async function PUT(request) {
  try {
    console.log('Blog API PUT called');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const data = await parseRequestData(request);
    
    // Extract fields
    const {
      title,
      excerpt,
      content,
      category,
      author,
      date,
      time,
      readTime,
      featured,
      tags,
      thumbnail,
      keepCurrentImage
    } = data;

    // Validate required fields
    if (!title || !excerpt || !content || !author || !date || !time || !readTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read existing posts
    const posts = await readBlogPosts();
    const existingPostIndex = posts.findIndex(post => post._id === id);

    if (existingPostIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const existingPost = posts[existingPostIndex];

    // Handle thumbnail upload
    let imageUrl = existingPost.image; // Keep existing image by default
    
    if (!keepCurrentImage && thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
      const uploadedPath = await saveFile(thumbnail, 'blog-images');
      if (uploadedPath) {
        imageUrl = uploadedPath;
      }
    }

    // Update the post
    const updatedPost = {
      ...existingPost,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'getting-started',
      author: author.trim(),
      date: new Date(date + 'T' + time).toISOString(),
      time: time,
      readTime: readTime.trim(),
      image: imageUrl,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      updatedAt: new Date().toISOString()
    };

    // Replace the post in the array
    posts[existingPostIndex] = updatedPost;
    
    // Save to file
    await writeBlogPosts(posts);

    console.log('Blog post updated:', updatedPost.title);

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully!',
      data: updatedPost
    });

  } catch (error) {
    console.error('Error in blog PUT API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update blog post'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const posts = await readBlogPosts();
    const initialLength = posts.length;
    const updatedPosts = posts.filter(post => post._id !== id);

    if (updatedPosts.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    await writeBlogPosts(updatedPosts);

    console.log('Blog post deleted, ID:', id);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully!'
    });

  } catch (error) {
    console.error('Error in blog DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}