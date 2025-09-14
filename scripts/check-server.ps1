# PowerShell script to check if Next.js development server is already running
param(
    [int]$Port = 3002
)

# Check if port is in use
$portInUse = netstat -ano | Select-String ":$Port\s"

if ($portInUse) {
    Write-Host "✅ Development server is already running on port $Port" -ForegroundColor Green
    Write-Host "🌐 Local: http://localhost:$Port" -ForegroundColor Cyan
    
    # Get process info
    $processInfo = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($processInfo) {
        $process = Get-Process -Id $processInfo.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "🔧 Process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
        }
    }
    
    $choice = Read-Host "Do you want to restart the server? (y/N)"
    if ($choice -eq 'y' -or $choice -eq 'Y') {
        Write-Host "🔄 Stopping existing server..." -ForegroundColor Yellow
        if ($process) {
            Stop-Process -Id $process.Id -Force
            Start-Sleep -Seconds 2
        }
        Write-Host "🚀 Starting new server..." -ForegroundColor Green
        npm run dev -- -p $Port
    } else {
        Write-Host "✨ Using existing server at http://localhost:$Port" -ForegroundColor Green
    }
} else {
    Write-Host "🚀 No server running on port $Port. Starting development server..." -ForegroundColor Green
    npm run dev -- -p $Port
}
