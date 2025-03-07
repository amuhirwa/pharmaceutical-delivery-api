import * as medicationController from "../controllers/medication.controller";
import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { medicationSchema } from "../utils/validation.utils";

const router = Router();

// Wrapper function to handle middleware type issues
const wrapMiddleware = (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, next);
  };

// Wrapper for async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Public routes
router.get('/', asyncHandler(medicationController.getAllMedications));
router.get('/:id', asyncHandler(medicationController.getMedicationById));
router.get('/vendor/:id', asyncHandler(medicationController.getMedicationsByVendor));

// Protected routes
router.use(wrapMiddleware(authMiddleware));

// Add new medication (vendor only)
router.post(
  '/',
  wrapMiddleware(authorize('vendor')),
  validate(medicationSchema),
  asyncHandler(medicationController.createMedication)
);

// Update medication (vendor only)
router.put(
  '/:id',
  wrapMiddleware(authorize('vendor')),
  asyncHandler(medicationController.updateMedication)
);

// Delete medication (vendor only)
router.delete(
  '/:id',
  wrapMiddleware(authorize('vendor')),
  asyncHandler(medicationController.deleteMedication)
);

export default router;