import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { JwtPayload } from "../types";

export function generateToken(payload: JwtPayload): string {
  const secretKey = config.jwt.secret as Secret;


  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any
  };

  return jwt.sign(payload, secretKey, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const secretKey = config.jwt.refreshSecret as Secret;

  // Type assertion for expiresIn to match what jwt accepts
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as any
  };

  return jwt.sign(payload, secretKey, options);
}

export function verifyToken(token: string): JwtPayload {
  const secretKey = config.jwt.secret as Secret;
  return jwt.verify(token, secretKey) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secretKey = config.jwt.refreshSecret as Secret;
  return jwt.verify(token, secretKey) as JwtPayload;
}