# Script pour supprimer tous les effets animate-spin du projet
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts" | Where-Object { (Get-Content $_.FullName) -match "animate-spin" }

foreach ($file in $files) {
    Write-Host "Traitement de $($file.Name)..."
    
    # Lire le contenu du fichier
    $content = Get-Content $file.FullName -Raw
    
    # Remplacer animate-spin par une chaîne vide dans les classes
    $content = $content -replace 'animate-spin\s+', ''
    $content = $content -replace '\s+animate-spin', ''
    $content = $content -replace 'animate-spin', ''
    
    # Écrire le contenu modifié
    Set-Content $file.FullName $content -Encoding UTF8
    
    Write-Host "Effets de rotation supprimés de $($file.Name)"
}

Write-Host "Traitement terminé !"
