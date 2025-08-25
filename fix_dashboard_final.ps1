# Script final pour corriger les caractères spéciaux dans AdminDashboard.tsx

$content = Get-Content "src/pages/AdminDashboard.tsx" -Raw -Encoding UTF8

# Remplacements des caractères spéciaux
$content = $content -replace "Ã©", "é"
$content = $content -replace "Ã ", "à"
$content = $content -replace "Ã¨", "è"
$content = $content -replace "Ã§", "ç"
$content = $content -replace "Ã¹", "ù"
$content = $content -replace "ÃŠ", "Ê"
$content = $content -replace "Ã‰", "É"
$content = $content -replace "Ã ", "À"
$content = $content -replace "Ã¨", "È"
$content = $content -replace "Ã§", "Ç"
$content = $content -replace "Ã¹", "Ù"

# Remplacements des emojis mal encodés
$content = $content -replace "ðŸ"", "🔍"
$content = $content -replace "ðŸš¨", "🚨"
$content = $content -replace "âœ…", "✅"
$content = $content -replace "ðŸ—'ï¸", "🗑️"
$content = $content -replace "ðŸ"", "📝"
$content = $content -replace "ðŸš«", "🔄"
$content = $content -replace "âŒ", "❌"
$content = $content -replace "ðŸ'¤", "👤"

# Sauvegarder
Set-Content "src/pages/AdminDashboard.tsx" -Value $content -Encoding UTF8

Write-Host "✅ Caractères spéciaux corrigés dans AdminDashboard.tsx" -ForegroundColor Green
