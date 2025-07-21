import { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { Sponsorship, User, StudentProfile } from '../db/schema';

interface UserInterface {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
}

// Create a new sponsorship
export const createSponsorship = async (req: Request, res: Response) => {
  try {
    const { studentId, startDate } = req.body;
    const user = req.user as unknown as UserInterface;

    if (!studentId || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and start date are required',
      });
    }

    // Check if student exists
    const student = await db.query.User.findFirst({
      where: eq(User.Id, studentId),
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (student.Role !== 'Student') {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not a student',
      });
    }

    // Check if sponsorship already exists
    const existingSponsorship = await db.query.Sponsorship.findFirst({
      where: and(
        eq(Sponsorship.SponsorId, user.Id),
        eq(Sponsorship.StudentId, studentId)
      ),
    });

    if (existingSponsorship) {
      return res.status(400).json({
        success: false,
        message: 'You are already sponsoring this student',
      });
    }

    // Create sponsorship
    const newSponsorship = await db.insert(Sponsorship).values({
      SponsorId: user.Id,
      StudentId: studentId,
      StartDate: startDate,
      Status: 'Active',
    }).returning();

    return res.status(201).json({
      success: true,
      message: 'Sponsorship created successfully',
      data: newSponsorship[0],
    });
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create sponsorship',
    });
  }
};

// Get all sponsorships for a sponsor
export const getSponsorshipsBySponsor = async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UserInterface;

    const sponsorships = await db.query.Sponsorship.findMany({
      where: eq(Sponsorship.SponsorId, user.Id),
      with: {
        Student: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Sponsorships retrieved successfully',
      data: sponsorships,
    });
  } catch (error) {
    console.error('Error retrieving sponsorships:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sponsorships',
    });
  }
};

// Get all sponsorships for a student
export const getSponsorshipsByStudent = async (req: Request, res: Response) => {
  try {
    const user = req.user as unknown as UserInterface;

    const sponsorships = await db.query.Sponsorship.findMany({
      where: eq(Sponsorship.StudentId, user.Id),
      with: {
        Sponsor: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Sponsorships retrieved successfully',
      data: sponsorships,
    });
  } catch (error) {
    console.error('Error retrieving sponsorships:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sponsorships',
    });
  }
};

// Get a specific sponsorship by ID
export const getSponsorshipById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user as unknown as UserInterface;

    const sponsorship = await db.query.Sponsorship.findFirst({
      where: eq(Sponsorship.Id, id),
      with: {
        Sponsor: true,
        Student: true,
      },
    });

    if (!sponsorship) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship not found',
      });
    }

    // Check if user is authorized (either sponsor or student)
    if (sponsorship.SponsorId !== user.Id && sponsorship.StudentId !== user.Id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this sponsorship',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sponsorship retrieved successfully',
      data: sponsorship,
    });
  } catch (error) {
    console.error('Error retrieving sponsorship:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve sponsorship',
    });
  }
};

// Update sponsorship status
export const updateSponsorshipStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user as unknown as UserInterface;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // Check if sponsorship exists
    const sponsorship = await db.query.Sponsorship.findFirst({
      where: eq(Sponsorship.Id, id),
    });

    if (!sponsorship) {
      return res.status(404).json({
        success: false,
        message: 'Sponsorship not found',
      });
    }

    // Check if user is the sponsor
    if (sponsorship.SponsorId !== user.Id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this sponsorship',
      });
    }

    // Update sponsorship
    const updatedSponsorship = await db.update(Sponsorship)
      .set({ Status: status })
      .where(eq(Sponsorship.Id, id))
      .returning();

    return res.status(200).json({
      success: true,
      message: 'Sponsorship updated successfully',
      data: updatedSponsorship[0],
    });
  } catch (error) {
    console.error('Error updating sponsorship:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update sponsorship',
    });
  }
}; 