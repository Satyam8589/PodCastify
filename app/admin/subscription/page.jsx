"use client";

import { useEffect, useState } from "react";

export default function SubscriptionAdminPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/subscribers");
      const data = await res.json();
      setSubscribers(data.subscribers || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch subscribers:", error);
      setLoading(false);
    }
  };

  const deleteSubscriber = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this subscriber?");
    if (!confirm) return;

    try {
      await fetch(`/api/subscribers/${id}`, {
        method: "DELETE",
      });
      setSubscribers((prev) => prev.filter((sub) => sub._id !== id));
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-6 sm:p-8 md:p-12">
      <div className="max-w-xl sm:max-w-2xl md:max-w-5xl mx-auto bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-6 sm:p-10 text-white">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center border-b border-white/30 pb-5 tracking-wide">
          📬 Subscribers Panel
        </h1>

        {loading ? (
          <div className="text-center text-lg animate-pulse text-white/80 font-semibold">
            Loading subscriber data...
          </div>
        ) : subscribers.length === 0 ? (
          <p className="text-center text-white/70 text-lg italic">No subscribers found.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
            {subscribers.map((sub) => (
              <div
                key={sub._id}
                className="bg-white/95 text-gray-900 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300"
              >
                <span className="text-lg sm:text-xl font-semibold break-words select-text">
                  {sub.email}
                </span>
                <button
                  onClick={() => deleteSubscriber(sub._id)}
                  className="mt-6 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-70"
                  type="button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
