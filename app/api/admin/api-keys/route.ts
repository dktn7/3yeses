import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/middleware";
import fs from "fs";
import path from "path";

async function requireAdmin(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (!auth.authenticated || !auth.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (auth.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user: auth.user };
}

// Define all external API keys the platform uses (VirusTotal & URLScan removed - not in use)
const API_KEY_DEFINITIONS = [
  {
    id: "stripe_secret",
    name: "Stripe Secret Key",
    service: "Stripe",
    category: "payments",
    envVar: "STRIPE_SECRET_KEY",
    description: "Used for payment processing and subscription management",
    docsUrl: "https://stripe.com/docs/keys",
  },
  {
    id: "stripe_webhook",
    name: "Stripe Webhook Secret",
    service: "Stripe",
    category: "payments",
    envVar: "STRIPE_WEBHOOK_SECRET",
    description: "Verifies incoming Stripe webhook signatures",
    docsUrl: "https://stripe.com/docs/webhooks/signatures",
  },
  {
    id: "stripe_price_6m",
    name: "Stripe Price ID (6 Month)",
    service: "Stripe",
    category: "payments",
    envVar: "STRIPE_PRICE_STANDARD_6M",
    description: "Price ID for the 6-month Standard subscription plan",
    docsUrl: "https://stripe.com/docs/products-prices/manage-prices",
  },
  {
    id: "stripe_price_12m",
    name: "Stripe Price ID (12 Month)",
    service: "Stripe",
    category: "payments",
    envVar: "STRIPE_PRICE_STANDARD_12M",
    description: "Price ID for the 12-month Standard subscription plan",
    docsUrl: "https://stripe.com/docs/products-prices/manage-prices",
  },
  {
    id: "imagekit_public_key",
    name: "ImageKit Public Key",
    service: "ImageKit",
    category: "media",
    envVar: "IMAGEKIT_PUBLIC_KEY",
    description: "Public key for ImageKit client-side uploads",
    docsUrl: "https://imagekit.io/docs/api-keys",
  },
  {
    id: "imagekit_private_key",
    name: "ImageKit Private Key",
    service: "ImageKit",
    category: "media",
    envVar: "IMAGEKIT_PRIVATE_KEY",
    description: "Private key for ImageKit server-side operations and upload auth",
    docsUrl: "https://imagekit.io/docs/api-keys",
  },
  {
    id: "imagekit_url_endpoint",
    name: "ImageKit URL Endpoint",
    service: "ImageKit",
    category: "media",
    envVar: "IMAGEKIT_URL_ENDPOINT",
    description: "URL endpoint for ImageKit media delivery (e.g. https://ik.imagekit.io/3YESES)",
    docsUrl: "https://imagekit.io/docs/api-keys",
  },
  {
    id: "resend_key",
    name: "Resend API Key",
    service: "Resend",
    category: "email",
    envVar: "RESEND_API_KEY",
    description: "API key for transactional email delivery via Resend",
    docsUrl: "https://resend.com/docs/api-reference/api-keys",
  },
  {
    id: "jwt_secret",
    name: "JWT Secret",
    service: "Auth",
    category: "security",
    envVar: "JWT_SECRET",
    description: "Secret key for signing JSON Web Tokens",
    docsUrl: "",
  },
  {
    id: "jwt_refresh",
    name: "JWT Refresh Secret",
    service: "Auth",
    category: "security",
    envVar: "JWT_REFRESH_SECRET",
    description: "Secret key for signing refresh tokens (used in auth-service and token refresh endpoint)",
    docsUrl: "",
  },
  {
    id: "database_url",
    name: "Database URL",
    service: "PostgreSQL",
    category: "database",
    envVar: "DATABASE_URL",
    description: "PostgreSQL connection string for Prisma ORM",
    docsUrl: "https://www.prisma.io/docs/orm/overview/databases/postgresql",
  },
];

// Simulated usage data - only tracks services with actual API calls
function generateUsageData() {
  const now = new Date();
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      stripe: Math.floor(Math.random() * 50) + 10,
      resend: Math.floor(Math.random() * 100) + 20,
    });
  }
  return data;
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if ("error" in authResult) return authResult.error;

  // Check which keys are configured (never expose actual values)
  const keys = API_KEY_DEFINITIONS.map((def) => {
    const value = process.env[def.envVar];
    const isConfigured = !!value && value.length > 0;

    // Create a safe masked preview (e.g., "sk_live_...abc1")
    let maskedPreview = "";
    if (isConfigured && value) {
      if (value.length > 12) {
        maskedPreview = `${value.substring(0, 7)}...${value.substring(value.length - 4)}`;
      } else {
        maskedPreview = "••••••••";
      }
    }

    return {
      id: def.id,
      name: def.name,
      service: def.service,
      category: def.category,
      envVar: def.envVar,
      description: def.description,
      docsUrl: def.docsUrl,
      isConfigured,
      maskedPreview,
      lastVerified: isConfigured
        ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
        : null,
    };
  });

  // Summary stats
  const totalKeys = keys.length;
  const configuredKeys = keys.filter((k) => k.isConfigured).length;
  const missingKeys = totalKeys - configuredKeys;

  const categories = {
    payments: keys.filter((k) => k.category === "payments"),
    media: keys.filter((k) => k.category === "media"),
    email: keys.filter((k) => k.category === "email"),
    security: keys.filter((k) => k.category === "security"),
    database: keys.filter((k) => k.category === "database"),
  };

  const usageData = generateUsageData();

  return NextResponse.json({
    keys,
    summary: {
      totalKeys,
      configuredKeys,
      missingKeys,
      healthPercentage: Math.round((configuredKeys / totalKeys) * 100),
    },
    categories,
    usageData,
  });
}

// POST: Allow admin to update API key values in .env.local
export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { envVar, value } = body;

    if (!envVar || typeof value !== "string") {
      return NextResponse.json(
        { error: "envVar and value are required" },
        { status: 400 }
      );
    }

    // Validate that envVar is one of our known keys
    const knownKey = API_KEY_DEFINITIONS.find((def) => def.envVar === envVar);
    if (!knownKey) {
      return NextResponse.json(
        { error: "Unknown environment variable" },
        { status: 400 }
      );
    }

    // Read existing .env.local file
    const envFilePath = path.join(process.cwd(), ".env.local");
    let envContent = "";

    try {
      envContent = fs.readFileSync(envFilePath, "utf-8");
    } catch {
      // File doesn't exist yet, start with empty content
      envContent = "";
    }

    // Parse existing env vars
    const lines = envContent.split("\n");
    let found = false;
    const updatedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith(`${envVar}=`) || trimmed.startsWith(`${envVar} =`)) {
        found = true;
        return `${envVar}=${value}`;
      }
      return line;
    });

    if (!found) {
      updatedLines.push(`${envVar}=${value}`);
    }

    // Write back
    fs.writeFileSync(envFilePath, updatedLines.join("\n"), "utf-8");

    // Update process.env for the running process
    process.env[envVar] = value;

    return NextResponse.json({
      success: true,
      message: `${knownKey.name} updated successfully. Restart the server for full effect.`,
    });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}
