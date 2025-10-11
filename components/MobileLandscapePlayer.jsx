"use client";

import React, { useState, useEffect, useRef } from "react";
import { Maximize, RotateCcw } from "lucide-react";

const MobileLandscapePlayer = ({ videoId, title }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Handle orientation changes
    const handleOrientationChange = () => {
      if (screen.orientation) {
        setOrientation(
          screen.orientation.type.includes("landscape")
            ? "landscape"
            : "portrait"
        );
      } else {
        // Fallback for older browsers
        setOrientation(
          window.innerWidth > window.innerHeight ? "landscape" : "portrait"
        );
      }
    };

    // Listen for orientation changes
    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationChange);
    }
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    // Set initial orientation
    handleOrientationChange();

    // Cleanup
    return () => {
      if (screen.orientation) {
        screen.orientation.removeEventListener(
          "change",
          handleOrientationChange
        );
      }
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      const element = containerRef.current;
      if (!element) return;

      // Request fullscreen
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }

      setIsFullscreen(true);

      // For mobile devices, encourage landscape mode
      if (
        window.innerWidth <= 768 &&
        screen.orientation &&
        screen.orientation.lock
      ) {
        try {
          await screen.orientation.lock("landscape-primary");
        } catch (e) {
          console.log("Orientation lock not supported or failed:", e);
        }
      }
    } catch (error) {
      console.error("Fullscreen request failed:", error);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }

      setIsFullscreen(false);

      // Unlock orientation
      if (screen.orientation && screen.orientation.unlock) {
        try {
          await screen.orientation.unlock();
        } catch (e) {
          console.log("Orientation unlock failed:", e);
        }
      }
    } catch (error) {
      console.error("Exit fullscreen failed:", error);
    }
  };

  const rotateToLandscape = async () => {
    if (screen.orientation && screen.orientation.lock) {
      try {
        const currentType = screen.orientation.type;
        const newOrientation = currentType.includes("landscape")
          ? "portrait-primary"
          : "landscape-primary";
        await screen.orientation.lock(newOrientation);
      } catch (e) {
        console.log("Rotation failed:", e);
        // Fallback: just show instruction
        alert(
          "Please rotate your device manually for better viewing experience"
        );
      }
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  if (!videoId) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Invalid YouTube URL</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0`;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden shadow-lg ${
        isFullscreen ? "fixed inset-0 z-50" : "w-full h-64 md:h-96"
      }`}
    >
      {/* Video iframe */}
      <iframe
        ref={playerRef}
        src={embedUrl}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />

      {/* Mobile controls overlay */}
      {!isFullscreen && (
        <div className="absolute top-2 right-2 flex space-x-2 md:hidden">
          <button
            onClick={requestFullscreen}
            className="p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
            title="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      )}

      {/* Fullscreen controls */}
      {isFullscreen && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top controls */}
          <div className="absolute top-4 right-4 flex space-x-2 pointer-events-auto md:hidden">
            <button
              onClick={rotateToLandscape}
              className="p-3 bg-purple-600/80 text-white rounded-full hover:bg-purple-700/80 transition-colors"
              title="Rotate to landscape"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={exitFullscreen}
              className="px-4 py-2 bg-red-600/80 text-white rounded-full hover:bg-red-700/80 transition-colors text-sm font-medium"
            >
              Exit
            </button>
          </div>

          {/* Orientation hint */}
          {orientation === "portrait" && isFullscreen && (
            <div className="absolute bottom-4 left-4 right-4 pointer-events-none md:hidden">
              <div className="bg-black/80 text-white p-3 rounded-lg text-center text-sm">
                <p className="mb-2">📱 Rotate your device for better viewing</p>
                <p className="text-xs text-gray-300">
                  or tap the rotate button above
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile hint when not fullscreen */}
      {!isFullscreen && (
        <div className="absolute bottom-2 left-2 right-2 md:hidden">
          <div className="bg-black/60 text-white p-2 rounded text-xs text-center">
            Tap fullscreen for landscape mode
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLandscapePlayer;
