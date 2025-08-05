# 🎧 PodCastify

![PodCastify Banner](https://raw.githubusercontent.com/Satyam8589/PodCastify/refs/heads/master/Screenshot%202025-08-05%20182756.png) <!-- Update the path if needed -->

PodCastify is a podcast streaming web application that allows users to explore and listen to podcasts, read blogs, and stay updated with news — all in one place. Built with **Next.js**, **Tailwind CSS**, and **Firebase**, this platform is designed for speed, security, and scalability.

## 🚀 Features

- 🎙️ Stream and browse various podcasts
- 📰 Read curated blogs and news content
- 🔐 Secure and separate **Admin Panel** for content management
- 🔍 Search and discover new content
- 🧠 Clean and responsive UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend/Auth:** Firebase (Firestore & Auth)
- **Styling:** Tailwind CSS
- **Routing & Middleware:** Next.js middleware for admin protection

## 🔐 Admin Panel

The app includes a secure `/admin` route accessible only to authenticated admins via Firebase. Admins can:

- Add or manage podcasts
- Post blogs and news
- Monitor uploads and users (if extended)

## 📁 Folder Structure (Important)

PodCastify/
├── app/
│ ├── admin/ → Protected admin panel
│ ├── blogs/ → Blogs section
│ ├── podcast/ → Podcast pages
│ ├── news/ → News section
├── components/ → Reusable React components
├── data/ → JSON/static data
├── public/ → Public assets (images/icons)
├── firebaseConfig.js → Firebase config file
├── middleware.js → Protects admin route


© 2025 PodCastify – All rights reserved.
