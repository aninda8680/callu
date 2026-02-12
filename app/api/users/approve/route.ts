import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
