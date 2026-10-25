param (
    [string]$DistPath = "dist",
    [string]$ZipPath = "dist.zip"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $DistPath)) {
    Write-Error "Directory '$DistPath' does not exist."
    exit 1
}

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$resolvedDist = (Resolve-Path $DistPath).Path
$resolvedZip = [System.IO.Path]::GetFullPath($ZipPath)

$archive = [System.IO.Compression.ZipFile]::Open($resolvedZip, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    $files = Get-ChildItem -Path $resolvedDist -Recurse -Force | Where-Object { -not $_.PSIsContainer }
    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($resolvedDist.Length).TrimStart([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar).Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $relativePath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
}
finally {
    $archive.Dispose()
}

Write-Host "Successfully packaged $DistPath into $ZipPath with standard POSIX forward slashes."
