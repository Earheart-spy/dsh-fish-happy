<#
One-step installer for the Fish Happy plugin on a Windows DSH desktop profile.

Usage:
  irm https://raw.githubusercontent.com/Earheart-spy/dsh-fish-happy/main/install.ps1 | iex

Optional environment variables:
  DSH_FISH_HAPPY_DIR     download directory (default: %USERPROFILE%\Documents\dsh\fish-happy)
  DSH_PROFILE            DSH profile directory (default: auto-detect the desktop profile)
  DSH_FISH_HAPPY_FORCE   set to 1 to replace an existing link that points elsewhere
#>

$ErrorActionPreference = 'Stop'
$repoUrl = 'https://github.com/Earheart-spy/dsh-fish-happy.git'
$zipUrl = 'https://github.com/Earheart-spy/dsh-fish-happy/archive/refs/heads/main.zip'
$packageName = 'dsh-fish-happy'
$InstallDir = $env:DSH_FISH_HAPPY_DIR
$ProfileDir = $env:DSH_PROFILE
$Force = ($env:DSH_FISH_HAPPY_FORCE -eq '1')

function Write-Step([string]$Message) {
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Normalize-Path([string]$Path) {
  return [System.IO.Path]::GetFullPath($Path).TrimEnd('\', '/')
}

# Old Windows PowerShell installations may still default to TLS 1.0; GitHub rejects that.
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {
  # Continue on systems where the Tls12 enum is unavailable.
}

if (-not $InstallDir) {
  $InstallDir = Join-Path $env:USERPROFILE 'Documents\dsh\fish-happy'
}
$InstallDir = Normalize-Path $InstallDir

Write-Step "Check install directory: $InstallDir"
if (Test-Path (Join-Path $InstallDir 'package.json')) {
  $existing = Get-Content -Raw -Encoding UTF8 (Join-Path $InstallDir 'package.json') | ConvertFrom-Json
  if ($existing.name -ne $packageName) {
    throw "Directory $InstallDir already exists but is not the $packageName repository. Choose another directory or clean it up first."
  }
  Write-Host "Plugin sources already exist; skipping download."
} else {
  if (Test-Path $InstallDir) {
    $children = @(Get-ChildItem -Force $InstallDir)
    if ($children.Count -gt 0) {
      throw "Directory $InstallDir already exists and is not empty. Choose another directory or clean it up first."
    }
  }

  $parent = Split-Path -Parent $InstallDir
  if ($parent -and -not (Test-Path $parent)) {
    New-Item -ItemType Directory -Path $parent | Out-Null
  }

  $git = Get-Command git -ErrorAction SilentlyContinue
  if ($git) {
    Write-Step "Download the plugin with git"
    & $git.Source clone --depth 1 $repoUrl $InstallDir
    if ($LASTEXITCODE -ne 0) {
      throw "git clone failed. Check the network and try again."
    }
  } else {
    Write-Step "git not found; download the ZIP archive instead"
    $zip = Join-Path $env:TEMP ("dsh-fish-happy-" + [guid]::NewGuid().ToString('N') + '.zip')
    $extract = Join-Path $env:TEMP ("dsh-fish-happy-" + [guid]::NewGuid().ToString('N'))
    try {
      Invoke-WebRequest -Uri $zipUrl -OutFile $zip -UseBasicParsing
      Expand-Archive -Path $zip -DestinationPath $extract -Force
      $source = Join-Path $extract 'dsh-fish-happy-main'
      if (-not (Test-Path $source)) {
        throw "The ZIP archive did not contain dsh-fish-happy-main."
      }
      New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
      Copy-Item -Path (Join-Path $source '*') -Destination $InstallDir -Recurse -Force
    } finally {
      if (Test-Path $zip) { Remove-Item $zip -Force }
      if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
    }
  }
}

if (-not (Test-Path (Join-Path $InstallDir 'package.json'))) {
  throw "package.json is missing after download; the archive may be incomplete."
}

Write-Step "Locate the DSH profile"
$profilesRoot = Join-Path $env:USERPROFILE '.dsh\profiles'
if ($ProfileDir) {
  $ProfileDir = Normalize-Path $ProfileDir
} else {
  if (-not (Test-Path $profilesRoot)) {
    throw "Could not find $profilesRoot. Start the DSH desktop app once first."
  }
  $candidates = @(
    Get-ChildItem -Directory $profilesRoot |
      Where-Object { Test-Path (Join-Path $_.FullName 'package.json') }
  )
  $desktop = $candidates | Where-Object { $_.Name -eq 'desktop' } | Select-Object -First 1
  if ($desktop) {
    $ProfileDir = $desktop.FullName
  } elseif ($candidates.Count -eq 1) {
    $ProfileDir = $candidates[0].FullName
  } else {
    throw "Multiple DSH profiles were found. Set the DSH_PROFILE environment variable and try again."
  }
}
$profilePackage = Join-Path $ProfileDir 'package.json'
if (-not (Test-Path $profilePackage)) {
  throw "The profile directory has no package.json: $ProfileDir"
}
Write-Host "Profile: $ProfileDir"

Write-Step "Update the profile manifest"
$json = Get-Content -Raw -Encoding UTF8 $profilePackage | ConvertFrom-Json
if (-not $json.dsh -or -not $json.dsh.profile -or -not $json.dsh.profile.bundles) {
  throw "This profile has no dsh.profile.bundles array; it may not be a DSH desktop profile."
}

$linkValue = 'link:' + ($InstallDir -replace '\\', '/')
if (-not $json.dependencies) {
  $json | Add-Member -NotePropertyName dependencies -NotePropertyValue ([pscustomobject]@{})
}
if ($json.dependencies.PSObject.Properties.Name -contains $packageName) {
  $json.dependencies.$packageName = $linkValue
} else {
  $json.dependencies | Add-Member -NotePropertyName $packageName -NotePropertyValue $linkValue
}

$bundles = @($json.dsh.profile.bundles)
if ($bundles -notcontains $packageName) {
  $json.dsh.profile.bundles = @($bundles + $packageName)
}

$jsonText = $json | ConvertTo-Json -Depth 30
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($profilePackage, $jsonText + [Environment]::NewLine, $utf8NoBom)

Write-Step "Create the plugin directory link"
$nodeModules = Join-Path $ProfileDir 'node_modules'
if (-not (Test-Path $nodeModules)) {
  New-Item -ItemType Directory -Path $nodeModules | Out-Null
}
$target = Join-Path $nodeModules $packageName
if (Test-Path $target) {
  $item = Get-Item $target -Force
  $sameTarget = $false
  if ($item.LinkType -in @('Junction', 'SymbolicLink')) {
    $currentTarget = @($item.Target)[0]
    if ($currentTarget) {
      $sameTarget = (Normalize-Path $currentTarget) -eq $InstallDir
    }
  }
  if ($sameTarget) {
    Write-Host "The link already points at the plugin; skipping."
  } elseif ($item.LinkType -in @('Junction', 'SymbolicLink')) {
    if (-not ($Force -or $env:DSH_FISH_HAPPY_FORCE -eq '1')) {
      throw "A link already points elsewhere: $target. Set DSH_FISH_HAPPY_FORCE=1 to replace it."
    }
    # rmdir removes only the junction, never the files inside its target.
    & cmd /c rmdir "$target"
    New-Item -ItemType Junction -Path $target -Target $InstallDir | Out-Null
  } else {
    throw "$target is a normal directory, not a link. Check for an older copy and remove it manually."
  }
} else {
  New-Item -ItemType Junction -Path $target -Target $InstallDir | Out-Null
}

if (-not (Test-Path (Join-Path $target 'package.json'))) {
  throw "The install link cannot read package.json: $target"
}

Write-Step "Installation complete"
Write-Host "Plugin directory: $InstallDir"
Write-Host "Profile:          $ProfileDir"
Write-Host "Fully quit the DSH desktop app, then start it again."
Write-Host "The fish-shaped Fish Happy entry should appear in the left sidebar."
