SELECT id, email, name, role, "createdAt"
FROM "User"
WHERE email ILIKE '%test%' OR email ILIKE '%admin%' OR name ILIKE '%test%' OR name ILIKE '%admin%' OR role='ADMIN'
ORDER BY "createdAt" DESC
LIMIT 50;
