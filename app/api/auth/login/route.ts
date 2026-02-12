import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password, adminId } = await req.json();

    // Check if this is an admin login attempt
    const ADMIN_ID = process.env.ADMIN_ID;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (adminId && password) {
      // Admin login via env credentials
      if (adminId === ADMIN_ID && password === ADMIN_PASSWORD) {
        const adminUser = {
          _id: 'admin-user',
          name: 'Admin',
          email: 'admin@callu.com',
          mobile: ADMIN_ID,
          status: 'approved',
          role: 'admin',
          avatarConfig: { color: 'bg-zinc-100' }
        };
        return NextResponse.json({ user: adminUser }, { status: 200 });
      } else {
        return NextResponse.json({ message: 'Invalid admin credentials' }, { status: 401 });
      }
    }

    // Regular user login (passwordless)
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.status !== 'approved') {
      return NextResponse.json({ message: 'Your application is still pending review.' }, { status: 403 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
