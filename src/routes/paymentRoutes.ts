import express, { RequestHandler } from 'express';
import { 
  createPaymentIntent, 
  processPayment, 
  handleWebhook, 
  getPaymentMethods,
  createCheckoutSession,
  testPaymentIntent,
  testCheckoutSession,
  testSuccess,
  testCancel,
  processSuccessfulPayment,
  testWebhook
} from '../controllers/paymentController';
import { 
  createDonation, 
  getDonationsBySponsorship, 
  getDonationsBySponsor,
  getDonationStats,
  getAllDonations
} from '../controllers/donationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Test routes without authentication
router.post('/test-payment-intent', testPaymentIntent as unknown as RequestHandler);
router.post('/test-checkout-session', testCheckoutSession as unknown as RequestHandler);
router.get('/test-success', testSuccess as unknown as RequestHandler);
router.get('/test-cancel', testCancel as unknown as RequestHandler);
router.post('/test-webhook', testWebhook as unknown as RequestHandler);
router.get('/donations/all', getAllDonations as unknown as RequestHandler);

// Payment routes
router.post('/create-payment-intent', authMiddleware as unknown as RequestHandler, createPaymentIntent as unknown as RequestHandler);
router.post('/process-payment', authMiddleware as unknown as RequestHandler, processPayment as unknown as RequestHandler);
router.post('/webhook', handleWebhook as unknown as RequestHandler);
router.get('/payment-methods', authMiddleware as unknown as RequestHandler, getPaymentMethods as unknown as RequestHandler);
router.post('/create-checkout-session', authMiddleware as unknown as RequestHandler, createCheckoutSession as unknown as RequestHandler);
router.get('/payment-success', processSuccessfulPayment as unknown as RequestHandler);

// Donation routes
router.post('/donations', authMiddleware as unknown as RequestHandler, createDonation as unknown as RequestHandler);
router.get('/donations/sponsorship/:sponsorshipId', authMiddleware as unknown as RequestHandler, getDonationsBySponsorship as unknown as RequestHandler);
router.get('/donations/sponsor', authMiddleware as unknown as RequestHandler, getDonationsBySponsor as unknown as RequestHandler);
router.get('/donations/stats', authMiddleware as unknown as RequestHandler, getDonationStats as unknown as RequestHandler);

export default router; 