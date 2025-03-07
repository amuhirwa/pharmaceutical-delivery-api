import * as pharmacyService from "../services/pharmacy.service";
import { NextFunction, Request, Response } from "express";
import { handleControllerError } from "../utils/error.utils";

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
    }
  }
}

export const getAllPharmacies = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  pharmacyService.getAllPharmacies(req.query)
    .then(pharmacies => res.status(200).json(pharmacies))
    .catch(next);
};

export const getPharmacyById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  pharmacyService.getPharmacyById(req.params.id)
    .then(pharmacy => res.status(200).json(pharmacy))
    .catch(next);
};

export const updatePharmacy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pharmacyId = req.params.id;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Admin can update any pharmacy, pharmacy can only update themselves
  const isAuthorized =
    userRole === 'admin' ||
    userId === pharmacyId;

  if (!isAuthorized) {
    return res.status(403).json({ message: 'Not authorized to update this pharmacy' });
  }

  pharmacyService.updatePharmacy(pharmacyId, req.body)
    .then(updatedPharmacy => res.status(200).json(updatedPharmacy))
    .catch(next);
};

export const createPharmacy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Ensure only admin can create pharmacies
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create pharmacies' });
  }

  pharmacyService.createPharmacy(req.body)
    .then(pharmacy => res.status(201).json(pharmacy))
    .catch(next);
};

export const deletePharmacy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Ensure only admin can delete pharmacies
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete pharmacies' });
  }

  pharmacyService.deletePharmacy(req.params.id)
    .then(() => res.status(200).json({ message: 'Pharmacy deleted successfully' }))
    .catch(next);
};