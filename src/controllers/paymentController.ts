import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { Stripe } from 'stripe';
import { db } from '../db';
import { Donation, Sponsorship } from '../db/schema';
import { and, eq } from 'drizzle-orm';
import { User } from '../db/schema';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

if (!stripeSecretKey) {
  console.error('Stripe secret key is not defined');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-06-30.basil',
});

interface UserInterface {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
  userId?: string;
}

export const testPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        test: 'true'
      },
    });
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating test payment intent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test payment intent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const testCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Donation',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${backendUrl}/api/payments/test-success`,
      cancel_url: `${backendUrl}/api/payments/test-cancel`,
    });
    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating test checkout session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test checkout session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const testSuccess = async (req: Request, res: Response) => {
  return res.status(200).send('<html><body><h1>Payment Successful!</h1><p>Your test payment was successful.</p></body></html>');
};

export const testCancel = async (req: Request, res: Response) => {
  return res.status(200).send('<html><body><h1>Payment Cancelled</h1><p>Your test payment was cancelled.</p></body></html>');
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { amount, studentId } = req.body;
    const user = req.user as unknown as UserInterface;
    if (!amount || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and student ID are required'
      });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        sponsorId: user.Id,
        studentId,
      },
    });
    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
    });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment intent ID is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed',
      });
    }

    const { sponsorId, studentId } = paymentIntent.metadata;
    const amountPaid = paymentIntent.amount / 100;

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        sponsorId,
        studentId,
        amount: amountPaid,
        paymentId: paymentIntentId,
      },
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
    });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { studentId, amount } = req.body;
    const user = req.user as unknown as UserInterface;

    if (!studentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and amount are required',
      });
    }

    const sponsorId = user.userId || user.Id;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Student Sponsorship Donation',
              description: `Donation for student ${studentId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${backendUrl}/api/payments/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${backendUrl}/payment-cancel.html`,
      metadata: {
        sponsorId,
        studentId,
        amount: amount.toString(),
      },
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const processSuccessfulPayment = async (req: Request, res: Response) => {
  try {
    const { session_id, payment_id } = req.query;
    const sessionId = session_id || payment_id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed',
      });
    }

    const { sponsorId, studentId } = session.metadata || {};
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0;

    if (sponsorId && studentId && amountPaid) {
      await createDonationRecord(sponsorId, studentId, amountPaid);
    }

    if (req.headers.accept?.includes('text/html')) {
      return res.redirect(`${frontendUrl}/payment-complete?payment_id=${sessionId}&amount=${amountPaid}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        sponsorId,
        studentId,
        amount: amountPaid,
        sessionId,
      },
    });
  } catch (error) {
    console.error('Error processing successful payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    console.log('Missing signature or endpoint secret, proceeding with test mode');
    try {
      const event = req.body;
      await processWebhookEvent(event);
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error('Error processing webhook event:', err);
      return res.status(400).json({ success: false, message: 'Webhook processing failed' });
    }
  }

  let event;
  try {
    const rawBody = (req as any).rawBody;
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    await processWebhookEvent(event);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
  }

  res.status(200).json({ received: true });
};

export const testWebhook = async (req: Request, res: Response) => {
  try {
    const { type, sponsorId, studentId, amount } = req.body;

    if (!type || !sponsorId || !studentId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, sponsorId, studentId, amount',
      });
    }

    let mockEvent;
    let paymentId;

    if (type === 'payment_intent.succeeded') {
      paymentId = `pi_test_${Date.now()}`;
      mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentId,
            amount: amount * 100,
            metadata: {
              sponsorId,
              studentId,
            },
          },
        },
      };
    } else if (type === 'checkout.session.completed') {
      paymentId = `cs_test_${Date.now()}`;
      mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: paymentId,
            amount_total: amount * 100,
            metadata: {
              sponsorId,
              studentId,
            },
            payment_status: 'paid',
          },
        },
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type. Must be "payment_intent.succeeded" or "checkout.session.completed"',
      });
    }

    await processWebhookEvent(mockEvent);

    const acceptHeader = req.headers.accept || '';
    if (acceptHeader.includes('text/html')) {
      return res.redirect(`${frontendUrl}/payment-complete.html?payment_id=${paymentId}&amount=${amount}`);
    }

    return res.status(200).json({
      success: true,
      message: `Test ${type} event processed successfully`,
      event: mockEvent,
    });
  } catch (error) {
    console.error('Error processing test webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process test webhook',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

async function processWebhookEvent(event: any) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      await createDonationRecord(
        paymentIntent.metadata?.sponsorId,
        paymentIntent.metadata?.studentId,
        paymentIntent.amount / 100
      );
      break;
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session.id);
      await createDonationRecord(
        session.metadata?.sponsorId,
        session.metadata?.studentId,
        session.amount_total / 100
      );
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function createDonationRecord(sponsorId: string, studentId: string, amount: number) {
  try {
    if (!sponsorId || !studentId) {
      console.error('Missing sponsorId or studentId');
      return;
    }

    console.log('Creating donation record:', { sponsorId, studentId, amount });

    let sponsorExists = await db.query.User.findFirst({
      where: eq(User.Id, sponsorId),
    });

    if (!sponsorExists) {
      console.log('Creating temporary sponsor user');
      await db.insert(User).values({
        Id: sponsorId,
        Name: 'Temporary Sponsor',
        Age: '30',
        Email: `sponsor-${sponsorId.substring(0, 8)}@example.com`,
        Password: 'temporary',
        Role: 'Sponsor',
      });
    }

    let studentExists = await db.query.User.findFirst({
      where: eq(User.Id, studentId),
    });

    if (!studentExists) {
      console.log('Creating temporary student user');
      await db.insert(User).values({
        Id: studentId,
        Name: 'Temporary Student',
        Age: '15',
        Email: `student-${studentId.substring(0, 8)}@example.com`,
        Password: 'temporary',
        Role: 'Student',
      });
    }

    const existingSponsorship = await db.query.Sponsorship.findFirst({
      where: and(
        eq(Sponsorship.SponsorId, sponsorId),
        eq(Sponsorship.StudentId, studentId)
      ),
    });

    let sponsorshipId;
    if (existingSponsorship) {
      sponsorshipId = existingSponsorship.Id;
      console.log('Using existing sponsorship:', sponsorshipId);
    } else {
      console.log('Creating new sponsorship');

      const today = new Date().toISOString().split('T')[0];

      const newSponsorships = await db.insert(Sponsorship).values({
        SponsorId: sponsorId,
        StudentId: studentId,
        StartDate: today,
        Status: 'Active',
      }).returning();

      if (!newSponsorships || newSponsorships.length === 0) {
        throw new Error('Failed to create sponsorship');
      }

      sponsorshipId = newSponsorships[0].Id;
      console.log('Created new sponsorship:', sponsorshipId);
    }

    const newDonations = await db.insert(Donation).values({
      SponsorshipId: sponsorshipId,
      Amount: amount.toString(),
    }).returning();

    if (!newDonations || newDonations.length === 0) {
      throw new Error('Failed to create donation record');
    }

    console.log('Donation created successfully:', newDonations[0]);
    return newDonations[0];
  } catch (error) {
    console.error('Error creating donation record:', error);
    throw error;
  }
}

export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UserInterface;

    return res.status(200).json({
      success: true,
      data: [],
      message: 'Payment methods retrieved successfully',
    });
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
    });
  }
};
