import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload image with more flexibility
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    const {
      folder = 'podcast-blog',
      width = 800,
      height = 600,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
      resourceType = 'auto'
    } = options;

    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
      format,
      transformation: [
        { width, height, crop, quality }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

// Helper function to upload from buffer (for API routes)
export const uploadBufferToCloudinary = async (buffer, options = {}) => {
  try {
    const {
      folder = 'podcast-blog',
      width = 800,
      height = 600,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder,
          format,
          transformation: [
            { width, height, crop, quality }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    throw new Error(`Failed to upload buffer to Cloudinary: ${error.message}`);
  }
};

// Helper function to delete image with better error handling
export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId || publicId === 'default-blog-image') {
      console.log('Skipping deletion for default or empty public_id');
      return { success: true };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log(`Successfully deleted image: ${publicId}`);
      return { success: true, result };
    } else {
      console.warn(`Image deletion result: ${result.result} for ${publicId}`);
      return { success: false, result };
    }
  } catch (error) {
    console.error('Failed to delete from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to get optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop, quality, format }
    ]
  });
};

// Helper function to validate Cloudinary configuration
export const validateCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary configuration is incomplete. Please check your environment variables.');
  }
  
  return true;
};