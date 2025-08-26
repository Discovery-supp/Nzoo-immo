# Dossier des images d'espaces

Ce dossier contient les images uploadées pour les espaces.

## Structure
- Les images sont nommées avec un timestamp unique
- Format: `space-{timestamp}-{randomId}.{extension}`
- Extensions supportées: jpg, jpeg, png, gif, webp

## Exemple
```
space-1703123456789-abc123.jpg
space-1703123456790-def456.png
```

## Notes
- Les images sont automatiquement uploadées depuis le dashboard admin
- Les URLs sont accessibles via: `/images/spaces/{filename}`
- Taille maximum: 5MB par image
