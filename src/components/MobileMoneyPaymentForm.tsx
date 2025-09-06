import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { mobileMoneyService, PaymentRequest, MobileMoneyPayment } from '../services/mobileMoneyService';

interface MobileMoneyPaymentFormProps {
  reservationId: string;
  amount: number;
  currency: string;
  clientEmail: string;
  onPaymentSuccess?: (payment: MobileMoneyPayment) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}

const MobileMoneyPaymentForm: React.FC<MobileMoneyPaymentFormProps> = ({
  reservationId,
  amount,
  currency,
  clientEmail,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    operator: 'ORANGE' as 'ORANGE' | 'AIRTEL' | 'MPESE'
  });

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [currentPayment, setCurrentPayment] = useState<MobileMoneyPayment | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const operators = [
    { value: 'ORANGE', label: 'Orange Money', color: 'bg-orange-500' },
    { value: 'AIRTEL', label: 'Airtel Money', color: 'bg-red-500' },
    { value: 'MPESE', label: 'M-Pesa', color: 'bg-green-500' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const validateForm = (): boolean => {
    if (!formData.phone_number.trim()) {
      setErrorMessage('Le numéro de téléphone est requis');
      return false;
    }

    if (formData.phone_number.length < 9) {
      setErrorMessage('Le numéro de téléphone doit contenir au moins 9 chiffres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const paymentRequest: PaymentRequest = {
        amount,
        currency,
        phone_number: formData.phone_number,
        operator: formData.operator,
        reservation_id: reservationId,
        client_email: clientEmail,
        description: `Réservation #${reservationId} - ${amount} ${currency}`
      };

      const response = await mobileMoneyService.initiatePayment(paymentRequest);

      if (response.success && response.transaction_id) {
        setCurrentPayment(await mobileMoneyService.checkPaymentStatus(response.transaction_id));
        setPaymentStatus('success');
        
        if (onPaymentSuccess && currentPayment) {
          onPaymentSuccess(currentPayment);
        }
      } else {
        setErrorMessage(response.error || 'Erreur lors de l\'initialisation du paiement');
        setPaymentStatus('error');
        
        if (onPaymentError) {
          onPaymentError(response.error || 'Erreur lors de l\'initialisation du paiement');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du paiement:', error);
      setErrorMessage('Erreur interne du serveur');
      setPaymentStatus('error');
      
      if (onPaymentError) {
        onPaymentError('Erreur interne du serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setCurrentPayment(null);
  };

  if (paymentStatus === 'success' && currentPayment) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-green-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Paiement Initialisé avec Succès !
          </h3>
          <p className="text-gray-600 mb-4">
            Votre paiement mobile money a été initialisé. Veuillez compléter le paiement sur votre téléphone.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Transaction ID:</span>
                <p className="text-gray-900 font-mono">{currentPayment.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Montant:</span>
                <p className="text-gray-900">{currentPayment.amount} {currentPayment.currency}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Opérateur:</span>
                <p className="text-gray-900">{currentPayment.operator}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Statut:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  En attente
                </span>
              </div>
            </div>
          </div>

          {currentPayment.payment_url && (
            <a
              href={currentPayment.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-soft"
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Compléter le Paiement
            </a>
          )}

          <button
            onClick={handleRetry}
            className="mt-4 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Nouveau Paiement
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
          <CreditCard className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Paiement Mobile Money
          </h3>
          <p className="text-gray-600">
            Complétez votre réservation avec un paiement mobile money
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-sm">€</span>
          </div>
          <div>
            <p className="text-sm text-blue-800 font-medium">Montant à payer</p>
            <p className="text-2xl font-bold text-blue-900">{amount} {currency}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sélection de l'opérateur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choisissez votre opérateur mobile money
          </label>
          <div className="grid grid-cols-3 gap-3">
            {operators.map((operator) => (
              <button
                key={operator.value}
                type="button"
                onClick={() => handleInputChange('operator', operator.value)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  formData.operator === operator.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 ${operator.color} rounded-full mx-auto mb-2`}></div>
                <span className="text-sm font-medium text-gray-900">
                  {operator.label}
                </span>
                {formData.operator === operator.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Numéro de téléphone */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleInputChange('phone_number', e.target.value)}
            placeholder="Ex: 0991234567"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Entrez le numéro associé à votre compte mobile money
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700 text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-soft"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5 mr-2" />
                Payer {amount} {currency}
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* Informations de sécurité */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <CheckCircle className="w-3 h-3 text-green-600" />
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Paiement Sécurisé</p>
            <p>
              Votre paiement est traité de manière sécurisée via CinetPay. 
              Aucune information bancaire n'est stockée sur nos serveurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyPaymentForm;






