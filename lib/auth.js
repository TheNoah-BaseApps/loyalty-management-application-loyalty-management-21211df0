import { verifyToken } from './jwt';

export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Missing or invalid authorization header'
      };
    }

    const token = authHeader.substring(7);
    const verification = await verifyToken(token);

    if (!verification.valid) {
      return {
        authenticated: false,
        error: 'Invalid or expired token'
      };
    }

    return {
      authenticated: true,
      user: verification.payload
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed'
    };
  }
}

export function checkRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole);
}