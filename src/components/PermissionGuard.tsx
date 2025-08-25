import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  permissionId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissionId,
  children,
  fallback,
  showAccessDenied = true
}) => {
  const { hasPermission, userProfile } = usePermissions();

  if (hasPermission(permissionId)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <div className="flex items-center justify-center p-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Accès Refusé
        </h3>
        <p className="text-red-600 mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </p>
        <div className="bg-white/50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Permission requise : <strong>{permissionId}</strong>
            </span>
          </div>
          {userProfile && (
            <div className="mt-2 text-xs text-red-600">
              Rôle actuel : <strong>{userProfile.role}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionGuard;
