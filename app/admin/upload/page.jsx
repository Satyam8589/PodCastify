"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const UploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [link, setLink] = useState("");
  const [dateTime, setDateTime] = useState("");

  const handleClear = () => {
    setTitle("");
    setDescription("");
    setImage(null);
    setLink("");
    setDateTime("");
  };

  const handleUpload = () => {
    console.log({
      title,
      description,
      image,
      link,
      dateTime
    });
    alert("Item Uploaded Successfully!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <span>📤</span> Upload New Item
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg">
                {image ? (
                  <img src={URL.createObjectURL(image)} className="w-full h-full object-cover rounded-md" />
                ) : (
                  <span className="text-gray-400 text-sm">📷</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="https://your-link.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Optional: Add a relevant URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleClear}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              ❌ Clear
            </button>
            <button
              onClick={handleUpload}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              ⬆️ Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
