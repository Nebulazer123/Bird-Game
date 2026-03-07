$ErrorActionPreference = "Stop"

function Ensure-Dir([string] $path) {
  if (!(Test-Path $path)) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
  }
}

function Download-File([string] $url, [string] $outFile) {
  if (Test-Path $outFile) {
    Write-Host "OK  exists  $outFile"
    return
  }

  Write-Host "GET $url"
  Ensure-Dir (Split-Path -Parent $outFile)
  Invoke-WebRequest -UseBasicParsing $url -OutFile $outFile
  Write-Host "OK  saved   $outFile"
}

function Copy-If-Exists([string] $fromFile, [string] $toFile) {
  if (!(Test-Path $fromFile)) {
    Write-Host "SKIP missing $fromFile"
    return
  }
  Ensure-Dir (Split-Path -Parent $toFile)
  Copy-Item -Force $fromFile $toFile
  Write-Host "OK  copied  $toFile"
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $projectRoot

$playerDir = Join-Path $projectRoot "public/assets/models/player"
$enemyDir = Join-Path $projectRoot "public/assets/models/enemy"
$kenneyDir = Join-Path $projectRoot "public/assets/models/kenney"
$hdriDir = Join-Path $projectRoot "public/assets/hdri"

Ensure-Dir $playerDir
Ensure-Dir $enemyDir
Ensure-Dir $kenneyDir
Ensure-Dir $hdriDir

Write-Host ""
Write-Host "== Birds (Three.js example models) =="
Download-File "https://threejs.org/examples/models/gltf/Parrot.glb" (Join-Path $playerDir "parrot.glb")
Download-File "https://threejs.org/examples/models/gltf/Stork.glb" (Join-Path $enemyDir "stork.glb")

Write-Host ""
Write-Host "== HDRI (Poly Haven, CC0) =="
Download-File "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/meadow_1k.hdr" (Join-Path $hdriDir "meadow_1k.hdr")

Write-Host ""
Write-Host "== Environment models (Kenney Nature Kit, CC0) =="
$kenneyZip = Join-Path $projectRoot "output/tmp-assets/kenney_nature-kit.zip"
$kenneyExtract = Join-Path $projectRoot "output/tmp-assets/kenney_nature-kit"

Download-File "https://kenney.nl/media/pages/assets/nature-kit/8334871c74-1677698939/kenney_nature-kit.zip" $kenneyZip

if (!(Test-Path $kenneyExtract)) {
  Ensure-Dir (Split-Path -Parent $kenneyExtract)
  Expand-Archive -Force $kenneyZip $kenneyExtract
  Write-Host "OK  extracted $kenneyExtract"
} else {
  Write-Host "OK  exists   $kenneyExtract"
}

$srcModels = Join-Path $kenneyExtract "Models/GLTF format"
$want = @(
  "tree_pineTallA_detailed.glb",
  "tree_pineTallB_detailed.glb",
  "tree_pineRoundC.glb",
  "plant_bushDetailed.glb",
  "grass_large.glb",
  "flower_yellowB.glb",
  "mushroom_tanGroup.glb",
  "rock_largeA.glb",
  "rock_largeC.glb",
  "rock_smallD.glb",
  "rock_tallC.glb"
)

foreach ($name in $want) {
  Copy-If-Exists (Join-Path $srcModels $name) (Join-Path $kenneyDir $name)
}

Write-Host ""
Write-Host "Done."
Write-Host "Next: run `corepack pnpm dev` and the game will load local assets from /public/assets/..."

