"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userDTO_1 = __importDefault(require("../DTOs/userDTO"));
const database_1 = require("../config/database");
const cloudinary_1 = require("../utils/cloudinary");
exports.userService = {
    createUser: async (userData) => {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 10);
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(process.env.DATABASE_URL);
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
            const user = await database_1.prisma.user.findUnique({
                where: { id: result.insertedId.toString() }
            });
            if (!user)
                throw new Error("User creation failed");
            return userDTO_1.default.getUserDTO(user);
        }
        catch (error) {
            if (error.code === 11000) {
                throw new Error("Email already exists");
            }
            throw error;
        }
        finally {
            await client.close();
        }
    },
    getUserById: async (userId) => {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        return user ? userDTO_1.default.getUserDTO(user) : null;
    },
    getAllUsers: async () => {
        const users = await database_1.prisma.user.findMany();
        return users.map(userDTO_1.default.getUserDTO);
    },
    loginUser: async (email, password) => {
        const user = await database_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('User not found');
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid)
            throw new Error('Invalid password');
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return { user: userDTO_1.default.getUserDTO(user), token };
    },
    updateProfile: async (userId, updateData) => {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const updatePayload = {};
        // Handle username update
        if (updateData.username !== undefined && updateData.username !== user.username) {
            // Check if username is already taken by another user
            const existingUser = await database_1.prisma.user.findFirst({
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
            const isPasswordValid = await bcryptjs_1.default.compare(updateData.currentPassword, user.password);
            if (!isPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            if (updateData.newPassword.length < 8) {
                throw new Error('New password must be at least 8 characters long');
            }
            updatePayload.password = await bcryptjs_1.default.hash(updateData.newPassword, 10);
        }
        // Handle profile picture upload
        if (updateData.profilePicture) {
            try {
                const imageUrl = await (0, cloudinary_1.uploadToCloudinary)(updateData.profilePicture);
                updatePayload.profilePicture = imageUrl;
            }
            catch (error) {
                throw new Error(`Failed to upload profile picture: ${error.message}`);
            }
        }
        // Update user if there are changes
        if (Object.keys(updatePayload).length > 0) {
            await database_1.prisma.user.update({
                where: { id: userId },
                data: updatePayload,
            });
        }
        // Fetch updated user to return
        const updatedUser = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!updatedUser)
            throw new Error('Failed to retrieve updated user');
        return {
            username: updatedUser.username || undefined,
            profilePicture: updatedUser.profilePicture || undefined,
        };
    },
};
//# sourceMappingURL=userService.js.map