// Base URL for the API
export const BASE_URL = process.env.BASE_URL;

// JWT Secret Key
export const JWT_SECRET = process.env.JWT_SECRET;

// JWT Refresh Secret Key
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Dynamic CORS configuration
const allowedOrigins = [
  process.env.VITE_CLIENT_URL, 
  // Add other allowed origins here if necessary (e.g., staging or production URLs)
];

export const CORS_CONFIG = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) { // Allow requests from allowed origins or requests with no origin
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS', // Allowed HTTP methods
  credentials: true, // Allow cookies to be sent with requests
};
