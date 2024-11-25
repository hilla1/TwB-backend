import { OAuth2Client } from 'google-auth-library';
import User from '../models/userModel.js';
import Profile from '../models/profileModel.js';
import { generateToken, generateRefreshToken } from '../middlewares/authMiddleware.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
const redirectURL = `${process.env.VITE_CLIENT_URL}/oauth/callback`;

// Helper function to handle errors
const handleError = (res, statusCode, message, details = null) => {
  res.status(statusCode).json({
    status: 'error',
    message,
    details,
  });
};

// Google OAuth Redirect URL
export const googleOAuthRedirect = (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    redirect_uri: redirectURL,
  });

  // Redirect user to Google OAuth consent screen
  res.redirect(authorizeUrl);
};

// Google OAuth Callback with cookies for token storage
export const googleOAuthCallback = async (req, res, next) => {
  const { code } = req.body; // Changed from req.query to req.body

  if (!code) {
    return handleError(res, 400, 'Authorization code is required');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectURL,
    });
    client.setCredentials(tokens);

    // Get user info from Google
    const userInfoResponse = await client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const { sub: googleId, email, name, picture: avatar } = userInfoResponse.data; // Extract profile photo

    // Check if user already exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with default role 'client'
      user = new User({ name, email, googleId, role: 'client', avatar,});
      await user.save();

      // Create a new profile for the user
      const profile = new Profile({
        user: user._id,
        fullName: name, // Set the full name from Google profile
        email: user.email,
        username: email.split('@')[0], // Basic username, could be improved
        profilePhoto: avatar, // Save the Google profile photo URL
      });
      await profile.save();
    } else {
      // If user already exists, ensure the role is fetched from the database
      user = await User.findById(user._id); // Refetch user from the database to get the latest role
    }

    // Generate JWT and refresh tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set the tokens in cookies
    res.cookie('token', token, {
      httpOnly: true, // Ensures the cookie is not accessible via JavaScript
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production', // Ensures the cookie is sent over HTTPS in production
      maxAge: 15 * 60 * 1000, // 15 minutes expiry for access token
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry for refresh token
    });

    // Send only the status response
    res.status(200).json({
      status: 'authenticated',
    });
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    next(error); // Pass error to the error-handling middleware
  }
};
