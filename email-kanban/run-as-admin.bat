@echo off
echo This will run the Tauri development server with administrator privileges
echo to avoid permission issues with Rust builds.
echo.
echo Press any key to continue...
pause >nul

powershell -Command "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0dev-admin.ps1\"' -Verb RunAs"

