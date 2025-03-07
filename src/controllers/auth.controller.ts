import * as authService from "../services/auth.service";
import { Request, Response } from "express";
import { handleControllerError } from "../utils/error.utils";

export async function registerVendor(req: Request, res: Response) {
  try {
    const result = await authService.registerVendor(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function registerPharmacy(req: Request, res: Response) {
  try {
    const result = await authService.registerPharmacy(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function registerAdmin(req: Request, res: Response) {
  try {
    const result = await authService.registerAdmin(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return handleControllerError(res, error, 401);
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const result = await authService.refreshToken(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    return handleControllerError(res, error, 401);
  }
}

export async function logout(req: Request, res: Response) {
  // Since we're using stateless JWT authentication, there's no server-side session to invalidate
  // Client should discard the tokens
  return res.status(200).json({ message: 'Logged out successfully' });
}
