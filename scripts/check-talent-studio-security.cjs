const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };

const analytics = read('app/api/analytics/dashboard/route.ts');
const passwordCode = read('app/api/user/password-change-code/route.ts');
const changePassword = read('app/api/user/change-password/route.ts');

assert(analytics.includes("AuthService.verifyJWT(accessToken)"), 'Analytics route must verify the access token.');
assert(analytics.includes("where: { userId: decoded.userId }"), 'Analytics route must scope the profile to the authenticated user.');
assert(analytics.includes('viewerId: { not: null }'), 'Analytics viewer aggregation must exclude anonymous viewers.');
assert(analytics.includes('select: {') && analytics.includes('createdAt: true'), 'Analytics recent views must use an explicit response select.');
assert(!analytics.includes('email: true'), 'Analytics recent-view payload must not select viewer email.');
assert(!analytics.includes('viewer.email'), 'Analytics response must not expose viewer email.');

assert(passwordCode.includes('AuthService.verifyJWT(accessToken)'), 'Password-code route must verify the access token.');
assert(passwordCode.includes('user.emailVerified'), 'Password-code route must require a verified email.');
assert(passwordCode.includes('prisma.user.updateMany'), 'Password-code route must reserve cooldown atomically.');
assert(passwordCode.includes('passwordChangeCodeSentAt: now'), 'Password-code route must reserve the send timestamp.');
assert(passwordCode.includes('hashCode(code)'), 'Password-code route must store only a hash of the verification code.');
assert(passwordCode.includes('createHmac') && passwordCode.includes('PASSWORD_CHANGE_CODE_PEPPER'), 'Password-code route must use a deployment secret for code hashing.');
assert(passwordCode.includes('CODE_WINDOW_MS'), 'Password-code route must expire verification codes.');
assert(passwordCode.includes('passwordChangeCodeAttempts: 0'), 'Password-code route must reset verification attempts.');
assert(passwordCode.includes('passwordChangeCodeSentAt: now'), 'Password-code route must clear a failed reservation only when it owns it.');

assert(changePassword.includes('passwordChangeCodeHash'), 'Password-change route must validate the emailed verification code.');
assert(changePassword.includes('passwordChangeCodeAttempts'), 'Password-change route must enforce code-attempt limits.');
assert(changePassword.includes('passwordChangeCodeExpiry'), 'Password-change route must enforce code expiry.');
assert(changePassword.includes('AuthService.hashPassword(newPassword)'), 'Password-change route must hash the new password.');
assert(changePassword.includes('createHmac') && changePassword.includes('PASSWORD_CHANGE_CODE_PEPPER'), 'Password-change route must use the same deployment secret for code hashing.');

const emailService = read('lib/email/emailService.ts');
assert(emailService.includes("throw new Error('Email provider is not configured')"), 'Email service must fail closed when the provider is missing.');
assert(!emailService.includes('console.log(html)'), 'Email service must never log rendered email HTML.');
assert(!emailService.includes('Email would be sent to:'), 'Email service must never log recipient details in the missing-provider path.');

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, checks: 22, note: 'Static security gate passed; no live payment mutation was performed.' }, null, 2));
}
