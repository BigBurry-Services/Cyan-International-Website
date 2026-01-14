$DataPath = "data.json"
$ProductsDir = "products"
$LogPath = "filter_log_ps.txt"

try {
    Write-Output "Starting filter process..." | Out-File $LogPath

    $jsonContent = Get-Content $DataPath -Raw
    $data = $jsonContent | ConvertFrom-Json

    # Get list of files in products directory
    $files = Get-ChildItem $ProductsDir | Select-Object -ExpandProperty Name
    # Create a hashset for faster lookup (case-insensitive by default in PS but good to be explicit/safe)
    $fileSet = @{}
    foreach ($f in $files) {
        $fileSet[$f.ToLower()] = $true
    }

    $initialCount = $data.products.Count
    $validProducts = @()

    foreach ($p in $data.products) {
        if ($p.image) {
            $imgName = Split-Path $p.image -Leaf
            if ($fileSet.ContainsKey($imgName.ToLower())) {
                $validProducts += $p
            } else {
                # Write-Output "Removing: $($p.name)" | Out-File $LogPath -Append
            }
        }
    }

    $data.products = $validProducts

    # Convert back to JSON and save
    $data | ConvertTo-Json -Depth 10 | Set-Content $DataPath -Encoding UTF8

    Write-Output "Initial count: $initialCount" | Out-File $LogPath -Append
    Write-Output "Final count: $($validProducts.Count)" | Out-File $LogPath -Append
    Write-Output "Success." | Out-File $LogPath -Append

} catch {
    Write-Output "Error: $_" | Out-File $LogPath -Append
}
