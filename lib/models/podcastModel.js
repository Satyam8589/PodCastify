import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Timer } from 'lucide-react';

const Schema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    Image:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now()
    },
    time:{
        type: Timer,
        required: true
    },
})

const podcastModel = mongoose.models.blog || mongoose.model('blog', Schema);

export default podcastModel;
export { connectDB };