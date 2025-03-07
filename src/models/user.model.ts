import mongoose, { Schema } from "mongoose";
import { UserDocument } from "../types";

const addressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { _id: false });

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendor', 'pharmacy'], required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: addressSchema, required: true },
}, {
  timestamps: true,
  discriminatorKey: 'role'
});


// Keep only this index:
userSchema.index({ role: 1 });

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;