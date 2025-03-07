import Medication from "../models/medication.model";
import Vendor from "../models/vendor.model";
import mongoose from "mongoose";
import { MedicationDocument } from "../types";

// src/services/medication.service.ts - COMPLETE FIX

export async function getAllMedications(query: any = {}) {
  const {
    page = 1,
    limit = 10,
    vendorId,
    category,
    requiresPrescription,
    minPrice,
    maxPrice,
    search,
    sort = 'name',
    order = 'asc',
    ...otherFilters
  } = query;

  const filters: any = {};

  // Add filters if provided
  if (vendorId) {
    filters.vendorId = vendorId;
  }

  if (category) {
    filters.category = category;
  }

  if (requiresPrescription !== undefined) {
    filters.requiresPrescription = requiresPrescription === 'true';
  }

  if (minPrice !== undefined) {
    filters.price = { $gte: Number(minPrice) };
  }

  if (maxPrice !== undefined) {
    filters.price = { ...filters.price, $lte: Number(maxPrice) };
  }

  if (search) {
    filters.$text = { $search: search };
  }

  // Add any other filters
  Object.keys(otherFilters).forEach(key => {
    filters[key] = otherFilters[key];
  });

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Sort configuration
  const sortOptions: any = {};
  sortOptions[sort] = order === 'asc' ? 1 : -1;

  // Execute query
  const medications = await Medication.find(filters)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions);

  const total = await Medication.countDocuments(filters);

  return {
    medications,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
}

export async function getMedicationById(medicationId: string) {
  const medication = await Medication.findById(medicationId);
  if (!medication) {
    throw new Error('Medication not found');
  }
  return medication;
}

export async function createMedication(vendorId: string, medicationData: Partial<MedicationDocument>) {
  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  // Create new medication
  const medication = new Medication({
    ...medicationData,
    vendorId
  });

  await medication.save();

  return medication;
}

export async function updateMedication(
  medicationId: string,
  vendorId: string,
  updateData: Partial<MedicationDocument>
) {
  // Find medication
  const medication = await Medication.findById(medicationId);
  if (!medication) {
    throw new Error('Medication not found');
  }

  // Check if vendor owns medication
  if (medication.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to update this medication');
  }

  // Update specific fields directly - no dynamic property access
  if (updateData.name !== undefined) medication.name = updateData.name;
  if (updateData.genericName !== undefined) medication.genericName = updateData.genericName;
  if (updateData.description !== undefined) medication.description = updateData.description;
  if (updateData.dosageForm !== undefined) medication.dosageForm = updateData.dosageForm;
  if (updateData.strength !== undefined) medication.strength = updateData.strength;
  if (updateData.packageSize !== undefined) medication.packageSize = updateData.packageSize;
  if (updateData.manufacturer !== undefined) medication.manufacturer = updateData.manufacturer;
  if (updateData.category !== undefined) medication.category = updateData.category;
  if (updateData.requiresPrescription !== undefined) medication.requiresPrescription = updateData.requiresPrescription;
  if (updateData.price !== undefined) medication.price = updateData.price;
  if (updateData.discountPrice !== undefined) medication.discountPrice = updateData.discountPrice;
  if (updateData.stock !== undefined) medication.stock = updateData.stock;
  if (updateData.images !== undefined) medication.images = updateData.images;

  await medication.save();

  return medication;
}

export async function deleteMedication(medicationId: string, vendorId: string) {
  // Find medication
  const medication = await Medication.findById(medicationId);
  if (!medication) {
    throw new Error('Medication not found');
  }

  // Check if vendor owns medication
  if (medication.vendorId.toString() !== vendorId) {
    throw new Error('Not authorized to delete this medication');
  }

  // Delete medication
  await Medication.findByIdAndDelete(medicationId);

  return { message: 'Medication deleted successfully' };
}

export async function getMedicationsByVendor(vendorId: string, query: any = {}) {
  // Check if vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor || vendor.role !== 'vendor') {
    throw new Error('Vendor not found');
  }

  const {
    page = 1,
    limit = 10,
    category,
    requiresPrescription,
    search,
    sort = 'name',
    order = 'asc'
  } = query;

  const filters: any = { vendorId };

  if (category) {
    filters.category = category;
  }

  if (requiresPrescription !== undefined) {
    filters.requiresPrescription = requiresPrescription === 'true';
  }

  if (search) {
    filters.$text = { $search: search };
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Sort configuration
  const sortOptions: any = {};
  sortOptions[sort] = order === 'asc' ? 1 : -1;

  // Execute query
  const medications = await Medication.find(filters)
    .skip(skip)
    .limit(Number(limit))
    .sort(sortOptions);

  const total = await Medication.countDocuments(filters);

  return {
    medications,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
}