import { supabase } from '../lib/supabaseClient';

export interface MobileMoneyPayment {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  phone_number: string;
  operator: 'ORANGE' | 'AIRTEL' | 'MPESA';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  reservation_id: string;
  client_email: string;
  created_at: string;
  updated_at: string;
  payment_url?: string;
  error_message?: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  phone_number: string;
  operator: 'ORANGE' | 'AIRTEL' | 'MPESE';
  reservation_id: string;
  client_email: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  payment_url?: string;
  transaction_id?: string;
  error?: string;
}

class MobileMoneyService {
  private readonly API_KEY = process.env.REACT_APP_CINETPAY_API_KEY || '';
  private readonly SITE_ID = process.env.REACT_APP_CINETPAY_SITE_ID || '';
  private readonly ENVIRONMENT = process.env.REACT_APP_CINETPAY_ENVIRONMENT || 'TEST';

  /**
   * Initialiser un paiement mobile money
   */
  async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🚀 Initialisation du paiement mobile money:', paymentRequest);

      // Créer l'enregistrement de paiement dans la base de données
      const { data: paymentRecord, error: dbError } = await supabase
        .from('mobile_money_payments')
        .insert({
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          phone_number: paymentRequest.phone_number,
          operator: paymentRequest.operator,
          status: 'PENDING',
          reservation_id: paymentRequest.reservation_id,
          client_email: paymentRequest.client_email,
          description: paymentRequest.description
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erreur lors de la création du paiement:', dbError);
        return { success: false, error: 'Erreur de base de données' };
      }

      // Générer l'URL de paiement CinetPay
      const paymentUrl = await this.generateCinetPayUrl(paymentRequest, paymentRecord.id);

      if (!paymentUrl) {
        // Mettre à jour le statut en cas d'échec
        await this.updatePaymentStatus(paymentRecord.id, 'FAILED', 'Échec de génération de l\'URL');
        return { success: false, error: 'Impossible de générer l\'URL de paiement' };
      }

      // Mettre à jour avec l'URL de paiement
      await this.updatePaymentUrl(paymentRecord.id, paymentUrl);

      console.log('✅ Paiement initialisé avec succès:', paymentRecord.id);
      return {
        success: true,
        payment_url: paymentUrl,
        transaction_id: paymentRecord.id
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du paiement:', error);
      return { success: false, error: 'Erreur interne du serveur' };
    }
  }

  /**
   * Générer l'URL de paiement CinetPay
   */
  private async generateCinetPayUrl(paymentRequest: PaymentRequest, paymentId: string): Promise<string | null> {
    try {
      const cinetpayData = {
        apikey: this.API_KEY,
        site_id: this.SITE_ID,
        transaction_id: paymentId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        description: paymentRequest.description,
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payment/webhook`,
        channels: 'MOBILE_MONEY',
        lang: 'fr',
        customer_name: paymentRequest.client_email.split('@')[0],
        customer_email: paymentRequest.client_email,
        customer_phone_number: paymentRequest.phone_number,
        customer_address: 'Kinshasa, RDC',
        customer_city: 'Kinshasa',
        customer_country: 'CD',
        customer_zip_code: '00000'
      };

      console.log('🔗 Données CinetPay:', cinetpayData);

      // En mode développement, simuler l'URL de paiement
      if (this.ENVIRONMENT === 'TEST') {
        return `${window.location.origin}/payment/simulate/${paymentId}`;
      }

      // En production, utiliser l'API CinetPay réelle
      const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cinetpayData)
      });

      if (!response.ok) {
        throw new Error(`Erreur CinetPay: ${response.status}`);
      }

      const result = await response.json();
      return result.data.payment_url;

    } catch (error) {
      console.error('❌ Erreur lors de la génération de l\'URL CinetPay:', error);
      return null;
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(paymentId: string): Promise<MobileMoneyPayment | null> {
    try {
      const { data, error } = await supabase
        .from('mobile_money_payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la vérification du statut:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le statut d'un paiement
   */
  async updatePaymentStatus(paymentId: string, status: string, message?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mobile_money_payments')
        .update({
          status,
          error_message: message,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du statut:', error);
        return false;
      }

      console.log('✅ Statut du paiement mis à jour:', paymentId, status);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      return false;
    }
  }

  /**
   * Mettre à jour l'URL de paiement
   */
  private async updatePaymentUrl(paymentId: string, paymentUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mobile_money_payments')
        .update({
          payment_url: paymentUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'URL:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'URL:', error);
      return false;
    }
  }

  /**
   * Obtenir l'historique des paiements d'un client
   */
  async getClientPaymentHistory(clientEmail: string): Promise<MobileMoneyPayment[]> {
    try {
      const { data, error } = await supabase
        .from('mobile_money_payments')
        .select('*')
        .eq('client_email', clientEmail)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération de l\'historique:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  /**
   * Obtenir les statistiques des paiements
   */
  async getPaymentStats(): Promise<{
    total: number;
    pending: number;
    success: number;
    failed: number;
    totalAmount: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('mobile_money_payments')
        .select('status, amount');

      if (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        return { total: 0, pending: 0, success: 0, failed: 0, totalAmount: 0 };
      }

      const stats = {
        total: data.length,
        pending: data.filter(p => p.status === 'PENDING').length,
        success: data.filter(p => p.status === 'SUCCESS').length,
        failed: data.filter(p => p.status === 'FAILED').length,
        totalAmount: data
          .filter(p => p.status === 'SUCCESS')
          .reduce((sum, p) => sum + (p.amount || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      return { total: 0, pending: 0, success: 0, failed: 0, totalAmount: 0 };
    }
  }

  /**
   * Traiter un webhook de paiement
   */
  async processWebhook(webhookData: any): Promise<boolean> {
    try {
      console.log('🔔 Webhook reçu:', webhookData);

      const { transaction_id, status, message } = webhookData;

      // Mettre à jour le statut du paiement
      const success = await this.updatePaymentStatus(transaction_id, status, message);

      if (success && status === 'SUCCESS') {
        // Mettre à jour le statut de la réservation
        await this.updateReservationStatus(transaction_id);
      }

      return success;
    } catch (error) {
      console.error('❌ Erreur lors du traitement du webhook:', error);
      return false;
    }
  }

  /**
   * Mettre à jour le statut de la réservation après paiement réussi
   */
  private async updateReservationStatus(paymentId: string): Promise<boolean> {
    try {
      // Récupérer le paiement pour obtenir l'ID de réservation
      const payment = await this.checkPaymentStatus(paymentId);
      if (!payment) return false;

      // Mettre à jour le statut de la réservation
      const { error } = await supabase
        .from('reservations')
        .update({
          payment_status: 'PAID',
          payment_method: 'MOBILE_MONEY',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.reservation_id);

      if (error) {
        console.error('❌ Erreur lors de la mise à jour de la réservation:', error);
        return false;
      }

      console.log('✅ Statut de la réservation mis à jour:', payment.reservation_id);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la réservation:', error);
      return false;
    }
  }
}

export const mobileMoneyService = new MobileMoneyService();
export default mobileMoneyService;









