import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';
import { connectToDatabase } from '@/lib/config/mongodb';
import { ObjectId } from 'mongodb';

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

// Initialize database with sample data
async function initializeBlogData() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('blogPosts');
    
    // Check if collection is empty
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
      console.log('Blog collection initialized with sample data');
    }
  } catch (error) {
    console.error('Error initializing blog data:', error);
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

    const { db } = await connectToDatabase();
    const collection = db.collection('blogPosts');
    
    // Initialize if needed
    await initializeBlogData();

    // If requesting a specific post by ID
    if (id) {
      let post;
      
      // Try to find by ObjectId first, then by string ID
      try {
        post = await collection.findOne({ _id: new ObjectId(id) });
      } catch (error) {
        // If ObjectId conversion fails, try finding by string ID
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
    
    // Apply filters
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

    // Fetch posts with sorting (newest first)
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

    // Insert into MongoDB
    const { db } = await connectToDatabase();
    const collection = db.collection('blogPosts');
    const result = await collection.insertOne(newPost);

    // Add the generated _id to the response
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

    const { db } = await connectToDatabase();
    const collection = db.collection('blogPosts');

    // Find existing post
    let existingPost;
    try {
      existingPost = await collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      // If ObjectId conversion fails, try finding by string ID
      existingPost = await collection.findOne({ _id: id });
    }

    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Handle thumbnail upload
    let imageUrl = existingPost.image; // Keep existing image by default
    
    if (!keepCurrentImage && thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
      const uploadedPath = await saveFile(thumbnail, 'blog-images');
      if (uploadedPath) {
        imageUrl = uploadedPath;
      }
    }

    // Prepare update data
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

    // Update the post in MongoDB
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

    // Get the updated post
    const updatedPost = await collection.findOne({ _id: existingPost._id });

    console.log('Blog post updated in MongoDB:', updatedPost.title);

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

    const { db } = await connectToDatabase();
    const collection = db.collection('blogPosts');

    // Delete the post
    let result;
    try {
      result = await collection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      // If ObjectId conversion fails, try deleting by string ID
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

  } catch (error) {
    console.error('Error in blog DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}