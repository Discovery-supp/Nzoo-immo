import { supabase } from './supabaseClient';

export interface ClientAccount {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  activity?: string;
  address?: string;
  total_reservations: number;
  total_spent: number;
  last_reservation_date?: string;
  account_status: 'active' | 'suspended' | 'inactive';
  account_type: 'standard' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface ClientReservation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  activity?: string;
  address?: string;
  space_type: string;
  start_date: string;
  end_date: string;
  occupants: number;
  subscription_type: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  client_id?: string;
}

export interface ClientStats {
  total_reservations: number;
  total_spent: number;
  confirmed_reservations: number;
  pending_reservations: number;
  cancelled_reservations: number;
  last_reservation_date?: string;
  average_amount: number;
}

// Service pour la gestion des comptes clients
export class ClientAccountService {
  
  // Récupérer un compte client par email
  static async getClientByEmail(email: string): Promise<ClientAccount | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Client non trouvé
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      return null;
    }
  }

  // Récupérer un compte client par ID
  static async getClientById(clientId: string): Promise<ClientAccount | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Client non trouvé
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      return null;
    }
  }

  // Récupérer toutes les réservations d'un client
  static async getClientReservations(clientId: string): Promise<ClientReservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations client:', error);
      return [];
    }
  }

  // Récupérer les réservations d'un client par email (même si client_id n'est pas défini)
  static async getClientReservationsByEmail(email: string): Promise<ClientReservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations par email:', error);
      return [];
    }
  }

  // Récupérer les statistiques d'un client
  static async getClientStats(clientId: string): Promise<ClientStats | null> {
    try {
      const { data, error } = await supabase
        .from('client_reservations_summary')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Client non trouvé
        }
        throw error;
      }

      return {
        total_reservations: data.total_reservations || 0,
        total_spent: data.total_spent || 0,
        confirmed_reservations: data.confirmed_reservations || 0,
        pending_reservations: data.pending_reservations || 0,
        cancelled_reservations: data.cancelled_reservations || 0,
        last_reservation_date: data.last_reservation_date,
        average_amount: data.total_spent > 0 && data.total_reservations > 0 
          ? data.total_spent / data.total_reservations 
          : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques client:', error);
      return null;
    }
  }

  // Mettre à jour les informations d'un client
  static async updateClientInfo(
    clientId: string, 
    updates: Partial<Omit<ClientAccount, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      return false;
    }
  }

  // Lier des réservations existantes à un compte client
  static async linkReservationsToClient(
    clientId: string, 
    reservationIds: string[]
  ): Promise<boolean> {
    try {
      for (const reservationId of reservationIds) {
        const { error } = await supabase.rpc('link_reservation_to_client', {
          reservation_uuid: reservationId,
          client_uuid: clientId
        });

        if (error) {
          console.warn(`Erreur lors de la liaison de la réservation ${reservationId}:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la liaison des réservations:', error);
      return false;
    }
  }

  // Rechercher des clients par nom, email ou entreprise
  static async searchClients(searchTerm: string): Promise<ClientAccount[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('full_name', { ascending: true })
        .limit(50);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche de clients:', error);
      return [];
    }
  }

  // Récupérer tous les clients avec leurs statistiques
  static async getAllClientsWithStats(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('client_reservations_summary')
        .select('*')
        .order('total_reservations', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des clients avec stats:', error);
      return [];
    }
  }

  // Créer un nouveau compte client
  static async createClient(clientData: Omit<ClientAccount, 'id' | 'created_at' | 'updated_at' | 'total_reservations' | 'total_spent'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          total_reservations: 0,
          total_spent: 0
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      return null;
    }
  }

  // Désactiver un compte client
  static async deactivateClient(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          is_active: false,
          account_status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation du client:', error);
      return false;
    }
  }

  // Réactiver un compte client
  static async reactivateClient(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          is_active: true,
          account_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la réactivation du client:', error);
      return false;
    }
  }
}
