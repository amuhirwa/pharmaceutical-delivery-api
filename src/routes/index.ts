import authRoutes from "./auth.routes";
import medicationRoutes from "./medication.routes";
import orderRoutes from "./order.routes";
import pharmacyRoutes from "./pharmacy.routes";
import userRoutes from "./user.routes";
import vendorRoutes from "./vendor.routes";
import { Router } from "express";

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/medications', medicationRoutes);
router.use('/orders', orderRoutes); // Make sure this line exists
router.use('/vendors', vendorRoutes);
router.use('/pharmacies', pharmacyRoutes);

export default router;