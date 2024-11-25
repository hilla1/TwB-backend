import Article from '../models/articleModel.js';
import User from '../models/userModel.js'; 

// Get all articles
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new article
export const createArticle = async (req, res) => {
  const { image, category, title, description } = req.body; // Exclude author from request body

  try {
    // Get user from request (added by protect middleware)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Automatically set author to user's full name and user ID
    const newArticle = new Article({
      image,
      category,
      title,
      description,
      author: user.name, // Set author as user's name
      user: req.user.id, // Store the user's ID
    });

    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an article by ID
export const updateArticle = async (req, res) => {
  const { id } = req.params;
  const { image, category, title, description } = req.body;

  try {
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if the user is the author of the article
    if (article.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // Update fields if provided
    article.image = image || article.image;
    article.category = category || article.category;
    article.title = title || article.title;
    article.description = description || article.description;

    const updatedArticle = await article.save();
    res.json(updatedArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an article by ID
export const deleteArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Use deleteOne from the document instance
    await article.deleteOne();
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


