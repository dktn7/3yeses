# Site-Wide URL Validation Implementation Guide

## Overview
Comprehensive URL validation system to protect against malicious and adult content across the entire application.

## Files Created
- `lib/url-validator.ts` - Core validation logic
- `lib/hooks/useUrlValidator.ts` - React hook for components
- `lib/middleware/url-validation.ts` - API middleware
- `lib/config/security.ts` - Centralized configuration

---

## Implementation Options

### **Option 1: Component-Level (Client-Side)**
Use the React hook in any component:

```typescript
import { useUrlValidator } from '@/lib/hooks/useUrlValidator';

function MyComponent() {
  const { url, setUrl, validation, isValid, validate } = useUrlValidator('', {
    validateOnChange: true,
    debounceMs: 300,
  });

  const handleSubmit = () => {
    const result = validate();
    if (!result.isValid) {
      alert(result.error);
      return;
    }
    // Proceed with submission
  };

  return (
    <div>
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        className={!isValid && validation ? 'border-red-500' : ''}
      />
      {validation && !validation.isValid && (
        <p className="text-red-500 text-sm">{validation.error}</p>
      )}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### **Option 2: API Route Protection (Server-Side)**
Add validation to any API endpoint:

```typescript
// app/api/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateUrlsInRequest } from '@/lib/middleware/url-validation';

export async function POST(request: NextRequest) {
  // Validate URLs in request
  const validationError = await validateUrlsInRequest(request, {
    fields: ['url', 'thumbnail', 'mediaUrl'],
    detailedErrors: true,
  });
  
  if (validationError) {
    return validationError; // Returns 400 with error details
  }
  
  const body = await request.json();
  // ... rest of your upload logic
}
```

**Or use the higher-order function:**

```typescript
import { withUrlValidation } from '@/lib/middleware/url-validation';

async function handleUpload(request: NextRequest) {
  const body = await request.json();
  // ... your logic here
}

export const POST = withUrlValidation(handleUpload, {
  fields: ['url', 'thumbnail'],
  detailedErrors: true,
});
```

### **Option 3: Utility Function (Anywhere)**
Use directly in any TypeScript/JavaScript file:

```typescript
import { validateUrl, isUrlSafe } from '@/lib/url-validator';

// Quick check
if (!isUrlSafe(userInput)) {
  throw new Error('Invalid URL');
}

// Detailed validation
const result = validateUrl(userInput);
if (!result.isValid) {
  console.error(result.error);
  return;
}

// Use sanitized URL
const safeUrl = result.sanitizedUrl;
```

### **Option 4: Batch Validation**
Validate multiple URLs at once:

```typescript
import { UrlValidator } from '@/lib/url-validator';

const validator = new UrlValidator();
const urls = ['https://example.com', 'https://badsite.com', 'invalid'];
const results = validator.validateBatch(urls);

results.forEach((result, url) => {
  console.log(`${url}: ${result.isValid ? 'Valid' : result.error}`);
});
```

---

## Update Existing Gallery Page

Replace the current validation with the new utility:

```typescript
// app/dashboard/gallery/page.tsx
import { validateUrl } from '@/lib/url-validator';
import { logBlockedUrl } from '@/lib/config/security';

const handleUrlUpload = async (type: string, url: string) => {
  if (!url.trim()) {
    setNotification({ show: true, type: 'error', message: 'Please enter a valid URL' });
    return;
  }
  
  // Use centralized validation
  const result = validateUrl(url);
  if (!result.isValid) {
    // Log security event
    logBlockedUrl(url, result.error || 'Validation failed');
    setNotification({ show: true, type: 'error', message: result.error });
    return;
  }
  
  // Use sanitized URL
  const safeUrl = result.sanitizedUrl!;
  
  try {
    setUploading(true);
    const formData = new FormData();
    formData.append('type', type);
    formData.append('url', safeUrl);
    // ... rest of upload logic
  } catch (error) {
    // ... error handling
  }
};
```

---

## Configuration

### Environment Variables (.env.local)
```bash
# Custom blocked domains (comma-separated)
BLOCKED_DOMAINS=bad-site.com,another-bad.com

# Custom blocked patterns (comma-separated)
BLOCKED_PATTERNS=spam,scam,illegal

# Enable strict mode
NODE_ENV=production
```

### Runtime Configuration
```typescript
import { securityConfig, updateBlockedDomains } from '@/lib/config/security';

// Add domains dynamically (e.g., from admin panel)
updateBlockedDomains(['new-bad-site.com', 'another.com']);

// Check if domain is blocked
import { isDomainBlocked } from '@/lib/config/security';
if (isDomainBlocked('example.com')) {
  // Handle blocked domain
}
```

---

## Security Features

### ✅ What's Protected
- **Adult content domains** - Comprehensive list of adult websites
- **Malicious patterns** - Keywords like "malware", "phishing", "crack"
- **IP addresses** - Direct IP access blocked
- **Localhost/internal networks** - Prevents SSRF attacks
- **Suspicious TLDs** - Free domains often used for phishing (.tk, .ml, etc.)
- **Invalid formats** - Proper URL structure required
- **Protocol enforcement** - Only HTTP/HTTPS allowed
- **Length limits** - Prevents buffer overflow attacks

### 📊 Monitoring
- Logs all blocked attempts
- Can integrate with monitoring services (Sentry, DataDog)
- Production alerts for suspicious activity

---

## Testing

```typescript
import { validateUrl } from '@/lib/url-validator';

// Test valid URLs
console.log(validateUrl('https://example.com')); // { isValid: true }

// Test blocked domains
console.log(validateUrl('https://pornhub.com/video')); // { isValid: false, error: '...' }

// Test malicious patterns
console.log(validateUrl('https://example.com/malware.exe')); // { isValid: false }

// Test invalid formats
console.log(validateUrl('not-a-url')); // { isValid: false }

// Test IP addresses
console.log(validateUrl('http://192.168.1.1')); // { isValid: false }
```

---

## Recommended Implementation Strategy

1. **✅ Update Gallery Page** - Replace inline validation with utility
2. **✅ Add API Middleware** - Protect upload endpoints
3. **✅ Use Hook in Forms** - Add to profile editor, contact forms, etc.
4. **✅ Monitor Logs** - Track blocked attempts
5. **✅ Admin Panel** - Allow admins to manage blocked domains

---

## Where to Apply Site-Wide

| Location | Method | Priority |
|----------|--------|----------|
| **Gallery Upload** | Hook + API | ✅ High |
| **Profile Editor** (website field) | Hook | ✅ High |
| **Comments** (with URLs) | Utility + API | 🟡 Medium |
| **Contact Form** | Hook | 🟡 Medium |
| **Admin Settings** | Utility | 🟢 Low |
| **Any user-submitted URLs** | All methods | ✅ High |

---

## Performance Considerations

- **Client-side validation**: Instant feedback, no server load
- **Server-side validation**: Security layer, prevents malicious requests
- **Debouncing**: Reduces validation calls during typing
- **Caching**: Can cache validation results for repeated URLs

---

## Future Enhancements

1. **External API Integration**
   - Google Safe Browsing API
   - VirusTotal API
   - PhishTank API

2. **Machine Learning**
   - Train model on URL patterns
   - Detect new threats automatically

3. **Admin Dashboard**
   - View blocked attempts
   - Manage blocklist
   - Analytics and reports

4. **Rate Limiting**
   - Limit validation requests per user
   - Prevent abuse
