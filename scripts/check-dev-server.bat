@echo off
echo 🔍 Checking for running Next.js development servers...
echo.

REM Check for servers on common development ports
netstat -ano | findstr :3001 > temp_3001.txt 2>nul
netstat -ano | findstr :3002 > temp_3002.txt 2>nul

set "server_found=0"

if exist temp_3001.txt (
    for /f %%i in (temp_3001.txt) do (
        echo ✅ Server found on port 3001
        echo 🌐 http://localhost:3001
        set "server_found=1"
        goto found
    )
)

if exist temp_3002.txt (
    for /f %%i in (temp_3002.txt) do (
        echo ✅ Server found on port 3002
        echo 🌐 http://localhost:3002
        set "server_found=1"
        goto found
    )
)

:found
if %server_found%==0 (
    echo ❌ No Next.js development server found running
    echo 🚀 You can start one with: npm run dev:3002
) else (
    echo.
    echo ⚠️  Server is already running. Use Ctrl+C in the terminal to stop it.
    echo 🔄 Or use: npm run dev:clean to restart
)

REM Cleanup
del temp_3001.txt 2>nul
del temp_3002.txt 2>nul

echo.
pause
