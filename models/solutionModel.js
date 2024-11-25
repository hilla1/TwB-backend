import mongoose from 'mongoose';

// Define the schema for the solution directly with item fields
const SolutionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Title of the solution item
    description: { type: String, required: true }, // Description of the solution item
    images: [{ type: String }], // Array of image URLs
    category: { type: String, required: true }, // Category for the item
    cta: {
      text: { type: String }, // Call-to-action text (optional)
      href: { type: String }   // Call-to-action link (optional)
    },

    // User who created the solution
    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the User model
      email: { type: String, required: true } // Email of the user who created the solution
    }
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

export default mongoose.model('Solution', SolutionSchema);
