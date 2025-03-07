import Pharmacy from "../models/pharmacy.model";

// Interfaces for type safety
interface PharmacyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PharmaciesResult {
  pharmacies: unknown[];
  pagination: PaginationResult;
}

// Custom error for not found scenarios
class PharmacyNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PharmacyNotFoundError';
  }
}

export async function getAllPharmacies(query: PharmacyQueryParams = {}): Promise<PharmaciesResult> {
  const {
    page = 1,
    limit = 10,
    search,
    ...otherFilters
  } = query;

  const filters: Record<string, unknown> = { role: 'pharmacy' };

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
  const pharmacies = await Pharmacy.find(filters)
    .select('-password')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Pharmacy.countDocuments(filters);

  return {
    pharmacies,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit))
    }
  };
}

export async function getPharmacyById(pharmacyId: string) {
  const pharmacy = await Pharmacy.findById(pharmacyId).select('-password');

  if (!pharmacy || pharmacy.role !== 'pharmacy') {
    throw new PharmacyNotFoundError('Pharmacy not found');
  }

  return pharmacy;
}

export async function updatePharmacy(pharmacyId: string, updateData: Record<string, unknown>) {
  // Remove sensitive fields that shouldn't be updated directly
  const { password, role, ...updatableData } = updateData;

  const pharmacy = await Pharmacy.findByIdAndUpdate(
    pharmacyId,
    { $set: updatableData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!pharmacy || pharmacy.role !== 'pharmacy') {
    throw new PharmacyNotFoundError('Pharmacy not found');
  }

  return pharmacy;
}

export async function createPharmacy(pharmacyData: Record<string, unknown>) {
  // Ensure the role is set to pharmacy
  pharmacyData.role = 'pharmacy';

  // Create new pharmacy
  const pharmacy = new Pharmacy(pharmacyData);
  await pharmacy.save();

  // Return pharmacy without password
  return await Pharmacy.findById(pharmacy._id).select('-password');
}

export async function deletePharmacy(pharmacyId: string) {
  const pharmacy = await Pharmacy.findByIdAndDelete(pharmacyId);

  if (!pharmacy || pharmacy.role !== 'pharmacy') {
    throw new PharmacyNotFoundError('Pharmacy not found');
  }

  return { message: 'Pharmacy deleted successfully' };
}