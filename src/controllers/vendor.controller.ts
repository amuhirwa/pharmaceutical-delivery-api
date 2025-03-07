import * as vendorService from "../services/vendor.service";
import { NextFunction, Request, Response } from "express";

// controllers/vendor.controller.ts

export const getAllVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendors = await vendorService.getAllVendors(req.query);
    res.status(200).json(vendors);
  } catch (error) {
    next(error);
  }
};

export const getVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendor = await vendorService.getVendorById(req.params.id);
    res.status(200).json(vendor);
  } catch (error) {
    next(error);
  }
};

export const getVendorReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await vendorService.getVendorReviews(req.params.id);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const updateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const vendorId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const isAuthorized = userRole === 'admin' || userId === vendorId;

    if (!isAuthorized) {
      res.status(403).json({ message: 'Not authorized to update this vendor' });
      return;
    }

    const updatedVendor = await vendorService.updateVendor(vendorId, req.body);
    res.status(200).json(updatedVendor);
  } catch (error) {
    next(error);
  }
};