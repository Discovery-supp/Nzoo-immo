import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useReservations } from '../hooks/useReservations';

interface ReservationsDebugProps {
  language: 'fr' | 'en';
}

const ReservationsDebug: React.FC<ReservationsDebugProps> = ({ language }) => {
  const { user: userProfile, loading: authLoading } = useAuth();
  const { reservations, loading, error, refetch } = useReservations(
    userProfile ? { email: userProfile.email, role: userProfile.role } : undefined
  );

  const handleRefresh = async () => {
    console.log('🔄 Actualisation manuelle...');
    await refetch();
  };

  if (language === 'en') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">
          🔍 Debug Panel (Development)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-gray-700 mb-2">Authentication</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Loading:</span> {authLoading ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">User:</span> {userProfile ? 'Connected' : 'Not connected'}</p>
              <p><span className="font-medium">Email:</span> {userProfile?.email || 'None'}</p>
              <p><span className="font-medium">Role:</span> {userProfile?.role || 'None'}</p>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded border">
            <h4 className="font-semibold text-gray-700 mb-2">Reservations</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Loading:</span> {loading ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Count:</span> {reservations?.length || 0}</p>
              <p><span className="font-medium">Error:</span> {error ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Error Message:</span> {error || 'None'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        🔍 Panneau de Diagnostic (Développement)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-gray-700 mb-2">Authentification</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Chargement:</span> {authLoading ? 'Oui' : 'Non'}</p>
            <p><span className="font-medium">Utilisateur:</span> {userProfile ? 'Connecté' : 'Non connecté'}</p>
            <p><span className="font-medium">Email:</span> {userProfile?.email || 'Aucun'}</p>
            <p><span className="font-medium">Rôle:</span> {userProfile?.role || 'Aucun'}</p>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-semibold text-gray-700 mb-2">Réservations</h4>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Chargement:</span> {loading ? 'Oui' : 'Non'}</p>
            <p><span className="font-medium">Nombre:</span> {reservations?.length || 0}</p>
            <p><span className="font-medium">Erreur:</span> {error ? 'Oui' : 'Non'}</p>
            <p><span className="font-medium">Message d'erreur:</span> {error || 'Aucune'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Actualiser les Données
        </button>
      </div>
    </div>
  );
};

export default ReservationsDebug;
