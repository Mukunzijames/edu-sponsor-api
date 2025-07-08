import express from 'express';
import authRoutes from './authRoutes';
import schoolRoutes from './schoolRoutes';
import studentRoutes from './studentRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/students', studentRoutes);

export default router; 