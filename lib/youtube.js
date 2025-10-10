/**
 * Utility functions for handling YouTube URLs and video operations
 */

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;

  const patterns = [
    // Standard youtube.com watch URLs
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    // Short youtu.be URLs
    /(?:youtu\.be\/)([^&\n?#]+)/,
    // Embed URLs
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    // Direct video URLs
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
    // YouTube shorts
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
    // Direct video ID (11 character string)
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate YouTube embed URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Embed options
 * @returns {string} - YouTube embed URL
 */
export const generateYouTubeEmbedUrl = (videoId, options = {}) => {
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: options.autoplay || "0",
    rel: options.rel || "0",
    modestbranding: options.modestbranding || "1",
    controls: options.controls || "1",
    showinfo: options.showinfo || "0",
    fs: options.fullscreen || "1",
    ...options.customParams,
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Generate YouTube thumbnail URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, hqdefault, maxresdefault)
 * @returns {string} - YouTube thumbnail URL
 */
export const generateYouTubeThumbnailUrl = (videoId, quality = "hqdefault") => {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
};

/**
 * Validate if a URL is a valid YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return extractYouTubeVideoId(url) !== null;
};

/**
 * Convert YouTube URL to watch URL format
 * @param {string} url - Any YouTube URL
 * @returns {string|null} - Standard YouTube watch URL
 */
export const normalizeYouTubeUrl = (url) => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
};

/**
 * Get video duration from YouTube API (requires API key)
 * @param {string} videoId - YouTube video ID
 * @param {string} apiKey - YouTube Data API key
 * @returns {Promise<string|null>} - Video duration or null
 */
export const getYouTubeVideoDuration = async (videoId, apiKey) => {
  if (!videoId || !apiKey) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].contentDetails.duration;
    }

    return null;
  } catch (error) {
    console.error("Error fetching YouTube video duration:", error);
    return null;
  }
};

/**
 * Format ISO 8601 duration to readable format
 * @param {string} duration - ISO 8601 duration (e.g., "PT4M13S")
 * @returns {string} - Formatted duration (e.g., "4:13")
 */
export const formatYouTubeDuration = (duration) => {
  if (!duration) return "";

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "";

  const hours = parseInt((match[1] || "0H").replace("H", "")) || 0;
  const minutes = parseInt((match[2] || "0M").replace("M", "")) || 0;
  const seconds = parseInt((match[3] || "0S").replace("S", "")) || 0;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
