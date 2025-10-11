import React from "react";
import { trackContentInteraction } from "./AnalyticsTracker";

// Make sure to receive props from the parent
const PodcastCard = ({ title, desc, time, image, id, onClick }) => {
  const handleClick = () => {
    // Track the podcast click
    trackContentInteraction("podcast", id || title, title, "click");

    // Call the provided onClick handler if it exists
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className="cursor-pointer bg-white rounded-xl shadow-md overflow-hidden w-full max-w-xs mx-auto transform transition duration-300 hover:scale-105 hover:shadow-lg"
      onClick={handleClick}
    >
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{desc}</p>
        <p className="text-xs text-purple-600 mt-2">{time}</p>
      </div>
    </div>
  );
};

export default PodcastCard;
