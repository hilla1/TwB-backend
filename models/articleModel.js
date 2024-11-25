// models/ArticleModel.js
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  image: { type: String, required: true },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true }, // Full name of the author
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user model
}, { timestamps: true });

const Article = mongoose.model('Article', articleSchema);

export default Article;
