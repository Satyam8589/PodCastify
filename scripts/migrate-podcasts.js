// Migration script to move podcast data from JSON to MongoDB
// Run this script once to migrate existing data

import { connectToDatabase } from "../lib/config/mongodb.js";
import Podcast from "../lib/models/Podcast.js";
import fs from "fs";
import path from "path";

const migratePodcastData = async () => {
  try {
    console.log("Starting podcast data migration...");

    // Connect to MongoDB
    await connectToDatabase();
    console.log("Connected to MongoDB");

    // Check if podcasts already exist in MongoDB
    const existingCount = await Podcast.countDocuments();
    if (existingCount > 0) {
      console.log(
        `Found ${existingCount} podcasts already in MongoDB. Skipping migration.`
      );
      return;
    }

    // Read JSON data
    const dataFilePath = path.join(process.cwd(), "data", "podcasts.json");

    if (!fs.existsSync(dataFilePath)) {
      console.log("No podcast JSON file found. Nothing to migrate.");
      return;
    }

    const jsonData = fs.readFileSync(dataFilePath, "utf8");
    const podcasts = JSON.parse(jsonData);

    console.log(`Found ${podcasts.length} podcasts in JSON file`);

    // Transform and insert data
    const migratedPodcasts = [];

    for (const podcast of podcasts) {
      try {
        // Transform JSON structure to MongoDB structure
        const newPodcast = new Podcast({
          title: podcast.title,
          description: podcast.description,
          podcastLink: podcast.podcastLink,
          date: podcast.date,
          time: podcast.time,
          thumbnail: {
            url: podcast.thumbnail || "/images/default-podcast.jpg",
            public_id: "migrated-" + (podcast.id || Date.now()),
          },
          featured: false,
          // Keep original creation date if available
          createdAt: podcast.createdAt
            ? new Date(podcast.createdAt)
            : new Date(),
          updatedAt: podcast.updatedAt
            ? new Date(podcast.updatedAt)
            : new Date(),
        });

        const saved = await newPodcast.save();
        migratedPodcasts.push(saved);
        console.log(`✓ Migrated: ${podcast.title}`);
      } catch (error) {
        console.error(`✗ Failed to migrate "${podcast.title}":`, error.message);
      }
    }

    console.log(`\nMigration completed successfully!`);
    console.log(
      `Total podcasts migrated: ${migratedPodcasts.length} out of ${podcasts.length}`
    );

    // Optionally backup the JSON file
    const backupPath = path.join(process.cwd(), "data", "podcasts.json.backup");
    fs.copyFileSync(dataFilePath, backupPath);
    console.log(`Original JSON file backed up to: ${backupPath}`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePodcastData()
    .then(() => {
      console.log("Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

export default migratePodcastData;
