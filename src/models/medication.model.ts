import mongoose, { Schema, Document } from 'mongoose';
import { MedicationDocument } from '../types';

interface MedicationModel extends MedicationDocument, Document {}

const medicationSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  description: { type: String, required: true },
  dosageForm: { type: String, required: true },
  strength: { type: String, required: true },
  packageSize: { type: Number, required: true },
  manufacturer: { type: String, required: true },
  category: [{ type: String }],
  requiresPrescription: { type: Boolean, default: false },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  stock: { type: Number, required: true, min: 0 },
  images: [{ type: String }]
}, { timestamps: true });

// Indexes
medicationSchema.index({ vendorId: 1 });
medicationSchema.index({ name: 'text', genericName: 'text', description: 'text' });
medicationSchema.index({ category: 1 });
medicationSchema.index({ price: 1 });

const Medication = mongoose.model<MedicationModel>('Medication', medicationSchema);

export default Medication;
