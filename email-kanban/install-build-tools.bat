@echo off
echo ========================================
echo INSTALLING WINDOWS BUILD TOOLS
echo ========================================
echo.
echo This will install the necessary Windows build tools for Rust compilation.
echo You need to run this as Administrator.
echo.
echo Press any key to continue...
pause >nul

echo.
echo Installing Visual Studio Build Tools...
winget install Microsoft.VisualStudio.2022.BuildTools --silent --accept-source-agreements --accept-package-agreements

echo.
echo Installing Windows 10 SDK...
winget install Microsoft.WindowsSDK --silent --accept-source-agreements --accept-package-agreements

echo.
echo Installing CMake...
winget install Kitware.CMake --silent --accept-source-agreements --accept-package-agreements

echo.
echo ✅ Build tools installation initiated!
echo Please wait for the installations to complete.
echo.
echo Press any key to close...
pause >nul

