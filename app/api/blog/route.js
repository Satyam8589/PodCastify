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
          createdAt: '2024-03-15T09:30:00.000Z'
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

// GET - Fetch blog posts
export async function GET(request) {
  try {
    console.log('Blog API GET called');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let posts = await readBlogPosts();
    
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

    console.log(`Returning ${posts.length} posts from file storage`);

    return NextResponse.json({
      success: true,
      data: posts,
      timestamp: new Date().toISOString() // Add timestamp for debugging
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

    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title');
    const excerpt = formData.get('excerpt');
    const content = formData.get('content');
    const category = formData.get('category');
    const author = formData.get('author');
    const date = formData.get('date');
    const time = formData.get('time');
    const readTime = formData.get('readTime');
    const featured = formData.get('featured') === 'true';
    const tagsString = formData.get('tags');
    const thumbnail = formData.get('thumbnail');

    // Validate required fields
    if (!title || !excerpt || !content || !author || !date || !time || !readTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse tags
    let tags = [];
    try {
      tags = tagsString ? JSON.parse(tagsString) : [];
    } catch (e) {
      console.warn('Failed to parse tags:', tagsString);
      tags = [];
    }

    // Handle thumbnail upload
    let imageUrl = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
    
    if (thumbnail && thumbnail.size > 0) {
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
      featured: featured,
      createdAt: new Date().toISOString()
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