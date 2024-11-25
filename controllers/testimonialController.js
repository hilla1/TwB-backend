import Testimonial from '../models/testimonialModel.js';
import User from '../models/userModel.js';

// Get all testimonials (accessible by everyone)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().populate('user', 'email role'); // Populate user data if available
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials', error });
  }
};

// Create a new testimonial (admin/blogger only)
export const createTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial({
      ...req.body,
      user: req.user.id, // Associate the testimonial with the authenticated user
    });
    await testimonial.save();
    res.status(201).json({ message: 'Testimonial created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating testimonial', error });
  }
};

// Update a testimonial (admin/blogger only)
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'email role');
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    res.status(200).json({ message: 'Testimonial updated successfully', testimonial });
  } catch (error) {
    res.status(500).json({ message: 'Error updating testimonial', error });
  }
};

// Delete a testimonial (admin/blogger only)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting testimonial', error });
  }
};
