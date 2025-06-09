"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';

const EditBlogPage = () => {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id;

  const [blog, setBlog] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    category: '',
    tags: [],
    image: '',
    featured: false,
    readTime: '',
    date: '', // Add date field
    time: ''  // Add time field
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Categories for selection
  const categories = [
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'monetization', label: 'Monetization' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'growth', label: 'Growth' },
    { value: 'technical', label: 'Technical' }
  ];

  // Helper function to extract date and time from ISO string
  const parseDateTime = (isoString) => {
    if (!isoString) return { date: '', time: '' };
    
    try {
      const dateObj = new Date(isoString);
      const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = dateObj.toTimeString().slice(0, 5); // HH:MM
      return { date, time };
    } catch (error) {
      console.error('Error parsing date:', error);
      return { date: '', time: '' };
    }
  };

  // Fetch blog data
  const fetchBlog = async () => {
    if (!blogId) {
      setError('No blog ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/blog?id=${blogId}`);
      const data = await response.json();
      
      if (data.success) {
        const blogData = data.data;
        const { date, time } = parseDateTime(blogData.date);
        
        setBlog({
          ...blogData,
          date: date,
          time: time
        });
        setImagePreview(blogData.image);
      } else {
        setError('Failed to fetch blog data');
      }
    } catch (err) {
      setError('Error fetching blog data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle preview - Fixed function
  const handlePreview = () => {
    if (!blogId) {
      setError('No blog ID available for preview');
      return;
    }

    // Try different possible URL patterns
    const possibleUrls = [
      `/blog/${blogId}`,
      `/blogs/${blogId}`,
      `/post/${blogId}`,
      `/posts/${blogId}`,
      `/blog/post/${blogId}`
    ];

    // Use the first URL pattern as default
    const previewUrl = possibleUrls[0];
    
    console.log('Opening preview for blog ID:', blogId);
    console.log('Preview URL:', previewUrl);
    
    // Open in new tab
    window.open(previewUrl, '_blank');
  };

  // Alternative preview with error handling
  const handlePreviewWithFallback = async () => {
    if (!blogId) {
      setError('No blog ID available for preview');
      return;
    }

    try {
      // First, try to check if the blog post exists and get its slug
      const response = await fetch(`/api/blog?id=${blogId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const blogData = data.data;
        
        // Try different URL patterns based on your routing structure
        const possibleUrls = [
          `/blog/${blogId}`,
          `/blog/${blogData.slug || blogId}`,
          `/blogs/${blogId}`,
          `/post/${blogId}`,
          `/posts/${blogId}`
        ];

        // Use the first available URL
        const previewUrl = possibleUrls[0];
        window.open(previewUrl, '_blank');
      } else {
        setError('Blog post not found for preview');
      }
    } catch (err) {
      console.error('Preview error:', err);
      // Fallback to simple preview
      window.open(`/blog/${blogId}`, '_blank');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/blog?id=${blogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blog)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Blog updated successfully!');
        setTimeout(() => {
          router.push('/admin/blogLists');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update blog');
      }
    } catch (err) {
      setError('Error updating blog');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBlog(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle tag addition
  const addTag = () => {
    if (newTag.trim() && !blog.tags.includes(newTag.trim())) {
      setBlog(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Handle tag removal
  const removeTag = (tagToRemove) => {
    setBlog(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle image file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to your image upload endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        const imageUrl = data.imageUrl;
        setBlog(prev => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
        setError('');
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      setError('Error uploading image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Remove current image
  const removeImage = () => {
    setBlog(prev => ({ ...prev, image: '' }));
    setImagePreview('');
    // Reset file input
    const fileInput = document.getElementById('imageFile');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  // Debug information
  useEffect(() => {
    console.log('Blog ID from params:', blogId);
    console.log('Current blog data:', blog);
  }, [blogId, blog]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/admin/blogLists')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog List
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Blog Post</h1>
        <p className="text-gray-600">Update your blog post details</p>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            <strong>Debug:</strong> Blog ID: {blogId || 'Not found'}
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600">{success}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={blog.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter blog title"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={blog.excerpt}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the blog post"
          />
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={blog.content}
            onChange={handleInputChange}
            required
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your blog content here..."
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={blog.author}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Author name"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={blog.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Publish Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={blog.date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time */}
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Publish Time *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              value={blog.time}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Read Time */}
          <div>
            <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2">
              Read Time *
            </label>
            <input
              type="text"
              id="readTime"
              name="readTime"
              value={blog.readTime}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5 min read"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <label htmlFor="featured" className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={blog.featured}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Featured Post</span>
            </label>
          </div>
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Image
          </label>
          
          {/* Current Image Display */}
          {imagePreview ? (
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Current Image</label>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Current blog image"
                  className="w-64 h-40 object-cover rounded-lg border shadow-sm"
                  onError={(e) => {
                    setImagePreview('');
                    setError('Failed to load current image.');
                  }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 text-xs"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No image selected</p>
            </div>
          )}

          {/* File Upload Input */}
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
              {imagePreview ? 'Change Image' : 'Select Image'}
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {uploading && (
              <div className="mt-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600">Uploading image...</span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB
            </p>
          </div>

          {/* Upload Tips */}
          {!imagePreview && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tips for great blog images:</strong>
              </p>
              <ul className="text-xs text-blue-600 mt-1 ml-4 list-disc">
                <li>Use high-quality images (recommended: 1200x630px)</li>
                <li>Ensure the image is relevant to your blog content</li>
                <li>Consider using stock photos from Unsplash or Pexels</li>
                <li>Optimize images for web to improve loading speed</li>
              </ul>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={handlePreviewWithFallback}
            disabled={!blogId}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/blogLists')}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogPage;