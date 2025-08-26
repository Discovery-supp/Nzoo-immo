# Script pour corriger les caractères spéciaux dans AdminDashboard.tsx

$filePath = "src/pages/AdminDashboard.tsx"

if (Test-Path $filePath) {
    Write-Host "Traitement de AdminDashboard.tsx..." -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    $originalContent = $content
    
    # Remplacements spécifiques pour AdminDashboard.tsx
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
        "ðŸ"" = "🔍"
        "ðŸš¨" = "🚨"
        "âœ…" = "✅"
        "ðŸ—'ï¸" = "🗑️"
        "ðŸ"" = "📝"
        "ðŸš«" = "🔄"
        "âŒ" = "❌"
        "ðŸ"" = "📊"
        "ðŸ"" = "📈"
        "ðŸ"" = "📋"
        "ðŸ"" = "📄"
        "ðŸ"" = "📱"
        "ðŸ"" = "💻"
        "ðŸ"" = "🏢"
        "ðŸ"" = "💰"
        "ðŸ"" = "📅"
        "ðŸ"" = "⏰"
        "ðŸ"" = "🎯"
        "ðŸ"" = "🔧"
        "ðŸ"" = "📊"
        "ðŸ"" = "📈"
        "ðŸ"" = "📋"
        "ðŸ"" = "📄"
        "ðŸ"" = "📱"
        "ðŸ"" = "💻"
        "ðŸ"" = "🏢"
        "ðŸ"" = "💰"
        "ðŸ"" = "📅"
        "ðŸ"" = "⏰"
        "ðŸ"" = "🎯"
        "ðŸ"" = "🔧"
    }
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace $old, $new
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  ✅ Caractères spéciaux corrigés dans AdminDashboard.tsx" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Aucun changement nécessaire dans AdminDashboard.tsx" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ Fichier AdminDashboard.tsx non trouvé" -ForegroundColor Red
}

Write-Host "`n🎉 Correction terminée !" -ForegroundColor Green
