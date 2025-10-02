@echo off
echo ========================================
echo SETTING UP ENVIRONMENT VARIABLES
echo ========================================
echo.
echo This will set up the proper PATH for Node.js and Rust.
echo.

echo Setting up Node.js PATH...
setx PATH "%PATH%;C:\Program Files\nodejs" /M

echo Setting up Rust PATH...
setx PATH "%PATH%;C:\Users\LocalAdmin\.cargo\bin" /M

echo.
echo ✅ Environment variables set!
echo You may need to restart your terminal for changes to take effect.
echo.
echo Press any key to close...
pause >nul

