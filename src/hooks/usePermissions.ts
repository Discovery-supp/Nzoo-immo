import { useAuth } from './useAuth';

export interface Permission {
  id: string;
  name: string;
  description: string;
  requiredRole: 'admin' | 'user' | 'both';
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();

  // Définition des permissions
  const permissions: Permission[] = [
    {
      id: 'view_users',
      name: 'Voir les utilisateurs',
      description: 'Accéder à la gestion des utilisateurs',
      requiredRole: 'admin'
    },
    {
      id: 'manage_users',
      name: 'Gérer les utilisateurs',
      description: 'Créer, modifier et supprimer des utilisateurs',
      requiredRole: 'admin'
    },
    {
      id: 'view_spaces',
      name: 'Voir les espaces',
      description: 'Accéder à la gestion des espaces',
      requiredRole: 'both'
    },
    {
      id: 'manage_spaces',
      name: 'Gérer les espaces',
      description: 'Créer, modifier et supprimer des espaces',
      requiredRole: 'both'
    },
    {
      id: 'view_reservations',
      name: 'Voir les réservations',
      description: 'Accéder aux réservations',
      requiredRole: 'both'
    },
    {
      id: 'manage_reservations',
      name: 'Gérer les réservations',
      description: 'Créer, modifier et supprimer des réservations',
      requiredRole: 'both'
    },
    {
      id: 'view_revenue',
      name: 'Voir les revenus',
      description: 'Accéder aux statistiques de revenus',
      requiredRole: 'both'
    },
    {
      id: 'view_statistics',
      name: 'Voir les statistiques',
      description: 'Accéder aux statistiques générales',
      requiredRole: 'both'
    }
  ];

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permissionId: string): boolean => {
    const permission = permissions.find(p => p.id === permissionId);
    if (!permission) return false;

    if (permission.requiredRole === 'both') return true;
    if (permission.requiredRole === 'admin' && isAdmin()) return true;
    if (permission.requiredRole === 'user' && !isAdmin()) return true;

    return false;
  };

  // Vérifier si l'utilisateur a plusieurs permissions
  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(id => hasPermission(id));
  };

  // Vérifier si l'utilisateur a toutes les permissions
  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(id => hasPermission(id));
  };

  // Obtenir toutes les permissions de l'utilisateur
  const getUserPermissions = (): Permission[] => {
    return permissions.filter(permission => hasPermission(permission.id));
  };

  // Obtenir les permissions manquantes pour une action
  const getMissingPermissions = (permissionIds: string[]): Permission[] => {
    return permissions.filter(permission => 
      permissionIds.includes(permission.id) && !hasPermission(permission.id)
    );
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    getMissingPermissions,
    permissions,
    isAdmin,
    user
  };
};
