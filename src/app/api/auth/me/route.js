/**
 * GET /api/auth/me
 * Verify current JWT token and return admin info.
 */
import { authMiddleware } from '@/lib/auth';

export async function GET(request) {
  const auth = await authMiddleware(request);
  if (auth.error) return auth.error;

  return Response.json({
    success: true,
    data: { admin: auth.admin },
  });
}
