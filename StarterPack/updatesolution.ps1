#!/usr/bin/env pwsh

$DistrPath = ".\src\"
$SolutionFolder = $args[0]

function CopyAndBackup($SourceFolder, $TargetFolder, $BackupFolder, $Filter, $SubFolder, $CheckSubfolders, $SkipIfExists)
{
    $files = Get-ChildItem -File -Path $( $SourceFolder + "\" + $SubFolder ) -Filter $Filter
    foreach ($file in $files)
    {
        $needToUpdate = $true
        $isnew = $true
        $fileforbackup = $TargetFolder + "\" + $SubFolder + "\" + $file.Name
        if (Test-Path $fileforbackup)
        {

            if ($SkipIfExists | Where-Object { $file.Name -like $_ })
            {
                "Ignore: " + $file.Name | Write-Host
                continue;
            }

            $isnew = $false
            $hashA = $( Get-FileHash $file.FullName ).hash
            $hashB = $( Get-FileHash $fileforbackup ).hash

            if ($hashA -eq $hashB)
            {
                $needToUpdate = $false
            }
            else
            {
                $needToUpdate = $true
            }

            if ($needToUpdate -eq $true)
            {
                if (!(Test-Path $( $BackupFolder + "\" + $SubFolder )))
                {
                    New-Item -ItemType Directory -Force -Path $( $BackupFolder + "\" + $SubFolder ) | Out-Null
                }
                Copy-Item -Path $fileforbackup -Destination  $( $BackupFolder + "\" + $SubFolder )
            }
        }

        if ($needToUpdate -eq $true)
        {

            if ($isnew -eq $true)
            {
                "Create: " + $file.Name | Write-Host
            }
            else
            {
                "Update: " + $file.Name | Write-Host
            }

            $destinationFolder = $( $TargetFolder + "\" + $SubFolder )
            $destinationFolder  | Write-Host
            if (!(Test-Path $destinationFolder))
            {
                New-Item -ItemType Directory -Force -Path $destinationFolder | Out-Null
            }
            Copy-Item -Path $file.FullName -Destination $destinationFolder
        }
    }

    if ($CheckSubfolders -eq $true)
    {
        $dirs = Get-ChildItem -Directory -Path $( $SourceFolder + "\" + $SubFolder )
        foreach ($dir in $dirs)
        {
            CopyAndBackup -SourceFolder $SourceFolder -TargetFolder $TargetFolder -BackupFolder $BackupFolder -Filter $Filter -SubFolder $( $SubFolder + "\" + $dir.Name )
        }
    }
}

'----------------------------'
'DWKit update solution script'
'https://dwkit.com'
'----------------------------'

while ($null -eq $SolutionFolder -Or !(Test-Path $SolutionFolder))
{
    $SolutionFolder = Read-Host -Prompt "Enter solution's folder"

    if (!(Test-Path $SolutionFolder))
    {
        Write-Host 'This folder does not exist!' -ForegroundColor Red
    }
}
'Target Folder: ' + $SolutionFolder

$BackupFolder = $SolutionFolder + '\dwkit-backup-' + (get-date).ToString("dd-MM-yyyy")
$folderIndex = 1
$BackupFolderTMP = $BackupFolder
while (Test-Path $BackupFolderTMP)
{
    $BackupFolderTMP = $BackupFolder + '-' + $folderIndex
    $folderIndex++
}

$BackupFolder = $BackupFolderTMP
#New-Item -ItemType Directory -Force -Path $BackupFolder | Out-Null
'Backup Folder: ' + $BackupFolder

#########
#OptimaJet.DWKit.Application
#########
"---------------------------------------" | Write-Host
"OptimaJet.DWKit.Application updating..." | Write-Host
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.cs -SubFolder "OptimaJet.DWKit.Application"

"OptimaJet.DWKit.Application has been updated" | Write-Host

#########
#OptimaJet.DWKit.StarterApplication
#########
"---------------------------------------" | Write-Host
"OptimaJet.DWKit.StarterApplication updating..." | Write-Host


CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.cs -SubFolder "OptimaJet.DWKit.StarterApplication"
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter package.json -SubFolder "OptimaJet.DWKit.StarterApplication"
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter webpack.config.js -SubFolder "OptimaJet.DWKit.StarterApplication"

#Controllers - *.cs
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.cs -SubFolder "OptimaJet.DWKit.StarterApplication\Controllers"
#View
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\Views" -CheckSubfolders $true
#wwwroot\css
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\css" -CheckSubfolders $true -SkipIfExists "site.css", "site.min.css"
#wwwroot\js
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\js" -CheckSubfolders $true
#wwwroot\images
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\images" -CheckSubfolders $true
#wwwroot\scripts
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\scripts" -CheckSubfolders $true
#wwwroot\localization
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\localization"
#wwwroot\themes
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\themes"
#silentRenew.html
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter silentRenew.html -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot"
#wwwroot\templates
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\templates" -CheckSubfolders $true
#wwwroot\mobileframe
CopyAndBackup -SourceFolder $DistrPath -TargetFolder $SolutionFolder -BackupFolder $BackupFolder -Filter *.* -SubFolder "OptimaJet.DWKit.StarterApplication\wwwroot\mobileframe" -CheckSubfolders $true



"OptimaJet.DWKit.StarterApplication has been updated" | Write-Host

#########
#Update version in csproj files
#########

"---------------------------------------" | Write-Host
"Package version updating for csproj-files..." | Write-Host


function UpgradeProject($CsProj, $FileMask)
{
    Write-Host $CsProj $FileMask

    [xml]$xml = Get-Content $CsProj
    $PackageReference = $xml.Project.ItemGroup.PackageReference

    $files = Get-ChildItem -File -Path $SolutionFolder -Recurse -Filter $FileMask
    foreach ($file in $files)
    {
        Write-Host "------------------------------------ $( $file )"

        if ($file.FullName -like "*dwkit-backup-*")
        {
            continue;
        }
        "VS Project: " + $file.Name | Write-Host
        [xml]$proj = Get-Content $file.FullName
        $needToBackup = $false
        foreach ($package in $PackageReference)
        {
            if ($null -eq $package.Include -and $null -eq $package.Version)
            {
                continue;
            }
            $packName = $package.Include.ToString()
            $packVersion = $package.Version.ToString()

            $packageUpgraded = $false
            foreach ($node in $proj.Project.ItemGroup.PackageReference)
            {
                if ($null -eq $node.Include -and $null -eq $node.Version)
                {
                    continue;
                }

                $nodeName = $node.Include.ToString()
                $nodeVersion = $node.Version.ToString()
                if ($packName.equals($nodeName) -and !$packVersion.equals($nodeVersion))
                {
                    $packName + " " + $nodeVersion + " -> " + $packVersion | Write-Host
                    $node.Version = $packVersion
                    $needToBackup = $true
                    $packageUpgraded = $true
                    break
                }
            }
            if (!$packageUpgraded) {
                $NewPackage = $proj.CreateElement("PackageReference")
                $NewPackage.SetAttribute("Include", $packName)
                $NewPackage.SetAttribute("Version", $packVersion)
                $proj.Project.ItemGroup.AppendChild($NewPackage)
                $needToBackup = $true
            }
        }

        if ($needToBackup)
        {
            if (!(Test-Path $( $BackupFolder + "\" + $file.Directory.Name )))
            {
                New-Item -ItemType Directory -Force -Path $( $BackupFolder + "\" + $file.Directory.Name ) | Out-Null
            }
            Copy-Item -Path $file.FullName -Destination $( $BackupFolder + "\" + $file.Directory.Name )
            "Backup: " + $file.Name | Write-Host
            "VS Project: " + $file.Name + " Updated" | Write-Host
            $proj.Save($file.FullName);
        }
        else
        {
            "VS Project: " + $file.Name + " Checked" | Write-Host
        }
    }
}

$csproj = $DistrPath + "OptimaJet.DWKit.StarterApplication\OptimaJet.DWKit.StarterApplication.csproj"
UpgradeProject $csproj "*StarterApplication.csproj"

$AppProj = $DistrPath + "OptimaJet.DWKit.Application\OptimaJet.DWKit.Application.csproj"
UpgradeProject $AppProj "*DWKit.Application.csproj"

do
{
    $dirs = gci $BackupFolder -directory -recurse | Where { (gci $_.fullName).count -eq 0 } | select -expandproperty FullName
    $dirs | Foreach-Object { Remove-Item $_ }
} while ($dirs.count -gt 0)

Write-Host "The update has been successful. Don't forget run npm install and update DB if it's necessary."
