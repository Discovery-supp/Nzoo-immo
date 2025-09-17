/**
 * Service pour récupérer toutes les réservations d'un client
 * Utilise le client_id pour lier les réservations au compte client
 */

import { supabase } from '../lib/supabase';
import { Reservation } from '../types';

export interface ClientReservationStats {
  totalReservations: number;
  totalSpent: number;
  lastReservationDate: string | null;
  reservationsByStatus: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

export class ClientReservationService {
  /**
   * Récupère toutes les réservations d'un client par son client_id
   * @param clientId - L'ID du compte client
   * @returns Promise<Reservation[]> - Liste des réservations
   */
  static async getReservationsByClientId(clientId: string): Promise<Reservation[]> {
    try {
      console.log('🔍 Récupération des réservations pour le client:', clientId);
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des réservations:', error);
        throw new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
      }

      if (!data) {
        console.log('⚠️ Aucune réservation trouvée pour le client:', clientId);
        return [];
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

      console.log(`✅ ${mappedReservations.length} réservations trouvées pour le client:`, clientId);
      return mappedReservations;

    } catch (error) {
      console.error('❌ Erreur dans getReservationsByClientId:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les réservations d'un client par son email
   * @param email - L'email du client
   * @returns Promise<Reservation[]> - Liste des réservations
   */
  static async getReservationsByEmail(email: string): Promise<Reservation[]> {
    try {
      console.log('🔍 Récupération des réservations pour l\'email:', email);
      
      // D'abord, récupérer le client_id de l'email
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single();

      if (clientError) {
        console.error('❌ Erreur lors de la récupération du client:', clientError);
        throw new Error(`Erreur lors de la récupération du client: ${clientError.message}`);
      }

      if (!clientData) {
        console.log('⚠️ Aucun compte client trouvé pour l\'email:', email);
        return [];
      }

      // Ensuite, récupérer toutes les réservations de ce client
      return await this.getReservationsByClientId(clientData.id);

    } catch (error) {
      console.error('❌ Erreur dans getReservationsByEmail:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des réservations d'un client
   * @param clientId - L'ID du compte client
   * @returns Promise<ClientReservationStats> - Statistiques des réservations
   */
  static async getClientReservationStats(clientId: string): Promise<ClientReservationStats> {
    try {
      const reservations = await this.getReservationsByClientId(clientId);
      
      const totalSpent = reservations.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const lastReservationDate = reservations.length > 0 ? reservations[0].created_at : null;
      
      const reservationsByStatus = {
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        completed: reservations.filter(r => r.status === 'completed').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length
      };

      return {
        totalReservations: reservations.length,
        totalSpent,
        lastReservationDate,
        reservationsByStatus
      };

    } catch (error) {
      console.error('❌ Erreur dans getClientReservationStats:', error);
      throw error;
    }
  }

  /**
   * Récupère les réservations d'un client avec pagination
   * @param clientId - L'ID du compte client
   * @param page - Numéro de page (commence à 1)
   * @param limit - Nombre d'éléments par page
   * @returns Promise<{reservations: Reservation[], total: number, page: number, totalPages: number}>
   */
  static async getReservationsByClientIdPaginated(
    clientId: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<{
    reservations: Reservation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      
      // Récupérer le total
      const { count, error: countError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId);

      if (countError) {
        console.error('❌ Erreur lors du comptage des réservations:', countError);
        throw new Error(`Erreur lors du comptage des réservations: ${countError.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      // Récupérer les réservations de la page
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Erreur lors de la récupération des réservations:', error);
        throw new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
      }

      // Mapper les données
      const mappedReservations = (data || []).map(item => ({
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

      return {
        reservations: mappedReservations,
        total,
        page,
        totalPages
      };

    } catch (error) {
      console.error('❌ Erreur dans getReservationsByClientIdPaginated:', error);
      throw error;
    }
  }
}
