@echo OFF

echo ------------------------------
echo Digital Workflow Platform
echo Build and Start script
echo https://dwkit.com

for /f "delims== tokens=1,*" %%G in (config.cfg) do set %%G=%%H

echo -
echo Step 1 Install NPM packages
echo ------------------------------
cd src\OptimaJet.DWKit.StarterApplication
call npm install --legacy-peer-deps

echo -
echo Step 2 Build Webpack
echo ------------------------------
call npm run dist
cd ..\..

echo -
echo Step 3 dotnet build
echo ------------------------------
dotnet build
IF ERRORLEVEL 9009 goto :NO_SDK_ERROR

echo -
echo Step 4 dotnet publish
echo ------------------------------
dotnet publish -o .\bin

echo -
echo Starting...
echo -----------------------------
start.bat

exit

:NO_SDK_ERROR
echo .NET Core not found. Please install .NET SDK 8.0 to run this application
echo For more information visit https://dotnet.microsoft.com/en-us/download/dotnet/8.0
