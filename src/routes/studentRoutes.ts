import { Router, RequestHandler } from 'express';
import { createStudent, createMultipleStudents, getAllStudents, getStudentById, updateStudent, deleteStudent     } from '../controllers/studentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllStudents as unknown as RequestHandler);
router.get('/:id', getStudentById as unknown as RequestHandler);
router.post('/multiple', createMultipleStudents as unknown as RequestHandler);

// Protected routes
router.post('/', createStudent as unknown as RequestHandler);
router.put('/:id', authMiddleware as unknown as RequestHandler, updateStudent as unknown as RequestHandler);
router.delete('/:id', authMiddleware as unknown as RequestHandler, deleteStudent as unknown as RequestHandler);

export default router; 