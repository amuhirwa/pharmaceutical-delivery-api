import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      schema.parse(req.body);

      // Validation passed, continue to the next middleware
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors into a more readable response
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        res.status(400).json({
          message: 'Validation failed',
          errors: errorMessages
        });
        return;
      }

      // For any other unexpected errors
      next(error);
    }
  };