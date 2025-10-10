"use client";

import { useState, useEffect } from "react";

export const useOfflineForm = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedSubmissions, setQueuedSubmissions] = useState([]);

  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      // Process queued submissions when back online
      if (online && queuedSubmissions.length > 0) {
        processQueuedSubmissions();
      }
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    setIsOnline(navigator.onLine);

    // Load queued submissions from localStorage
    const stored = localStorage.getItem("queued-form-submissions");
    if (stored) {
      setQueuedSubmissions(JSON.parse(stored));
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  const queueFormSubmission = (formData, endpoint) => {
    const submission = {
      id: Date.now().toString(),
      formData,
      endpoint,
      timestamp: new Date().toISOString(),
    };

    const updated = [...queuedSubmissions, submission];
    setQueuedSubmissions(updated);
    localStorage.setItem("queued-form-submissions", JSON.stringify(updated));

    return submission.id;
  };

  const processQueuedSubmissions = async () => {
    for (const submission of queuedSubmissions) {
      try {
        const response = await fetch(submission.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submission.formData),
        });

        if (response.ok) {
          // Remove successful submission from queue
          const updated = queuedSubmissions.filter(
            (s) => s.id !== submission.id
          );
          setQueuedSubmissions(updated);
          localStorage.setItem(
            "queued-form-submissions",
            JSON.stringify(updated)
          );
        }
      } catch (error) {
        console.log("Failed to process queued submission:", error);
      }
    }
  };

  const submitForm = async (formData, endpoint) => {
    if (!isOnline) {
      // Queue for later submission
      const submissionId = queueFormSubmission(formData, endpoint);
      return {
        success: true,
        queued: true,
        message:
          "Your message has been queued and will be sent when you're back online.",
        submissionId,
      };
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      // If online but fetch fails, queue the submission
      const submissionId = queueFormSubmission(formData, endpoint);
      return {
        success: true,
        queued: true,
        message:
          "Connection failed. Your message has been queued and will be sent automatically.",
        submissionId,
      };
    }
  };

  return {
    isOnline,
    queuedSubmissions,
    submitForm,
    hasQueuedSubmissions: queuedSubmissions.length > 0,
  };
};

export default useOfflineForm;
