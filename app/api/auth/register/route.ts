import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail, sendParentalConsentEmail, sendWelcomeEmail } from '@/lib/email/emailService';
import { generateNextUserId } from '@/lib/id-generator';

const prisma = new PrismaClient();

// Helper function to generate verification token
function generateVerificationToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract data from all three signup steps
    const {
      // Step 1 - Account Information
      accountType,
      isMinor,
      // SELF account fields
      firstName,
      lastName,
      email,
      phone,
      password,
      dateOfBirth,
      // SELF_WITH_CONSENT account fields (13-15 year olds)
      parentName, // For consent emails
      parentEmail, // For consent emails
      // PARENT_MANAGED account fields
      parentFirstName,
      parentLastName,
      parentEmail: parentManagedEmail,
      parentPhone,
      childFirstName,
      childLastName,
      childDateOfBirth,
      parentalConsentGiven,
      termsAccepted,
      
      // Step 2 - Profile Details
      category,
      subcategory,
      bio,
      location,
      experience,
      skills,
      gender,
      genderOther,
      ethnicity,
      ethnicityOther,
      bodyType,
      languages,
      disabilities,
      disabilityOther,
      
      // Step 3 - Media (file names/URLs for now, actual upload handled separately)
      profilePhotoUrl,
      portfolioUrls,
      audioUrls,
      videoUrls,
    } = body;

    // === VALIDATION ===
    
    // Common validation
    if (!accountType || !termsAccepted) {
      return NextResponse.json(
        { success: false, message: 'Account type and terms acceptance are required' },
        { status: 400 }
      );
    }

    // Validate based on account type
    if (accountType === 'SELF') {
      if (!firstName || !lastName || !email || !password) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields for self-managed account' },
          { status: 400 }
        );
      }
    } else if (accountType === 'SELF_WITH_CONSENT') {
      // 13-15 year olds who chose self-managed with parental consent
      if (!firstName || !lastName || !email || !password || !parentName || !parentEmail) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields for self-managed account with consent' },
          { status: 400 }
        );
      }
      // Validate parent email is different from teen's
      if (email === parentEmail) {
        return NextResponse.json(
          { success: false, message: 'Parent email must be different from your email' },
          { status: 400 }
        );
      }
    } else if (accountType === 'PARENT_MANAGED') {
      if (!parentFirstName || !parentLastName || !parentManagedEmail || 
          !childFirstName || !childLastName || !childDateOfBirth || !parentalConsentGiven) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields for parent-managed account' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Step 2 validation
    if (!category || !location || !experience) {
      return NextResponse.json(
        { success: false, message: 'Missing required profile fields (category, location, experience)' },
        { status: 400 }
      );
    }

    // === CHECK FOR EXISTING USER ===
    
    const primaryEmail = accountType === 'PARENT_MANAGED' ? parentManagedEmail : email;
    const existingUser = await prisma.user.findUnique({
      where: { email: primaryEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // === HASH PASSWORD (for SELF and SELF_WITH_CONSENT accounts) ===
    
    let hashedPassword: string | null = null;
    if ((accountType === 'SELF' || accountType === 'SELF_WITH_CONSENT') && password) {
      const salt = await bcrypt.genSalt(12);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // === GENERATE VERIFICATION TOKEN ===
    
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // === GENERATE USER ID ===
    
    const userId = await generateNextUserId();
    
    // === CREATE USER ===
    
    const userData: any = {
      id: userId,
      email: primaryEmail,
      role: 'TALENT', // All signups through this flow are talent
      accountType,
      isMinor: isMinor || false,
      termsAcceptedAt: new Date(),
      verificationToken,
      verificationTokenExpiry,
    };

    // Add fields based on account type
    if (accountType === 'SELF') {
      userData.name = `${firstName} ${lastName}`;
      userData.password = hashedPassword;
      userData.phone = phone || null;
      userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    } else if (accountType === 'SELF_WITH_CONSENT') {
      // Teen's account that requires parental consent
      userData.name = `${firstName} ${lastName}`;
      userData.password = hashedPassword;
      userData.phone = phone || null;
      userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      // Parental consent fields
      userData.parentName = parentName;
      userData.parentEmail = parentEmail;
      userData.parentalConsentRequired = true;
      userData.parentalConsentPending = true;
      userData.parentalConsentGiven = false;
      // Generate consent token
      const consentToken = crypto.randomBytes(32).toString('hex');
      const consentTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
      userData.parentConsentToken = consentToken;
      userData.parentConsentTokenExpiry = consentTokenExpiry;
    } else if (accountType === 'PARENT_MANAGED') {
      userData.name = `${childFirstName} ${childLastName}`; // Child's name as primary name
      userData.password = null; // No password for parent-managed accounts
      userData.parentFirstName = parentFirstName;
      userData.parentLastName = parentLastName;
      userData.parentEmail = parentManagedEmail;
      userData.parentPhone = parentPhone || null;
      userData.childFirstName = childFirstName;
      userData.childLastName = childLastName;
      userData.childDateOfBirth = new Date(childDateOfBirth);
      userData.parentalConsentGiven = parentalConsentGiven;
      userData.parentalConsentDate = new Date();
    }

    const user = await prisma.user.create({
      data: userData,
    });

    // === CREATE TALENT PROFILE ===
    
    const talentProfileData: any = {
      userId: user.id,
      categoryId: category,
      subcategoryId: subcategory || null,
      bio: bio || null,
      location,
      experience: parseInt(experience) || 0,
      skills: skills || [],
      languages: languages || [],
      rating: 0,
      viewCount: 0,
      likeCount: 0,
      isBeginner: false,
    };

    // Add optional profile fields
    if (gender) {
      talentProfileData.gender = gender === 'OTHER' ? genderOther : gender;
    }
    if (ethnicity) {
      talentProfileData.ethnicity = ethnicity === 'OTHER' ? ethnicityOther : ethnicity;
    }
    if (bodyType) {
      talentProfileData.bodyType = bodyType;
    }
    if (disabilities && disabilities.length > 0) {
      talentProfileData.disabilities = disabilities;
      if (disabilities.includes('other') && disabilityOther) {
        talentProfileData.disabilityOther = disabilityOther;
      }
    }

    // Add media URLs if provided
    if (profilePhotoUrl) {
      talentProfileData.avatarUrl = profilePhotoUrl;
    }
    if (portfolioUrls && portfolioUrls.length > 0) {
      talentProfileData.portfolioUrls = portfolioUrls;
    }
    if (audioUrls && audioUrls.length > 0) {
      talentProfileData.audioUrls = audioUrls;
    }
    if (videoUrls && videoUrls.length > 0) {
      talentProfileData.videoUrls = videoUrls;
    }

    const talentProfile = await prisma.talentProfile.create({
      data: talentProfileData,
    });

    // === SEND VERIFICATION EMAIL ===
    
    // For SELF_WITH_CONSENT accounts, send parental consent email instead of verification
    if (accountType === 'SELF_WITH_CONSENT') {
      const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/auth/parental-consent/${userData.parentConsentToken}`;
      
      try {
        await sendParentalConsentEmail(
          parentEmail,
          `${firstName} ${lastName}`,
          consentUrl,
          'en' // TODO: Pass locale from request
        );
        console.log(`✅ Parental consent email sent to: ${parentEmail}`);
      } catch (emailError) {
        console.error('❌ Failed to send parental consent email:', emailError);
        // Continue - user is created, they can request resend
      }
    } else {
      // For PARENT_MANAGED and SELF accounts, send verification email
      const verificationEmail = accountType === 'PARENT_MANAGED' ? parentManagedEmail : email;
      const recipientName = accountType === 'PARENT_MANAGED' ? parentFirstName : firstName;
      
      try {
        await sendVerificationEmail(
          verificationEmail,
          verificationToken,
          'en' // TODO: Pass locale from request
        );
        console.log(`✅ Verification email sent to: ${verificationEmail}`);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        // Continue - user is created, they can request resend
      }
    }
    // === RETURN SUCCESS RESPONSE ===
    
    // Different message for accounts requiring parental consent
    const successMessage = accountType === 'SELF_WITH_CONSENT'
      ? 'Account created successfully. A consent request has been sent to your parent/guardian.'
      : 'Account created successfully. Please check your email to verify your account.';
    
    const responseEmail = accountType === 'SELF_WITH_CONSENT' ? email : 
                         accountType === 'PARENT_MANAGED' ? parentManagedEmail : email;
    
    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        userId: user.id,
        talentProfileId: talentProfile.userId,
        email: responseEmail,
        accountType,
        requiresParentalConsent: accountType === 'SELF_WITH_CONSENT' || accountType === 'PARENT_MANAGED',
        parentalConsentPending: accountType === 'SELF_WITH_CONSENT',
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { success: false, message: 'An account with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
