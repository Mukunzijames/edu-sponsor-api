import express, { RequestHandler } from 'express';
import { 
  createSponsorship, 
  getSponsorshipsBySponsor, 
  getSponsorshipsByStudent,
  getSponsorshipById,
  updateSponsorshipStatus
} from '../controllers/sponsorshipController';
import {  authMiddleware } from '../middleware/auth';

const router = express.Router();

// Sponsorship routes
router.post('/', authMiddleware as unknown as RequestHandler, createSponsorship as unknown as RequestHandler);
router.get('/sponsor', authMiddleware as unknown as RequestHandler, getSponsorshipsBySponsor as unknown as RequestHandler);
router.get('/student', authMiddleware as unknown as RequestHandler, getSponsorshipsByStudent as unknown as RequestHandler);
router.get('/:id', authMiddleware as unknown as RequestHandler, getSponsorshipById as unknown as RequestHandler);
router.patch('/:id/status', authMiddleware as unknown as RequestHandler, updateSponsorshipStatus as unknown as RequestHandler);

export default router; 