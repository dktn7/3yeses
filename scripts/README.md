# Development Server Management

This project includes several utilities to prevent duplicate Next.js development servers and manage them efficiently.

## 🛠️ Available Scripts

### Basic Development
```bash
npm run dev          # Start server on port 3001 (default)
npm run dev:3002     # Start server on port 3002 (alternative)
```

### Server Management
```bash
npm run check-server # Check which ports have running servers
npm run dev:clean    # Kill existing servers and start fresh on port 3002
```

### Manual Utilities
```bash
# Check if servers are running (Windows)
.\scripts\check-dev-server.bat

# Check specific ports
netstat -ano | findstr :3001
netstat -ano | findstr :3002
```

## 🔍 Best Practices

### Before Starting Development
1. **Always check first**: Run `npm run check-server` to see if a server is already running
2. **Use existing server**: If one is running, just navigate to the URL shown
3. **Clean restart**: Use `npm run dev:clean` if you need a fresh start

### Managing Multiple Servers
- **Port 3001**: Default Next.js port (preferred for main development)
- **Port 3002**: Alternative port (used when 3001 is busy)
- **Check conflicts**: Run the check script before starting new servers

### Troubleshooting
```bash
# If you get "EADDRINUSE" error:
npm run check-server  # See what's running
npm run dev:clean     # Clean restart

# If ports are stuck:
# Find the process ID (PID) and kill it manually:
netstat -ano | findstr :3002
taskkill /F /PID <PID_NUMBER>
```

## 🚀 Quick Start Workflow

1. **First time today**:
   ```bash
   npm run check-server
   # If nothing running: npm run dev:3002
   # If something running: use the displayed URL
   ```

2. **Development session**:
   ```bash
   # Check status anytime
   npm run check-server
   
   # Open browser to displayed URL
   # http://localhost:3002 (most likely)
   ```

3. **End of day**:
   ```bash
   # Stop server with Ctrl+C in terminal
   # Or use npm run dev:clean tomorrow for fresh start
   ```

## 📁 File Structure

```
scripts/
├── check-dev-server.bat    # Windows batch script for server checking
├── check-server.ps1        # PowerShell script (advanced)
└── README.md              # This file

package.json               # Contains npm scripts for server management
```

## 🎯 Why This Matters

- **Prevents port conflicts**: No more "EADDRINUSE" errors
- **Saves time**: Don't start duplicate servers
- **Clean development**: Know exactly what's running where
- **Team coordination**: Everyone uses the same workflow

---

**💡 Pro Tip**: Bookmark `http://localhost:3002` and always run `npm run check-server` before starting work!
