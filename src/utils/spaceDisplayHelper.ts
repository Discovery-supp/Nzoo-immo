/**
 * Utilitaire pour gérer l'affichage des espaces selon l'offre
 * Permet de personnaliser l'affichage des espaces dans les emails selon le type d'activité
 */

/**
 * Fonction pour détecter l'offre "Bienvenu à Kin" et retourner le texte approprié pour l'espace
 * @param reservation - L'objet réservation contenant les informations
 * @returns Le texte à afficher pour l'espace
 */
export const getSpaceDisplayText = (reservation: any): string => {
  // Vérifier si c'est l'offre "Bienvenu à Kin"
  if (reservation.activity && 
      reservation.activity.toLowerCase().includes('bienvenu') && 
      reservation.activity.toLowerCase().includes('kin')) {
    return 'Accompagnement des Jeunes Entrepreunariat';
  }
  
  // Pour les autres cas, retourner le type d'espace normal
  return reservation.space_type || 'Espace non spécifié';
};

/**
 * Fonction pour détecter si une réservation correspond à l'offre "Bienvenu à Kin"
 * @param reservation - L'objet réservation
 * @returns true si c'est l'offre "Bienvenu à Kin", false sinon
 */
export const isBienvenuAKinOffer = (reservation: any): boolean => {
  return reservation.activity && 
         reservation.activity.toLowerCase().includes('bienvenu') && 
         reservation.activity.toLowerCase().includes('kin');
};

/**
 * Fonction pour obtenir le texte d'espace formaté selon l'offre
 * @param reservation - L'objet réservation
 * @param defaultText - Texte par défaut si aucun espace n'est spécifié
 * @returns Le texte formaté pour l'affichage
 */
export const getFormattedSpaceText = (reservation: any, defaultText: string = 'Espace non spécifié'): string => {
  if (isBienvenuAKinOffer(reservation)) {
    return 'Accompagnement des Jeunes Entrepreunariat';
  }
  
  return reservation.space_type || defaultText;
};
