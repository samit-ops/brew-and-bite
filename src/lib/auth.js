/**
 * JWT Authentication Utilities
 * - signToken: creates a JWT for an admin user
 * - verifyToken: validates a JWT from the Authorization header
 * - authMiddleware: extracts and verifies token, returns admin payload or error response
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

/**
 * Sign a new JWT token for an admin user.
 * @param {Object} payload - { id, email, name }
 * @returns {string} JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify a JWT token string.
 * @param {string} token
 * @returns {Object|null} decoded payload or null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Middleware: Extract Bearer token from request headers and verify.
 * Returns the admin payload if valid, or a NextResponse error.
 * 
 * Usage in API route:
 *   const auth = await authMiddleware(request);
 *   if (auth.error) return auth.error;
 *   const admin = auth.admin;
 */
export async function authMiddleware(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: Response.json(
        { success: false, message: 'Authentication required. Provide Bearer token.' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      error: Response.json(
        { success: false, message: 'Invalid or expired token.' },
        { status: 401 }
      ),
    };
  }

  return { admin: decoded };
}
