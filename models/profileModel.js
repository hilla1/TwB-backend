import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    unique: true, // Ensures that each user can have only one profile
    sparse: true // Allows null or missing user fields to not conflict with uniqueness
  },
  fullName: { 
    type: String, 
    required: [true, 'Full Name is required'] 
  },
  phoneNumber: { 
    type: String, 
    default: '' // Optional field with a default empty string
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, // Ensures email is stored in lowercase
    trim: true // Trims whitespace from the email
  },
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true, 
    trim: true // Trims whitespace from the username
  },
  bio: { 
    type: String, 
    default: '' // Optional field with a default empty string
  },
  coverPhoto: { 
    type: String, 
    default: '/defaults/default-cover.jpg' // Default value for cover photo
  },
  profilePhoto: { 
    type: String, 
    default: '/defaults/default-avatar.png' // Default value for profile photo
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Indexing for improved query performance
ProfileSchema.index({ email: 1, username: 1 });

const Profile = mongoose.model('Profile', ProfileSchema);

export default Profile;
