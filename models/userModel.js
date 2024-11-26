import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Profile from './profileModel.js'; // Import the Profile model

// Define user schema with timestamps enabled and virtuals
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true, 
    match: [/.+@.+\..+/, 'Please enter a valid email'] 
  },
  password: { 
    type: String, 
    minlength: [6, 'Password must be at least 6 characters'], 
    default: 'google-auth' // Placeholder password for Google users
  },
  googleId: { 
    type: String, 
    default: null, // This will store the Google ID if the user signs in with Google
  },
  role: { 
    type: String, 
    enum: ['admin', 'business', 'client', 'freelancer','consultant'], 
    default: 'client' 
  },
  isActive: { 
    type: Boolean, 
    default: true // Field to check if the user is active
  },
  blocked: { 
    type: Boolean, 
    default: false // Field to check if the user is blocked
  },
  avatar: { 
    type: String, 
    default: '' // Avatar field with default empty string
  },
  messageCount: { 
    type: Number, 
    default: 0 // Message count defaulting to zero
  },
  notificationCount: { 
    type: Number, 
    default: 0 // Notification count defaulting to zero
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for profile
UserSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

// Hash password before saving (if applicable)
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new) and not the placeholder
  if (!this.isModified('password') || this.password === 'google-auth') return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err);
  }
});

// Method to compare hashed passwords
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Ignore the 'google-auth' condition and always check the password
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to delete the associated profile when a user is deleted
UserSchema.pre('remove', async function(next) {
  try {
    await Profile.findOneAndDelete({ user: this._id });
    next();
  } catch (error) {
    console.error('Error deleting profile:', error);
    next(error);
  }
});

// Create and export the User model
const User = mongoose.model('User', UserSchema);

export default User;
