"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Calendar,
  User,
  Clock,
  ExternalLink,
  Play,
} from "lucide-react";

const AdminPodcastList = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [editLoading, setEditLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [podcastToDelete, setPodcastToDelete] = useState(null);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    podcastLink: "",
    date: "",
    time: "",
  });

  // Fetch podcasts from API
  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/podcasts");
      const data = await response.json();

      if (data.success) {
        setPodcasts(data.data);
      } else {
        setError("Failed to fetch podcasts");
      }
    } catch (err) {
      setError("Error fetching podcasts");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete podcast
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/podcasts?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setPodcasts(podcasts.filter((podcast) => podcast._id !== id));
        setShowDeleteModal(false);
        setPodcastToDelete(null);
        alert("Podcast deleted successfully!");
      } else {
        setError(data.error || "Failed to delete podcast");
      }
    } catch (err) {
      setError("Error deleting podcast");
      console.error("Error:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Start editing
  const startEditing = (podcast) => {
    setEditingPodcast(podcast._id);
    setEditForm({
      title: podcast.title,
      description: podcast.description,
      podcastLink: podcast.podcastLink,
      date: podcast.date,
      time: podcast.time,
    });
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  // Save edit
  const handleEditSave = async (id) => {
    try {
      setEditLoading(id);

      const formData = new FormData();
      formData.append("id", id);
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("podcastLink", editForm.podcastLink);
      formData.append("date", editForm.date);
      formData.append("time", editForm.time);

      const response = await fetch("/api/podcasts", {
        method: "PUT",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        await fetchPodcasts(); // Refresh the list
        setEditingPodcast(null);
        alert("Podcast updated successfully!");
      } else {
        setError(data.error || "Failed to update podcast");
      }
    } catch (err) {
      setError("Error updating podcast");
      console.error("Error:", err);
    } finally {
      setEditLoading(null);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingPodcast(null);
    setEditForm({
      title: "",
      description: "",
      podcastLink: "",
      date: "",
      time: "",
    });
  };

  // Filter podcasts based on search
  const filteredPodcasts = podcasts.filter((podcast) => {
    const matchesSearch =
      podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      podcast.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate text
  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Podcast Management
        </h1>
        <p className="text-gray-600">Manage all your podcasts</p>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search podcasts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Podcasts
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {podcasts.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  podcasts.filter(
                    (p) =>
                      new Date(p.createdAt).getMonth() === new Date().getMonth()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <ExternalLink className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">
                {podcasts.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Podcasts List */}
      {filteredPodcasts.length === 0 ? (
        <div className="text-center py-12">
          <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No podcasts found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search term."
              : "Create your first podcast to get started."}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPodcasts.map((podcast) => (
              <li key={podcast._id} className="px-6 py-4">
                {editingPodcast === podcast._id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Podcast Link
                        </label>
                        <input
                          type="url"
                          name="podcastLink"
                          value={editForm.podcastLink}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={editForm.time}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSave(podcast._id)}
                        disabled={editLoading === podcast._id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {editLoading === podcast._id ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start justify-between">
                    <div className="flex">
                      {podcast.thumbnail?.url && (
                        <img
                          src={podcast.thumbnail.url}
                          alt={podcast.title}
                          className="h-16 w-16 rounded-lg object-cover mr-4 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {podcast.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 mb-2 text-sm">
                          {truncateText(podcast.description, 150)}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(podcast.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {podcast.time}
                          </div>
                          <a
                            href={podcast.podcastLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-purple-600 hover:text-purple-800"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Listen
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => startEditing(podcast)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit podcast"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          setPodcastToDelete(podcast);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete podcast"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Podcast
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete "{podcastToDelete?.title}"? This
                action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPodcastToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(podcastToDelete._id)}
                  disabled={deleteLoading === podcastToDelete._id}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading === podcastToDelete._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPodcastList;
