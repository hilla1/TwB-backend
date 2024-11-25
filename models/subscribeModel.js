import mongoose from 'mongoose';
import crypto from 'crypto';

const SubscribeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: 'Invalid email format',
      },
    },
    subscribed: {
      type: Boolean,
      default: true,
    },
    unsubscribeToken: {
      type: String,
      required: false,
    },
    lead: {
      type: Boolean,
      default: true, // Default value for lead
    },
    client: {
      type: Boolean,
      default: false, // Default value for client
    },
    handler: {
      type: String,
      default: null, // Default value for handler (string)
    },
    comments: [{
      text: {
        type: String,
        required: true, // Ensures each comment has text
      },
      createdAt: {
        type: Date,
        default: Date.now, // Automatically set to the current date
      }
    }],
  },
  { timestamps: true }
);

// Method to generate unsubscribe token
SubscribeSchema.methods.generateUnsubscribeToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.unsubscribeToken = token;
  return this.save();
};

// Instance method to unsubscribe a user (soft delete)
SubscribeSchema.methods.unsubscribe = function () {
  this.subscribed = false;
  this.unsubscribeToken = null; // Clear token after unsubscribing
  return this.save();
};

// Instance method to resubscribe a user
SubscribeSchema.methods.resubscribe = function () {
  this.subscribed = true;
  return this.save();
};

export default mongoose.model('Subscribe', SubscribeSchema);
