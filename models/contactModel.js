import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

// Define the schema for contact messages
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
  subject: {
    type: String,
    default: 'Response from TwB (techwithbrands.com) to your enquiry', // Default value for subject
  },
  messages: [
    {
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  responses: [
    {
      message: {
        type: String,
        required: true,
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        autopopulate: true, // Auto-populate on query
      },
      respondedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Add autopopulate plugin
contactSchema.plugin(autopopulate);

// Create and export the model
const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
