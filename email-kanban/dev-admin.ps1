# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Add Node.js and Rust to PATH
$env:PATH += ";C:\Program Files\nodejs;C:\Users\LocalAdmin\.cargo\bin"

# Navigate to project directory
Set-Location "C:\Users\LocalAdmin\Desktop\email_client\email-kanban"

Write-Host "Starting Tauri development server with admin privileges..." -ForegroundColor Green
Write-Host "Node.js version: $(node --version)" -ForegroundColor Cyan
Write-Host "Rust version: $(rustc --version)" -ForegroundColor Cyan
Write-Host "Cargo version: $(cargo --version)" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run tauri dev

# Keep the window open
Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

