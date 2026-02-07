# Stop the dev server first (Ctrl+C in the terminal running npm run dev)
# Then run this script

Write-Host "Regenerating Prisma Client..." -ForegroundColor Cyan

# Wait a moment for any file locks to release
Start-Sleep -Seconds 2

# Try to delete the old Prisma client
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\@prisma\client" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Running prisma generate..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Prisma client regenerated." -ForegroundColor Green
    Write-Host "`nNow you can:" -ForegroundColor Cyan
    Write-Host "1. Start your dev server: npm run dev" -ForegroundColor White
} else {
    Write-Host "`nError: Failed to generate Prisma client" -ForegroundColor Red
    Write-Host "Make sure the dev server is stopped and try again" -ForegroundColor Yellow
}
