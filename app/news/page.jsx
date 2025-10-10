"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Tag,
  Calendar,
  TrendingUp,
  Star,
  Filter,
  Search,
  Grid,
  List,
  Eye,
  Clock,
  Zap,
} from "lucide-react";

const AdvertisementPage = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredAds, setFeaturedAds] = useState([]);

  const categories = [
    { id: "all", name: "All Categories", icon: Grid },
    { id: "product", name: "Products", icon: Star },
    { id: "service", name: "Services", icon: Zap },
    { id: "event", name: "Events", icon: Calendar },
    { id: "promotion", name: "Promotions", icon: TrendingUp },
    { id: "brand", name: "Brands", icon: Tag },
    { id: "other", name: "Other", icon: List },
  ];

  const priorities = [
    { id: "all", name: "All Priorities" },
    { id: "featured", name: "Featured" },
    { id: "high", name: "High Priority" },
    { id: "medium", name: "Medium Priority" },
    { id: "low", name: "Low Priority" },
  ];

  // Fetch advertisements
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (selectedPriority !== "all")
        params.append("priority", selectedPriority);
      params.append("active", "true");

      const response = await fetch(`/api/advertisements?${params.toString()}`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch advertisements: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setAdvertisements(data.data);
        setFeaturedAds(
          data.data.filter((ad) => ad.priority === "featured").slice(0, 3)
        );
      } else {
        throw new Error(data.error || "Failed to fetch advertisements");
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      setError(error.message);
      // Set fallback data for demonstration
      setAdvertisements([]);
      setFeaturedAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, [selectedCategory, selectedPriority]);

  // Filter advertisements based on search term
  const filteredAdvertisements = advertisements.filter(
    (ad) =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Handle advertisement click (track impression)
  const handleAdClick = async (ad) => {
    try {
      // Track click here if needed
      window.open(ad.link, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error tracking click:", error);
      window.open(ad.link, "_blank", "noopener,noreferrer");
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "featured":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white";
      case "high":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "medium":
        return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
      case "low":
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case "product":
        return "bg-emerald-100 text-emerald-800";
      case "service":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-purple-100 text-purple-800";
      case "promotion":
        return "bg-orange-100 text-orange-800";
      case "brand":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Discover Amazing
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {" "}
                Opportunities
              </span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Explore premium products, exclusive services, and exciting events
              from our trusted partners
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search advertisements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md rounded-xl text-white placeholder-gray-300 border border-white/20 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Advertisements */}
        {featuredAds.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Featured Opportunities
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredAds.map((ad, index) => (
                <div
                  key={ad._id}
                  className={`relative overflow-hidden rounded-2xl shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 ${
                    index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                  onClick={() => handleAdClick(ad)}
                >
                  <div className="relative h-64 lg:h-80">
                    <Image
                      src={ad.image?.url || "/images/default-ad.jpg"}
                      alt={ad.title}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "/images/default-ad.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Priority Badge */}
                    <div
                      className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                        ad.priority
                      )}`}
                    >
                      <Star className="w-3 h-3 inline mr-1" />
                      {ad.priority.toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-medium mb-2 ${getCategoryColor(
                          ad.category
                        )}`}
                      >
                        {ad.category}
                      </div>
                      <h3 className="text-white text-xl font-bold mb-2">
                        {ad.title}
                      </h3>
                      <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                        {ad.shortDescription}
                      </p>
                      <div className="flex items-center text-gray-300 text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(ad.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white rounded-xl px-4 py-3 pr-10 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="appearance-none bg-white rounded-xl px-4 py-3 pr-10 border border-gray-200 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
              <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg ${
                viewMode === "grid"
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg ${
                viewMode === "list"
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Error Loading Advertisements
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAdvertisements}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Advertisement Grid/List */}
        {!error && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Opportunities
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({filteredAdvertisements.length} found)
                </span>
              </h2>
            </div>

            {filteredAdvertisements.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-xl p-12 max-w-md mx-auto">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Advertisements Found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "No advertisements match your current filters"}
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {filteredAdvertisements.map((ad) => (
                  <div
                    key={ad._id}
                    className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                    onClick={() => handleAdClick(ad)}
                  >
                    <div
                      className={`relative ${
                        viewMode === "list" ? "w-64 flex-shrink-0" : "h-48"
                      }`}
                    >
                      <Image
                        src={ad.image?.url || "/images/default-ad.jpg"}
                        alt={ad.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "/images/default-ad.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Priority Badge */}
                      <div
                        className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-xs font-semibold ${getPriorityColor(
                          ad.priority
                        )}`}
                      >
                        {ad.priority}
                      </div>

                      {/* Hover Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(
                            ad.category
                          )}`}
                        >
                          {ad.category}
                        </div>
                        <Eye className="w-4 h-4 text-gray-400" />
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {ad.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {ad.shortDescription}
                      </p>

                      {ad.tags && ad.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {ad.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </div>
                        {ad.endDate && (
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Until {new Date(ad.endDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdvertisementPage;
