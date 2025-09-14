import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, agreeToTerms, agreeToPrivacy, confirmAge } = body;

    // --- Basic Validation ---
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (!agreeToTerms || !agreeToPrivacy || !confirmAge) {
        return NextResponse.json({ message: 'You must agree to the terms, privacy policy, and confirm your age.' }, { status: 400 });
    }

    // --- Check for existing user ---
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    // --- Hash Password ---
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // --- Create User ---
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(), // Assuming role in schema is uppercase (e.g., TALENT, CLIENT)
      },
    });

    // --- Create Profile based on Role ---
    if (user.role === 'TALENT') {
      await prisma.talentProfile.create({
        data: {
          userId: user.id,
          // Add any default fields for talent profile here
        },
      });
    } else if (user.role === 'CLIENT') {
      await prisma.clientProfile.create({
        data: {
          userId: user.id,
          // Add any default fields for client profile here
        },
      });
    }
    
    // TODO: Implement email verification logic (e.g., send a verification email)

    return NextResponse.json({ 
        message: 'User registered successfully. Please proceed to the next step.',
        userId: user.id 
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

