import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Conditional imports to handle missing dependencies gracefully
let connectToDatabase, ObjectId;
try {
  connectToDatabase = require('@/lib/config/mongodb').connectToDatabase;
  ObjectId = require('mongodb').ObjectId;
} catch (error) {
  console.warn('MongoDB dependencies not found. Using fallback storage.');
}

// In-memory fallback storage for development/testing
let memoryStore = [];
let isInitialized = false;

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

// Helper function to parse request data (both JSON and FormData)
async function parseRequestData(request) {
  try {
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
  } catch (error) {
    console.error('Error parsing request data:', error);
    throw error;
  }
}

// Initialize with sample data
async function initializeData() {
  if (isInitialized) return;
  
  try {
    // Try MongoDB first
    if (connectToDatabase && process.env.MONGODB_URI) {
      const { db } = await connectToDatabase();
      const collection = db.collection('blogPosts');
      
      const count = await collection.countDocuments();
      
      if (count === 0) {
        const initialData = {
          title: 'Getting Started with Podcasting: A Complete Beginner\'s Guide',
          excerpt: 'Learn the fundamentals of podcasting, from choosing your niche to recording your first episode.',
          content: '<h2>Welcome to the World of Podcasting</h2><p>Starting a podcast can seem overwhelming, but with the right guidance, anyone can create compelling audio content.</p><p>This comprehensive guide will walk you through everything you need to know to launch your first podcast episode.</p><h3>Choosing Your Niche</h3><p>The first step in creating a successful podcast is identifying your niche. Consider your passions, expertise, and what unique perspective you can bring to your audience.</p><h3>Essential Equipment</h3><p>You don\'t need expensive equipment to start. A good USB microphone, headphones, and recording software like Audacity (free) or GarageBand are sufficient for beginners.</p><h3>Recording Your First Episode</h3><p>Plan your content, create an outline, and practice speaking clearly. Remember, your first episode doesn\'t have to be perfect – it just needs to be authentic and valuable to your audience.</p>',
          category: 'getting-started',
          author: 'Sarah Johnson',
          date: new Date('2024-03-15T09:30:00.000Z'),
          time: '09:30 AM',
          readTime: '8 min read',
          image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          tags: ['beginner', 'equipment', 'recording', 'publishing'],
          featured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await collection.insertOne(initialData);
        console.log('MongoDB collection initialized with sample data');
      }
    } else {
      // Fallback to memory storage
      if (memoryStore.length === 0) {
        memoryStore.push({
          _id: 'sample-post-1',
          title: 'Getting Started with Podcasting: A Complete Beginner\'s Guide',
          excerpt: 'Learn the fundamentals of podcasting, from choosing your niche to recording your first episode.',
          content: '<h2>Welcome to the World of Podcasting</h2><p>Starting a podcast can seem overwhelming, but with the right guidance, anyone can create compelling audio content.</p>',
          category: 'getting-started',
          author: 'Sarah Johnson',
          date: new Date('2024-03-15T09:30:00.000Z'),
          time: '09:30 AM',
          readTime: '8 min read',
          image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          tags: ['beginner', 'equipment', 'recording', 'publishing'],
          featured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Memory store initialized with sample data');
      }
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Error initializing data:', error);
    // Continue with empty data rather than failing
    isInitialized = true;
  }
}

// Validate ObjectId
function isValidObjectId(id) {
  return ObjectId && ObjectId.isValid && ObjectId.isValid(id);
}

// Generate a simple ID for memory storage
function generateId() {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
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

    // Initialize data
    await initializeData();

    // Try MongoDB first
    if (connectToDatabase && process.env.MONGODB_URI) {
      try {
        const { db } = await connectToDatabase();
        const collection = db.collection('blogPosts');

        // If requesting a specific post by ID
        if (id) {
          let post;
          
          if (isValidObjectId(id)) {
            post = await collection.findOne({ _id: new ObjectId(id) });
          } else {
            post = await collection.findOne({ _id: id });
          }
          
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

        // Build query for filtering
        let query = {};
        
        if (category && category !== 'all') {
          query.category = category;
        }

        if (featured === 'true') {
          query.featured = true;
        }

        if (search) {
          const searchRegex = new RegExp(search, 'i');
          query.$or = [
            { title: searchRegex },
            { excerpt: searchRegex },
            { tags: { $in: [searchRegex] } }
          ];
        }

        const posts = await collection
          .find(query)
          .sort({ date: -1 })
          .toArray();

        console.log(`Returning ${posts.length} posts from MongoDB`);

        return NextResponse.json({
          success: true,
          data: posts,
          timestamp: new Date().toISOString()
        });

      } catch (mongoError) {
        console.error('MongoDB error, falling back to memory storage:', mongoError);
        // Fall through to memory storage
      }
    }

    // Fallback to memory storage
    let posts = [...memoryStore];

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

    // Apply filters for memory storage
    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category);
    }

    if (featured === 'true') {
      posts = posts.filter(post => post.featured === true);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`Returning ${posts.length} posts from memory storage`);

    return NextResponse.json({
      success: true,
      data: posts,
      timestamp: new Date().toISOString(),
      storage: 'memory'
    });

  } catch (error) {
    console.error('Error in blog GET API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog posts',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request) {
  try {
    console.log('Blog API POST called');

    const data = await parseRequestData(request);
    
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
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'getting-started',
      author: author.trim(),
      date: new Date(date + 'T' + time),
      time: time,
      readTime: readTime.trim(),
      image: imageUrl,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Try MongoDB first
    if (connectToDatabase && process.env.MONGODB_URI) {
      try {
        const { db } = await connectToDatabase();
        const collection = db.collection('blogPosts');
        const result = await collection.insertOne(newPost);

        const createdPost = {
          ...newPost,
          _id: result.insertedId
        };

        console.log('New blog post created in MongoDB:', createdPost.title);

        return NextResponse.json({
          success: true,
          message: 'Blog post published successfully!',
          data: createdPost
        });
      } catch (mongoError) {
        console.error('MongoDB error, falling back to memory storage:', mongoError);
        // Fall through to memory storage
      }
    }

    // Fallback to memory storage
    const createdPost = {
      ...newPost,
      _id: generateId()
    };

    memoryStore.push(createdPost);

    console.log('New blog post created in memory storage:', createdPost.title);

    return NextResponse.json({
      success: true,
      message: 'Blog post published successfully!',
      data: createdPost,
      storage: 'memory'
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

    // Try MongoDB first
    if (connectToDatabase && process.env.MONGODB_URI) {
      try {
        const { db } = await connectToDatabase();
        const collection = db.collection('blogPosts');

        let existingPost;
        if (isValidObjectId(id)) {
          existingPost = await collection.findOne({ _id: new ObjectId(id) });
        } else {
          existingPost = await collection.findOne({ _id: id });
        }

        if (!existingPost) {
          return NextResponse.json(
            { success: false, error: 'Post not found' },
            { status: 404 }
          );
        }

        let imageUrl = existingPost.image;
        
        if (!keepCurrentImage && thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
          const uploadedPath = await saveFile(thumbnail, 'blog-images');
          if (uploadedPath) {
            imageUrl = uploadedPath;
          }
        }

        const updateData = {
          title: title.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category: category || 'getting-started',
          author: author.trim(),
          date: new Date(date + 'T' + time),
          time: time,
          readTime: readTime.trim(),
          image: imageUrl,
          tags: Array.isArray(tags) ? tags : [],
          featured: Boolean(featured),
          updatedAt: new Date()
        };

        const result = await collection.updateOne(
          { _id: existingPost._id },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return NextResponse.json(
            { success: false, error: 'Post not found' },
            { status: 404 }
          );
        }

        const updatedPost = await collection.findOne({ _id: existingPost._id });

        console.log('Blog post updated in MongoDB:', updatedPost.title);

        return NextResponse.json({
          success: true,
          message: 'Blog post updated successfully!',
          data: updatedPost
        });

      } catch (mongoError) {
        console.error('MongoDB error, falling back to memory storage:', mongoError);
        // Fall through to memory storage
      }
    }

    // Fallback to memory storage
    const postIndex = memoryStore.findIndex(p => p._id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const existingPost = memoryStore[postIndex];
    let imageUrl = existingPost.image;
    
    if (!keepCurrentImage && thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
      const uploadedPath = await saveFile(thumbnail, 'blog-images');
      if (uploadedPath) {
        imageUrl = uploadedPath;
      }
    }

    const updatedPost = {
      ...existingPost,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'getting-started',
      author: author.trim(),
      date: new Date(date + 'T' + time),
      time: time,
      readTime: readTime.trim(),
      image: imageUrl,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      updatedAt: new Date()
    };

    memoryStore[postIndex] = updatedPost;

    console.log('Blog post updated in memory storage:', updatedPost.title);

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully!',
      data: updatedPost,
      storage: 'memory'
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
    console.log('Blog API DELETE called');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Try MongoDB first
    if (connectToDatabase && process.env.MONGODB_URI) {
      try {
        const { db } = await connectToDatabase();
        const collection = db.collection('blogPosts');

        let result;
        if (isValidObjectId(id)) {
          result = await collection.deleteOne({ _id: new ObjectId(id) });
        } else {
          result = await collection.deleteOne({ _id: id });
        }

        if (result.deletedCount === 0) {
          return NextResponse.json(
            { success: false, error: 'Post not found' },
            { status: 404 }
          );
        }

        console.log('Blog post deleted from MongoDB, ID:', id);

        return NextResponse.json({
          success: true,
          message: 'Blog post deleted successfully!'
        });

      } catch (mongoError) {
        console.error('MongoDB error, falling back to memory storage:', mongoError);
        // Fall through to memory storage
      }
    }

    // Fallback to memory storage
    const postIndex = memoryStore.findIndex(p => p._id === id);
    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    memoryStore.splice(postIndex, 1);

    console.log('Blog post deleted from memory storage, ID:', id);

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully!',
      storage: 'memory'
    });

  } catch (error) {
    console.error('Error in blog DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}