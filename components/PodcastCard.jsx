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
      className="cursor-pointer bg-white rounded-xl shadow-md overflow-hidden w-full max-w-xs mx-auto transform transition duration-300 hover:scale-105 hover:shadow-lg h-full flex flex-col"
      onClick={handleClick}
    >
      <img
        src={image}
        alt={title}
        className="w-full h-48 object-cover flex-shrink-0"
      />
      <div className="p-4 podcast-card-content flex-grow">
        <h3 className="text-lg font-semibold truncate mb-2" title={title}>
          {title}
        </h3>
        <p
          className="text-sm text-gray-500 line-clamp-2 overflow-hidden mb-2 flex-grow"
          title={desc}
        >
          {desc}
        </p>
        <p className="text-xs text-purple-600 truncate mt-auto" title={time}>
          {time}
        </p>
      </div>
    </div>
  );
};

export default PodcastCard;
