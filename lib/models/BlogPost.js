import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['getting-started', 'storytelling', 'branding', 'monetization', 'interviews', 'psychology']
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  time: {
    type: String,
    required: true
  },
  readTime: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  slug: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Helper function to slugify string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric chars with dash
    .replace(/^-+|-+$/g, '')      // remove leading and trailing dashes
    .replace(/-+/g, '-');         // replace multiple dashes with one
}

// Pre-save middleware to generate slug from title
BlogPostSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title);
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
