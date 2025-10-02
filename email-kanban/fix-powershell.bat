@echo off
echo ========================================
echo FIXING POWERSHELL EXECUTION POLICY
echo ========================================
echo.
echo This will fix the PowerShell execution policy that's blocking npm commands.
echo You need to run this as Administrator.
echo.
echo Press any key to continue...
pause >nul

echo.
echo Setting execution policy to allow npm commands...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
if %errorlevel% equ 0 (
    echo ✅ Execution policy fixed successfully!
    echo.
    echo Now you can run npm commands normally.
) else (
    echo ❌ Failed to fix execution policy.
    echo Please run this batch file as Administrator.
)

echo.
echo Press any key to close...
pause >nul

