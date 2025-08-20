import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Reservation } from '../types';
import { logger } from '../utils/logger';

export const useReservations = (filterByUser?: { email: string; role: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.database('Fetching reservations from Supabase...');
      
      // Test de connexion à Supabase
      const { data: testConnection, error: connectionError } = await supabase
        .from('reservations')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        logger.error('Connection error:', { error: connectionError.message });
        
        // Check if it's a connection error due to missing environment variables
        if (connectionError.message.includes('Invalid API key') || connectionError.message.includes('fetch')) {
          throw new Error('Connexion Supabase non configurée. Veuillez cliquer sur "Connect to Supabase" en haut à droite.');
        }
        
        throw new Error(`Erreur de connexion: ${connectionError.message}`);
      }
      
      logger.database('Supabase connection successful');
      
      // Récupérer les réservations selon le filtre utilisateur
      let query = supabase
        .from('reservations')
        .select('*');
      
      logger.debug('useReservations - Filtre utilisateur:', filterByUser);
      
      // Si c'est un client, filtrer seulement ses réservations
      if (filterByUser && filterByUser.role === 'clients') {
        logger.debug('useReservations - Filtrage pour client:', { email: filterByUser.email });
        console.log('📋 Filtrage des réservations pour client:', filterByUser.email);
        query = query.eq('email', filterByUser.email);
      } else if (filterByUser) {
        console.log('📋 Chargement de toutes les réservations pour:', filterByUser.role);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      logger.debug('useReservations - Résultats:', {
        count: data?.length || 0,
        error: error?.message,
        filterApplied: filterByUser?.role === 'clients'
      });

      if (error) throw error;
      
      logger.database('Raw data from Supabase:', { count: data?.length || 0 });
      logger.debug('Sample data:', data?.[0]);
      
      // Vérifier si on a des données
      if (!data || data.length === 0) {
        logger.warn('No reservations found in database');
        setReservations([]);
        return;
      }
      
      // Mapper les données avec gestion flexible des noms de colonnes
      const mappedData = (data || []).map(item => {
        logger.debug('Mapping item:', { id: item.id });
        return {
          id: item.id,
          full_name: item.full_name || item.fullname || '',
          email: item.email || '',
          phone: item.phone || '',
          company: item.company || '',
          activity: item.activity || '',
          space_type: item.space_type || item.spacetype || 'coworking',
          start_date: item.start_date || item.startdate || new Date().toISOString().split('T')[0],
          end_date: item.end_date || item.enddate || new Date().toISOString().split('T')[0],
          occupants: item.occupants || 1,
          amount: item.amount || 0,
          payment_method: item.payment_method || item.paymentmethod || 'cash',
          status: item.status || 'pending',
          notes: item.notes || '',
          admin_notes: item.admin_notes || '',
          created_at: item.created_at || item.createdat || new Date().toISOString(),
          updated_at: item.updated_at || item.updatedat || new Date().toISOString()
        };
      });
      
      logger.database('Mapped reservations:', { count: mappedData.length });
      setReservations(mappedData);
    } catch (err) {
      console.error('❌ Error fetching reservations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des réservations';
      setError(errorMessage);
      
      // En cas d'erreur, essayer de diagnostiquer
              logger.debug('Diagnostic: Checking Supabase configuration...');
        logger.debug('Supabase URL:', { set: !!import.meta.env.VITE_SUPABASE_URL });
        logger.debug('Supabase Key:', { set: !!import.meta.env.VITE_SUPABASE_ANON_KEY });
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
      logger.reservation('Updating reservation status:', { id, status });
      
      // Use RPC function for status updates
      const { data, error } = await supabase.rpc('update_reservation_admin', {
        reservation_id: id,
        reservation_data: { status }
      });

      if (error) throw error;
      
              logger.reservation('Status updated successfully', { id, status });
      // Refresh reservations
      await fetchReservations();
    } catch (err) {
      console.error('❌ Error updating status:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut');
    }
  };

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      logger.reservation('Updating reservation:', { id, updates });
      
      // Use RPC function for updates with elevated privileges
      const { data, error } = await supabase.rpc('update_reservation_admin', {
        reservation_id: id,
        reservation_data: updates
      });

      if (error) throw error;
      
              logger.reservation('Reservation updated successfully', { id });
      // Refresh reservations
      await fetchReservations();
    } catch (err) {
      console.error('❌ Error updating reservation:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la réservation');
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      logger.reservation('Deleting reservation:', { id });
      
      // Use RPC function for deletion with elevated privileges
      const { data, error } = await supabase.rpc('delete_reservation_admin', {
        reservation_id: id
      });

      if (error) throw error;
      
              logger.reservation('Reservation deleted successfully', { id });
      // Refresh reservations
      await fetchReservations();
    } catch (err) {
      console.error('❌ Error deleting reservation:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression de la réservation');
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    updateReservationStatus,
    updateReservation,
    deleteReservation,
    refetch: fetchReservations
  };
};