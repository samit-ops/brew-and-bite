/**
 * POST /api/auth/login
 * Admin login — validates credentials, returns JWT.
 */
import dbConnect from '@/lib/db';
import Admin from '@/lib/models/Admin';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Find admin (explicitly select password since it's excluded by default)
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return Response.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return Response.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });

    return Response.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, message: 'Server error during login.' },
      { status: 500 }
    );
  }
}
