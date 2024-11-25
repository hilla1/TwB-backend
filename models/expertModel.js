import mongoose from 'mongoose';
import autopopulate from 'mongoose-autopopulate';

const { Schema } = mongoose;

// Feedback schema for storing project feedback
const feedbackSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', autopopulate: true }, // Auto-populate project details
  score: { type: Number, required: true },
  comment: { type: String },
}, { timestamps: true });

// Expert schema definition
const expertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, autopopulate: true }, // Auto-populate user details
  email: { type: String, required: true, unique: true }, // Unique email field
  skillSet: { type: [String], required: true },
  availability: { type: Boolean, default: true },
  rating: { type: Number, default: 5 },
  completedTasks: { type: Number, default: 0 },
  totalRatingScore: { type: Number, default: 0 },
  lastAssignedTask: { type: Date },
  feedback: [feedbackSchema],
  moduleEarnings: [{ // New field to track earnings from modules
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', autopopulate: { maxDepth: 2 } }, // Populate project details, which can include modules
    amount: { type: Number, required: true }, // Earnings amount
  }],
  totalEarnings: { type: Number, default: 0 }, // Total earnings from all modules
}, { timestamps: true });

// Apply the autopopulate plugin to the schema
expertSchema.plugin(autopopulate);

// Export the Expert model
export default mongoose.model('Expert', expertSchema);
