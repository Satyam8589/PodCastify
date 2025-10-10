"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { useOfflineForm } from "@/hooks/useOfflineForm";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', 'queued', or null
  const [errorMessage, setErrorMessage] = useState("");

  const { isOnline, submitForm, hasQueuedSubmissions } = useOfflineForm();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage("");

    try {
      const result = await submitForm(formData, "/api/contact");

      if (result.success) {
        if (result.queued) {
          setSubmitStatus("queued");
          setErrorMessage(result.message);
        } else {
          setSubmitStatus("success");
        }
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "Failed to send message");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please try again.");
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gray-400 rounded-xl py-5 md:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Contact Info */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-6">
              Have questions or want to collaborate? Reach out and we’ll get
              back to you soon.
            </p>
            <ul className="space-y-4 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" />
                hello@podcastify.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-purple-600" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                451 Podcast Blvd, Suite 200, NY, USA
              </li>
            </ul>
            {/* Social icons */}
            <div className="flex gap-4 mt-6 text-purple-600 text-lg">
              <FaFacebookF className="cursor-pointer hover:text-purple-800 transition-colors" />
              <FaTwitter className="cursor-pointer hover:text-purple-800 transition-colors" />
              <FaInstagram className="cursor-pointer hover:text-purple-800 transition-colors" />
              <FaYoutube className="cursor-pointer hover:text-purple-800 transition-colors" />
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div>
            {/* Success Message */}
            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-700">
                  Thank you! Your message has been sent successfully. We'll get
                  back to you soon.
                </p>
              </div>
            )}

            {/* Queued Message */}
            {submitStatus === "queued" && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <p className="text-yellow-700">{errorMessage}</p>
              </div>
            )}

            {/* Offline Status */}
            {!isOnline && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm">
                  📱 You're offline. Your message will be queued and sent
                  automatically when you reconnect.
                </p>
              </div>
            )}

            {/* Queued Submissions Indicator */}
            {hasQueuedSubmissions && isOnline && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-purple-700 text-sm">
                  📤 Sending previously queued messages...
                </p>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === "error" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  disabled={isSubmitting}
                  className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
                disabled={isSubmitting}
                className="w-full p-3 border rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                rows="5"
                required
                disabled={isSubmitting}
                className="w-full p-3 border rounded-md text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
              ></textarea>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
