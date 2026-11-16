param(
    [string]$ExportPath = (Join-Path $PSScriptRoot '..\..\CCN\dist')
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$workspace = (Resolve-Path -LiteralPath (Join-Path $repo '..\..')).Path
$source = (Resolve-Path -LiteralPath $ExportPath).Path
$apps = (Resolve-Path -LiteralPath (Join-Path $repo 'site\apps')).Path
$destination = Join-Path $apps 'ccn-mobile'
$stage = Join-Path $apps '.ccn-mobile-stage'
$previous = Join-Path $apps '.ccn-mobile-previous'
$base = '/portfolio-ufpi/apps/ccn-mobile'

function Assert-InWorkspace([string]$Path) {
    $absolute = [IO.Path]::GetFullPath($Path)
    if (-not $absolute.StartsWith($workspace + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Path outside workspace: $absolute"
    }
}

foreach ($path in @($source, $destination, $stage, $previous)) { Assert-InWorkspace $path }
if (-not (Test-Path -LiteralPath (Join-Path $source 'index.html'))) { throw 'Expo export has no index.html' }
if (Test-Path -LiteralPath $stage) { throw 'Stage path already exists; inspect it before retrying' }
if (Test-Path -LiteralPath $previous) { throw 'Previous export backup already exists; inspect it before retrying' }

New-Item -ItemType Directory -Path $stage | Out-Null
Get-ChildItem -LiteralPath $source -File -Filter '*.html' | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $stage $_.Name)
}
foreach ($folder in @('(tabs)', 'noticias', '_expo', 'assets', 'branding')) {
    $from = Join-Path $source $folder
    if (-not (Test-Path -LiteralPath $from)) { throw "Missing public export folder: $folder" }
    Copy-Item -LiteralPath $from -Destination (Join-Path $stage $folder) -Recurse
}

foreach ($file in Get-ChildItem -LiteralPath $stage -Recurse -File | Where-Object { $_.Extension -in @('.html', '.js') }) {
    $content = [IO.File]::ReadAllText($file.FullName)
    $patched = [regex]::Replace($content, '(?<![A-Za-z0-9_-])/branding/', "$base/branding/")
    if ($patched -ne $content) {
        [IO.File]::WriteAllText($file.FullName, $patched, [Text.UTF8Encoding]::new($false))
    }
}

if (Test-Path -LiteralPath (Join-Path $stage 'admin')) { throw 'Admin folder must not enter the portfolio' }
if (Test-Path -LiteralPath (Join-Path $stage 'solicitacoes')) { throw 'Service backend files must not enter the portfolio' }
if (Get-ChildItem -LiteralPath $stage -Recurse -File | Where-Object { $_.Name -match '(?i)^\.env|\.(key|pem|p12|pfx|jks|keystore)$' }) {
    throw 'Sensitive file name found in the staged export'
}
$entry = Get-ChildItem -LiteralPath (Join-Path $stage '_expo\static\js\web') -File -Filter 'entry-*.js' | Select-Object -First 1
if (-not $entry) { throw 'Web bundle missing from the staged export' }
$bundle = [IO.File]::ReadAllText($entry.FullName)
if ($bundle.Contains('/api/admin/')) { throw 'Admin API route found in web bundle' }
if (-not $bundle.Contains('https://ccn-mobile-vercel.vercel.app')) { throw 'Public read API was not configured in the web bundle' }
$html = [IO.File]::ReadAllText((Join-Path $stage 'index.html'))
if (-not $html.Contains("$base/_expo/") -or -not $html.Contains("$base/branding/")) {
    throw 'Base path is incomplete in index.html'
}

if (Test-Path -LiteralPath $destination) { Move-Item -LiteralPath $destination -Destination $previous }
Move-Item -LiteralPath $stage -Destination $destination
if (-not (Test-Path -LiteralPath (Join-Path $destination 'index.html'))) {
    throw 'New export was not installed; the previous export remains at the backup path'
}
if (Test-Path -LiteralPath $previous) {
    $resolvedPrevious = (Resolve-Path -LiteralPath $previous).Path
    Assert-InWorkspace $resolvedPrevious
    Remove-Item -LiteralPath $resolvedPrevious -Recurse -Force
}
Write-Output "Updated CCN Mobile public export at $destination"
