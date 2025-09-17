// Service de paiement simplifié (démo)

export interface PaymentInitResult {
  success: boolean;
  paymentUrl?: string;
  reference?: string;
  error?: string;
}

export const initiateMobileMoneyPayment = async (amount: number, customerPhone: string): Promise<PaymentInitResult> => {
  try {
    // Génère uniquement une référence côté client; l'URL de paiement réelle est fournie par CinetPay côté page de réservation
    const reference = `MM_${Date.now()}`;
    return { success: true, reference };
  } catch (e) {
    return { success: false, error: 'Impossible d’initier le paiement Mobile Money' };
  }
};

export const initiateVisaPayment = async (amount: number): Promise<PaymentInitResult> => {
  try {
    const reference = `VISA_${Date.now()}`;
    const paymentUrl = `https://pay.nzoo-immo.local/visa?ref=${reference}&amount=${encodeURIComponent(amount)}`;
    return { success: true, paymentUrl, reference };
  } catch (e) {
    return { success: false, error: 'Impossible d’initier le paiement VISA' };
  }
};

export const createQrCodeUrl = (data: string, size: number = 200): string => {
  // Utilisation d’un service public de génération de QR (sans dépendance)
  const encoded = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
};


