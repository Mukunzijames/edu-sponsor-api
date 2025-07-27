import { Request, Response } from 'express';
import { db } from '../db';
import { School, StudentProfile } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createSchool = async (req: Request, res: Response) => {
  try {
    const { name, description, district } = req.body;

    if (!name || !description || !district) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newSchool = await db.insert(School).values({
      Name: name,
      Description: description,
      District: district,
    }).returning({ Id: School.Id, Name: School.Name });

    return res.status(201).json({
      message: 'School created successfully',
      school: newSchool[0]
    });
  } catch (error) {
    console.error('Create school error:', error);
    return res.status(500).json({ message: 'Server error during school creation' });
  }
};

export const getAllSchools = async (_req: Request, res: Response) => {
  try {
    const schools = await db.select().from(School);
    return res.status(200).json(schools);
  } catch (error) {
    console.error('Get all schools error:', error);
    return res.status(500).json({ message: 'Server error while fetching schools' });
  }
};

export const getSchoolById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const school = await db.select().from(School).where(eq(School.Id, id));
    
    if (school.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }
    
    return res.status(200).json(school[0]);
  } catch (error) {
    console.error('Get school by ID error:', error);
    return res.status(500).json({ message: 'Server error while fetching school' });
  }
};

export const updateSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, district, status } = req.body;

    // Check if school exists
    const existingSchool = await db.select().from(School).where(eq(School.Id, id));
    
    if (existingSchool.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) updateData.Name = name;
    if (description !== undefined) updateData.Description = description;
    if (district !== undefined) updateData.District = district;
    if (status !== undefined) updateData.Status = status;

    // Update school
    const updatedSchool = await db.update(School)
      .set(updateData)
      .where(eq(School.Id, id))
      .returning();

    return res.status(200).json({
      message: 'School updated successfully',
      school: updatedSchool[0]
    });
  } catch (error) {
    console.error('Update school error:', error);
    return res.status(500).json({ message: 'Server error during school update' });
  }
};

export const deleteSchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if school exists
    const existingSchool = await db.select().from(School).where(eq(School.Id, id));
    
    if (existingSchool.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if school has students
    const students = await db.select().from(StudentProfile).where(eq(StudentProfile.SchoolId, id));
    
    if (students.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete school with associated students. Remove all students first.' 
      });
    }

    // Delete school
    await db.delete(School).where(eq(School.Id, id));

    return res.status(200).json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Delete school error:', error);
    return res.status(500).json({ message: 'Server error during school deletion' });
  }
};

export const getStudentsBySchool = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if school exists
    const existingSchool = await db.select().from(School).where(eq(School.Id, id));
    
    if (existingSchool.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Get students for the school
    const students = await db.select().from(StudentProfile).where(eq(StudentProfile.SchoolId, id));
    
    return res.status(200).json(students);
  } catch (error) {
    console.error('Get students by school error:', error);
    return res.status(500).json({ message: 'Server error while fetching students' });
  }
}; 