import mongoose, { Schema, Document } from 'mongoose';
import { OrderDocument } from '../types';

interface OrderModel extends OrderDocument, Document {}

const orderItemSchema = new Schema({
  medicationId: { type: Schema.Types.ObjectId, ref: 'Medication', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true }
}, { _id: false });

const deliveryAddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { _id: false });

const deliveryInfoSchema = new Schema({
  address: { type: deliveryAddressSchema, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  deliveryNotes: { type: String },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  deliveryPersonId: { type: String },
  deliveryPersonName: { type: String },
  deliveryPersonPhone: { type: String },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    updatedAt: { type: Date }
  }
}, { _id: false });

const orderSchema = new Schema({
  pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['creditCard', 'bankTransfer', 'cod'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  deliveryInfo: { type: deliveryInfoSchema, required: true }
}, { timestamps: true });

// Indexes
orderSchema.index({ pharmacyId: 1 });
orderSchema.index({ vendorId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'paymentStatus': 1 });
orderSchema.index({ createdAt: 1 });

const Order = mongoose.model<OrderModel>('Order', orderSchema);

export default Order;
