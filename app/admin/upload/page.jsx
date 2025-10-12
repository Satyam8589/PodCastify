"use client";

import { useState } from "react";
import {
  Upload,
  X,
  Eye,
  Save,
  Calendar,
  Clock,
  FileText,
  Mic,
  Image,
  Link,
  AlertCircle,
  CheckCircle,
  Star,
  Tag,
  ExternalLink,
} from "lucide-react";

const AdminUploadPage = () => {
  const [contentType, setContentType] = useState("blog");
  const [formData, setFormData] = useState({
    // Common fields
    title: "",
    description: "",
    thumbnail: null,
    thumbnailPreview: "",
    date: "",
    time: "",

    // Podcast specific
    podcastLink: "",

    // Blog specific
    excerpt: "",
    content: "",
    readTime: "",
    featured: false,
    category: "getting-started",
    author: "",
    tags: [],

    // Advertisement specific
    shortDescription: "",
    link: "",
    adCategory: "product",
    priority: "medium",
    targetAudience: "",
    budget: "",
    startDate: "",
    endDate: "",
    adTags: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: "" });

  const categories = [
    { id: "getting-started", name: "Getting Started" },
    { id: "storytelling", name: "Storytelling" },
    { id: "branding", name: "Branding" },
    { id: "monetization", name: "Monetization" },
    { id: "interviews", name: "Interviews" },
    { id: "psychology", name: "Psychology" },
  ];

  const adCategories = [
    { id: "product", name: "Product" },
    { id: "service", name: "Service" },
    { id: "event", name: "Event" },
    { id: "promotion", name: "Promotion" },
    { id: "brand", name: "Brand" },
    { id: "other", name: "Other" },
  ];

  const adPriorities = [
    { id: "low", name: "Low Priority" },
    { id: "medium", name: "Medium Priority" },
    { id: "high", name: "High Priority" },
    { id: "featured", name: "Featured" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear any previous error messages when user starts typing
    if (submitStatus.type === "error") {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleFileUpload = (field, file) => {
    if (field === "thumbnail" && file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setSubmitStatus({
          type: "error",
          message: "Please select a valid image file.",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitStatus({
          type: "error",
          message: "Image file must be smaller than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          [field]: file,
          thumbnailPreview: e.target.result,
        }));
      };
      reader.onerror = () => {
        setSubmitStatus({
          type: "error",
          message: "Failed to read the image file.",
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddAdTag = () => {
    if (tagInput.trim() && !formData.adTags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        adTags: [...prev.adTags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveAdTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      adTags: prev.adTags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.title.trim()) errors.push("Title is required");

    if (contentType === "podcast") {
      if (!formData.description.trim()) errors.push("Description is required");
      if (!formData.podcastLink.trim()) errors.push("Podcast link is required");
      if (!formData.date) errors.push("Date is required");
      if (!formData.time) errors.push("Time is required");

      // Validate URL format
      try {
        new URL(formData.podcastLink);
      } catch {
        errors.push("Please enter a valid podcast URL");
      }
    } else if (contentType === "advertisement") {
      if (!formData.description.trim()) errors.push("Description is required");
      if (!formData.shortDescription.trim())
        errors.push("Short description is required");
      if (!formData.link.trim()) errors.push("Advertisement link is required");
      if (formData.shortDescription.length > 150)
        errors.push("Short description must be 150 characters or less");

      // Validate URL format
      try {
        new URL(formData.link);
      } catch {
        errors.push("Please enter a valid advertisement URL");
      }
    } else {
      if (!formData.excerpt.trim()) errors.push("Excerpt is required");
      if (!formData.content.trim()) errors.push("Content is required");
      if (!formData.author.trim()) errors.push("Author is required");
      if (!formData.readTime.trim()) errors.push("Read time is required");
      if (!formData.date) errors.push("Date is required");
      if (!formData.time) errors.push("Time is required");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSubmitStatus({
        type: "error",
        message: validationErrors.join(", "),
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      let endpoint;
      if (contentType === "podcast") {
        endpoint = "/api/podcasts";
      } else if (contentType === "advertisement") {
        endpoint = "/api/advertisements";
      } else {
        endpoint = "/api/blog";
      }

      const formDataToSend = new FormData();

      if (contentType === "podcast") {
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append("podcastLink", formData.podcastLink.trim());
        formDataToSend.append("date", formData.date);
        formDataToSend.append("time", formData.time);

        if (formData.thumbnail) {
          formDataToSend.append("thumbnail", formData.thumbnail);
        }

        console.log("Submitting podcast with data:", {
          title: formData.title,
          description: formData.description,
          podcastLink: formData.podcastLink,
          date: formData.date,
          time: formData.time,
          hasThumbnail: !!formData.thumbnail,
        });
      } else if (contentType === "advertisement") {
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("description", formData.description.trim());
        formDataToSend.append(
          "shortDescription",
          formData.shortDescription.trim()
        );
        formDataToSend.append("link", formData.link.trim());
        formDataToSend.append("category", formData.adCategory);
        formDataToSend.append("priority", formData.priority);

        if (formData.targetAudience)
          formDataToSend.append(
            "targetAudience",
            formData.targetAudience.trim()
          );
        if (formData.budget && formData.budget.trim())
          formDataToSend.append("budget", formData.budget.trim());
        if (formData.startDate)
          formDataToSend.append("startDate", formData.startDate);
        if (formData.endDate)
          formDataToSend.append("endDate", formData.endDate);
        if (formData.adTags.length > 0)
          formDataToSend.append("tags", JSON.stringify(formData.adTags));

        if (formData.thumbnail) {
          formDataToSend.append("image", formData.thumbnail);
        }

        console.log("Submitting advertisement with data:", {
          title: formData.title,
          description: formData.description,
          shortDescription: formData.shortDescription,
          link: formData.link,
          category: formData.adCategory,
          priority: formData.priority,
          hasThumbnail: !!formData.thumbnail,
        });
      } else {
        formDataToSend.append("title", formData.title.trim());
        formDataToSend.append("excerpt", formData.excerpt.trim());
        formDataToSend.append("content", formData.content.trim());
        formDataToSend.append("category", formData.category);
        formDataToSend.append("author", formData.author.trim());
        formDataToSend.append("date", formData.date);
        formDataToSend.append("time", formData.time);
        formDataToSend.append("readTime", formData.readTime.trim());
        formDataToSend.append("tags", JSON.stringify(formData.tags));
        formDataToSend.append("featured", formData.featured);

        if (formData.thumbnail) {
          formDataToSend.append("thumbnail", formData.thumbnail);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response scenarios
      let responseData;
      let responseText;

      try {
        responseText = await response.text();
      } catch (error) {
        throw new Error("Failed to read server response");
      }

      if (!response.ok) {
        let errorMessage = `Server error (${response.status})`;

        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage =
              errorData.error ||
              errorData.message ||
              `${response.status}: ${response.statusText}`;
          } catch {
            // If not JSON, use the raw text if it's meaningful
            if (responseText.length < 200) {
              errorMessage = responseText;
            } else {
              errorMessage = `${response.status}: ${response.statusText}`;
            }
          }
        }

        throw new Error(errorMessage);
      }

      // Try to parse response as JSON
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          // If response is successful but not JSON, treat as success
          setSubmitStatus({
            type: "success",
            message:
              responseText ||
              `${
                contentType === "podcast" ? "Podcast" : "Blog post"
              } uploaded successfully!`,
          });
          resetForm();
          return;
        }
      }

      // Handle JSON response
      if (responseData) {
        if (responseData.success !== false) {
          setSubmitStatus({
            type: "success",
            message:
              responseData.message ||
              `${
                contentType === "podcast" ? "Podcast" : "Blog post"
              } uploaded successfully!`,
          });
          resetForm();
        } else {
          throw new Error(
            responseData.error ||
              responseData.message ||
              `Failed to upload ${contentType}`
          );
        }
      } else {
        // Empty successful response
        setSubmitStatus({
          type: "success",
          message: `${
            contentType === "podcast" ? "Podcast" : "Blog post"
          } uploaded successfully!`,
        });
        resetForm();
      }
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.name === "AbortError") {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      thumbnail: null,
      thumbnailPreview: "",
      date: "",
      time: "",
      podcastLink: "",
      excerpt: "",
      content: "",
      readTime: "",
      featured: false,
      category: "getting-started",
      author: "",
      tags: [],
      // Advertisement specific
      shortDescription: "",
      link: "",
      adCategory: "product",
      priority: "medium",
      targetAudience: "",
      budget: "",
      startDate: "",
      endDate: "",
      adTags: [],
    });
    setTagInput("");
    setSubmitStatus({ type: null, message: "" });
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
          <p className="text-gray-200">
            Upload podcasts and blog posts to your platform
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content Type Selector */}
        <div className="mb-8">
          <div className="flex gap-4 p-2 bg-white rounded-xl shadow-lg">
            <button
              onClick={() => toggleContentType("podcast")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                contentType === "podcast"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Mic size={20} />
              Upload Podcast
            </button>
            <button
              onClick={() => toggleContentType("blog")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                contentType === "blog"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FileText size={20} />
              Write Blog Post
            </button>
            <button
              onClick={() => toggleContentType("advertisement")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                contentType === "advertisement"
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Star size={20} />
              Create Advertisement
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              submitStatus.type === "success"
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              {submitStatus.type === "success" ? (
                <CheckCircle
                  size={20}
                  className="text-green-600 flex-shrink-0"
                />
              ) : (
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              )}
              <span className="font-medium">{submitStatus.message}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {contentType === "podcast"
                    ? "🎙️ New Podcast Episode"
                    : "📝 New Blog Post"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-violet-600 hover:text-violet-800 font-medium"
                >
                  <Eye size={20} />
                  {showPreview ? "Hide Preview" : "Show Preview"}
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
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder={
                    contentType === "podcast"
                      ? "Enter podcast episode title"
                      : "Enter blog post title"
                  }
                  required
                />
              </div>

              {/* Author (Blog only) */}
              {contentType === "blog" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      handleInputChange("author", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Enter author name"
                    required
                  />
                </div>
              )}

              {/* Category (Blog only) */}
              {contentType === "blog" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description/Excerpt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {contentType === "podcast"
                    ? "Description"
                    : contentType === "advertisement"
                    ? "Description"
                    : "Excerpt"}{" "}
                  *
                </label>
                <textarea
                  value={
                    contentType === "podcast"
                      ? formData.description
                      : contentType === "advertisement"
                      ? formData.description
                      : formData.excerpt
                  }
                  onChange={(e) =>
                    handleInputChange(
                      contentType === "podcast"
                        ? "description"
                        : contentType === "advertisement"
                        ? "description"
                        : "excerpt",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder={
                    contentType === "podcast"
                      ? "Brief description of the episode"
                      : contentType === "advertisement"
                      ? "Detailed description of the advertisement"
                      : "Brief excerpt for the blog post"
                  }
                  required
                />
              </div>

              {/* Podcast Link (Podcast only) */}
              {contentType === "podcast" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Podcast Link *
                  </label>
                  <input
                    type="url"
                    value={formData.podcastLink}
                    onChange={(e) =>
                      handleInputChange("podcastLink", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="https://example.com/podcast-episode"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the direct link to your podcast episode
                  </p>
                </div>
              )}

              {/* Blog Content Editor */}
              {contentType === "blog" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter your blog content here... You can use HTML tags for formatting."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can use HTML tags for formatting (h2, h3, p, strong, em,
                    etc.)
                  </p>
                </div>
              )}

              {/* Tags (Blog only) */}
              {contentType === "blog" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleAddTag())
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Enter a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Advertisement Specific Fields */}
              {contentType === "advertisement" && (
                <>
                  {/* Short Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) =>
                        handleInputChange("shortDescription", e.target.value)
                      }
                      rows={3}
                      maxLength={150}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Brief description for the advertisement (max 150 characters)"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.shortDescription.length}/150 characters
                    </p>
                  </div>

                  {/* Advertisement Link */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advertisement Link *
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) =>
                        handleInputChange("link", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="https://example.com/your-ad-destination"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL where users will be redirected when they click the ad
                    </p>
                  </div>

                  {/* Advertisement Category */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advertisement Category *
                    </label>
                    <select
                      value={formData.adCategory}
                      onChange={(e) =>
                        handleInputChange("adCategory", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    >
                      {adCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Advertisement Priority */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        handleInputChange("priority", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      {adPriorities.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Audience */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        handleInputChange("targetAudience", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="e.g., Podcast creators, Business professionals"
                    />
                  </div>

                  {/* Budget */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={(e) =>
                        handleInputChange("budget", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="e.g., $500/month, $2000 total"
                    />
                  </div>

                  {/* Campaign Dates */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Advertisement Tags */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddAdTag())
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Enter a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddAdTag}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.adTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveAdTag(tag)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Thumbnail Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail Image
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
                        onClick={() => {
                          handleInputChange("thumbnail", null);
                          handleInputChange("thumbnailPreview", "");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Image className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload thumbnail (optional)
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Supported formats: JPG, PNG, WebP (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload("thumbnail", e.target.files[0])
                        }
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="inline-block bg-violet-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-violet-700 transition-colors"
                      >
                        Choose Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Date, Time, and Read Time */}
              {contentType !== "advertisement" && (
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("time", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {contentType === "blog" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Read Time *
                      </label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) =>
                          handleInputChange("readTime", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="e.g., 5 min read"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Featured Toggle (Blog only) */}
              {contentType === "blog" && (
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        handleInputChange("featured", e.target.checked)
                      }
                      className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                    />
                    <span className="font-medium text-gray-700">
                      Mark as featured post
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Publish{" "}
                      {contentType === "podcast"
                        ? "Podcast"
                        : contentType === "advertisement"
                        ? "Advertisement"
                        : "Blog Post"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="px-6 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
            </form>
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
                  {(contentType === "podcast"
                    ? formData.description
                    : contentType === "advertisement"
                    ? formData.shortDescription
                    : formData.excerpt) ||
                    `Sample ${contentType} description...`}
                </p>

                {contentType === "blog" && formData.author && (
                  <p className="text-sm text-gray-500">By {formData.author}</p>
                )}

                {contentType === "podcast" && formData.podcastLink && (
                  <div className="flex items-center gap-2 text-violet-600 text-sm">
                    <Link size={16} />
                    <span>Podcast Link Available</span>
                  </div>
                )}

                {contentType === "advertisement" && formData.link && (
                  <div className="flex items-center gap-2 text-violet-600 text-sm">
                    <ExternalLink size={16} />
                    <span>Advertisement Link Available</span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {contentType === "advertisement"
                    ? formData.startDate && `Starts: ${formData.startDate}`
                    : formData.date && `${formData.date}`}
                  {contentType !== "advertisement" &&
                    formData.time &&
                    ` • ${formData.time}`}
                  {formData.readTime && ` • ${formData.readTime}`}
                </div>

                {contentType === "advertisement" && formData.adCategory && (
                  <div className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {
                      adCategories.find((cat) => cat.id === formData.adCategory)
                        ?.name
                    }
                  </div>
                )}

                {contentType === "advertisement" && formData.priority && (
                  <div
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      formData.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : formData.priority === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : formData.priority === "featured"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {adPriorities.find((p) => p.id === formData.priority)?.name}
                  </div>
                )}

                {formData.tags.length > 0 &&
                  contentType !== "advertisement" && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                {formData.adTags.length > 0 &&
                  contentType === "advertisement" && (
                    <div className="flex flex-wrap gap-1">
                      {formData.adTags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                {contentType === "blog" && formData.featured && (
                  <div className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Featured Post
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadPage;
