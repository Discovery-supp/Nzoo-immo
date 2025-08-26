import React from 'react';
import { CreditCard, Smartphone, Banknote, QrCode } from 'lucide-react';
import { createQrCodeUrl, initiateMobileMoneyPayment, initiateVisaPayment } from '../services/paymentService';
import { APP_CONFIG } from '../config/app.config';

interface PaymentSelectorProps {
  language: 'fr' | 'en';
  amount: number;
  onMethodSelect: (method: 'MOBILE_MONEY' | 'VISA' | 'CASH') => void;
  selected?: 'MOBILE_MONEY' | 'VISA' | 'CASH' | null;
  customerPhone?: string;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({ language, amount, onMethodSelect, selected = null, customerPhone }) => {
  const [qrUrl, setQrUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleMobileMoney = async () => {
    onMethodSelect('MOBILE_MONEY');
    setError(null);
    setIsLoading(true);
    const phone = customerPhone || '';
    const init = await initiateMobileMoneyPayment(amount, phone);
    setIsLoading(false);
    if (!init.success || !init.reference) { setError(language === 'fr' ? 'Erreur d’initiation Mobile Money' : 'Mobile Money init error'); return; }
    if (APP_CONFIG.payments.qrEnabled) {
      const payData = `MM|ref=${init.reference}|amount=${amount}`;
      setQrUrl(createQrCodeUrl(payData));
    } else {
      setQrUrl(null);
    }
  };

  const handleVisa = async () => {
    onMethodSelect('VISA');
    setError(null);
    setIsLoading(true);
    const init = await initiateVisaPayment(amount);
    setIsLoading(false);
    if (!init.success || !init.reference) { setError(language === 'fr' ? 'Erreur d’initiation VISA' : 'VISA init error'); return; }
    if (APP_CONFIG.payments.qrEnabled) {
      const payData = `VISA|ref=${init.reference}|amount=${amount}`;
      setQrUrl(createQrCodeUrl(payData));
    } else {
      setQrUrl(null);
    }
  };

  const handleCash = () => {
    onMethodSelect('CASH');
    setQrUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <button type="button" onClick={handleMobileMoney} className={`p-4 rounded-xl border-2 ${selected === 'MOBILE_MONEY' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300'}`}>
          <div className="text-center">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold">{language === 'fr' ? 'Mobile Money' : 'Mobile Money'}</div>
          </div>
        </button>
        <button type="button" onClick={handleVisa} className={`p-4 rounded-xl border-2 ${selected === 'VISA' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold">VISA</div>
          </div>
        </button>
        <button type="button" onClick={handleCash} className={`p-4 rounded-xl border-2 ${selected === 'CASH' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
          <div className="text-center">
            <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <div className="font-semibold">{language === 'fr' ? 'Espèces' : 'Cash'}</div>
          </div>
        </button>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-gray-600">{language === 'fr' ? 'Génération du QR…' : 'Generating QR…'}</div>
      )}
      {error && (
        <div className="text-center text-sm text-red-600">{error}</div>
      )}
      {qrUrl && (
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 mb-2 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
            <QrCode className="w-3 h-3 mr-1" /> {language === 'fr' ? 'Scannez pour payer' : 'Scan to pay'}
          </div>
          <div className="flex justify-center">
            <img src={qrUrl} alt="QR Code" className="w-44 h-44 rounded-lg border" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSelector;


