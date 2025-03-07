import { z } from "zod";

// utils/validation.utils.ts

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP code is required'),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
  }),
});

export const registerVendorSchema = registerUserSchema.extend({
  businessName: z.string().min(1, 'Business name is required'),
  businessLicense: z.string().min(1, 'Business license is required'),
  deliveryCapability: z.boolean().optional(),
});

export const registerPharmacySchema = registerUserSchema.extend({
  businessName: z.string().min(1, 'Business name is required'),
  pharmacyLicense: z.string().min(1, 'Pharmacy license is required'),
  preferredVendors: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Add the missing schemas for user updates and password change
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  phone: z.string().min(1, 'Phone number is required').optional(),
  address: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zip: z.string().min(1, 'ZIP code is required'),
    coordinates: z.object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
  }).optional(),
  email: z.string().email('Invalid email format').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must be less than 100 characters'),
});

export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  genericName: z.string().min(1, 'Generic name is required'),
  description: z.string().min(1, 'Description is required'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  strength: z.string().min(1, 'Strength is required'),
  packageSize: z.number().min(1, 'Package size is required'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  category: z.array(z.string()).min(1, 'At least one category is required'),
  requiresPrescription: z.boolean().default(false),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discountPrice: z.number().optional(),
  stock: z.number().min(0, 'Stock cannot be negative'),
  images: z.array(z.string()).optional(),
});

export const orderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  items: z.array(
    z.object({
      medicationId: z.string().min(1, 'Medication ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['creditCard', 'bankTransfer', 'cod']),
  deliveryInfo: z.object({
    address: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      zip: z.string().min(1, 'ZIP code is required'),
      coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }).optional(),
    }),
    contactName: z.string().min(1, 'Contact name is required'),
    contactPhone: z.string().min(1, 'Contact phone is required'),
    deliveryNotes: z.string().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled',
  ]),
});

export const updateDeliveryLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Pharmacy-specific schema for routes
export const pharmacySchema = registerPharmacySchema;