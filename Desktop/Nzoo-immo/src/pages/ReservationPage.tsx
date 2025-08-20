import React, { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Smartphone, Banknote, AlertCircle, Clock, Calendar, X, Info, Building, User, FileText } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { createReservation } from '../services/reservationService';
import { checkSpaceAvailability } from '../services/availabilityService';
import { getSpaceInfo } from '../data/spacesData';
import { generateAndDownloadReservationInvoice } from '../services/invoiceService';
import { calculateDaysBetween, calculateTotalPrice } from '../utils/dateUtils';
import { logger } from '../utils/logger';

interface ReservationPageProps {
  language: 'fr' | 'en';
  spaceType?: string;
}

interface DateAvailability {
  date: string;
  available: boolean;
  conflictingReservations: number;
  maxCapacity: number;
}

const ReservationPage: React.FC<ReservationPageProps> = ({ language, spaceType = 'coworking' }) => {
  const [selectedDates, setSelectedDates] = useState<[Date, Date] | null>(null);
  const [autoSelectDates, setAutoSelectDates] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    activity: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    occupants: 1,
    subscriptionType: 'daily',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);

  // Nouveaux états pour la gestion des réservations
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // États pour la gestion de la disponibilité
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [dateAvailability, setDateAvailability] = useState<DateAvailability[]>([]);
  const [availabilityCheck, setAvailabilityCheck] = useState<any>(null);
  const [suggestedDates, setSuggestedDates] = useState<{ start: string; end: string }[]>([]);

  // Capacités maximales par type d'espace
  const maxCapacities = {
    'coworking': 4,
    'bureau-prive': 3,
    'bureau_prive': 3,
    'domiciliation': 1
  };

  const currentMaxCapacity = maxCapacities[spaceType as keyof typeof maxCapacities] || 4;

  // Fonction améliorée pour mapper les types d'espaces vers les valeurs de la base de données
  const mapSpaceType = (type: string) => {
    const spaceTypeMap: Record<string, string> = {
      'coworking': 'coworking',
      'bureau-prive': 'bureau_prive',
      'domiciliation': 'domiciliation',
    };
    return spaceTypeMap[type] || type;
  };

  // --- Ajout useEffect pour forcer subscriptionType si ce n'est pas coworking ---
  useEffect(() => {
    if (spaceType !== 'coworking' && formData.subscriptionType === 'daily') {
      setFormData((prev) => ({ ...prev, subscriptionType: 'monthly' }));
    }
  }, [spaceType, formData.subscriptionType]);

  // Fonction pour vérifier la disponibilité d'une période
  const checkAvailability = async (startDate: Date, endDate: Date) => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const mappedSpaceType = mapSpaceType(spaceType || 'coworking');
      const result = await checkSpaceAvailability(mappedSpaceType, startDateStr, endDateStr);
      
      setAvailabilityCheck(result);
      
      if (!result.isAvailable) {
        setSuggestedDates(result.suggestedDates || []);
        setAvailabilityError(result.message || 'Période non disponible');
      } else {
        setSuggestedDates([]);
        setAvailabilityError(null);
      }
      
      return result.isAvailable;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      setAvailabilityError('Erreur lors de la vérification de disponibilité');
      return false;
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Fonction améliorée pour sélectionner automatiquement une période d'un mois
  const handleDateSelection = async (value: any) => {
    console.log('🔍 handleDateSelection called with:', value);
    console.log('🔍 spaceType:', spaceType);
    console.log('🔍 value type:', typeof value);
    console.log('🔍 isArray:', Array.isArray(value));
    
    if (spaceType === 'coworking') {
      // Pour le coworking, comportement normal de sélection libre
      console.log('🔍 Coworking mode - setting dates:', value);
      
      // Validation des dates sélectionnées
      if (Array.isArray(value) && value.length === 2) {
        const [startDate, endDate] = value;
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        console.log('🔍 Selected period:', {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
          days: days
        });
        
        // Avertissement si la période semble trop longue
        if (days > 30) {
          console.warn('⚠️ Long period selected:', days, 'days');
        }
      }
      
      setSelectedDates(value);
      setAutoSelectDates(false);
      
      // Vérifier la disponibilité si une plage est sélectionnée
      if (Array.isArray(value) && value.length === 2) {
        await checkAvailability(value[0], value[1]);
      }
    } else {
      // Pour les autres services, sélectionner automatiquement un mois
      if (value && !Array.isArray(value)) {
        // Si une seule date est sélectionnée, calculer automatiquement la période d'un mois
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1); // Dernier jour de la période d'un mois
        
        console.log('🔍 Non-coworking mode - auto-selecting month:', { 
          startDate: startDate.toISOString().split('T')[0], 
          endDate: endDate.toISOString().split('T')[0] 
        });
        setSelectedDates([startDate, endDate]);
        setAutoSelectDates(true);
        
        // Vérifier la disponibilité
        await checkAvailability(startDate, endDate);
        
        // Afficher un message informatif à l'utilisateur
        setTimeout(() => {
          const message = language === 'fr' 
            ? `Période automatiquement sélectionnée : ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`
            : `Period automatically selected: ${startDate.toLocaleDateString('en-US')} to ${endDate.toLocaleDateString('en-US')}`;
          
          console.log(message);
        }, 100);
        
      } else if (Array.isArray(value) && value.length === 2) {
        // Si une plage est déjà sélectionnée, la conserver
        console.log('🔍 Non-coworking mode - range already selected:', value);
        setSelectedDates(value as [Date, Date]);
        setAutoSelectDates(false);
        
        // Vérifier la disponibilité
        await checkAvailability(value[0], value[1]);
      }
    }
  };

  // Fonction pour réinitialiser la sélection de dates
  const handleResetDates = () => {
    setSelectedDates(null);
    setAutoSelectDates(false);
    setAvailabilityCheck(null);
    setAvailabilityError(null);
    setSuggestedDates([]);
  };

  // Fonction pour sélectionner une date suggérée
  const handleSuggestedDateSelect = async (suggestedDate: { start: string; end: string }) => {
    const startDate = new Date(suggestedDate.start);
    const endDate = new Date(suggestedDate.end);
    
    setSelectedDates([startDate, endDate] as [Date, Date]);
    setAutoSelectDates(false);
    setAvailabilityError(null);
    setSuggestedDates([]);
    
    // Vérifier à nouveau la disponibilité
    await checkAvailability(startDate, endDate);
  };

  // Fonction pour calculer le nombre de jours sélectionnés
  const calculateSelectedDays = () => {
    if (!selectedDates) return 0;
    
    if (Array.isArray(selectedDates) && selectedDates.length === 2) {
      const days = calculateDaysBetween(selectedDates[0], selectedDates[1]);
      logger.debug('calculateSelectedDays', {
        start: selectedDates[0].toISOString().split('T')[0],
        end: selectedDates[1].toISOString().split('T')[0],
        days
      });
      return days;
    }
    
    return 1;
  };

  const translations = {
    fr: {
      title: "Réservation d'Espace",
      steps: {
        selection: 'Sélection',
        details: 'Détails',
        payment: 'Paiement',
        confirmation: 'Confirmation',
      },
      form: {
        fullName: 'Nom Complet',
        activity: 'Activité',
        company: 'Entreprise',
        phone: 'Téléphone',
        email: 'Email',
        address: 'Adresse Physique',
        occupants: "Nombre d'Occupants",
        period: 'Période Souhaitée',
        subscriptionType: "Type d'Abonnement",
        daily: 'Journalier',
        monthly: 'Mensuel',
        yearly: 'Annuel',
        hourly: 'Horaire',
        dates: 'Dates de réservation',
        cancel: 'Annuler',
        submit: 'Confirmer la réservation'
      },
      payment: {
        title: 'Paiement Sécurisé',
        methods: 'Moyens de Paiement',
        mobileMoney: 'Mobile Money',
        visa: 'Carte VISA',
        cash: "Paiement en espèces",
        total: 'Total à Payer',
        processing: 'Traitement en cours...',
        checking: 'Vérification du paiement en cours...',
        error: 'Erreur de paiement : ',
        success: 'Paiement réussi !',
        failed: 'Paiement échoué',
        cancelled: 'Paiement annulé'
      },
      buttons: {
        next: 'Suivant',
        previous: 'Précédent',
        reserve: 'Réserver',
        pay: 'Payer Maintenant',
        newReservation: 'Nouvelle Réservation',
      },
      validation: {
        selectDates: 'Veuillez sélectionner les dates',
        fillRequired: 'Veuillez remplir tous les champs obligatoires',
        maxOccupants: "Nombre maximum d'occupants dépassé",
      },
      success: {
        title: 'Réservation Confirmée !',
        message:
          'Votre réservation a été confirmée avec succès. Vous recevrez un email de confirmation.',
        reference: 'Référence',
        invoice: {
          generated: 'Facture générée avec succès',
          generating: 'Génération de la facture en cours...',
          error: 'Erreur lors de la génération de la facture',
          download: 'Télécharger la facture'
        }
      },
    },
    en: {
      title: 'Space Reservation',
      steps: {
        selection: 'Selection',
        details: 'Details',
        payment: 'Payment',
        confirmation: 'Confirmation',
      },
      form: {
        fullName: 'Full Name',
        activity: 'Activity',
        company: 'Company',
        phone: 'Phone',
        email: 'Email',
        address: 'Physical Address',
        occupants: 'Number of Occupants',
        period: 'Desired Period',
        subscriptionType: 'Subscription Type',
        daily: 'Daily',
        monthly: 'Monthly',
        yearly: 'Yearly',
        hourly: 'Hourly',
        dates: 'Reservation dates',
        cancel: 'Cancel',
        submit: 'Confirm reservation'
      },
      payment: {
        title: 'Secure Payment',
        methods: 'Payment Methods',
        mobileMoney: 'Mobile Money',
        visa: 'VISA Card',
        cash: 'Cash Payment',
        total: 'Total to Pay',
        processing: 'Processing...',
        checking: 'Checking payment status...',
        error: 'Payment error: ',
        success: 'Payment successful!',
        failed: 'Payment failed',
        cancelled: 'Payment cancelled'
      },
      buttons: {
        next: 'Next',
        previous: 'Previous',
        reserve: 'Reserve',
        pay: 'Pay Now',
        newReservation: 'New Reservation',
      },
      validation: {
        selectDates: 'Please select dates',
        fillRequired: 'Please fill all required fields',
        maxOccupants: 'Maximum occupants exceeded',
      },
      success: {
        title: 'Reservation Confirmed!',
        message:
          'Your reservation has been successfully confirmed. You will receive a confirmation email.',
        reference: 'Reference',
        invoice: {
          generated: 'Invoice generated successfully',
          generating: 'Generating invoice...',
          error: 'Error generating invoice',
          download: 'Download invoice'
        }
      },
    },
  };

  const t = translations[language];
  
  // Obtenir les informations de l'espace depuis le fichier de données
  const spaceInfo = getSpaceInfo(spaceType || 'coworking', language);

  if (!spaceInfo) {
    return (
      <div className="max-w-3xl mx-auto p-6 min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {language === 'fr' ? 'Espace non trouvé' : 'Space not found'}
          </h1>
          <p className="mt-4">
            {language === 'fr' 
              ? 'L\'espace demandé n\'existe pas.' 
              : 'The requested space does not exist.'}
          </p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!selectedDates) return 0;

    const days = calculateDaysBetween(selectedDates[0], selectedDates[1]);



    if (spaceType === 'domiciliation') {
      return (spaceInfo.monthlyPrice || 0) * Math.ceil(days / 30);
    }

    return calculateTotalPrice(days, formData.subscriptionType, {
      daily: spaceInfo.dailyPrice,
      monthly: spaceInfo.monthlyPrice,
      yearly: spaceInfo.yearlyPrice
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'occupants' ? Number(value) : value,
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return selectedDates !== null;
      case 2:
        return (
          formData.fullName !== '' &&
          formData.email !== '' &&
          formData.phone !== '' &&
          formData.activity !== ''
        );
      case 3:
        return selectedPaymentMethod !== null && !paymentProcessing;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Fonction pour générer la facture après une réservation réussie
  const generateInvoiceAfterReservation = async (reservationData: any) => {
    try {
      setGeneratingInvoice(true);
      await generateAndDownloadReservationInvoice(reservationData);
      setInvoiceGenerated(true);
      console.log('✅ Facture générée avec succès');
    } catch (invoiceError) {
      console.error('❌ Erreur lors de la génération de la facture:', invoiceError);
      // Ne pas bloquer le processus si la facture échoue
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleCashPayment = async () => {
    if (!selectedDates) return;

    setReservationError(null);

    const cashTransactionId = `CASH_${Date.now()}`;

    try {
      const mappedSpaceType = mapSpaceType(spaceType || 'coworking');
      
      // Formatage correct des dates pour éviter les problèmes de timezone
      const startDateFormatted = selectedDates[0].toISOString().split('T')[0];
      const endDateFormatted = selectedDates[1].toISOString().split('T')[0];
      
      console.log(`🔍 Preparing reservation data:`, {
        originalSpaceType: spaceType,
        mappedSpaceType: mappedSpaceType,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        subscriptionType: formData.subscriptionType,
        amount: calculateTotal()
      });

      const reservationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        activity: formData.activity,
        address: formData.address,
        spaceType: mappedSpaceType,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        occupants: formData.occupants,
        subscriptionType: formData.subscriptionType,
        amount: calculateTotal(),
        paymentMethod: 'cash',
        transactionId: cashTransactionId,
      };

      console.log(`🚀 Sending reservation data:`, reservationData);

      const result = await createReservation(reservationData);
      
      if (result.success) {
        console.log(`✅ Reservation created successfully:`, result);
        setReservationSuccess(true);
        setEmailSent(result.emailSent || false);
        setCurrentStep(4);
        
        // Pas de génération automatique de facture pour les paiements en cash
        console.log('💵 Paiement en cash - Pas de génération automatique de facture');
        
        // Afficher une notification si l'email n'a pas été envoyé
        if (!result.emailSent) {
          console.warn('⚠️ Email de confirmation non envoyé pour la réservation:', result.reservation?.id);
        }
      } else {
        throw new Error(result.error || 'Échec de la création de la réservation');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la réservation cash:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation';
      setReservationError(errorMessage);
      
      // Log détaillé pour debug
      console.error('❌ Détails de l\'erreur:', {
        error,
        spaceType,
        mappedSpaceType: mapSpaceType(spaceType || 'coworking'),
        formData,
        selectedDates
      });
    }
  };

  // Gestion principale des réservations
  const handleReservation = async () => {
    if (!selectedPaymentMethod) return;
    
    // Déterminer le type de paiement et la méthode
    let paymentMethod = '';
    let transactionId = '';
    
    switch (selectedPaymentMethod) {
      case 'ORANGE_MONEY':
        paymentMethod = 'orange_money';
        transactionId = `OM_${Date.now()}`;
        break;
      case 'AIRTEL_MONEY':
        paymentMethod = 'airtel_money';
        transactionId = `AM_${Date.now()}`;
        break;
      case 'VISA':
        paymentMethod = 'visa';
        transactionId = `VISA_${Date.now()}`;
        break;
      case 'CASH':
        paymentMethod = 'cash';
        transactionId = `CASH_${Date.now()}`;
        break;
      default:
        paymentMethod = 'cash';
        transactionId = `CASH_${Date.now()}`;
    }
    
    await handlePayment(paymentMethod, transactionId);
  };
  
  const handlePayment = async (paymentMethod: string, transactionId: string) => {
    if (!selectedDates) return;

    setReservationError(null);

    try {
      const mappedSpaceType = mapSpaceType(spaceType || 'coworking');
      
      // Formatage correct des dates pour éviter les problèmes de timezone
      const startDateFormatted = selectedDates[0].toISOString().split('T')[0];
      const endDateFormatted = selectedDates[1].toISOString().split('T')[0];
      
      console.log(`🔍 Preparing reservation data:`, {
        originalSpaceType: spaceType,
        mappedSpaceType: mappedSpaceType,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        subscriptionType: formData.subscriptionType,
        amount: calculateTotal(),
        paymentMethod
      });

      const reservationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        activity: formData.activity,
        address: formData.address,
        spaceType: mappedSpaceType,
        startDate: startDateFormatted,
        endDate: endDateFormatted,
        occupants: formData.occupants,
        subscriptionType: formData.subscriptionType,
        amount: calculateTotal(),
        paymentMethod: paymentMethod,
        transactionId: transactionId,
      };

      console.log(`🚀 Sending reservation data:`, reservationData);

      const result = await createReservation(reservationData);
      
      if (result.success) {
        console.log(`✅ Reservation created successfully:`, result);
        setReservationSuccess(true);
        setEmailSent(result.emailSent || false);
        setCurrentStep(4);
        
        // Générer automatiquement la facture seulement pour les paiements par mobile money
        if (paymentMethod === 'orange_money' || paymentMethod === 'airtel_money') {
          console.log('📄 Génération automatique de la facture pour paiement mobile money');
          await generateInvoiceAfterReservation(reservationData);
        } else {
          console.log('💵 Paiement en cash - Pas de génération automatique de facture');
        }
        
        // Afficher une notification si l'email n'a pas été envoyé
        if (!result.emailSent) {
          console.warn('⚠️ Email de confirmation non envoyé pour la réservation:', result.reservation?.id);
        }
      } else {
        throw new Error(result.error || 'Échec de la création de la réservation');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la réservation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation';
      setReservationError(errorMessage);
      
      // Log détaillé pour debug
      console.error('❌ Détails de l\'erreur:', {
        error,
        spaceType,
        mappedSpaceType: mapSpaceType(spaceType || 'coworking'),
        formData,
        selectedDates
      });
    }
  };

  // Variables pour compatibilité
  const paymentLoading = false;
  const paymentProcessing = false;
  const checkingPayment = false;
  const paymentError = null;
  const transactionId = formData.fullName + '_' + Date.now();

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
                           className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                 currentStep >= step 
                   ? 'bg-nzoo-dark text-white shadow-lg transform scale-110' 
                   : 'bg-gray-200 text-gray-600'
               }`}
          >
            {currentStep > step ? <CheckCircle className="w-7 h-7" /> : step}
          </div>
          {step < 4 && (
                         <div
               className={`w-20 h-1 mx-3 rounded-full transition-all duration-300 ${
                 currentStep > step 
                   ? 'bg-nzoo-dark' 
                   : 'bg-gray-200'
               }`}
             />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-12">
      {/* Section Information Espace avec Design Moderne */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 md:p-12 border border-gray-100 overflow-hidden relative">
        {/* Éléments décoratifs */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-nzoo-gray/20 to-nzoo-dark/20 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full blur-xl opacity-50"></div>
        
        <div className="relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nzoo-dark to-nzoo-dark text-white rounded-2xl mb-6">
              <Building className="w-5 h-5 mr-2" />
              <span className="font-semibold">{spaceInfo.title}</span>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">{spaceInfo.description}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Équipements avec design moderne */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-100">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Équipements Inclus</h4>
              </div>
              <div className="space-y-4">
                {spaceInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-soft transition-all duration-300 group">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors duration-300">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarifs avec design moderne */}
            <div className="bg-gradient-to-br from-nzoo-dark to-nzoo-dark rounded-2xl p-8 text-white shadow-soft">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold">Tarifs</h4>
              </div>
              <div className="space-y-4">
                {spaceInfo.dailyPrice && (
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <span className="text-white/90 font-medium">Journalier</span>
                    <span className="font-bold text-2xl text-white">${spaceInfo.dailyPrice}</span>
                  </div>
                )}
                {spaceInfo.monthlyPrice && (
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <span className="text-white/90 font-medium">Mensuel</span>
                    <span className="font-bold text-2xl text-white">${spaceInfo.monthlyPrice}</span>
                  </div>
                )}
                {spaceInfo.yearlyPrice && (
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <span className="text-white/90 font-medium">Annuel</span>
                    <span className="font-bold text-2xl text-white">${spaceInfo.yearlyPrice}</span>
                  </div>
                )}
                {spaceInfo.hourlyPrice && (
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                    <span className="text-white/90 font-medium">Horaire</span>
                    <span className="font-bold text-2xl text-white">${spaceInfo.hourlyPrice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Calendrier avec Design Amélioré */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 md:p-12 border border-gray-100">
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-nzoo-dark mb-4 font-montserrat">
            {t.form.dates}
          </h4>
          <p className="text-gray-600 font-poppins">
            Sélectionnez vos dates de réservation
          </p>
        </div>

        {/* Informations sur la capacité */}
        <div className="mb-6 p-4 bg-gradient-to-r from-nzoo-dark/5 to-nzoo-dark/10 border border-nzoo-dark/20 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-nzoo rounded-xl flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-nzoo-dark">
                  nombre de box que contient notre espaces : {currentMaxCapacity} {spaceType === 'coworking' ? 'places' : 'bureaux'}
                </p>
                <p className="text-sm text-gray-600">
                  {spaceType === 'coworking' 
                    ? 'Sélectionnez une plage de dates pour le coworking'
                    : 'Sélectionnez une date de début pour un abonnement mensuel'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>



        {/* Informations spéciales pour les services non-coworking */}
        {spaceType !== 'coworking' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-800 mb-1">
                  {language === 'fr' 
                    ? "Sélection automatique d'un mois"
                    : "Automatic one-month selection"}
                </p>
                <p className="text-blue-700">
                  {language === 'fr'
                    ? "Sélectionnez une date de début, le système choisira automatiquement une période d'un mois."
                    : "Select a start date, the system will automatically choose a one-month period."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calendrier avec design amélioré */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-gray-100">
            <ReactCalendar
              onChange={handleDateSelection}
              selectRange={spaceType === 'coworking'}
              value={selectedDates}
              minDate={new Date()}
              className="rounded-2xl border-2 border-nzoo-gray/30 shadow-soft"
            />
          </div>
        </div>

        {/* Indicateur de chargement */}
        {availabilityLoading && (
          <div className="flex items-center justify-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-blue-700 font-medium">
              {language === 'fr' ? 'Vérification de la disponibilité...' : 'Checking availability...'}
            </span>
          </div>
        )}

        {/* Affichage de la période sélectionnée */}
        {selectedDates && !availabilityLoading && (
          <div className={`mt-6 p-6 rounded-2xl border ${
            availabilityError 
              ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-200' 
              : 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  availabilityError ? 'bg-red-500' : 'bg-green-500'
                }`}>
                  {availabilityError ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className={`font-semibold mb-1 ${
                    availabilityError ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {Array.isArray(selectedDates) && selectedDates.length === 2 ? (
                      language === 'fr' 
                        ? `Période sélectionnée`
                        : `Selected period`
                    ) : (
                      language === 'fr' 
                        ? `Date sélectionnée`
                        : `Selected date`
                    )}
                  </p>
                  <p className={`font-medium ${
                    availabilityError ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {selectedDates && Array.isArray(selectedDates) && selectedDates.length === 2 ? (
                      language === 'fr' 
                        ? `${selectedDates[0].toLocaleDateString('fr-FR')} au ${selectedDates[1].toLocaleDateString('fr-FR')}`
                        : `${selectedDates[0].toLocaleDateString('en-US')} to ${selectedDates[1].toLocaleDateString('en-US')}`
                    ) : (
                      language === 'fr' 
                        ? 'Aucune date sélectionnée'
                        : 'No date selected'
                    )}
                  </p>
                  <p className={`text-sm mt-1 ${
                    availabilityError ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {language === 'fr' 
                      ? `Durée : ${calculateSelectedDays()} jour${calculateSelectedDays() > 1 ? 's' : ''}`
                      : `Duration: ${calculateSelectedDays()} day${calculateSelectedDays() > 1 ? 's' : ''}`
                    }
                  </p>

                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                {autoSelectDates && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                    {language === 'fr' ? "Auto-sélection" : "Auto-selected"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetDates}
                  className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                >
                  {language === 'fr' ? "Modifier" : "Change"}
                </button>
              </div>
            </div>

            {/* Message d'erreur de disponibilité */}
            {availabilityError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 font-medium mb-3">{availabilityError}</p>
                
                {/* Dates suggérées */}
                {suggestedDates.length > 0 && (
                  <div>
                    <p className="text-red-600 mb-3 font-medium">
                      {language === 'fr' ? 'Dates alternatives disponibles :' : 'Alternative dates available:'}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {suggestedDates.slice(0, 4).map((suggested, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedDateSelect(suggested)}
                          className="p-3 bg-white border border-green-200 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all duration-300 text-left"
                        >
                          <p className="font-medium text-green-800">
                            {new Date(suggested.start).toLocaleDateString('fr-FR')} - {new Date(suggested.end).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-sm text-green-600">
                            {language === 'fr' ? 'Cliquez pour sélectionner' : 'Click to select'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!selectedDates && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700 font-medium">{t.validation.selectDates}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 md:p-12 border border-gray-100 overflow-hidden relative">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-100 to-emerald-100 rounded-full blur-2xl opacity-30"></div>
      
      <div className="relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nzoo-dark to-blue-600 text-white rounded-2xl mb-6">
            <User className="w-5 h-5 mr-2" />
            <span className="font-semibold">Informations Personnelles</span>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed">
            Remplissez vos informations pour finaliser votre réservation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informations principales */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-3">
                {t.form.fullName} *
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="Votre nom complet"
                required
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <label htmlFor="activity" className="block text-sm font-semibold text-gray-700 mb-3">
                {t.form.activity} *
              </label>
              <input
                type="text"
                name="activity"
                id="activity"
                value={formData.activity}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="Votre activité professionnelle"
                required
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-3">
                {t.form.company}
              </label>
              <input
                type="text"
                name="company"
                id="company"
                value={formData.company}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="Nom de votre entreprise (optionnel)"
              />
            </div>
          </div>

          {/* Contact et autres informations */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                {t.form.phone} *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="Votre numéro de téléphone"
                required
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                {t.form.email} *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900 placeholder-gray-400"
                placeholder="votre.email@exemple.com"
                required
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100">
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
                {t.form.address}
              </label>
              <textarea
                name="address"
                id="address"
                rows={3}
                value={formData.address}
                onChange={handleInputChange}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Votre adresse physique (optionnel)"
              />
            </div>
          </div>
        </div>

        {/* Options supplémentaires */}
        {spaceType !== 'domiciliation' && (
          <div className="mt-8 bg-gradient-to-r from-nzoo-dark/5 to-blue-50 rounded-2xl p-8 border border-nzoo-dark/10">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <label htmlFor="occupants" className="block text-sm font-semibold text-gray-700 mb-3">
                  {t.form.occupants}
                </label>
                <input
                  type="number"
                  min={1}
                  max={spaceInfo.maxOccupants}
                  name="occupants"
                  id="occupants"
                  value={formData.occupants}
                  onChange={handleInputChange}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900"
                />
                {formData.occupants > spaceInfo.maxOccupants && (
                  <p className="text-red-600 mt-3 font-medium flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {t.validation.maxOccupants}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
                <label htmlFor="subscriptionType" className="block text-sm font-semibold text-gray-700 mb-3">
                  {t.form.subscriptionType}
                </label>
                <select
                  id="subscriptionType"
                  name="subscriptionType"
                  value={formData.subscriptionType}
                  onChange={handleInputChange}
                  disabled={spaceType !== 'coworking'}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-gray-900"
                >
                  {spaceType === 'coworking' && <option value="daily">{t.form.daily}</option>}
                  <option value="monthly">{t.form.monthly}</option>
                  <option value="yearly">{t.form.yearly}</option>
                </select>
                {spaceType !== 'coworking' && (
                  <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-orange-700 text-sm font-medium">
                      {language === 'fr'
                        ? "Pour ce service, seuls les abonnements mensuels et annuels sont disponibles."
                        : "For this service, only monthly and yearly subscriptions are available."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const total = calculateTotal();
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 md:p-12 border border-gray-100 overflow-hidden relative">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-2xl opacity-30"></div>
        
        <div className="relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-nzoo-dark to-blue-600 text-white rounded-2xl mb-6">
              <CreditCard className="w-5 h-5 mr-2" />
              <span className="font-semibold">{t.payment.title}</span>
            </div>
            <p className="text-xl text-gray-700 leading-relaxed">
              Choisissez votre méthode de paiement préférée
            </p>
          </div>

          {/* Options de paiement modernes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Orange Money */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('ORANGE_MONEY')}
              className={`group p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                selectedPaymentMethod === 'ORANGE_MONEY'
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500 shadow-2xl'
                  : 'bg-white text-orange-600 border-orange-200 hover:border-orange-400 hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${
                  selectedPaymentMethod === 'ORANGE_MONEY' 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-orange-100 group-hover:bg-orange-200'
                }`}>
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Orange Money</h3>
                  <p className="text-sm mt-1 opacity-80">
                    {language === 'fr' ? 'Paiement mobile' : 'Mobile payment'}
                  </p>
                </div>
                {selectedPaymentMethod === 'ORANGE_MONEY' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-orange-600" />
                  </div>
                )}
              </div>
            </button>

            {/* Airtel Money */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('AIRTEL_MONEY')}
              className={`group p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                selectedPaymentMethod === 'AIRTEL_MONEY'
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-500 shadow-2xl'
                  : 'bg-white text-red-600 border-red-200 hover:border-red-400 hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${
                  selectedPaymentMethod === 'AIRTEL_MONEY' 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-red-100 group-hover:bg-red-200'
                }`}>
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Airtel Money</h3>
                  <p className="text-sm mt-1 opacity-80">
                    {language === 'fr' ? 'Paiement mobile' : 'Mobile payment'}
                  </p>
                </div>
                {selectedPaymentMethod === 'AIRTEL_MONEY' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-red-600" />
                  </div>
                )}
              </div>
            </button>

            {/* Carte VISA */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('VISA')}
              className={`group p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                selectedPaymentMethod === 'VISA'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500 shadow-2xl'
                  : 'bg-white text-blue-600 border-blue-200 hover:border-blue-400 hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${
                  selectedPaymentMethod === 'VISA' 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">Carte VISA</h3>
                  <p className="text-sm mt-1 opacity-80">
                    {language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
                  </p>
                </div>
                {selectedPaymentMethod === 'VISA' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            </button>

            {/* Paiement en espèces */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('CASH')}
              className={`group p-6 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                selectedPaymentMethod === 'CASH'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-500 shadow-2xl'
                  : 'bg-white text-green-600 border-green-200 hover:border-green-400 hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${
                  selectedPaymentMethod === 'CASH' 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-green-100 group-hover:bg-green-200'
                }`}>
                  <Banknote className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{t.payment.cash}</h3>
                  <p className="text-sm mt-1 opacity-80">
                    {language === 'fr' ? 'Paiement sur place' : 'Pay on-site'}
                  </p>
                </div>
                {selectedPaymentMethod === 'CASH' && (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Messages informatifs selon la méthode sélectionnée */}
          {selectedPaymentMethod && (
            <div className="mb-8 p-6 rounded-2xl border-2 backdrop-blur-sm">
              {selectedPaymentMethod === 'ORANGE_MONEY' && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 rounded-xl p-4">
                  <p className="text-orange-700 text-center font-medium">
                    {language === 'fr'
                      ? "Vous avez choisi Orange Money. Vous recevrez un SMS avec les instructions de paiement."
                      : "You have chosen Orange Money. You will receive an SMS with payment instructions."}
                  </p>
                </div>
              )}
              {selectedPaymentMethod === 'AIRTEL_MONEY' && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 rounded-xl p-4">
                  <p className="text-red-700 text-center font-medium">
                    {language === 'fr'
                      ? "Vous avez choisi Airtel Money. Vous recevrez un SMS avec les instructions de paiement."
                      : "You have chosen Airtel Money. You will receive an SMS with payment instructions."}
                  </p>
                </div>
              )}
              {selectedPaymentMethod === 'VISA' && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-700 text-center font-medium">
                    {language === 'fr'
                      ? "Vous avez choisi le paiement par carte VISA. Vous serez redirigé vers une page de paiement sécurisée."
                      : "You have chosen VISA card payment. You will be redirected to a secure payment page."}
                  </p>
                </div>
              )}
              {selectedPaymentMethod === 'CASH' && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 rounded-xl p-4">
                  <p className="text-green-700 text-center font-medium">
                    {language === 'fr'
                      ? "Vous avez choisi de payer en espèces. Merci de régler sur place lors de votre arrivée."
                      : "You have chosen to pay cash. Please pay on-site upon arrival."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Total à payer avec design moderne */}
          <div className="bg-gradient-to-r from-nzoo-dark to-blue-700 rounded-2xl p-8 text-white shadow-soft">
            <div className="text-center">
              <p className="text-white/80 mb-2 text-lg">{t.payment.total}</p>
              <p className="text-4xl md:text-5xl font-bold text-white">
                ${total}
              </p>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span className="text-white/80 text-sm">Paiement sécurisé</span>
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Messages d'erreur et de traitement */}
          {reservationError && (
            <div className="mt-6 p-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl">
              <div className="flex items-center justify-center space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p className="text-red-700 font-semibold text-center">Erreur: {reservationError}</p>
              </div>
            </div>
          )}

          {paymentProcessing && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-700 text-center font-medium">{t.payment.processing}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-soft p-8 md:p-16 border border-gray-100 overflow-hidden relative">
      {/* Éléments décoratifs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-2xl opacity-30"></div>
      
      <div className="relative text-center space-y-12">
        {/* Animation de succès */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-green-400 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Titre et message */}
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">{t.success.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{t.success.message}</p>
        </div>
        
                 {/* Statut de l'email */}
         {emailSent && (
           <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 max-w-2xl mx-auto">
             <div className="flex items-center justify-center space-x-3">
               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                 <CheckCircle className="w-5 h-5 text-white" />
               </div>
               <p className="text-green-700 font-semibold text-lg">
                 {language === 'fr' ? 'Email de confirmation envoyé avec succès' : 'Confirmation email sent successfully'}
               </p>
             </div>
           </div>
         )}

         {/* Statut de la facture */}
         {generatingInvoice && (
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 max-w-2xl mx-auto">
             <div className="flex items-center justify-center space-x-3">
               <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               </div>
               <p className="text-blue-700 font-semibold text-lg">
                 {t.success.invoice.generating}
               </p>
             </div>
           </div>
         )}

         {invoiceGenerated && (
           <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 max-w-2xl mx-auto">
             <div className="flex items-center justify-center space-x-3">
               <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                 <FileText className="w-5 h-5 text-white" />
               </div>
               <p className="text-green-700 font-semibold text-lg">
                 {t.success.invoice.generated}
               </p>
             </div>
           </div>
         )}
        
        {/* Référence de réservation */}
        <div className="bg-gradient-to-r from-nzoo-dark to-blue-700 rounded-2xl p-8 text-white shadow-soft max-w-2xl mx-auto">
          <div className="space-y-4">
            <p className="text-white/80 text-lg font-medium">Référence de votre réservation</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-2xl font-bold text-white font-mono tracking-wider">{transactionId}</p>
            </div>
            <p className="text-white/70 text-sm">
              {language === 'fr' 
                ? 'Conservez cette référence pour vos futurs échanges avec notre équipe.' 
                : 'Keep this reference for future communications with our team.'}
            </p>
          </div>
        </div>

        {/* Bouton nouvelle réservation */}
        <button
          type="button"
          onClick={() => {
            setCurrentStep(1);
            setSelectedDates(null);
            setAutoSelectDates(false);
            setFormData({
              fullName: '',
              activity: '',
              company: '',
              phone: '',
              email: '',
              address: '',
              occupants: 1,
              subscriptionType: 'daily',
            });
            setSelectedPaymentMethod(null);
            setReservationError(null);
            setReservationSuccess(false);
            setEmailSent(false);
            setInvoiceGenerated(false);
            setGeneratingInvoice(false);
          }}
          className="group px-12 py-6 bg-gradient-to-r from-nzoo-dark to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 font-bold text-xl shadow-soft hover:shadow-nzoo-hover transform hover:-translate-y-2"
        >
          <div className="flex items-center space-x-3">
            <span>{t.buttons.newReservation}</span>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-blue-200"></div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900 transition-all duration-700 font-sans">
      {/* Header Section avec Design Moderne */}
             <section className="relative bg-gradient-to-br from-nzoo-dark via-nzoo-dark to-nzoo-dark pt-32 pb-24 overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Calendar className="w-5 h-5 text-white mr-2" />
              <span className="text-white/90 font-medium">Réservation en ligne</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {t.title}
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              Réservez votre espace de travail en quelques étapes simples et sécurisées
            </p>
            
            {/* Indicateur de progression moderne */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                    currentStep >= step 
                      ? 'bg-white text-nzoo-dark shadow-2xl transform scale-110' 
                      : 'bg-white/20 text-white/70 border border-white/30'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step 
                        ? 'bg-white' 
                        : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="relative -mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Conteneur principal avec effet de profondeur */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === 3) {
                handleReservation();
              } else {
                nextStep();
              }
            }}
            className="p-8 md:p-12"
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            
            {/* Navigation moderne */}
            {currentStep !== 4 && (
              <div className="mt-12 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl shadow-soft border border-gray-100">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="group px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-semibold shadow-soft hover:shadow-md transform hover:-translate-y-1"
                    disabled={paymentProcessing}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin group-hover:border-gray-600"></div>
                      <span>{t.buttons.previous}</span>
                    </div>
                  </button>
                )}
                
                {currentStep !== 3 && (
                  <button
                    type="submit"
                    className="group px-10 py-4 bg-gradient-to-r from-nzoo-dark to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-soft hover:shadow-nzoo-hover transform hover:-translate-y-1 ml-auto"
                    disabled={!validateStep(currentStep) || paymentLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{t.buttons.next}</span>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:border-blue-200"></div>
                    </div>
                  </button>
                )}
                
                {currentStep === 3 && (
                  <button
                    type="button"
                    onClick={handleReservation}
                    className="group px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 transition-all duration-300 font-semibold shadow-soft hover:shadow-nzoo-hover transform hover:-translate-y-1 ml-auto"
                    disabled={paymentProcessing || paymentLoading || !selectedPaymentMethod}
                  >
                    <div className="flex items-center space-x-2">
                      {paymentProcessing || paymentLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{language === 'fr' ? 'Traitement...' : 'Processing...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{selectedPaymentMethod === 'CASH' ? t.buttons.reserve : t.buttons.pay}</span>
                          <CreditCard className="w-5 h-5" />
                        </>
                      )}
                    </div>
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default ReservationPage;