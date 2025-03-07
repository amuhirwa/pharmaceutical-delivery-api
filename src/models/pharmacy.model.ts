import mongoose, { Schema, Document } from 'mongoose';
import User from './user.model';
import { PharmacyDocument } from '../types';

interface PharmacyModel extends PharmacyDocument, Document {}

const pharmacySchema = new Schema({
  businessName: { type: String, required: true },
  pharmacyLicense: { type: String, required: true },
  preferredVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }]
});

const Pharmacy = User.discriminator<PharmacyModel>('pharmacy', pharmacySchema);

export default Pharmacy;
