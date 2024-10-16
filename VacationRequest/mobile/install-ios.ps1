#!/usr/bin/env pwsh

$loc = Get-Location

npm install --legacy-peer-deps

Set-Location -Path "ios"
pod install
Set-Location -Path $loc
