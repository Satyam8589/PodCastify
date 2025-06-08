// app/api/podcast/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// File path for storing podcast data
const dataFilePath = path.join(process.cwd(), "data", "podcasts.json");

// Ensure data directory exists
const ensureDataDirectory = () => {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory:', dataDir);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('Error creating data directory:', error);
    return false;
  }
};

// Read existing podcast data
const readPodcastData = () => {
  try {
    console.log('Reading podcast data from:', dataFilePath);
    
    if (!ensureDataDirectory()) {
      throw new Error('Failed to create data directory');
    }
    
    if (!fs.existsSync(dataFilePath)) {
      console.log('Podcast data file does not exist, creating with default data');
      // Create initial file with default podcasts if it doesn't exist
      const defaultPodcasts = [
        {
          id: "1",
          title: "Why AI is Eating the World",
          description: "Exploring the rise of artificial intelligence and its impact on society",
          date: "May 25, 2025",
          time: "10:00 AM",
          thumbnail: "/images/ai-world.jpg",
          podcastLink: "https://example.com/ai-world-podcast",
          createdAt: new Date().toISOString()
        },
        {
          id: "2",
          title: "The Future of Work",
          description: "Exploring the rise of artificial intelligence",
          date: "May 20, 2025",
          time: "08:00 AM",
          thumbnail: "/images/future-work.jpg",
          podcastLink: "https://example.com/future-work-podcast",
          createdAt: new Date().toISOString()
        },
        {
          id: "3",
          title: "Health and Wellness",
          description: "Tips and insights on wellness",
          date: "May 19, 2025",
          time: "02:50 PM",
          thumbnail: "/images/health.jpg",
          podcastLink: "https://example.com/health-podcast",
          createdAt: new Date().toISOString()
        },
        {
          id: "4",
          title: "The Entrepreneurial Journey",
          description: "Deep insights from founders",
          date: "May 15, 2025",
          time: "11:00 AM",
          thumbnail: "/images/entrepreneur.jpg",
          podcastLink: "https://example.com/entrepreneur-podcast",
          createdAt: new Date().toISOString()
        },
        {
          id: "5",
          title: "Exploring the Cosmos",
          description: "Space, telescopes, and wonder",
          date: "May 10, 2025",
          time: "04:00 PM",
          thumbnail: "/images/cosmos.jpg",
          podcastLink: "https://example.com/cosmos-podcast",
          createdAt: new Date().toISOString()
        },
        {
          id: "6",
          title: "History's Greatest Mysteries",
          description: "Time travel through secrets",
          date: "May 5, 2025",
          time: "01:20 PM",
          thumbnail: "/images/mystery.jpg",
          podcastLink: "https://example.com/mystery-podcast",
          createdAt: new Date().toISOString()
        }
      ];
      
      try {
        fs.writeFileSync(dataFilePath, JSON.stringify(defaultPodcasts, null, 2));
        console.log('Default podcast data created successfully');
        return defaultPodcasts;
      } catch (writeError) {
        console.error('Error writing default podcast data:', writeError);
        throw new Error(`Failed to create default podcast data: ${writeError.message}`);
      }
    }
    
    const data = fs.readFileSync(dataFilePath, "utf8");
    const podcasts = JSON.parse(data);
    console.log(`Successfully read ${podcasts.length} podcasts`);
    return podcasts;
  } catch (error) {
    console.error("Error reading podcast data:", error);
    throw new Error(`Failed to read podcast data: ${error.message}`);
  }
};

// Write podcast data
const writePodcastData = (data) => {
  try {
    if (!ensureDataDirectory()) {
      throw new Error('Failed to create data directory');
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    console.log('Podcast data written successfully');
    return true;
  } catch (error) {
    console.error("Error writing podcast data:", error);
    throw new Error(`Failed to write podcast data: ${error.message}`);
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Handle file upload
const handleFileUpload = async (file) => {
  if (!file) return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "podcasts");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Return the public URL
    return `/uploads/podcasts/${fileName}`;
  } catch (error) {
    console.error('Error handling file upload:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// GET - Retrieve all podcasts
export async function GET(request) {
  try {
    console.log('GET /api/podcast called');
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset') || '0';
    
    console.log('Query params:', { limit, offset });

    const podcasts = readPodcastData();
    
    // Sort by date (newest first)
    const sortedPodcasts = podcasts.sort((a, b) => {
      try {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB - dateA;
      } catch (error) {
        console.warn('Error sorting podcasts by date:', error);
        return 0;
      }
    });

    // Apply pagination if limit is specified
    let result = sortedPodcasts;
    if (limit) {
      const limitNum = parseInt(limit);
      const offsetNum = parseInt(offset);
      result = sortedPodcasts.slice(offsetNum, offsetNum + limitNum);
    }

    const response = {
      success: true,
      data: result,
      total: podcasts.length,
      hasMore: limit ? (parseInt(offset) + parseInt(limit)) < podcasts.length : false
    };
    
    console.log('Returning response:', {
      success: response.success,
      dataCount: response.data.length,
      total: response.total,
      hasMore: response.hasMore
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error in GET /api/podcast:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to fetch podcasts: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Create new podcast
export async function POST(request) {
  try {
    console.log('POST /api/podcast called');
    
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get('title');
    const description = formData.get('description');
    const podcastLink = formData.get('podcastLink');
    const date = formData.get('date');
    const time = formData.get('time');
    const thumbnailFile = formData.get('thumbnail');

    console.log('Form data received:', { title, description, podcastLink, date, time, hasFile: !!thumbnailFile });

    // Validate required fields
    if (!title || !description || !podcastLink || !date || !time) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate podcast link format
    try {
      new URL(podcastLink);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid podcast link URL" },
        { status: 400 }
      );
    }

    // Handle thumbnail upload
    let thumbnailPath = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailPath = await handleFileUpload(thumbnailFile);
    }

    // Create new podcast object
    const newPodcast = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      podcastLink: podcastLink.trim(),
      date: date,
      time: time,
      thumbnail: thumbnailPath || "/images/default-podcast.jpg", // fallback image
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Read existing data and add new podcast
    const existingPodcasts = readPodcastData();
    const updatedPodcasts = [newPodcast, ...existingPodcasts];

    // Write updated data
    writePodcastData(updatedPodcasts);

    console.log('New podcast created successfully:', newPodcast.id);

    return NextResponse.json({
      success: true,
      message: "Podcast uploaded successfully!",
      data: newPodcast
    });

  } catch (error) {
    console.error("Error in POST /api/podcast:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create podcast: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing podcast
export async function PUT(request) {
  try {
    console.log('PUT /api/podcast called');
    
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Podcast ID is required" },
        { status: 400 }
      );
    }

    const podcasts = readPodcastData();
    const podcastIndex = podcasts.findIndex(p => p.id === id);

    if (podcastIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Podcast not found" },
        { status: 404 }
      );
    }

    // Extract and update fields
    const title = formData.get('title');
    const description = formData.get('description');
    const podcastLink = formData.get('podcastLink');
    const date = formData.get('date');
    const time = formData.get('time');
    const thumbnailFile = formData.get('thumbnail');

    const existingPodcast = podcasts[podcastIndex];
    let thumbnailPath = existingPodcast.thumbnail;

    // Handle new thumbnail upload
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnailPath = await handleFileUpload(thumbnailFile);
    }

    // Update podcast object
    const updatedPodcast = {
      ...existingPodcast,
      title: title?.trim() || existingPodcast.title,
      description: description?.trim() || existingPodcast.description,
      podcastLink: podcastLink?.trim() || existingPodcast.podcastLink,
      date: date || existingPodcast.date,
      time: time || existingPodcast.time,
      thumbnail: thumbnailPath,
      updatedAt: new Date().toISOString()
    };

    podcasts[podcastIndex] = updatedPodcast;
    writePodcastData(podcasts);

    console.log('Podcast updated successfully:', id);

    return NextResponse.json({
      success: true,
      message: "Podcast updated successfully!",
      data: updatedPodcast
    });

  } catch (error) {
    console.error("Error in PUT /api/podcast:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update podcast: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete podcast
export async function DELETE(request) {
  try {
    console.log('DELETE /api/podcast called');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Podcast ID is required" },
        { status: 400 }
      );
    }

    const podcasts = readPodcastData();
    const filteredPodcasts = podcasts.filter(p => p.id !== id);

    if (filteredPodcasts.length === podcasts.length) {
      return NextResponse.json(
        { success: false, error: "Podcast not found" },
        { status: 404 }
      );
    }

    writePodcastData(filteredPodcasts);

    console.log('Podcast deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: "Podcast deleted successfully!"
    });

  } catch (error) {
    console.error("Error in DELETE /api/podcast:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to delete podcast: ${error.message}`,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}