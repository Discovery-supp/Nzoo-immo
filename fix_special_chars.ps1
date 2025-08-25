# Script pour corriger les caractères spéciaux mal encodés
# Ce script remplace les caractères UTF-8 mal encodés par leurs équivalents corrects

$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | Where-Object { $_.Name -notlike "*node_modules*" }

$replacements = @{
    "Ã©" = "é"
    "Ã " = "à"
    "Ã¨" = "è"
    "Ã " = "à"
    "Ã§" = "ç"
    "Ã¹" = "ù"
    "Ã " = "à"
    "ÃŠ" = "Ê"
    "Ã‰" = "É"
    "Ã " = "À"
    "Ã¨" = "È"
    "Ã " = "À"
    "Ã§" = "Ç"
    "Ã¹" = "Ù"
    "Ã " = "À"
    "Ã©" = "é"
    "Ã " = "à"
    "Ã¨" = "è"
    "Ã " = "à"
    "Ã§" = "ç"
    "Ã¹" = "ù"
    "Ã " = "à"
    "ÃŠ" = "Ê"
    "Ã‰" = "É"
    "Ã " = "À"
    "Ã¨" = "È"
    "Ã " = "À"
    "Ã§" = "Ç"
    "Ã¹" = "Ù"
    "Ã " = "À"
}

foreach ($file in $files) {
    Write-Host "Traitement de $($file.Name)..."
    
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    $originalContent = $content
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace $old, $new
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "  ✅ Caractères spéciaux corrigés dans $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Aucun changement nécessaire dans $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Correction des caractères spéciaux terminée !" -ForegroundColor Green
