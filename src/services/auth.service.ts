import Pharmacy from "../models/pharmacy.model";
import User from "../models/user.model";
import Vendor from "../models/vendor.model";
import { Types } from "mongoose";
import { generateRefreshToken, generateToken, verifyRefreshToken } from "../utils/jwt.utils";
import { hashPassword, verifyPassword } from "../utils/password.utils";

export async function registerVendor(vendorData: any) {
  const {
    email,
    password,
    name,
    phone,
    address,
    businessName,
    businessLicense,
    deliveryCapability
  } = vendorData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new vendor
  const vendor = new Vendor({
    email,
    password: hashedPassword,
    name,
    phone,
    address,
    businessName,
    businessLicense,
    deliveryCapability: deliveryCapability || false,
  });

  await vendor.save();

  // Generate tokens with proper type assertion
  const userId = vendor._id as Types.ObjectId;
  const accessToken = generateToken({ userId: userId.toString(), role: 'vendor' });
  const refreshToken = generateRefreshToken({ userId: userId.toString(), role: 'vendor' });

  return {
    user: {
      id: userId,
      email: vendor.email,
      name: vendor.name,
      role: 'vendor',
      businessName: vendor.businessName
    },
    accessToken,
    refreshToken
  };
}

export async function registerPharmacy(pharmacyData: any) {
  const {
    email,
    password,
    name,
    phone,
    address,
    businessName,
    pharmacyLicense,
    preferredVendors
  } = pharmacyData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new pharmacy
  const pharmacy = new Pharmacy({
    email,
    password: hashedPassword,
    name,
    phone,
    address,
    businessName,
    pharmacyLicense,
    preferredVendors: preferredVendors || []
  });

  await pharmacy.save();

  // Generate tokens with proper type assertion
  const userId = pharmacy._id as Types.ObjectId;
  const accessToken = generateToken({ userId: userId.toString(), role: 'pharmacy' });
  const refreshToken = generateRefreshToken({ userId: userId.toString(), role: 'pharmacy' });

  return {
    user: {
      id: userId,
      email: pharmacy.email,
      name: pharmacy.name,
      role: 'pharmacy',
      businessName: pharmacy.businessName
    },
    accessToken,
    refreshToken
  };
}

export async function registerAdmin(adminData: any) {
  const {
    email,
    password,
    name,
    phone,
    address
  } = adminData;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new admin
  const admin = new User({
    email,
    password: hashedPassword,
    role: 'admin',
    name,
    phone,
    address
  });

  await admin.save();

  // Generate tokens with proper type assertion
  const userId = admin._id as Types.ObjectId;
  const accessToken = generateToken({ userId: userId.toString(), role: 'admin' });
  const refreshToken = generateRefreshToken({ userId: userId.toString(), role: 'admin' });

  return {
    user: {
      id: userId,
      email: admin.email,
      name: admin.name,
      role: 'admin'
    },
    accessToken,
    refreshToken
  };
}

export async function login(credentials: { email: string; password: string }) {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens with proper type assertion
  const userId = user._id as Types.ObjectId;
  const accessToken = generateToken({ userId: userId.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ userId: userId.toString(), role: user.role });

  return {
    user: {
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}

export async function refreshToken(token: string) {
  try {
    // Get decoded token
    const decoded = verifyRefreshToken(token);

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens with proper type assertion
    const userId = user._id as Types.ObjectId;
    const accessToken = generateToken({
      userId: userId.toString(),
      role: user.role as string
    });

    const refreshToken = generateRefreshToken({
      userId: userId.toString(),
      role: user.role as string
    });

    return {
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}