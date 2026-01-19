import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  // JWT sign - expiresIn accepts string (e.g., '7d', '1h') or number (seconds)
  // Using any to bypass strict type checking for expiresIn
  const payload = { id };
  const options: any = { expiresIn };
  
  return jwt.sign(payload, secret, options);
};
