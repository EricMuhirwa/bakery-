import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userDTO from '../DTOs/userDTO';
import { prisma } from '../config/database';
import { uploadToCloudinary } from '../utils/cloudinary';

type UserData = {
  name: string;
  email: string;
  password: string;
};

type LoginResponse = {
  user: ReturnType<typeof userDTO.getUserDTO>;
  token: string;
};

type UpdateProfileData = {
  username?: string;
  profilePicture?: Express.Multer.File;
  currentPassword?: string;
  newPassword?: string;
};

export const userService = {
  createUser: async (userData: UserData): Promise<ReturnType<typeof userDTO.getUserDTO>> => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.DATABASE_URL as string, { tls: true });
    try {
      await client.connect();
      const db = client.db();
      const result = await db.collection('User').insertOne({
        email: userData.email,
        password: hashedPassword,
        role: 'user',
        username: userData.name || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const user = await prisma.user.findUnique({
        where: { id: result.insertedId.toString() }
      });
      if (!user) throw new Error("User creation failed");
      return userDTO.getUserDTO(user);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("Email already exists");
      }
      throw error;
    } finally {
      await client.close();
    }
  },

  getUserById: async (userId: string): Promise<ReturnType<typeof userDTO.getUserDTO> | null> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? userDTO.getUserDTO(user) : null;
  },

  getAllUsers: async (): Promise<ReturnType<typeof userDTO.getUserDTO>[]> => {
    const users = await prisma.user.findMany();
    return users.map(userDTO.getUserDTO);
  },

  loginUser: async (email: string, password: string): Promise<LoginResponse> => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return { user: userDTO.getUserDTO(user), token };
  },

  updateProfile: async (userId: string, updateData: UpdateProfileData): Promise<ReturnType<typeof userDTO.getUpdateProfileDTO>> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const updatePayload: any = {};

    // Handle username update
    if (updateData.username !== undefined && updateData.username !== user.username) {
      // Check if username is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updateData.username,
          id: { not: userId }
        }
      });
      if (existingUser) {
        throw new Error('Username is already taken');
      }
      updatePayload.username = updateData.username;
    }

    // Handle password update
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new Error('Current password is required to change password');
      }

      const isPasswordValid = await bcrypt.compare(updateData.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      if (updateData.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      updatePayload.password = await bcrypt.hash(updateData.newPassword, 10);
    }

    // Handle profile picture upload
    if (updateData.profilePicture) {
      try {
        const imageUrl = await uploadToCloudinary(updateData.profilePicture);
        updatePayload.profilePicture = imageUrl;
      } catch (error: any) {
        throw new Error(`Failed to upload profile picture: ${error.message}`);
      }
    }

    // Update user if there are changes
    if (Object.keys(updatePayload).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updatePayload,
      });
    }

    // Fetch updated user to return
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!updatedUser) throw new Error('Failed to retrieve updated user');

    return {
      username: updatedUser.username || undefined,
      profilePicture: updatedUser.profilePicture || undefined,
    };
  },
};
