"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const AnalyticsTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Track page visit
    trackPageVisit(pathname);
  }, [pathname]);

  const trackPageVisit = async (page) => {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": getSessionId(),
        },
        body: JSON.stringify({
          action: "track_visit",
          data: { page },
        }),
      });
    } catch (error) {
      console.error("Failed to track page visit:", error);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  };

  return null; // This component doesn't render anything
};

// Global function to track content interactions
export const trackContentInteraction = async (
  contentType,
  contentId,
  contentTitle,
  actionType
) => {
  try {
    const sessionId = (() => {
      let id = sessionStorage.getItem("analytics_session_id");
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("analytics_session_id", id);
      }
      return id;
    })();

    await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
      },
      body: JSON.stringify({
        action: "track_interaction",
        data: {
          contentType,
          contentId,
          contentTitle,
          actionType,
        },
      }),
    });
  } catch (error) {
    console.error("Failed to track content interaction:", error);
  }
};

export default AnalyticsTracker;
