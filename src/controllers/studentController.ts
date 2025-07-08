import { Request, Response } from 'express';
import { db } from '../db';
import { StudentProfile, School } from '../db/schema';
import { eq } from 'drizzle-orm';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      age, 
      gender, 
      address, 
      phone, 
      email, 
      parentName, 
      schoolId 
    } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !address || !phone || !email || !parentName || !schoolId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if school exists
    const schoolExists = await db.select().from(School).where(eq(School.Id, schoolId));
    if (schoolExists.length === 0) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Create student profile
    const newStudent = await db.insert(StudentProfile).values({
      Name: name,
      Age: age,
      Gender: gender,
      Address: address,
      Phone: phone,
      Email: email,
      ParentName: parentName,
      SchoolId: schoolId
    }).returning({ Id: StudentProfile.Id, Name: StudentProfile.Name });

    return res.status(201).json({
      message: 'Student created successfully',
      student: newStudent[0]
    });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ message: 'Server error during student creation' });
  }
};

export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await db.select().from(StudentProfile);
    return res.status(200).json(students);
  } catch (error) {
    console.error('Get all students error:', error);
    return res.status(500).json({ message: 'Server error while fetching students' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const student = await db.select().from(StudentProfile).where(eq(StudentProfile.Id, id));
    
    if (student.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    return res.status(200).json(student[0]);
  } catch (error) {
    console.error('Get student by ID error:', error);
    return res.status(500).json({ message: 'Server error while fetching student' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      age, 
      gender, 
      address, 
      phone, 
      email, 
      parentName, 
      schoolId 
    } = req.body;

    // Check if student exists
    const existingStudent = await db.select().from(StudentProfile).where(eq(StudentProfile.Id, id));
    if (existingStudent.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Optional: Check if school exists if schoolId is provided
    if (schoolId) {
      const schoolExists = await db.select().from(School).where(eq(School.Id, schoolId));
      if (schoolExists.length === 0) {
        return res.status(404).json({ message: 'School not found' });
      }
    }

    // Update student profile
    const updatedStudent = await db.update(StudentProfile)
      .set({
        ...(name && { Name: name }),
        ...(age && { Age: age }),
        ...(gender && { Gender: gender }),
        ...(address && { Address: address }),
        ...(phone && { Phone: phone }),
        ...(email && { Email: email }),
        ...(parentName && { ParentName: parentName }),
        ...(schoolId && { SchoolId: schoolId }),
        UpdatedAt: new Date()
      })
      .where(eq(StudentProfile.Id, id))
      .returning();

    return res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent[0]
    });
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ message: 'Server error during student update' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const existingStudent = await db.select().from(StudentProfile).where(eq(StudentProfile.Id, id));
    if (existingStudent.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete student
    await db.delete(StudentProfile).where(eq(StudentProfile.Id, id));

    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ message: 'Server error during student deletion' });
  }
};

export const createMultipleStudents = async (req: Request, res: Response) => {
  try {
    const students = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Invalid input: Expected an array of students' });
    }

    const validStudents: typeof StudentProfile.$inferSelect[] = [];
    for (const student of students) {
      const { 
        name, 
        age, 
        gender, 
        address, 
        phone, 
        email, 
        parentName, 
        schoolId 
      } = student;

      // Validate required fields
      if (!name || !age || !gender || !address || !phone || !email || !parentName || !schoolId) {
        return res.status(400).json({ message: 'All fields are required for each student' });
      }

      // Check if school exists
      const schoolExists = await db.select().from(School).where(eq(School.Id, schoolId));
      if (schoolExists.length === 0) {
        return res.status(404).json({ message: `School not found for student: ${name}` });
      }

      validStudents.push(student);
    }

    // Insert multiple students
    const newStudents = await db.insert(StudentProfile).values(
      validStudents.map(student => ({
        Name: student.Name,
        Age: student.Age,
        Gender: student.Gender,
        Address: student.Address,
        Phone: student.Phone,
        Email: student.Email,
        ParentName: student.ParentName,
        SchoolId: student.SchoolId
      }))
    ).returning({ Id: StudentProfile.Id, Name: StudentProfile.Name });

    return res.status(201).json({
      message: 'Students created successfully',
      students: newStudents
    });
  } catch (error) {
    console.error('Create multiple students error:', error);
    return res.status(500).json({ message: 'Server error during multiple student creation' });
  }
};
