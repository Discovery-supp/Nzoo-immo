// Service CinetPay pour les paiements par mobile money en République du Congo
// Intégration avec Orange Money et Airtel Money

export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  environment: 'PROD' | 'TEST';
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  channel: string;
  lang: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  message?: string;
}

// Configuration des méthodes de paiement
export const CONGO_PAYMENT_METHODS = {
  ORANGE_MONEY: {
    name: 'Orange Money',
    code: 'MOBILE_MONEY',
    color: 'orange',
    channel: 'ORANGE',
    description: 'Paiement via Orange Money',
    icon: '📱',
    popular: true
  },
  AIRTEL_MONEY: {
    name: 'Airtel Money',
    code: 'MOBILE_MONEY',
    color: 'red',
    channel: 'AIRTEL',
    description: 'Paiement via Airtel Money',
    icon: '📱',
    popular: true
  },
  VISA: {
    name: 'Carte VISA',
    code: 'CARD',
    color: 'blue',
    channel: 'VISA',
    description: 'Carte Visa internationale',
    icon: '💳',
    popular: false
  },
  MASTERCARD: {
    name: 'Carte Mastercard',
    code: 'CARD',
    color: 'green',
    channel: 'MASTERCARD',
    description: 'Carte Mastercard internationale',
    icon: '💳',
    popular: false
  }
};

// Configuration par défaut (à remplacer par vos vraies clés)
const DEFAULT_CONFIG: CinetPayConfig = {
  apiKey: process.env.REACT_APP_CINETPAY_API_KEY || '17852597076873f647d76131.41366104',
  siteId: process.env.REACT_APP_CINETPAY_SITE_ID || '105901836',
  environment: (process.env.REACT_APP_CINETPAY_ENVIRONMENT as 'PROD' | 'TEST') || 'TEST',
  currency: 'CDF',
  returnUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancel`,
  notifyUrl: `${window.location.origin}/api/payment/notify`
};

class CinetPayService {
  private config: CinetPayConfig;

  constructor(config?: Partial<CinetPayConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialiser un paiement
   */
  async initiatePayment(
    amount: number,
    description: string,
    clientId: string,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    channel: string
  ): Promise<PaymentResponse> {
    try {
      console.log('🚀 Initialisation du paiement CinetPay:', {
        amount,
        description,
        clientId,
        channel,
        environment: this.config.environment
      });

      // Vérifier la configuration
      if (!this.config.apiKey || this.config.apiKey === 'your_cinetpay_api_key') {
        throw new Error('Configuration CinetPay manquante. Veuillez configurer vos clés API.');
      }

      // Préparer les données de paiement
      const paymentData: PaymentRequest = {
        amount: Math.round(amount), // Montant en centimes
        currency: this.config.currency,
        description,
        returnUrl: this.config.returnUrl,
        cancelUrl: this.config.cancelUrl,
        notifyUrl: this.config.notifyUrl,
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        channel,
        lang: 'FR'
      };

      // URL de l'API CinetPay
      const apiUrl = this.config.environment === 'PROD' 
        ? 'https://api-checkout.cinetpay.com/v2/payment'
        : 'https://api-checkout.cinetpay.com/v2/payment';

             // Appel à l'API CinetPay
       const response = await fetch(apiUrl, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${this.config.apiKey}`
         },
         body: JSON.stringify({
           apikey: this.config.apiKey,
           site_id: this.config.siteId,
           transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
           amount: paymentData.amount,
           currency: paymentData.currency,
           description: paymentData.description,
           return_url: paymentData.returnUrl,
           cancel_url: paymentData.cancelUrl,
           notify_url: paymentData.notifyUrl,
           client_id: paymentData.clientId,
           client_name: paymentData.clientName,
           client_email: paymentData.clientEmail,
           client_phone: paymentData.clientPhone,
           channel: paymentData.channel,
           lang: paymentData.lang,
           // Champs supplémentaires requis par CinetPay
           metadata: {
             order_id: `ORDER_${Date.now()}`,
             customer_id: paymentData.clientId
           },
           // Informations sur le produit
           items: [
             {
               name: paymentData.description,
               quantity: 1,
               unit_price: paymentData.amount,
               total_price: paymentData.amount
             }
           ]
         })
       });

      const result = await response.json();

      console.log('📡 Réponse CinetPay:', result);

      if (result.code === '201') {
        return {
          success: true,
          paymentUrl: result.data.payment_url,
          transactionId: result.data.transaction_id,
          message: 'Paiement initialisé avec succès'
        };
      } else {
        throw new Error(result.message || 'Erreur lors de l\'initialisation du paiement');
      }

    } catch (error) {
      console.error('❌ Erreur CinetPay:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        message: 'Échec de l\'initialisation du paiement'
      };
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(transactionId: string): Promise<any> {
    try {
      console.log('🔍 Vérification du statut du paiement:', transactionId);

      const response = await fetch('https://api-checkout.cinetpay.com/v2/payment/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          apikey: this.config.apiKey,
          site_id: this.config.siteId,
          transaction_id: transactionId
        })
      });

      const result = await response.json();
      console.log('📡 Statut du paiement:', result);

      return result;

    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error);
      throw error;
    }
  }

  /**
   * Simuler un paiement (pour les tests)
   */
  async simulatePayment(
    amount: number,
    description: string,
    clientId: string,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    channel: string
  ): Promise<PaymentResponse> {
    console.log('🧪 Simulation de paiement CinetPay:', {
      amount,
      description,
      clientId,
      channel
    });

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simuler une réponse réussie
    const transactionId = `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      paymentUrl: `https://simulation.cinetpay.com/payment/${transactionId}`,
      transactionId,
      message: 'Paiement simulé avec succès (mode test)'
    };
  }

  /**
   * Obtenir la configuration actuelle
   */
  getConfig(): CinetPayConfig {
    return this.config;
  }

  /**
   * Mettre à jour la configuration
   */
  updateConfig(newConfig: Partial<CinetPayConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Instance par défaut du service
export const cinetpayService = new CinetPayService();

// Fonctions utilitaires
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF'
  }).format(amount);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Validation pour les numéros congolais
  const congolesePhoneRegex = /^(\+242|242)?[0-9]{9}$/;
  return congolesePhoneRegex.test(phone.replace(/\s/g, ''));
};

export const getChannelFromMethod = (method: string): string => {
  switch (method) {
    case 'ORANGE_MONEY':
      return 'ORANGE';
    case 'AIRTEL_MONEY':
      return 'AIRTEL';
    case 'VISA':
      return 'VISA';
    case 'MASTERCARD':
      return 'MASTERCARD';
    default:
      return 'ORANGE';
  }
};

export default CinetPayService;
