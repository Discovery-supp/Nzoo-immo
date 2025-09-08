import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Reservation } from '../types';

export const useReservations = (filterByUser?: { email: string; role: string }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des réservations...');
      
      // Construire la requête
      let query = supabase.from('reservations').select('*');
      
      // Appliquer le filtre si nécessaire
      if (filterByUser && filterByUser.role === 'clients' && filterByUser.email) {
        console.log('🔒 Filtrage pour client par client_id:', filterByUser.email);
        // D'abord, récupérer le client_id de l'utilisateur
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('email', filterByUser.email)
          .single();
        
        if (clientError) {
          console.error('❌ Erreur récupération client:', clientError);
          setError('Erreur lors de la récupération du compte client');
          setReservations([]);
          return;
        }
        
        if (clientData) {
          // Filtrer par client_id au lieu de l'email
          query = query.eq('client_id', clientData.id);
          console.log('🔒 Filtrage par client_id:', clientData.id);
        } else {
          console.log('⚠️ Aucun compte client trouvé pour:', filterByUser.email);
          setReservations([]);
          return;
        }
      } else {
        console.log('📋 Chargement de toutes les réservations');
      }
      
      // Exécuter la requête
      const { data, error: queryError } = await query.order('created_at', { ascending: false });
      
      if (queryError) {
        console.error('❌ Erreur de requête:', queryError);
        setError(queryError.message);
        setReservations([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ Aucune réservation trouvée');
        setReservations([]);
        if (filterByUser?.role === 'clients') {
          console.log('🔒 Client sans réservations:', filterByUser.email);
          setError(null); // Pas d'erreur, juste aucune réservation
        }
        return;
      }
      
      // Mapper les données
      const mappedReservations = data.map(item => ({
        id: item.id,
        full_name: item.full_name || '',
        email: item.email || '',
        phone: item.phone || '',
        company: item.company || '',
        activity: item.activity || '',
        address: item.address || '',
        space_type: item.space_type || 'coworking',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        occupants: item.occupants || 1,
        subscription_type: item.subscription_type || 'daily',
        amount: item.amount || 0,
        payment_method: item.payment_method || 'cash',
        transaction_id: item.transaction_id || '',
        status: item.status || 'pending',
        notes: item.notes || '',
        admin_notes: item.admin_notes || '',
        client_id: item.client_id || null,
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
      
      console.log(`✅ ${mappedReservations.length} réservations chargées`);
      setReservations(mappedReservations);
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement:', err);
      setError('Erreur lors du chargement des réservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Recharger les réservations
      await fetchReservations();
    } catch (err) {
      console.error('❌ Erreur mise à jour statut:', err);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  };

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      console.log('🔄 Mise à jour complète de la réservation:', { id, updates });
      
      const { data, error } = await supabase
        .from('reservations')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur mise à jour réservation:', error);
        throw error;
      }
      
      console.log('✅ Réservation mise à jour avec succès:', data);
      
      // Recharger les réservations
      await fetchReservations();
      
      return data;
    } catch (err) {
      console.error('❌ Erreur mise à jour réservation:', err);
      throw new Error('Erreur lors de la mise à jour de la réservation');
    }
  };

  const deleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Recharger les réservations
      await fetchReservations();
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      throw new Error('Erreur lors de la suppression');
    }
  };

  // Charger les réservations au montage et quand les filtres changent
  useEffect(() => {
    fetchReservations();
  }, [filterByUser?.email, filterByUser?.role]);

  return {
    reservations,
    loading,
    error,
    refetch: fetchReservations,
    updateReservationStatus,
    updateReservation,
    deleteReservation
  };
};