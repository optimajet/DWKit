#!/bin/sh

if ! type dotnet > /dev/null; then
  echo ".NET Core not found. Please install .NET 8.0 to run this application"
  echo "For more information visit https://dotnet.microsoft.com/en-us/download/dotnet/8.0"
  exit 127
fi

export ConnectionStrings__default=`grep "ConnectionString" ./config.cfg | cut -d '=' -f 2-`
export DWKit__MetadataPath=../metadata/
export DWKit__LicensePath=../license/

export ASPNETCORE_URLS=http://localhost:48800
export ASPNETCORE_ENVIRONMENT=Development

cd ./bin

dotnet OptimaJet.DWKit.StarterApplication.dll
