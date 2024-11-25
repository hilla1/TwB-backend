// routes/projectRoutes.js
import express from 'express';
import { createProject, rateExpert, getAllProjects, getProjectById, updateProjectById,deleteProjectById, addModule, updateModule, deleteModule } from '../controllers/projectController.js';
import { protect, verifyRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply the protect middleware to all routes to ensure the user is authenticated
router.use(protect);

// POST /projects - Create a new project and break it into modules
router.post('/', createProject);

// POST /projects/rate - Rate an expert after completing a module
router.post('/rate', rateExpert);

// GET /projects - Retrieve all projects
router.get('/', getAllProjects);

// GET /projects/:id - Retrieve a single project by ID
router.get('/:id', getProjectById);

// PUT /projects/:id - Update an existing project
router.put('/:id', updateProjectById);

// DELETE /projects/:id - Delete a project
router.delete('/:id', deleteProjectById);

router.post('/:projectId/modules', addModule);
router.patch('/:projectId/modules/:moduleId', updateModule);
router.delete('/:projectId/modules/:moduleId', deleteModule);

export default router;
