import User from "../models/user.model";
import bcrypt from "bcrypt";

// services/user.service.ts

// Add the missing verifyPassword function
const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateUser = async (userId: string, updateData: Record<string, any>) => {
  // Remove fields that shouldn't be updated directly
  const { password, role, ...updatableData } = updateData;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updatableData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await verifyPassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  return { message: 'Password changed successfully' };
};

export const getAllUsers = async (query: Record<string, any> = {}) => {
  const {
    page = 1,
    limit = 10,
    search,
    ...filters
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const queryFilters: Record<string, any> = { ...filters };

  if (search) {
    queryFilters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(queryFilters)
    .select('-password')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(queryFilters);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
};