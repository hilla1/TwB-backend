import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // Ensure you have the User model

// Ensure JWT secrets are defined either in environment variables or default them
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret';

// Middleware to protect routes by ensuring the user is authenticated via JWT stored in cookies
export const protect = async (req, res, next) => {
  // Check for token in cookies
  const token = req.cookies.token;

  if (token) {
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find the user based on the decoded token's payload
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user data to the request object for further use in the route
      req.user = {
        id: user._id,
        email: user.email,
        name:user.name,
        role: user.role,
        avatar: user.avatar,
        messageCount:user.messageCount,
        notificationCount:user.notificationCount,
      };

      return next(); // Proceed to the next middleware or route handler
    } catch (error) {
      // Handle different JWT verification errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    // If no token is found, send 401 Unauthorized
    res.status(401).json({ message: 'Not authorized, token required' });
  }
};

// Function to generate JWT token (for user authentication)
export const generateToken = (user) => {
  // Token expires in 1 hour; adjust expiration as needed
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
};

// Function to generate a refresh token (longer expiration)
export const generateRefreshToken = (user) => {
  // Refresh token expires in 7 days
  return jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Function to verify a token (used in routes where token validity needs to be checked)
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        // Handle token errors specifically
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired' });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Token is valid, save the user ID in req.user for use in the next steps
      req.user = { id: decoded.id };
      next(); // Proceed to the next middleware/route handler
    });
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};

// Function to refresh JWT using a valid refresh token stored in cookies
export const refreshToken = async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshTokenFromCookie, JWT_REFRESH_SECRET);

    // Find the user based on the refresh token's payload
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate a new access token
    const newToken = generateToken(user); // Ensure generateToken function is defined
    const refreshTokenValue = generateRefreshToken(user);

    // Set new access token in the cookies (secure, HTTP only, with expiration)
    res.cookie('token', newToken, {
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production
      sameSite: 'Strict', // Prevents CSRF attacks
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshTokenValue, {
      httpOnly: true,
      sameSite: 'Strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days expiry
    });

    // Respond with a success message
    return res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    // Handle refresh token errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    console.error('Refresh token verification error:', error);
    return res.status(401).json({ message: 'Not authorized' });
  }
};

// Middleware to verify the user's role
export const verifyRole = (roles) => async (req, res, next) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Find the user by ID
    const user = await User.findById(req.user.id).select('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};
