'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.includes('@gmail.com')) {
      toast.error('Please enter a valid Gmail address');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/subscribers', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success('🎉 Thank you for subscribing!');
      setEmail('');
    } else {
      toast.error(data.message || 'Something went wrong');
    }
  };

  return (
    <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Never Miss an Update!
        </h2>
        <p className="text-xl text-gray-200 mb-8">
          Subscribe for the latest episodes and news.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your Gmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-4 rounded-full border-0 focus:ring-4 focus:ring-white/20 focus:outline-none text-gray-900 bg-white/90 backdrop-blur-sm"
          />
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 to-violet-500 text-white px-8 py-4 rounded-full font-bold hover:from-pink-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
