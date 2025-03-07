import User from "./user.model";
import { Schema } from "mongoose";
import { VendorDocument } from "../types";

const reviewSchema = new Schema({
  pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { _id: false });

const vendorSchema = new Schema({
  businessName: { type: String, required: true },
  businessLicense: { type: String, required: true },
  deliveryCapability: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: [reviewSchema]
});

const Vendor = User.discriminator<VendorDocument>('vendor', vendorSchema);

export default Vendor;