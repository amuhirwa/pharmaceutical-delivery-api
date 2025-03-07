import User from "../models/user.model";
import Vendor from "../models/vendor.model";
import { VendorDocument } from "../types";

// import mongoose from "mongoose";


export async function getAllVendors(query: any = {}) {
  const {
    page = 1,
    limit = 10,
    rating,
    deliveryCapability,
    search,
    ...otherFilters
  } = query;

  const filters: any = { role: 'vendor' };

  // Add filters if provided
  if (rating) {
    filters.rating = { $gte: Number(rating) };
  }

  if (deliveryCapability !== undefined) {
    filters.deliveryCapability = deliveryCapability === 'true';
  }

  if (search) {
    filters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Add any other filters
  Object.keys(otherFilters).forEach(key => {
    filters[key] = otherFilters[key];
  });

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Execute query
  const vendors = await Vendor.find(filters)
    .select('-password')
    .skip(skip)
    .limit(Number(limit))
    .sort({ rating: -1 });

  const total = await Vendor.countDocuments(filters);

  return {
    vendors,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
}

export async function getVendorById(vendorId: string) {
  const vendor = await Vendor.findById(vendorId).select('-password');
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }
  return vendor;
}

export async function updateVendor(vendorId: string, updateData: Partial<VendorDocument>) {
  // Remove sensitive fields that shouldn't be updated directly
  const { password, role, ...updatableData } = updateData;

  const vendor = await Vendor.findByIdAndUpdate(
    vendorId,
    { $set: updatableData },
    { new: true }
  ).select('-password');

  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  return vendor;
}

export async function getVendorReviews(vendorId: string) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  return vendor.reviews;
}

export async function addVendorReview(
  vendorId: string,
  pharmacyId: string,
  reviewData: { rating: number; comment?: string }
) {
  const { rating, comment = "" } = reviewData;  // Provide a default empty string for comment

  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  // Check if pharmacy exists
  const pharmacy = await User.findById(pharmacyId);
  if (!pharmacy || pharmacy.role !== 'pharmacy') {
    throw new Error('Pharmacy not found');
  }

  // Check if pharmacy has already reviewed this vendor
  const existingReviewIndex = vendor.reviews.findIndex(
    (review) => review.pharmacyId.toString() === pharmacyId
  );

  if (existingReviewIndex !== -1) {
    // Update existing review
    vendor.reviews[existingReviewIndex] = {
      pharmacyId,
      rating,
      comment,
      date: new Date()
    };
  } else {
    // Add new review
    vendor.reviews.push({
      pharmacyId,
      rating,
      comment,
      date: new Date()
    });
  }

  // Calculate new average rating
  const totalRating = vendor.reviews.reduce((sum, review) => sum + review.rating, 0);
  vendor.rating = vendor.reviews.length > 0 ? totalRating / vendor.reviews.length : 0;

  await vendor.save();

  return vendor.reviews;
}