'use client';

import { useState } from 'react';
import { Upload, X, Eye, Save, Calendar, Clock, FileText, Mic, Image, Link } from 'lucide-react';

const page = () => {
  const [contentType, setContentType] = useState('podcast'); // 'podcast' or 'blog'
  const [formData, setFormData] = useState({
    // Common fields
    title: '',
    description: '',
    thumbnail: null,
    thumbnailPreview: '',
    date: '',
    time: '',
    
    // Podcast specific
    podcastLink: '',
    
    // Blog specific
    excerpt: '',
    content: '',
    readTime: '',
    featured: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (field, file) => {
    if (field === 'thumbnail') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: file,
          thumbnailPreview: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Submitting:', { contentType, ...formData });
    alert(`${contentType === 'podcast' ? 'Podcast' : 'Blog post'} uploaded successfully!`);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      thumbnail: null,
      thumbnailPreview: '',
      date: '',
      time: '',
      podcastLink: '',
      excerpt: '',
      content: '',
      readTime: '',
      featured: false
    });
    
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      thumbnail: null,
      thumbnailPreview: '',
      date: '',
      time: '',
      podcastLink: '',
      excerpt: '',
      content: '',
      readTime: '',
      featured: false
    });
  };

  const toggleContentType = (type) => {
    setContentType(type);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Admin Content Upload
          </h1>
          <p className="text-gray-200">Upload podcasts and blog posts to your platform</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Type Selector */}
        <div className="mb-8">
          <div className="flex gap-4 p-2 bg-white rounded-xl shadow-lg inline-flex">
            <button
              onClick={() => toggleContentType('podcast')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                contentType === 'podcast'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Mic size={20} />
              Upload Podcast
            </button>
            <button
              onClick={() => toggleContentType('blog')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                contentType === 'blog'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={20} />
              Upload Blog Post
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {contentType === 'podcast' ? '🎙️ New Podcast Episode' : '📝 New Blog Post'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-violet-600 hover:text-violet-800 font-medium"
                >
                  <Eye size={20} />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder={contentType === 'podcast' ? 'Enter podcast episode title' : 'Enter blog post title'}
                  required
                />
              </div>

              {/* Description/Excerpt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {contentType === 'podcast' ? 'Description' : 'Excerpt'} *
                </label>
                <textarea
                  value={contentType === 'podcast' ? formData.description : formData.excerpt}
                  onChange={(e) => handleInputChange(contentType === 'podcast' ? 'description' : 'excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder={contentType === 'podcast' ? 'Brief description of the episode' : 'Brief excerpt for the blog post'}
                  required
                />
              </div>

              {/* Podcast Link (Podcast only) */}
              {contentType === 'podcast' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Podcast Link *
                  </label>
                  <input
                    type="url"
                    value={formData.podcastLink}
                    onChange={(e) => handleInputChange('podcastLink', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="https://example.com/podcast-episode"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Enter the direct link to your podcast episode</p>
                </div>
              )}

              {/* Blog Content Editor */}
              {contentType === 'blog' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter your blog content here... You can use HTML tags for formatting."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">You can use HTML tags for formatting (h2, h3, p, strong, em, etc.)</p>
                </div>
              )}

              {/* Thumbnail Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-violet-400 transition-colors">
                  {formData.thumbnailPreview ? (
                    <div className="relative">
                      <img 
                        src={formData.thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange('thumbnail', null) || handleInputChange('thumbnailPreview', '')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload thumbnail</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload('thumbnail', e.target.files[0])}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="mt-2 inline-block bg-violet-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-violet-700"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Date, Time, and Read Time */}
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>

                {contentType === 'blog' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Read Time
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => handleInputChange('readTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="e.g., 5 min read"
                    />
                  </div>
                )}
              </div>

              {/* Featured Toggle (Blog only) */}
              {contentType === 'blog' && (
                <div className="mb-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    />
                    <span className="font-medium text-gray-700">Mark as featured post</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Publish {contentType === 'podcast' ? 'Podcast' : 'Blog Post'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>
              
              {formData.thumbnailPreview && (
                <img 
                  src={formData.thumbnailPreview} 
                  alt="Preview" 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">
                  {formData.title || `Sample ${contentType} title`}
                </h4>
                
                <p className="text-gray-600 text-sm">
                  {(contentType === 'podcast' ? formData.description : formData.excerpt) || 
                   `Sample ${contentType} description...`}
                </p>
                
                {contentType === 'podcast' && formData.podcastLink && (
                  <div className="flex items-center gap-2 text-violet-600 text-sm">
                    <Link size={16} />
                    <span>Podcast Link Available</span>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  {formData.date && `${formData.date}`}
                  {formData.time && ` • ${formData.time}`}
                  {formData.readTime && ` • ${formData.readTime}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;