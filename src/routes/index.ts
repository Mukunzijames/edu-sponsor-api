import express from 'express';
import authRoutes from './authRoutes';
import schoolRoutes from './schoolRoutes';
import studentRoutes from './studentRoutes';
import paymentRoutes from './paymentRoutes';
import sponsorshipRoutes from './sponsorshipRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/schools', schoolRoutes);
router.use('/students', studentRoutes);
router.use('/payments', paymentRoutes);
router.use('/sponsorships', sponsorshipRoutes);

export default router; 