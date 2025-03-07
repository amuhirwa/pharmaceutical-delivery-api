import * as pharmacyController from "../controllers/pharmacy.controller";
import { Router } from "express";
import { z } from "zod";
import { authMiddleware, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { asyncHandler } from "../utils/async.utils";
import { pharmacySchema } from "../utils/validation.utils";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all pharmacies (admin and vendors)
router.get(
    '/',
    authorize(['admin', 'vendor']), // Changed to allow vendors too
    asyncHandler(async (req, res, next) => {
        await pharmacyController.getAllPharmacies(req, res, next);
    })
);

// Get pharmacy by ID
router.get(
    '/:id',
    asyncHandler(async (req, res, next) => {
        await pharmacyController.getPharmacyById(req, res, next);
    })
);

// Create pharmacy (admin only)
router.post(
    '/',
    authorize('admin'),
    validate(pharmacySchema),
    asyncHandler(async (req, res, next) => {
        await pharmacyController.createPharmacy(req, res, next);
    })
);

// Update pharmacy
router.put(
    '/:id',
    validate(pharmacySchema),
    asyncHandler(async (req, res, next) => {
        await pharmacyController.updatePharmacy(req, res, next);
    })
);

// Delete pharmacy (admin only)
router.delete(
    '/:id',
    authorize('admin'),
    asyncHandler(async (req, res, next) => {
        await pharmacyController.deletePharmacy(req, res, next);
    })
);

export default router;