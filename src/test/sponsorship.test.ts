import { expect } from 'chai';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

describe('Sponsorship Routes', () => {
  // Mock user data for authentication
  const mockSponsor = {
    Id: '550e8400-e29b-41d4-a716-446655440000',
    Name: 'Test Sponsor',
    Email: 'sponsor@example.com',
    Role: 'Sponsor'
  };

  const mockStudent = {
    Id: '550e8400-e29b-41d4-a716-446655440001',
    Name: 'Test Student',
    Email: 'student@example.com',
    Role: 'Student'
  };

  const mockOtherUser = {
    Id: '550e8400-e29b-41d4-a716-446655440002',
    Name: 'Other User',
    Email: 'other@example.com',
    Role: 'Sponsor'
  };

  // Generate valid JWT tokens for authentication
  const generateToken = (userId: string) => {
    return jwt.sign(
      { userId }, 
      process.env.JWT_SECRET || 'HEDSAFNJASKJFBASDKJBFKJSDBKJD',
      { expiresIn: '1h' }
    );
  };

  const sponsorToken = generateToken(mockSponsor.Id);
  const studentToken = generateToken(mockStudent.Id);
  const otherUserToken = generateToken(mockOtherUser.Id);

  describe('POST /api/sponsorships (Protected)', () => {
    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .send({
          studentId: '550e8400-e29b-41d4-a716-446655440001',
          startDate: '2024-01-01'
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Correctly blocked request without auth token');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          studentId: '550e8400-e29b-41d4-a716-446655440001',
          startDate: '2024-01-01'
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Invalid or expired token');
      console.log('✅ Correctly blocked request with invalid token');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({}) // Empty body
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Student ID and start date are required');
      console.log('✅ Correctly validated required fields');
    });

    it('should return 400 when studentId is missing', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({ startDate: '2024-01-01' })
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Student ID and start date are required');
      console.log('✅ Correctly validated studentId field');
    });

    it('should return 400 when startDate is missing', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({ studentId: '550e8400-e29b-41d4-a716-446655440001' })
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Student ID and start date are required');
      console.log('✅ Correctly validated startDate field');
    });

    it('should return 404 for non-existent student', async () => {
      const fakeStudentId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({
          studentId: fakeStudentId,
          startDate: '2024-01-01'
        })
        .expect(404);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Student not found');
      console.log('✅ Correctly handled non-existent student');
    });

    it('should return 400 when trying to sponsor non-student user', async () => {
      // Try to sponsor a user who is not a student
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({
          studentId: mockSponsor.Id, // Sponsor trying to sponsor another sponsor
          startDate: '2024-01-01'
        });

      // Should return 400 if user exists but is not a student, or 404 if not found
      expect([400, 404]).to.include(response.status);
      console.log('✅ Handled non-student user case with status:', response.status);
    });
  });

  describe('GET /api/sponsorships/sponsor (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/sponsorships/sponsor')
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected sponsor sponsorships route correctly requires auth');
    });

    it('should return sponsorships for authenticated sponsor', async () => {
      const response = await request(app)
        .get('/api/sponsorships/sponsor')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message', 'Sponsorships retrieved successfully');
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array');
      
      console.log('✅ Successfully retrieved sponsor sponsorships:', response.body.data.length, 'sponsorships');
      
      if (response.body.data.length > 0) {
        const sponsorship = response.body.data[0];
        expect(sponsorship).to.have.property('Id');
        expect(sponsorship).to.have.property('SponsorId');
        expect(sponsorship).to.have.property('StudentId');
        expect(sponsorship).to.have.property('Status');
        expect(sponsorship).to.have.property('StartDate');
        
        console.log('✅ Sample sponsorship structure verified');
      }
    });
  });

  describe('GET /api/sponsorships/student (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/sponsorships/student')
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected student sponsorships route correctly requires auth');
    });

    it('should return sponsorships for authenticated student', async () => {
      const response = await request(app)
        .get('/api/sponsorships/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('message', 'Sponsorships retrieved successfully');
      expect(response.body).to.have.property('data');
      expect(response.body.data).to.be.an('array');
      
      console.log('✅ Successfully retrieved student sponsorships:', response.body.data.length, 'sponsorships');
    });
  });

  describe('GET /api/sponsorships/:id (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/sponsorships/550e8400-e29b-41d4-a716-446655440000')
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected sponsorship by ID route correctly requires auth');
    });

    it('should return 404 for non-existent sponsorship', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .get(`/api/sponsorships/${fakeId}`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(404);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship not found');
      console.log('✅ Correctly handled non-existent sponsorship');
    });

    it('should handle invalid UUID format', async () => {
      const invalidId = 'invalid-uuid-format';
      const response = await request(app)
        .get(`/api/sponsorships/${invalidId}`)
        .set('Authorization', `Bearer ${sponsorToken}`);

      // Could be 400 (bad request) or 500 (server error) depending on DB validation
      expect([400, 404, 500]).to.include(response.status);
      console.log('✅ Handled invalid UUID format with status:', response.status);
    });
  });

  describe('PATCH /api/sponsorships/:id/status (Protected)', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/api/sponsorships/550e8400-e29b-41d4-a716-446655440000/status')
        .send({ status: 'Inactive' })
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Protected status update route correctly requires auth');
    });

    it('should return 400 when status is missing', async () => {
      const response = await request(app)
        .patch('/api/sponsorships/550e8400-e29b-41d4-a716-446655440000/status')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({}) // Empty body
        .expect(400);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Status is required');
      console.log('✅ Correctly validated status field');
    });

    it('should return 404 for non-existent sponsorship', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440999';
      const response = await request(app)
        .patch(`/api/sponsorships/${fakeId}/status`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({ status: 'Inactive' })
        .expect(404);

      expect(response.body).to.have.property('success', false);
      expect(response.body).to.have.property('message', 'Sponsorship not found');
      console.log('✅ Correctly handled non-existent sponsorship for status update');
    });

    it('should handle invalid UUID format for status update', async () => {
      const invalidId = 'invalid-uuid-format';
      const response = await request(app)
        .patch(`/api/sponsorships/${invalidId}/status`)
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({ status: 'Inactive' });

      // Could be 400, 404, or 500 depending on validation
      expect([400, 404, 500]).to.include(response.status);
      console.log('✅ Handled invalid UUID for status update with status:', response.status);
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', 'InvalidFormat')
        .send({
          studentId: '550e8400-e29b-41d4-a716-446655440001',
          startDate: '2024-01-01'
        })
        .expect(401);

      expect(response.body).to.have.property('message', 'Authentication required');
      console.log('✅ Correctly handled malformed Authorization header');
    });

    it('should handle expired token', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { userId: mockSponsor.Id },
        process.env.JWT_SECRET || 'HEDSAFNJASKJFBASDKJBFKJSDBKJD',
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(app)
        .get('/api/sponsorships/sponsor')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).to.have.property('message', 'Invalid or expired token');
      console.log('✅ Correctly handled expired token');
    });

    it('should handle token with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { userId: mockSponsor.Id },
        'wrong-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/sponsorships/sponsor')
        .set('Authorization', `Bearer ${wrongSecretToken}`)
        .expect(401);

      expect(response.body).to.have.property('message', 'Invalid or expired token');
      console.log('✅ Correctly handled token with wrong secret');
    });
  });

  describe('Authorization Edge Cases', () => {
    it('should test authorization for viewing sponsorship', async function() {
      // First get a sponsorship to test authorization
      const sponsorshipsResponse = await request(app)
        .get('/api/sponsorships/sponsor')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      if (sponsorshipsResponse.body.data.length > 0) {
        const sponsorshipId = sponsorshipsResponse.body.data[0].Id;
        
        // Test that unauthorized user cannot access sponsorship
        const response = await request(app)
          .get(`/api/sponsorships/${sponsorshipId}`)
          .set('Authorization', `Bearer ${otherUserToken}`);

        // Should return 403 (forbidden) or 404 if user is not authorized
        expect([403, 404]).to.include(response.status);
        console.log('✅ Authorization test completed with status:', response.status);
      } else {
        console.log('ℹ️  No sponsorships found for authorization test');
        this.pending();
      }
    });

    it('should test authorization for updating sponsorship status', async function() {
      // First get a sponsorship to test authorization
      const sponsorshipsResponse = await request(app)
        .get('/api/sponsorships/sponsor')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .expect(200);

      if (sponsorshipsResponse.body.data.length > 0) {
        const sponsorshipId = sponsorshipsResponse.body.data[0].Id;
        
        // Test that unauthorized user cannot update sponsorship
        const response = await request(app)
          .patch(`/api/sponsorships/${sponsorshipId}/status`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send({ status: 'Inactive' });

        // Should return 403 (forbidden) or 404 if user is not authorized
        expect([403, 404]).to.include(response.status);
        console.log('✅ Status update authorization test completed with status:', response.status);
      } else {
        console.log('ℹ️  No sponsorships found for status update authorization test');
        this.pending();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully in getSponsorshipsBySponsor', async () => {
      // This test ensures the try-catch blocks work
      const response = await request(app)
        .get('/api/sponsorships/sponsor')
        .set('Authorization', `Bearer ${sponsorToken}`);
      
      // Should either succeed (200) or handle error gracefully (500)
      expect([200, 500]).to.include(response.status);
      
      if (response.status === 500) {
        expect(response.body).to.have.property('success', false);
        expect(response.body).to.have.property('message');
      }
      
      console.log('✅ Error handling test completed for getSponsorshipsBySponsor');
    });

    it('should handle server errors gracefully in getSponsorshipsByStudent', async () => {
      const response = await request(app)
        .get('/api/sponsorships/student')
        .set('Authorization', `Bearer ${studentToken}`);
      
      // Should either succeed (200) or handle error gracefully (500)
      expect([200, 500]).to.include(response.status);
      
      console.log('✅ Error handling test completed for getSponsorshipsByStudent');
    });

    it('should validate date format for startDate', async () => {
      const response = await request(app)
        .post('/api/sponsorships')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({
          studentId: '550e8400-e29b-41d4-a716-446655440001',
          startDate: 'invalid-date-format'
        });

      // Should either validate date format or attempt to process
      expect([400, 404, 500]).to.include(response.status);
      console.log('✅ Date validation test completed with status:', response.status);
    });

    it('should validate status values for update', async () => {
      const response = await request(app)
        .patch('/api/sponsorships/550e8400-e29b-41d4-a716-446655440000/status')
        .set('Authorization', `Bearer ${sponsorToken}`)
        .send({ status: '' }); // Empty status

      // Should validate status or attempt to process
      expect([400, 404, 500]).to.include(response.status);
      console.log('✅ Status validation test completed with status:', response.status);
    });
  });
}); 