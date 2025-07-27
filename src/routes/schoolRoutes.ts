import { Router, RequestHandler } from 'express';
import { createSchool, getAllSchools, getSchoolById, updateSchool, deleteSchool, getStudentsBySchool } from '../controllers/schoolController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllSchools as unknown as RequestHandler);
router.get('/:id', getSchoolById as unknown as RequestHandler);

// Protected routes
router.post('/',  createSchool as unknown as RequestHandler);
router.put('/:id', authMiddleware as unknown as RequestHandler, updateSchool as unknown as RequestHandler);
router.delete('/:id', authMiddleware as unknown as RequestHandler, deleteSchool as unknown as RequestHandler);

router.get('/:id/students', getStudentsBySchool as unknown as RequestHandler);

export default router; 