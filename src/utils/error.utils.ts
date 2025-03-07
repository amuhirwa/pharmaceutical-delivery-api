import { Response } from "express";

export function handleControllerError(res: Response, error: unknown, statusCode = 400): Response | void {
  console.error('Error:', error);

  if (res.headersSent) {
    return;
  }

  const errorMessage = error instanceof Error
    ? error.message
    : 'An unknown error occurred';

  return res.status(statusCode).json({ message: errorMessage });
}