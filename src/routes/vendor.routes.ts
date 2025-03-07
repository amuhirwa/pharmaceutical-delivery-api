import * as vendorController from "../controllers/vendor.controller";
import { Router } from "express";
import { NextFunction, Request, Response } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/async.utils";

// routes/vendor.routes.ts

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all vendors
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const vendors = await vendorController.getAllVendors(req, res, next);
  res.json(vendors);
}));

// Get vendor by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const vendor = await vendorController.getVendorById(req, res, next);
  res.json(vendor);
}));

// Get vendor reviews
router.get('/:id/reviews', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const reviews = await vendorController.getVendorReviews(req, res, next);
  res.json(reviews);
}));

// Error handling middleware
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Update vendor (only vendor or admin)
router.put('/:id', authorize(['vendor', 'admin']), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const updatedVendor = await vendorController.updateVendor(req, res, next);
  res.json(updatedVendor);
}));

export default router;