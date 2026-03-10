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
Write-Host "== Stylized Nature MegaKit (Quaternius, CC0) =="
$quaterniusDir = Join-Path $projectRoot "public/assets/models/quaternius"
$quaterniusZip = Join-Path $projectRoot "output/tmp-assets/quaternius_stylized-nature-megakit.zip"
$quaterniusExtract = Join-Path $projectRoot "output/tmp-assets/quaternius_stylized-nature-megakit"
$quaterniusExtractLegacy = Join-Path $projectRoot "output/tmp-assets/quaternius_stylized_nature_megakit_standard"

Download-File "https://quaternius.com/packs/Ultimate%20Stylized%20Nature%20Pack.zip" $quaterniusZip

if ((Test-Path $quaterniusExtractLegacy) -and !(Test-Path $quaterniusExtract)) {
  $quaterniusExtract = $quaterniusExtractLegacy
  Write-Host "OK  exists   $quaterniusExtract"
} elseif (!(Test-Path $quaterniusExtract)) {
  Ensure-Dir (Split-Path -Parent $quaterniusExtract)
  Expand-Archive -Force $quaterniusZip $quaterniusExtract
  Write-Host "OK  extracted $quaterniusExtract"
} else {
  Write-Host "OK  exists   $quaterniusExtract"
}

Ensure-Dir $quaterniusDir

$quaterniusWant = @(
  "CommonTree_1",
  "CommonTree_2",
  "CommonTree_4",
  "Pine_1",
  "Pine_3",
  "TwistedTree_2",
  "TwistedTree_4",
  "DeadTree_2",
  "DeadTree_4",
  "Rock_Medium_1",
  "Rock_Medium_2",
  "Rock_Medium_3",
  "Pebble_Round_4",
  "Pebble_Square_5",
  "RockPath_Round_Wide",
  "RockPath_Round_Thin",
  "RockPath_Square_Wide",
  "RockPath_Square_Thin",
  "Bush_Common",
  "Bush_Common_Flowers",
  "Fern_1",
  "Plant_1",
  "Plant_7_Big",
  "Grass_Common_Tall",
  "Grass_Wispy_Tall",
  "Clover_1",
  "Flower_3_Group",
  "Flower_4_Group",
  "Mushroom_Common"
)

$srcGltfDir = Get-ChildItem -Path $quaterniusExtract -Recurse -Directory | Where-Object { $_.Name -match "GLTF|gltf|glTF" } | Select-Object -First 1
$srcGltfPath = if ($srcGltfDir) { $srcGltfDir.FullName } else { $quaterniusExtract }
$srcTextureDir = Get-ChildItem -Path $quaterniusExtract -Recurse -Directory | Where-Object { $_.Name -eq "Textures" } | Select-Object -First 1

foreach ($baseName in $quaterniusWant) {
  $found = Get-ChildItem -Path $srcGltfPath -Recurse -Filter "$baseName.gltf" | Select-Object -First 1
  if (-not $found) {
    $found = Get-ChildItem -Path $quaterniusExtract -Recurse -Filter "$baseName.gltf" | Select-Object -First 1
  }
  if ($found) {
    Copy-If-Exists $found.FullName (Join-Path $quaterniusDir "$baseName.gltf")
    $binFile = Join-Path $found.DirectoryName "$baseName.bin"
    if (Test-Path $binFile) {
      Copy-If-Exists $binFile (Join-Path $quaterniusDir "$baseName.bin")
    }
  } else {
    Write-Host "SKIP missing $baseName.gltf in Quaternius pack"
  }
}

if ($srcTextureDir) {
  Get-ChildItem -Path $srcTextureDir.FullName -File -Filter *.png | ForEach-Object {
    Copy-If-Exists $_.FullName (Join-Path $quaterniusDir $_.Name)
  }
} else {
  Write-Host "SKIP missing Quaternius texture directory"
}

Write-Host ""
Write-Host "Done."
Write-Host "Next: run ``corepack pnpm dev`` and the game will load local assets from /public/assets/..."

