// Utilitaire pour les notifications
export const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
  // Pour l'instant, on utilise console.log
  // Plus tard, on pourra intégrer avec un système de toast
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Optionnel : afficher une alerte simple
  if (type === 'error') {
    alert(`Erreur: ${message}`);
  }
};
