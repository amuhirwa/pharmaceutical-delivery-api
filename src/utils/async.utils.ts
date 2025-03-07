import { NextFunction, Request, Response } from "express";

/**
 * Wraps async controller functions to properly handle errors
 * @param fn The async controller function to wrap
 * @returns A function that catches errors and passes them to next()
 */
export const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                await fn(req, res, next);
            } catch (error) {
                next(error);
            }
        };