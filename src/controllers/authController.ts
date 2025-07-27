import dotenv from 'dotenv';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { User } from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoginUserInput, RegisterUserInput } from '../types';

dotenv.config();

export const register = async (req: Request<{}, {}, RegisterUserInput>, res: Response) => {
  try {
    const { name, age, email, password , role} = req.body;

    // Validate input
    if (!name || age === undefined || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await db.select().from(User).where(eq(User.Email, email));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await db.insert(User).values({
      Name: name,
      Age: age.toString(),
      Email: email,
      Password: hashedPassword,
      Role : role as any
    }).returning({ Id: User.Id });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser[0].Id },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      userId: newUser[0].Id
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const users = await db.select().from(User).where(eq(User.Email, email));
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.Id },
      process.env.JWT_SECRET || '',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.Id,
      userdata: {
        Name: user.Name,
        Age: user.Age,
        Email: user.Email,
        Role: user.Role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
}; 