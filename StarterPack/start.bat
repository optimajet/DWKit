@echo OFF

for /f "delims== tokens=1,*" %%G in (config) do set %%G=%%H

SET Metadata__path=../metadata/metadata.json
SET ConnectionStrings__default=%ConnectionString%
SET ASPNETCORE_URLS=http://localhost:48800
SET ASPNETCORE_ENVIRONMENT=Development

CD "bin"

dotnet "OptimaJet.DWKit.StarterApplication.dll"
IF ERRORLEVEL 9009 goto :NO_DOTNETCORE

pause

exit

:NO_DOTNETCORE
echo .NET Core not found. Please install .NET Core 2.1 to run this application
echo For more information visit https://dotnet.microsoft.com/download/dotnet-core/2.1
