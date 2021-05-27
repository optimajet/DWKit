#!/bin/sh

if ! type dotnet > /dev/null; then
  echo ".NET Core not found. Please install .NET Core SDK 2.1 to run this application"
  echo "For more information visit https://dotnet.microsoft.com/download/dotnet-core/2.1"
  exit 127
fi

if ! type npm > /dev/null; then
  echo "NPM not found. Please install npm to build this application"
  echo "For more information visit https://www.npmjs.com/get-npm"
  exit 127
fi

echo "------------------------------"
echo "Digital Workflow Platform"
echo "Build and Start script"
echo "https://dwkit.com"

echo ""
echo "Step 1 Install NPM packages"
echo "------------------------------"
cd src/OptimaJet.DWKit.StarterApplication
npm install

echo ""
echo "Step 2 Build Webpack"
echo "------------------------------"
webpack -p
cd ../..

echo ""
echo "Step 3 dotnet build"
echo "------------------------------"
dotnet build

echo ""
echo "Step 4 dotnet publish"
echo "------------------------------"
dotnet publish -o ./../../bin

echo ""
echo "Starting..."
echo "-----------------------------"
./start.sh
