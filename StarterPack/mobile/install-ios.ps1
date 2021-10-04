#!/usr/bin/env pwsh

$loc = Get-Location

npm install

Set-Location -Path "ios"
pod install
Set-Location -Path $loc
