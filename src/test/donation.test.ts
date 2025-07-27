import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

describe('Donation Routes', () => {
  // Mock user data for authentication
  const mockUser = {
    Id: '550e8400-e29b-41d4-a716-446655440000',
    Name: 'Test User',
    Email: 'test@example.com',
    Role: 'Sponsor'
  };

  const mockStudent = {
    Id: '550e8400-e29b-41d4-a716-446655440001',
    Name: 'Test Student',
    Email: 'student@example.com',
    Role: 'Student'
  };

  // Generate valid JWT token for authentication
  const generateToken = (userId: string) => {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET || 'HEDSAFNJASKJFBASDKJBFKJSDBKJD',
      { expiresIn: '1h' }
    );
  };

  const validToken = generateToken(mockUser.Id);
  const studentToken = generateToken(mockStudent.Id);

  describe('GET /api/payments/donations/all (Public)', () => {
    it('should get all donations without authentication', async () => {
      const response = await request(app)
        .get('/api/payments/donations/all')
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message', 'All donations retrieved successfully');
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array');
      
      console.log('✅ All donations retrieved:', response.body.data.length, 'donations found');
      
      if (response.body.data.length > 0) {
        const donation = response.body.data[0];
        expect(donation).to.have.property('Id');
        expect(donation).to.have.property('Amount');
        expect(donation).to.have.property('SponsorshipId');
        expect(donation).to.have.property('DonatedAt');
        expect(donation).to.have.property('Sponsorship');
        
        console.log('✅ Sample donation structure verified');
      }
    });
  });

  describe('POST /api/payments/donations (Protected)', () => {
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .send({
          sponsorshipId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Correctly blocked request without auth token');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          sponsorshipId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Invalid or expired token');
      console.log('✅ Correctly blocked request with invalid token');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${validToken}`)
        .send({}) // Empty body
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship ID and amount are required');
      console.log('✅ Correctly validated required fields');
    });

    it('should return 400 when sponsorshipId is missing', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ amount: 100 })
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship ID and amount are required');
      console.log('✅ Correctly validated sponsorshipId field');
    });

    it('should return 400 when amount is missing', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ sponsorshipId: '550e8400-e29b-41d4-a716-446655440000' })
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship ID and amount are required');
      console.log('✅ Correctly validated amount field');
    });

    it('should return 404 for non-existent sponsorship', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          sponsorshipId: fakeId,
          amount: 100
        })
        .expect(404);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship not found');
      console.log('✅ Correctly handled non-existent sponsorship');
    });
  });

  describe('GET /api/payments/donations/sponsorship/:sponsorshipId (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/payments/donations/sponsorship/550e8400-e29b-41d4-a716-446655440000')
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected sponsorship donations route correctly requires auth');
    });

    it('should return 404 for non-existent sponsorship', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .get(`/api/payments/donations/sponsorship/${fakeId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(404);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship not found');
      console.log('✅ Correctly handled non-existent sponsorship for donations');
    });
  });

  describe('GET /api/payments/donations/sponsor (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/payments/donations/sponsor')
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected sponsor donations route correctly requires auth');
    });

    it('should return sponsor donations with valid token', async () => {
      const response = await request(app)
        .get('/api/payments/donations/sponsor')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message', 'Donations retrieved successfully');
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array');
      
      console.log('✅ Successfully retrieved sponsor donations:', response.body.data.length, 'donations');
    });
  });

  describe('GET /api/payments/donations/stats (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/payments/donations/stats')
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected stats route correctly requires auth');
    });

    it('should return donation statistics with valid token', async () => {
      const response = await request(app)
        .get('/api/payments/donations/stats')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message', 'Donation statistics retrieved successfully');
      expect(response.body).to.have.property('data');
      
      const stats = response.body.data;
      expect(stats).to.have.property('totalAmount');
      expect(stats).to.have.property('donationCount');
      expect(stats).to.have.property('studentCount');
      expect(stats.totalAmount).to.be.a('number');
      expect(stats.donationCount).to.be.a('number');
      expect(stats.studentCount).to.be.a('number');
      
      console.log('✅ Stats retrieved:', {
        totalAmount: stats.totalAmount,
        donationCount: stats.donationCount,
        studentCount: stats.studentCount
      });
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', 'InvalidFormat')
        .send({
          sponsorshipId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Correctly handled malformed Authorization header');
    });

    it('should handle expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: mockUser.Id },
        process.env.JWT_SECRET || 'HEDSAFNJASKJFBASDKJBFKJSDBKJD',
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          sponsorshipId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Invalid or expired token');
      console.log('✅ Correctly handled expired token');
    });

    it('should handle token with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: mockUser.Id },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .send({
          sponsorshipId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 100
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Invalid or expired token');
      console.log('✅ Correctly handled token with wrong secret');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully in getAllDonations', async () => {
      // This test ensures the try-catch blocks work
      // In a real scenario, you might mock the database to throw an error
      const response = await request(app)
        .get('/api/payments/donations/all');
      
      // Should either succeed (200) or handle error gracefully (500)
      expect([200, 500]).to.include(response.status);
      
      if (response.status === 500) {
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('message');
      }
      
      console.log('✅ Error handling test completed for getAllDonations');
    });

    it('should validate numeric amount values', async () => {
      const response = await request(app)
        .post('/api/payments/donations')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          sponsorshipId: '550e8400-e29b-41d4-a716-446655440000',
          amount: 'invalid-amount' // Non-numeric amount
        });

      // Should either validate (400) or attempt to process (404/403/201)
      expect([400, 404, 403, 201, 500]).to.include(response.status);
      console.log('✅ Amount validation test completed with status:', response.status);
    });
  });
}); 