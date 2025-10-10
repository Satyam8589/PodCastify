"use client";

import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit, FiEye, FiEyeOff } from "react-icons/fi";

const AdvertisementListsPage = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/advertisements");
      const data = await response.json();
      if (data.success) {
        setAdvertisements(data.data);
      }
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/advertisements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        fetchAdvertisements();
      }
    } catch (error) {
      console.error("Error updating advertisement:", error);
    }
  };

  const deleteAdvertisement = async (id) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      try {
        const response = await fetch(`/api/advertisements/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchAdvertisements();
        }
      } catch (error) {
        console.error("Error deleting advertisement:", error);
      }
    }
  };

  const filteredAds = advertisements.filter((ad) => {
    if (filter === "active") return ad.active;
    if (filter === "inactive") return !ad.active;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Advertisement Management
        </h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Advertisements</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {filteredAds.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl text-gray-600 mb-2">
            No advertisements found
          </h3>
          <p className="text-gray-500">
            Create your first advertisement to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div
              key={ad._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              {ad.imageUrl && (
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {ad.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      ad.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ad.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {ad.description}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>Category: {ad.category}</span>
                  <span>Priority: {ad.priority}</span>
                </div>

                {ad.targetUrl && (
                  <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs mb-3 block truncate"
                  >
                    {ad.targetUrl}
                  </a>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(ad._id, ad.active)}
                      className={`p-2 rounded ${
                        ad.active
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-green-100 text-green-600 hover:bg-green-200"
                      }`}
                      title={ad.active ? "Deactivate" : "Activate"}
                    >
                      {ad.active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>

                    <button
                      onClick={() => deleteAdvertisement(ad._id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(ad.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementListsPage;
