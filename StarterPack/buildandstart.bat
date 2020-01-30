@echo OFF

for /f "delims== tokens=1,*" %%G in (config) do set %%G=%%H

dotnet build
IF ERRORLEVEL 9009 goto :NO_SDK_ERROR

dotnet publish -o bin

start.bat

exit

:NO_SDK_ERROR
echo .NET Core not found. Please install .NET Core SDK 2.1 to run this application
echo For more information visit https://dotnet.microsoft.com/download/dotnet-core/2.1
