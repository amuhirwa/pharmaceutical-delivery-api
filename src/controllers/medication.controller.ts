import * as medicationService from "../services/medication.service";
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

export const getAllMedications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const medications = await medicationService.getAllMedications(req.query);
    res.status(200).json(medications);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getMedicationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const medication = await medicationService.getMedicationById(req.params.id);
    res.status(200).json(medication);
  } catch (error) {
    handleControllerError(res, error, 404);
  }
};

export const createMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only vendors can create medications
    if (!req.user || req.user.role !== 'vendor') {
      res.status(403).json({ message: 'Only vendors can create medications' });
      return;
    }

    const medication = await medicationService.createMedication(
      req.user.userId,
      req.body
    );

    res.status(201).json(medication);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only vendor who owns the medication can update it
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const medication = await medicationService.updateMedication(
      req.params.id,
      req.user.userId,
      req.body
    );

    res.status(200).json(medication);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteMedication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only vendor who owns the medication can delete it
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await medicationService.deleteMedication(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({ message: 'Medication deleted successfully' });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getMedicationsByVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const medications = await medicationService.getMedicationsByVendor(
      req.params.id,
      req.query
    );

    res.status(200).json(medications);
  } catch (error) {
    handleControllerError(res, error);
  }
};