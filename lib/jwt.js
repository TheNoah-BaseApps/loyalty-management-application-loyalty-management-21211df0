import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-characters-long'
);

export async function generateToken(payload) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return { valid: true, payload };
  } catch (error) {
    console.error('Error verifying token:', error);
    return { valid: false, error: error.message };
  }
}