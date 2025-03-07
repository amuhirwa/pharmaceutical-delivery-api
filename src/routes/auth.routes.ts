import * as authController from "../controllers/auth.controller";
import express, { NextFunction, Request, Response, Router } from "express";
import { authMiddleware, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";

import {
  registerVendorSchema,
  registerPharmacySchema,
  loginSchema
} from '../utils/validation.utils';

const router = Router();

// Create middleware wrapper functions that don't return anything (void)
const validateRegisterVendor = (req: Request, res: Response, next: NextFunction): void => {
  validate(registerVendorSchema)(req, res, next);
};

const validateRegisterPharmacy = (req: Request, res: Response, next: NextFunction): void => {
  validate(registerPharmacySchema)(req, res, next);
};

const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  validate(loginSchema)(req, res, next);
};

const auth = (req: Request, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, next);
};

const authAdmin = (req: Request, res: Response, next: NextFunction): void => {
  authMiddleware(req, res, next);
  authorize('admin')(req, res, next);
};

// Create controller wrapper functions that don't return anything (void)
const handleRegisterVendor = (req: Request, res: Response): void => {
  authController.registerVendor(req, res);
};

const handleRegisterPharmacy = (req: Request, res: Response): void => {
  authController.registerPharmacy(req, res);
};

const handleLogin = (req: Request, res: Response): void => {
  authController.login(req, res);
};

const handleRefreshToken = (req: Request, res: Response): void => {
  authController.refreshToken(req, res);
};

const handleLogout = (req: Request, res: Response): void => {
  authController.logout(req, res);
};

const handleRegisterAdmin = (req: Request, res: Response): void => {
  authController.registerAdmin(req, res);
};

// Public routes
router.post('/register/vendor', validateRegisterVendor, handleRegisterVendor);
router.post('/register/pharmacy', validateRegisterPharmacy, handleRegisterPharmacy);
router.post('/login', validateLogin, handleLogin);
router.post('/refresh', handleRefreshToken);

// Protected routes
router.post('/logout', auth, handleLogout);

// Admin only route
router.post('/register/admin', authAdmin, handleRegisterAdmin);

export default router;