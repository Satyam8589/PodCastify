import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Mock blog data that will work immediately
let mockBlogPosts = [
  {
    _id: '1',
    title: 'Getting Started with Podcasting: A Complete Beginner\'s Guide',
    excerpt: 'Learn the fundamentals of podcasting, from choosing your niche to recording your first episode. This comprehensive guide covers everything you need to know to start your podcasting journey.',
    content: `
      <h2>Welcome to the World of Podcasting</h2>
      <p>Starting a podcast can seem overwhelming, but with the right guidance, anyone can create compelling audio content that resonates with their audience.</p>
      
      <h3>1. Finding Your Niche</h3>
      <p>The first step in creating a successful podcast is identifying your unique voice and topic. Consider what you're passionate about and what expertise you can share with others.</p>
      
      <h3>2. Essential Equipment</h3>
      <p>You don't need expensive equipment to start. A quality USB microphone, quiet recording space, and free editing software like Audacity can get you started.</p>
      
      <h3>3. Planning Your Content</h3>
      <p>Successful podcasts have a clear structure and consistent format. Plan your episodes in advance and create an outline to keep your content focused and engaging.</p>
      
      <h3>4. Recording Best Practices</h3>
      <p>Good audio quality is crucial. Record in a quiet space, speak clearly, and always do a test recording to check your levels before starting your actual episode.</p>
      
      <h3>5. Publishing and Promotion</h3>
      <p>Once your episode is edited, you'll need a hosting platform to distribute your podcast to major platforms like Apple Podcasts, Spotify, and Google Podcasts.</p>
    `,
    category: 'getting-started',
    author: 'Sarah Johnson',
    date: '2024-03-15T09:30:00.000Z',
    time: '09:30 AM',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['beginner', 'equipment', 'recording', 'publishing'],
    featured: true,
    createdAt: '2024-03-15T09:30:00.000Z'
  },
  {
    _id: '2',
    title: 'The Art of Storytelling in Podcasting',
    excerpt: 'Master the techniques that turn ordinary conversations into compelling narratives that keep listeners coming back for more.',
    content: `
      <h2>Why Storytelling Matters</h2>
      <p>Great podcasts aren't just about sharing information—they're about creating an emotional connection with your audience through compelling storytelling.</p>
      
      <h3>The Three-Act Structure</h3>
      <p>Every great story has a beginning, middle, and end. Apply this structure to your podcast episodes for maximum impact.</p>
      
      <h3>Character Development</h3>
      <p>Whether you're interviewing guests or sharing personal experiences, focus on developing the characters in your stories.</p>
      
      <h3>Conflict and Resolution</h3>
      <p>Tension keeps listeners engaged. Introduce problems, challenges, or questions early and resolve them throughout your episode.</p>
      
      <h3>Using Your Voice Effectively</h3>
      <p>Your voice is your primary storytelling tool. Learn to use pacing, tone, and emphasis to enhance your narratives.</p>
    `,
    category: 'storytelling',
    author: 'Michael Chen',
    date: '2024-03-12T14:15:00.000Z',
    time: '02:15 PM',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['storytelling', 'narrative', 'engagement'],
    featured: false,
    createdAt: '2024-03-12T14:15:00.000Z'
  },
  {
    _id: '3',
    title: 'Building Your Podcast Brand: Visual Identity and Voice',
    excerpt: 'Create a memorable brand that stands out in the crowded podcast landscape with these proven branding strategies.',
    content: `
      <h2>Your Brand is Your Promise</h2>
      <p>A strong podcast brand communicates what listeners can expect from your show before they even press play.</p>
      
      <h3>Visual Elements</h3>
      <p>Your podcast artwork, website, and social media should all work together to create a cohesive visual identity.</p>
      
      <h3>Voice and Tone</h3>
      <p>Develop a consistent voice that reflects your personality and resonates with your target audience.</p>
      
      <h3>Consistency is Key</h3>
      <p>Maintain consistency across all touchpoints to build trust and recognition with your audience.</p>
      
      <h3>Brand Guidelines</h3>
      <p>Create a simple brand guide that outlines your colors, fonts, voice, and key messaging to maintain consistency.</p>
    `,
    category: 'branding',
    author: 'Emily Rodriguez',
    date: '2024-03-10T11:00:00.000Z',
    time: '11:00 AM',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['branding', 'design', 'identity'],
    featured: false,
    createdAt: '2024-03-10T11:00:00.000Z'
  },
  {
    _id: '4',
    title: 'Monetizing Your Podcast: Beyond Traditional Advertising',
    excerpt: 'Explore innovative revenue streams that can turn your passion project into a profitable business venture.',
    content: `
      <h2>Multiple Revenue Streams</h2>
      <p>Successful podcast monetization often involves diversifying your income sources rather than relying on a single method.</p>
      
      <h3>Sponsorships and Partnerships</h3>
      <p>Build authentic partnerships with brands that align with your values and audience interests.</p>
      
      <h3>Premium Content</h3>
      <p>Offer exclusive content, early access, or ad-free episodes to subscribers willing to pay for premium experiences.</p>
      
      <h3>Merchandise and Products</h3>
      <p>Create physical or digital products that extend your brand and provide additional value to your audience.</p>
      
      <h3>Community Building</h3>
      <p>Build a community around your podcast through memberships, forums, or exclusive events.</p>
    `,
    category: 'monetization',
    author: 'David Park',
    date: '2024-03-08T16:45:00.000Z',
    time: '04:45 PM',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['monetization', 'business', 'revenue'],
    featured: false,
    createdAt: '2024-03-08T16:45:00.000Z'
  },
  {
    _id: '5',
    title: 'Interview Techniques That Get Great Responses',
    excerpt: 'Learn the questioning strategies and conversation techniques that help you extract compelling stories from your guests.',
    content: `
      <h2>The Art of the Interview</h2>
      <p>Great interviews feel like natural conversations, but they require careful preparation and skillful execution.</p>
      
      <h3>Research Your Guest</h3>
      <p>Understanding your guest's background allows you to ask more thoughtful, specific questions that others might miss.</p>
      
      <h3>Open-Ended Questions</h3>
      <p>Ask questions that begin with "how," "why," or "what" to encourage detailed responses rather than simple yes/no answers.</p>
      
      <h3>Active Listening</h3>
      <p>Listen not just for answers, but for opportunities to dig deeper into interesting topics your guest mentions.</p>
      
      <h3>Creating Comfort</h3>
      <p>Help your guests feel comfortable and relaxed to get their best, most authentic responses.</p>
    `,
    category: 'interviews',
    author: 'Lisa Thompson',
    date: '2024-03-05T13:20:00.000Z',
    time: '01:20 PM',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['interviews', 'conversation', 'questions'],
    featured: false,
    createdAt: '2024-03-05T13:20:00.000Z'
  },
  {
    _id: '6',
    title: 'The Psychology of Podcast Listening: What Keeps People Engaged',
    excerpt: 'Understand the psychological factors that influence listener behavior and how to leverage them in your content.',
    content: `
      <h2>Understanding Your Audience's Mind</h2>
      <p>Successful podcasters understand not just what their audience wants to hear, but why they want to hear it.</p>
      
      <h3>The Intimacy Factor</h3>
      <p>Podcasts create a uniquely intimate experience. Listeners often feel like they're having a personal conversation with the host.</p>
      
      <h3>Habit Formation</h3>
      <p>Regular publishing schedules help create listening habits, making your podcast part of your audience's routine.</p>
      
      <h3>Social Connection</h3>
      <p>People use podcasts to feel connected to communities and ideas that matter to them.</p>
      
      <h3>Emotional Triggers</h3>
      <p>Understanding what emotions drive your audience helps you create more compelling and relevant content.</p>
    `,
    category: 'psychology',
    author: 'Dr. Amanda Foster',
    date: '2024-03-03T10:30:00.000Z',
    time: '10:30 AM',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    tags: ['psychology', 'engagement', 'behavior'],
    featured: false,
    createdAt: '2024-03-03T10:30:00.000Z'
  }
];

// Helper function to save uploaded files
async function saveFile(file, folder = 'uploads') {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', folder);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileName = `${Date.now()}-${uuidv4()}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
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

    console.log('Filters:', { category, search, featured });

    let filteredPosts = [...mockBlogPosts];

    // Filter by category
    if (category && category !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by featured
    if (featured === 'true') {
      filteredPosts = filteredPosts.filter(post => post.featured === true);
    }

    console.log(`Returning ${filteredPosts.length} posts`);

    return NextResponse.json({
      success: true,
      data: filteredPosts
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

    // Parse form data
    const formData = await request.formData();
    
    // Extract all form fields
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
    let imageUrl = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'; // Default image
    
    if (thumbnail && thumbnail.size > 0) {
      try {
        imageUrl = await saveFile(thumbnail, 'blog-images');
      } catch (error) {
        console.error('Error uploading thumbnail:', error);
        // Continue with default image if upload fails
      }
    }

    // Create new blog post object
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

    // Add to mock data (in a real app, you'd save to database)
    mockBlogPosts.unshift(newPost);

    console.log('New blog post created:', newPost.title);

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

// DELETE - Delete blog post (optional, for future use)
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

    // Find and remove the post
    const initialLength = mockBlogPosts.length;
    mockBlogPosts = mockBlogPosts.filter(post => post._id !== id);

    if (mockBlogPosts.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

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