import { Request, Response, NextFunction } from 'express';
import express from 'express';

/**
 * Middleware to handle raw body for Stripe webhooks
 * Stripe needs the raw body to verify webhook signatures
 */
export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  let data = '';
  
  // Get raw body for Stripe webhook verification
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    (req as any).rawBody = data;
    
    // If this is not the webhook route, parse the JSON
    if (req.path !== '/api/payments/webhook') {
      try {
        if (data && req.headers['content-type'] === 'application/json') {
          req.body = JSON.parse(data);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
    
    next();
  });
};

/**
 * Middleware to parse JSON except for webhook routes
 * This is needed because we need the raw body for webhook verification
 */
export const jsonParserMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip JSON parsing for webhook routes
  if (req.path === '/api/payments/webhook') {
    return next();
  }
  
  // For all other routes, parse JSON
  express.json()(req, res, next);
}; 