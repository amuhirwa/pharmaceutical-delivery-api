import { Document } from "mongoose";

// Base interfaces
export interface IUser {
  email: string;
  password: string;
  role: 'admin' | 'vendor' | 'pharmacy';
  name: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
}

export interface IVendor extends IUser {
  role: 'vendor';
  businessName: string;
  businessLicense: string;
  deliveryCapability: boolean;
  rating: number;
  reviews: Array<{
    pharmacyId: string;
    rating: number;
    comment: string;
    date: Date;
  }>;
}

export interface IPharmacy extends IUser {
  role: 'pharmacy';
  businessName: string;
  pharmacyLicense: string;
  preferredVendors: string[]; // Vendor IDs
}

export interface IMedication {
  vendorId: string;
  name: string;
  genericName: string;
  description: string;
  dosageForm: string;
  strength: string;
  packageSize: number;
  manufacturer: string;
  category: string[];
  requiresPrescription: boolean;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
}

export interface IOrder {
  pharmacyId: string;
  vendorId: string;
  items: Array<{
    medicationId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'creditCard' | 'bankTransfer' | 'cod';
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryInfo: {
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
      coordinates: {
        latitude: number;
        longitude: number;
      }
    };
    contactName: string;
    contactPhone: string;
    deliveryNotes?: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    deliveryPersonId?: string;
    deliveryPersonName?: string;
    deliveryPersonPhone?: string;
    currentLocation?: {
      latitude: number;
      longitude: number;
      updatedAt: Date;
    };
  };
}

// Document interfaces for Mongoose
export interface UserDocument extends IUser, Document { }
export interface VendorDocument extends IVendor, Document { }
export interface PharmacyDocument extends IPharmacy, Document { }
export interface MedicationDocument extends IMedication, Document { }
export interface OrderDocument extends IOrder, Document { }

// JWT Payload type
export interface JwtPayload {
  userId: string;
  role: string;
}