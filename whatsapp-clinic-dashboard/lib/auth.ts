import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface UserPayload {
  userId: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist';
}

/**
 * Hashea una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compara una contraseña con su hash
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Genera un token JWT
 */
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica un token JWT
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Genera un token de recuperación de contraseña
 */
export function generateResetToken(userId: string): string {
  return jwt.sign({ userId, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Verifica un token de recuperación de contraseña
 */
export function verifyResetToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
    if (decoded.type !== 'reset') {
      return null;
    }
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}
