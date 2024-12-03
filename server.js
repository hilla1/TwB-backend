import express from 'express';
import connectDB from './config/db.js';
import profileRoutes from './routes/profileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import solutionRoutes from './routes/solutionRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import subscribeRoutes from './routes/subscribeRoutes.js';
import manageUserRoutes from './routes/manageUserRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import expertRoutes from './routes/expertRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import milestoneRoutes from './routes/milestoneRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorMiddleware.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import dotenv from 'dotenv';
import { BASE_URL, CORS_CONFIG } from './config/constants.js';

dotenv.config();
connectDB();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors(CORS_CONFIG));

// Rate Limiting Middleware
app.use(
  rateLimit({
    windowMs: 15 * 60 * 100, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
  })
);

// Swagger Documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Define API routes
app.use('/api/profiles', profileRoutes); // done working
app.use('/auth', authRoutes); // For authentication routes (both JWT and OAuth) done working
app.use('/articles', articleRoutes); // done working
app.use('/solutions', solutionRoutes); // done working
app.use('/testimonials', testimonialRoutes); // done working
app.use('/contact', contactRoutes); // done working
app.use('/subscribe', subscribeRoutes); // done working
app.use('/users', manageUserRoutes); // done working
app.use('/projects', projectRoutes);
app.use('/experts', expertRoutes); // done working
app.use('/upload', uploadRoutes); // done working
app.use('/milestones', milestoneRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${BASE_URL}`));
