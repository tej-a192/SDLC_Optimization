import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { AuthRequest } from '../types/auth.types';

/**
 * Registers a new user with username, email, and password
 * @param username - Desired username
 * @param email - User's email address
 * @param password - Plain text password
 * @returns Object containing user data and JWT token
 */
export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = savedUser.toObject();

    return {
      user: userResponse,
      token
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

/**
 * Authenticates a user with email and password
 * @param email - User's email address
 * @param password - Plain text password
 * @returns Object containing user data and JWT token
 */
export const loginUser = async (email: string, password: string) => {
  try {
    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user.toObject();

    return {
      user: userResponse,
      token
    };
  } catch (error) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

/**
 * Retrieves user profile information
 * @param userId - ID of the user to retrieve
 * @returns User object without password field
 */
export const getUserProfile = async (userId: string) => {
  try {
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
};

/**
 * Middleware function to verify JWT token
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 */
export const authenticateToken = (
  req: AuthRequest,
  res: any,
  next: any
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key'
    ) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};