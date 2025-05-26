import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

const Contact = () => {
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
              <FaFacebookF />
              <FaTwitter />
              <FaInstagram />
              <FaYoutube />
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 border rounded-md text-sm"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 border rounded-md text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full p-3 border rounded-md text-sm"
            />
            <textarea
              placeholder="Your Message"
              rows="5"
              className="w-full p-3 border rounded-md text-sm resize-none"
            ></textarea>
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
