#!/bin/bash

# Script de nettoyage des fichiers de documentation redondants
# N'zoo Immo - Optimisation du projet

echo "🧹 Nettoyage des fichiers de documentation redondants..."

# Liste des fichiers de documentation à supprimer (redondants)
FILES_TO_DELETE=(
    "RESERVATION_CALCULATION_GUIDE.md"
    "EMAIL_SYSTEM_GUIDE.md"
    "INVOICE_GENERATION_GUIDE.md"
    "AUTO_RESERVATION_MANAGEMENT.md"
    "INVOICE_DATE_FIXES.md"
    "USER_PERMISSIONS_SYSTEM.md"
    "DELETE_SPACE_SYSTEM.md"
    "ADD_SPACE_SYSTEM.md"
    "SPACE_CONTENT_SYSTEM.md"
    "GUIDE_MODAL_REVENUS_V2.md"
    "GUIDE_MODAL_REVENUS.md"
    "GUIDE_UTILISATION_ESPACES_V2.md"
    "GUIDE_UTILISATION_ESPACES.md"
    "SPACE_MANAGEMENT_README.md"
    "SUPABASE_SETUP.md"
)

# Supprimer les fichiers
for file in "${FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        echo "❌ Suppression de $file"
        rm "$file"
    else
        echo "⚠️  Fichier $file non trouvé"
    fi
done

echo "✅ Nettoyage terminé !"
echo "📝 Documentation consolidée dans PROJECT_OPTIMIZATION_REPORT.md"
