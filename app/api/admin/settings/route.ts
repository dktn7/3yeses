import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'admin-settings.json');

const DEFAULT_SETTINGS = {
  general: {
    platformName: '3YESES',
    supportEmail: 'support@3yeses.online',
    defaultLanguage: 'en',
    timezone: 'UTC',
  },
  security: {
    requireEmailVerification: true,
    twoFactorAuth: false,
    sessionTimeout: 60,
  },
  email: {
    smtpHost: '',
    smtpPort: 587,
    encryption: 'tls',
    fromEmail: 'noreply@3yeses.online',
  },
  payments: {
    gateway: 'stripe',
    commission: 15,
    currency: 'GBP',
  },
  users: {
    maxPortfolioItems: 50,
    requireApproval: false,
    allowSelfDelete: true,
  },
  notifications: {
    emailOnNewUser: true,
    emailOnReport: true,
    emailOnPayment: true,
  },
};

async function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data');
  const { mkdir } = await import('fs/promises');
  try {
    await mkdir(dataDir, { recursive: true });
  } catch {
    // dir exists
  }
}

async function loadSettings() {
  try {
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function saveSettings(settings: Record<string, any>) {
  await ensureDataDir();
  await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

async function getHandler(req: NextRequest) {
  try {
    const settings = await loadSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Failed to load settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

async function postHandler(req: NextRequest, context: { admin: any }) {
  try {
    const body = await req.json();
    const current = await loadSettings();
    const merged = { ...current, ...body };
    await saveSettings(merged);

    // Audit log
    try {
      const { createAuditLog } = await import('@/lib/admin/audit');
      await createAuditLog({
        action: 'UPDATE_SETTINGS',
        userId: context.admin?.userId || 'system',
        details: { changedKeys: Object.keys(body) },
      });
    } catch {
      // non-critical
    }

    return NextResponse.json({ success: true, settings: merged });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

export const GET = withAdminAuth(getHandler);
export const POST = withAdminAuth(postHandler);
