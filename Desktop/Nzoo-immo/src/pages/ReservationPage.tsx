import React, { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, Smartphone, Banknote, AlertCircle, Clock, Calendar, X, Info, Building, User, FileText, ArrowRight } from 'lucide-react';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { createReservation } from '../services/reservationService';
import { checkSpaceAvailability, checkGeneralSpaceAvailability } from '../services/availabilityService';
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

interface SpaceOption {
  key: string;
  title: string;
  description: string;
  image: string;
  price: string;
  capacity: string;
  available: boolean;
  color: string;
}

const ReservationPage: React.FC<ReservationPageProps> = ({ language, spaceType = 'coworking' }) => {
  const [selectedSpace, setSelectedSpace] = useState<string>(spaceType);
  const [showSpaceSelection, setShowSpaceSelection] = useState(false);
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

  // États pour la gestion des réservations
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
  const [spaceAvailability, setSpaceAvailability] = useState<{ isAvailable: boolean; message?: string }>({ isAvailable: true });

  // Capacités maximales par type d'espace
  const maxCapacities = {
    'coworking': 4,
    'bureau-prive': 3,
    'bureau_prive': 3,
    'domiciliation': 1
  };

  const currentMaxCapacity = maxCapacities[selectedSpace as keyof typeof maxCapacities] || 4;

  // États pour les options d'espaces
  const [spaceOptions, setSpaceOptions] = useState<SpaceOption[]>([]);
  const [spaceOptionsLoading, setSpaceOptionsLoading] = useState(true);

  // Fonction pour mapper les types d'espaces
  const mapSpaceType = (type: string) => {
    const spaceTypeMap: Record<string, string> = {
      'coworking': 'coworking',
      'bureau-prive': 'bureau_prive',
      'domiciliation': 'domiciliation',
    };
    return spaceTypeMap[type] || type;
  };





  // useEffect pour gérer l'affichage basé sur l'URL
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const spaceTypeFromUrl = urlParams.get('spaceType');
      
      if (spaceTypeFromUrl) {
        setSelectedSpace(spaceTypeFromUrl);
        setShowSpaceSelection(false); // Aller directement au formulaire
      } else {
        setShowSpaceSelection(true); // Montrer la sélection d'espace
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la page de réservation:', error);
      // Fallback: montrer la sélection d'espace
      setShowSpaceSelection(true);
    }
  }, []);

  // useEffect pour forcer subscriptionType
  useEffect(() => {
    if (selectedSpace !== 'coworking' && formData.subscriptionType === 'daily') {
      setFormData((prev) => ({ ...prev, subscriptionType: 'monthly' }));
    }
  }, [selectedSpace, formData.subscriptionType]);

  // useEffect pour vérifier la disponibilité générale de l'espace
  useEffect(() => {
    const checkSpaceGeneralAvailability = async () => {
      if (selectedSpace === 'bureau-prive') {
        try {
          const availability = await checkGeneralSpaceAvailability('bureau-prive');
          setSpaceAvailability({
            isAvailable: availability.isAvailable,
            message: availability.message
          });
        } catch (error) {
          console.warn('Erreur lors de la vérification de disponibilité générale:', error);
          // En cas d'erreur, considérer comme disponible pour ne pas bloquer
          setSpaceAvailability({ isAvailable: true });
        }
      } else {
        // Pour les autres types d'espaces, considérer comme disponible
        setSpaceAvailability({ isAvailable: true });
      }
    };

    checkSpaceGeneralAvailability();
  }, [selectedSpace]);

  // Fonction pour sélectionner un espace
  const handleSpaceSelection = (spaceKey: string) => {
    setSelectedSpace(spaceKey);
    setShowSpaceSelection(false);
    setCurrentStep(1);
    setSelectedDates(null);
    setFormData(prev => ({
      ...prev,
      occupants: 1,
      subscriptionType: spaceKey === 'coworking' ? 'daily' : 'monthly'
    }));
  };

  // Fonction pour revenir à la sélection d'espace
  const handleBackToSpaceSelection = () => {
    setShowSpaceSelection(true);
    setCurrentStep(1);
  };

  // Fonction pour vérifier la disponibilité
  const checkAvailability = async (startDate: Date, endDate: Date) => {
    try {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const mappedSpaceType = mapSpaceType(selectedSpace || 'coworking');
      
      // Gestion d'erreur pour le service de disponibilité
      let result;
      try {
        result = await checkSpaceAvailability(mappedSpaceType, startDateStr, endDateStr);
      } catch (serviceError) {
        console.warn('Service de disponibilité non disponible, utilisation du fallback:', serviceError);
        // Fallback: considérer comme disponible
        result = {
          isAvailable: true,
          conflictingReservations: 0,
          maxCapacity: 4,
          message: 'Service temporairement indisponible, mais vous pouvez continuer votre réservation.'
        };
      }
      
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

  // Fonction pour gérer la sélection de dates
  const handleDateSelection = async (value: any) => {
    if (selectedSpace === 'coworking') {
      setSelectedDates(value);
      setAutoSelectDates(false);
      
      if (Array.isArray(value) && value.length === 2) {
        await checkAvailability(value[0], value[1]);
      }
    } else {
      if (value && !Array.isArray(value)) {
        const startDate = new Date(value);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        
        setSelectedDates([startDate, endDate]);
        setAutoSelectDates(true);
        await checkAvailability(startDate, endDate);
      } else if (Array.isArray(value) && value.length === 2) {
        setSelectedDates(value as [Date, Date]);
        setAutoSelectDates(false);
        await checkAvailability(value[0], value[1]);
      }
    }
  };

  // Fonction pour réinitialiser les dates
  const handleResetDates = () => {
    setSelectedDates(null);
    setAutoSelectDates(false);
    setAvailabilityError(null);
    setSuggestedDates([]);
  };

  // Fonction pour sélectionner une date suggérée
  const handleSuggestedDateSelect = async (suggestedDate: { start: string; end: string }) => {
    const startDate = new Date(suggestedDate.start);
    const endDate = new Date(suggestedDate.end);
    
    setSelectedDates([startDate, endDate]);
    setAutoSelectDates(false);
    setAvailabilityError(null);
    setSuggestedDates([]);
    
    await checkAvailability(startDate, endDate);
  };

  // Fonction pour calculer les jours sélectionnés
  const calculateSelectedDays = () => {
    if (!selectedDates) return 0;
    if (Array.isArray(selectedDates) && selectedDates.length === 2) {
      return calculateDaysBetween(selectedDates[0], selectedDates[1]);
    }
    return 1;
  };

  // Fonction pour calculer le prix total
  const calculateTotal = () => {
    if (!spaceInfo) return 0;
    
    if (!selectedDates) return 0;
    
    const days = calculateSelectedDays();
    
    if (selectedSpace === 'domiciliation') {
      return (spaceInfo.monthlyPrice || 0) * Math.ceil(days / 30);
    }
    
    if (Array.isArray(selectedDates) && selectedDates.length === 2) {
      const days = calculateSelectedDays();
      return calculateTotalPrice(days, formData.subscriptionType, {
        daily: spaceInfo.dailyPrice,
        monthly: spaceInfo.monthlyPrice,
        yearly: spaceInfo.yearlyPrice
      });
    }
    return 0;
  };

  // Traductions
  const translations = {
    fr: {
             title: "Réservation d'Offre",
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
        visa: 'Carte VISA',
        cash: "Paiement en espèces",
        total: 'Total à Payer',
        processing: 'Traitement en cours...',
        checking: 'Vérification du paiement en cours...',
        error: 'Erreur de paiement : ',
        success: 'Paiement réussi !',
        failed: 'Paiement Échoué',
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
        message: 'Votre réservation a été confirmée avec succès. Vous recevrez un email de confirmation.',
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
        message: 'Your reservation has been successfully confirmed. You will receive a confirmation email.',
        reference: 'Reference',
        invoice: {
          generated: 'Invoice generated successfully',
          generating: 'Generating invoice...',
          error: 'Error generating invoice',
          download: 'Download invoice'
        }
      },
    }
  };

  const t = translations[language];
  
  // États pour les informations d'espace
  const [spaceInfo, setSpaceInfo] = useState<any>(null);
  const [spaceInfoLoading, setSpaceInfoLoading] = useState(true);
  const [spaceInfoError, setSpaceInfoError] = useState<string | null>(null);

  // Charger les informations de l'espace sélectionné
  useEffect(() => {
    const loadSpaceInfo = async () => {
      try {
        setSpaceInfoLoading(true);
        setSpaceInfoError(null);
        
        // Importer SpaceDatabaseService pour charger uniquement depuis la base de données
        const { SpaceDatabaseService } = await import('../services/spaceDatabaseService');
        
        // Charger uniquement les données de la base de données
        const dbSpaces = await SpaceDatabaseService.loadFromDatabase(language);
        
        if (!dbSpaces || !dbSpaces[selectedSpace || 'coworking']) {
          console.log(`ℹ️ Espace ${selectedSpace} non trouvé en base de données`);
          setSpaceInfoError(`Espace ${selectedSpace} non configuré. Veuillez contacter l'administrateur.`);
          setSpaceInfo(null);
          return;
        }
        
        const info = dbSpaces[selectedSpace || 'coworking'];
        console.log(`✅ Informations de l'espace ${selectedSpace} chargées depuis la base de données`);
        setSpaceInfo(info);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des informations d\'espace:', error);
        setSpaceInfoError('Erreur lors du chargement des informations d\'espace');
        setSpaceInfo(null);
      } finally {
        setSpaceInfoLoading(false);
      }
    };

    loadSpaceInfo();
  }, [selectedSpace, language]);

  // Charger les options d'espaces depuis la base de données
  useEffect(() => {
    const loadSpaceOptions = async () => {
      try {
        setSpaceOptionsLoading(true);
        
        // Importer SpaceDatabaseService pour charger uniquement depuis la base de données
        const { SpaceDatabaseService } = await import('../services/spaceDatabaseService');
        
        // Charger uniquement les données de la base de données (pas de fusion avec les données par défaut)
        const dbSpaces = await SpaceDatabaseService.loadFromDatabase(language);
        
        if (!dbSpaces || Object.keys(dbSpaces).length === 0) {
          console.log('ℹ️ Aucun espace trouvé en base de données');
          setSpaceOptions([]);
          return;
        }
        
        // Convertir les espaces de la base de données en options pour l'affichage
        const options: SpaceOption[] = Object.entries(dbSpaces)
          .filter(([key, space]) => space.isAvailable !== false) // Filtrer les espaces indisponibles
          .map(([key, space]) => ({
            key,
            title: space.title,
            description: space.description,
            image: space.imageUrl || `/images/spaces/${key}.jpg`,
            price: space.dailyPrice > 0 
              ? `À partir de $${space.dailyPrice}/jour`
              : space.monthlyPrice > 0 
              ? `À partir de $${space.monthlyPrice}/mois`
              : 'Prix sur demande',
            capacity: space.maxOccupants > 1 
              ? `Jusqu'à ${space.maxOccupants} personnes`
              : 'Service individuel',
            available: true, // Par défaut disponible
            color: key === 'coworking' ? 'primary' : 
                   key === 'bureau-prive' || key === 'bureau_prive' ? 'nzoo-dark' : 
                   'primary-light'
          }));
        
        console.log(`✅ ${options.length} espaces chargés depuis la base de données`);
        setSpaceOptions(options);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des options d\'espaces:', error);
        // En cas d'erreur, utiliser des options minimales
        setSpaceOptions([]);
      } finally {
        setSpaceOptionsLoading(false);
      }
    };

    loadSpaceOptions();
  }, [language]);

  // Affichage de chargement
  if (spaceInfoLoading || spaceOptionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nzoo-dark mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-700">
                         {language === 'fr' ? 'Chargement des offres...' : 'Loading offers...'}
          </h1>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (spaceInfoError && !spaceInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {language === 'fr' ? 'Erreur de chargement' : 'Loading error'}
          </h1>
          <p className="mt-4 text-gray-600">
            {spaceInfoError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-nzoo-dark text-white rounded-lg hover:bg-nzoo-dark/80"
          >
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Vérifier qu'il y a des espaces disponibles
  if (spaceOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
                     <h1 className="text-2xl font-bold text-gray-600">
             {language === 'fr' ? 'Aucune offre disponible' : 'No offers available'}
           </h1>
           <p className="mt-4 text-gray-500">
             {language === 'fr' 
               ? 'Aucune offre n\'a été configurée. Veuillez contacter l\'administrateur.'
               : 'No offers have been configured. Please contact the administrator.'
             }
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-nzoo-dark text-white rounded-lg hover:bg-nzoo-dark/80"
          >
            {language === 'fr' ? 'Actualiser' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  // Fonction pour générer la facture
  const generateInvoiceAfterReservation = async (reservationData: any) => {
    try {
      setGeneratingInvoice(true);
      await generateAndDownloadReservationInvoice(reservationData);
      setInvoiceGenerated(true);
      console.log('✅ Facture générée avec succès');
    } catch (invoiceError) {
      console.error('❌ Erreur lors de la génération de la facture:', invoiceError);
    } finally {
      setGeneratingInvoice(false);
    }
  };

  // Fonction pour gérer les réservations en cash
  const handleCashPayment = async () => {
    if (!selectedDates) return;

    setReservationError(null);
    const cashTransactionId = `CASH_${Date.now()}`;

    try {
      const mappedSpaceType = mapSpaceType(selectedSpace || 'coworking');
      const startDateFormatted = selectedDates[0].toISOString().split('T')[0];
      const endDateFormatted = selectedDates[1].toISOString().split('T')[0];

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

      const result = await createReservation(reservationData);
      
      if (result.success) {
        setReservationSuccess(true);
        setEmailSent(result.emailSent || false);
        setCurrentStep(4);
      } else {
        throw new Error(result.error || 'Échec de la création de la réservation');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation';
      setReservationError(errorMessage);
    }
  };



  // Gestion principale des réservations
  const handleReservation = async () => {
    console.log('🔍 [DEBUG] handleReservation appelé');
    console.log('🔍 [DEBUG] selectedPaymentMethod:', selectedPaymentMethod);
    
    if (!selectedPaymentMethod) {
      console.log('❌ [DEBUG] Aucune méthode de paiement sélectionnée');
      return;
    }
    
    if (selectedPaymentMethod === 'CASH') {
      console.log('🔍 [DEBUG] Paiement en espèces, appel handleCashPayment');
      await handleCashPayment();
      return;
    }

    if (!spaceInfo) {
      console.log('❌ [DEBUG] spaceInfo manquant');
      setReservationError('Veuillez vérifier les informations de l\'offre');
      return;
    }

    if (!selectedDates) {
      console.log('❌ [DEBUG] selectedDates manquant');
      setReservationError('Veuillez sélectionner des dates');
      return;
    }

    try {
      console.log('🔍 [DEBUG] Préparation des données de réservation');
      const mappedSpaceType = mapSpaceType(selectedSpace || 'coworking');
      const startDateFormatted = selectedDates[0].toISOString().split('T')[0];
      const endDateFormatted = selectedDates[1].toISOString().split('T')[0];

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
        paymentMethod: selectedPaymentMethod,
        transactionId: `${selectedPaymentMethod.toUpperCase()}_${Date.now()}`,
      };

      console.log('🔍 [DEBUG] Données de réservation:', reservationData);

      // Paiement en espèces ou autres méthodes
      console.log('🔍 [DEBUG] Paiement standard (espèces)');
      
      const result = await createReservation(reservationData);
      
      if (result.success) {
        console.log('✅ [DEBUG] Réservation réussie');
        console.log('🔍 [DEBUG] result.emailSent:', result.emailSent);
        console.log('🔍 [DEBUG] result.clientEmailSent:', result.clientEmailSent);
        console.log('🔍 [DEBUG] result.adminEmailSent:', result.adminEmailSent);
        
        setReservationSuccess(true);
        setEmailSent(result.emailSent || false);
        setCurrentStep(4);
        
        console.log('✅ [DEBUG] États mis à jour:');
        console.log('  - setReservationSuccess(true)');
        console.log('  - setEmailSent(', result.emailSent || false, ')');
        console.log('  - setCurrentStep(4)');
      } else {
        console.log('❌ [DEBUG] Échec de la réservation:', result.error);
        throw new Error(result.error || 'Échec de la création de la réservation');
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erreur générale:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réservation';
      setReservationError(errorMessage);
    }
  };

  // Variables pour compatibilité
  const paymentLoading = false;
  const paymentProcessing = false;
  const transactionId = `RES_${Date.now()}`;

  // Fonctions de navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction de validation des étapes
  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return selectedDates !== null && spaceAvailability.isAvailable;
      case 2:
        return formData.fullName && formData.email && formData.phone && formData.activity && formData.activity.trim() !== '' && spaceAvailability.isAvailable;
      case 3:
        return selectedPaymentMethod !== null;
      default:
        return true;
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

    // Fonctions de rendu des étapes
  const renderStep1 = () => (
    <div className="space-y-12">
      {/* Section Information Offre */}
      <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-soft p-8 md:p-12 border border-primary-200 overflow-hidden relative">
        <div className="relative">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-nzoo rounded-2xl flex items-center justify-center mr-6 shadow-soft">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-nzoo-dark mb-2 font-heading">{spaceInfo?.title}</h3>
              <p className="text-primary-600 text-lg font-body">{spaceInfo?.description}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Équipements */}
            <div className="bg-white rounded-2xl p-8 shadow-soft border border-primary-200">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-soft">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-nzoo-dark font-heading">Équipements Inclus</h4>
              </div>
              <div className="space-y-4">
                {spaceInfo?.features.slice(0, 5).map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-primary-700 font-body">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prix et informations */}
            <div className="bg-gradient-nzoo rounded-2xl p-8 text-white shadow-soft">
              <h4 className="text-2xl font-bold mb-6 font-heading">Tarifs</h4>
              <div className="space-y-4">
                {spaceInfo?.dailyPrice && (
                  <div className="flex justify-between items-center">
                    <span className="font-body">Par jour</span>
                    <span className="font-bold">${spaceInfo.dailyPrice}</span>
                  </div>
                )}
                {spaceInfo?.monthlyPrice && (
                  <div className="flex justify-between items-center">
                    <span className="font-body">Par mois</span>
                    <span className="font-bold">${spaceInfo.monthlyPrice}</span>
                  </div>
                )}
                {spaceInfo?.yearlyPrice && (
                  <div className="flex justify-between items-center">
                    <span className="font-body">Par an</span>
                    <span className="font-bold">${spaceInfo.yearlyPrice}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Calendrier */}
      <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-soft p-8 md:p-12 border border-primary-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-nzoo rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-3xl font-bold text-nzoo-dark mb-4 font-heading">
            {t.form.dates}
          </h4>
          <p className="text-primary-600 font-body">
            Sélectionnez vos dates de réservation
          </p>
        </div>



        {/* Alerte de disponibilité pour les bureaux privés */}
        {selectedSpace === 'bureau-prive' && !spaceAvailability.isAvailable && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-soft">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-red-800 font-body">
                  Bureaux privés actuellement indisponibles
                </p>
                <p className="text-sm text-red-600 font-body">
                  {spaceAvailability.message || 'Tous les bureaux privés sont actuellement occupés. Veuillez réessayer plus tard.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations spéciales pour les services non-coworking */}
        {selectedSpace !== 'coworking' && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-300 rounded-2xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mt-1 shadow-soft">
                <Info className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-nzoo-dark mb-1 font-body">
                  {language === 'fr' 
                    ? "Sélection automatique d'un mois"
                    : "Automatic one-month selection"}
                </p>
                <p className="text-primary-700 font-body">
                  {language === 'fr'
                    ? "Sélectionnez une date de début, le système choisira automatiquement une période d'un mois."
                    : "Select a start date, the system will automatically choose a one-month period."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Calendrier */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-primary-200">
            <ReactCalendar
              onChange={handleDateSelection}
              selectRange={selectedSpace === 'coworking'}
              value={selectedDates}
              minDate={new Date()}
              className="rounded-2xl border-0 shadow-none"
            />
          </div>
        </div>

        {/* Loading state */}
        {availabilityLoading && (
          <div className="flex items-center justify-center p-6 bg-primary-50 rounded-2xl border border-primary-200">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mr-3"></div>
            <span className="text-primary-700 font-medium font-body">
              {language === 'fr' ? 'Vérification de la disponibilité...' : 'Checking availability...'}
            </span>
          </div>
        )}

        {/* Affichage de la période sélectionnée */}
        {selectedDates && !availabilityLoading && (
          <div className={`mt-6 p-6 rounded-2xl border ${
            availabilityError 
              ? 'border-red-200 bg-red-50' 
              : 'border-green-200 bg-green-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">
                  {Array.isArray(selectedDates) && selectedDates.length === 2 ? (
                    language === 'fr' 
                      ? `Période sélectionnée`
                      : `Selected period`
                  ) : (
                    language === 'fr' 
                      ? `Date sélectionnée`
                      : `Selected date`
                  )}
                </h5>
                <p className="text-gray-700">
                  {selectedDates && Array.isArray(selectedDates) && selectedDates.length === 2 ? (
                    `${selectedDates[0].toLocaleDateString('fr-FR')} - ${selectedDates[1].toLocaleDateString('fr-FR')}`
                  ) : (
                    language === 'fr' 
                      ? 'Aucune date sélectionnée'
                      : 'No date selected'
                  )}
                </p>
                <p className={`text-sm mt-2 ${
                  availabilityError ? 'text-red-600' : 'text-green-600'
                }`}>
                  {language === 'fr' 
                    ? `Durée : ${calculateSelectedDays()} jour${calculateSelectedDays() > 1 ? 's' : ''}`
                    : `Duration: ${calculateSelectedDays()} day${calculateSelectedDays() > 1 ? 's' : ''}`
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {autoSelectDates && (
                  <span className="text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                    {language === 'fr' ? "Auto-sélection" : "Auto-selected"}
                  </span>
                )}
                <button
                  onClick={handleResetDates}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
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
                    <p className="text-red-600 mb-3">
                      {language === 'fr' ? 'Périodes alternatives disponibles :' : 'Alternative periods available:'}
                    </p>
                    <div className="space-y-2">
                      {suggestedDates.map((suggestedDate, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedDateSelect(suggestedDate)}
                          className="w-full p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
                        >
                          <p className="font-medium text-green-800">
                            {new Date(suggestedDate.start).toLocaleDateString('fr-FR')} - {new Date(suggestedDate.end).toLocaleDateString('fr-FR')}
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
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-soft p-8 md:p-12 border border-primary-200 overflow-hidden relative">
      <div className="relative">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-nzoo-dark mb-4 font-heading">
            {t.steps.details}
          </h3>
          <p className="text-xl text-primary-700 leading-relaxed font-body">
            Remplissez vos informations pour finaliser votre réservation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
              {t.form.fullName} *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark placeholder-primary-400 font-body"
              placeholder="Votre nom complet"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
              {t.form.activity} *
            </label>
            <input
              type="text"
              name="activity"
              value={formData.activity}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark placeholder-primary-400 font-body"
              placeholder="Votre activité professionnelle"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
              {t.form.company}
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark placeholder-primary-400 font-body"
              placeholder="Nom de votre entreprise"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
              {t.form.phone} *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark placeholder-primary-400 font-body"
              placeholder="Votre numéro de téléphone"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
              {t.form.email} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark placeholder-primary-400 font-body"
              placeholder="Votre adresse email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
              {t.form.address}
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark placeholder-primary-400 font-body"
              placeholder="Votre adresse physique"
            />
          </div>
        </div>

        {/* Options supplémentaires */}
        {selectedSpace !== 'domiciliation' && (
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 border border-primary-200">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
                  {t.form.occupants}
                </label>
                <input
                  type="number"
                  name="occupants"
                  value={formData.occupants}
                  onChange={handleInputChange}
                  min="1"
                  max={currentMaxCapacity}
                  className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark font-body"
                />
                <p className="text-sm text-primary-600 mt-2 font-body">
                  Maximum: {currentMaxCapacity} {selectedSpace === 'coworking' ? 'personnes' : 'bureaux'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-nzoo-dark mb-3 font-body">
                  {t.form.subscriptionType}
                </label>
                <select
                  name="subscriptionType"
                  value={formData.subscriptionType}
                  onChange={handleInputChange}
                  disabled={selectedSpace !== 'coworking'}
                  className="block w-full rounded-xl border-2 border-primary-200 px-4 py-4 shadow-soft focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 text-nzoo-dark font-body"
                >
                  {selectedSpace === 'coworking' && <option value="daily">{t.form.daily}</option>}
                  <option value="monthly">{t.form.monthly}</option>
                  <option value="yearly">{t.form.yearly}</option>
                </select>
                {selectedSpace !== 'coworking' && (
                  <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-orange-700 text-sm font-medium font-body">
                      {language === 'fr' 
                        ? 'Abonnement mensuel automatique pour les bureaux privés et la domiciliation'
                        : 'Automatic monthly subscription for private offices and domiciliation'
                      }
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

  const renderStep3 = () => (
    <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-soft p-8 md:p-12 border border-primary-200 overflow-hidden relative">
      <div className="relative">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-nzoo rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-nzoo-dark mb-4 font-heading">
            {t.payment.title}
          </h3>
          <p className="text-xl text-primary-700 leading-relaxed font-body">
            Choisissez votre méthode de paiement préférée
          </p>
        </div>

        <div className="space-y-8">
                     {/* Méthodes de paiement */}
           <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">

            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('visa')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedPaymentMethod === 'visa'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">Carte VISA</h3>
                <p className="text-sm mt-1 opacity-80">
                  {language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
                </p>
              </div>
            </button>

            {/* Paiement en espèces */}
            <button
              type="button"
              onClick={() => setSelectedPaymentMethod('CASH')}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                selectedPaymentMethod === 'CASH'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Banknote className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">Espèces</h3>
                <p className="text-sm mt-1 opacity-80">
                  {language === 'fr' ? 'Paiement sur place' : 'On-site payment'}
                </p>
              </div>
            </button>
          </div>

          {/* Messages informatifs selon la méthode sélectionnée */}
          {selectedPaymentMethod && (
            <div className="mb-8 p-6 rounded-2xl border-2 backdrop-blur-sm">
              {selectedPaymentMethod === 'visa' && (
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-blue-700 text-center font-medium">
                    {language === 'fr'
                      ? "Vous avez choisi le paiement par carte VISA. Vous serez redirigé vers une page de paiement sécurisée."
                      : "You have chosen VISA card payment. You will be redirected to a secure payment page."}
                  </p>
                </div>
              )}
              

              
              {selectedPaymentMethod === 'CASH' && (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
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
           <div className="bg-gradient-nzoo rounded-2xl p-8 text-white shadow-soft">
             <div className="text-center">
               <h4 className="text-2xl font-bold mb-4 font-heading">{t.payment.total}</h4>
               <div className="text-4xl font-bold mb-4 font-heading">
                 ${calculateTotal().toFixed(2)}
               </div>
               <div className="mt-4 flex items-center justify-center space-x-2">
                 <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                 <span className="text-white/80 text-sm font-body">Paiement sécurisé</span>
                 <div className="w-2 h-2 bg-white/60 rounded-full"></div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl shadow-soft p-8 md:p-16 border border-primary-200 overflow-hidden relative">
      <div className="relative text-center space-y-12">
        {/* Animation de succès */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse shadow-soft">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-green-300 rounded-full animate-ping"></div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-nzoo-dark mb-6 font-heading">
            {t.success.title}
          </h2>
          <p className="text-xl text-primary-700 leading-relaxed max-w-2xl mx-auto font-body">
            {t.success.message}
          </p>
        </div>

        {/* Email de confirmation */}
        {emailSent && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <p className="text-green-700 font-semibold text-lg">
                {language === 'fr' ? 'Email de confirmation envoyé avec succès' : 'Confirmation email sent successfully'}
              </p>
            </div>
          </div>
        )}
        
                 {/* Référence de réservation */}
         <div className="bg-gradient-nzoo rounded-2xl p-8 text-white shadow-soft max-w-2xl mx-auto">
           <div className="space-y-4">
             <p className="text-white/80 text-lg font-medium font-body">Référence de votre réservation</p>
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
               <p className="text-2xl font-bold text-white font-mono tracking-wider">{transactionId}</p>
             </div>
             <p className="text-white/70 text-sm font-body">
               {language === 'fr' 
                 ? 'Conservez cette référence pour vos futurs échanges avec notre équipe.' 
                 : 'Keep this reference for future communications with our team.'}
             </p>
           </div>
         </div>

         {/* Bouton nouvelle réservation */}
         <button
           type="button"
           onClick={() => window.location.reload()}
           className="inline-flex items-center px-8 py-4 bg-gradient-nzoo text-white rounded-2xl font-bold text-lg hover:shadow-nzoo-hover transition-all duration-300 transform hover:scale-105 shadow-soft font-heading"
         >
           <span className="flex items-center space-x-2">
             <span>{t.buttons.newReservation}</span>
             <ArrowRight className="w-5 h-5" />
           </span>
         </button>
      </div>
    </div>
  );

    return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white font-sans">
      {/* Sélection d'espace - Version opérationnelle simplifiée */}
             {showSpaceSelection && (
         <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-12">
           <div className="container mx-auto px-4">
             {/* Bannière de sélection d'espace */}
             <section className="relative bg-gradient-to-r from-nzoo-dark via-primary-600 to-nzoo-dark py-12 mb-12 overflow-hidden rounded-3xl">
               {/* Éléments décoratifs de fond */}
               <div className="absolute inset-0">
                 <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                 <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>
               </div>

               <div className="relative z-10 text-center">
                 <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-6">
                   <Building className="w-5 h-5 text-white mr-2" />
                   <span className="text-white font-semibold font-poppins">
                     {language === 'fr' ? 'Sélection d\'offre' : 'Offer Selection'}
                   </span>
                 </div>
                 
                                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white font-heading">
                     {language === 'fr' ? 'Sélectionnez votre offre' : 'Select your offer'}
                   </h1>
                 
                                    <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 font-body">
                     {language === 'fr' 
                       ? 'Découvrez nos offres de travail modernes et choisissez celle qui correspond le mieux à vos besoins professionnels'
                       : 'Discover our modern work offers and choose the one that best suits your professional needs'
                     }
                   </p>

                 {/* Statistiques rapides */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                   <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                     <div className="text-2xl font-bold text-white font-heading">3</div>
                     <div className="text-white/80 text-sm font-body">
                       {language === 'fr' ? 'Types d\'offres' : 'Offer types'}
                     </div>
                   </div>
                   <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                     <div className="text-2xl font-bold text-white font-heading">24/7</div>
                     <div className="text-white/80 text-sm font-body">
                       {language === 'fr' ? 'Accès sécurisé' : 'Secure access'}
                     </div>
                   </div>
                   <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                     <div className="text-2xl font-bold text-white font-heading">100%</div>
                     <div className="text-white/80 text-sm font-body">
                       {language === 'fr' ? 'Équipements inclus' : 'Included equipment'}
                     </div>
                   </div>
                 </div>
               </div>
             </section>

             {/* Header opérationnel */}
             <div className="text-center mb-12">
               <div className="inline-flex items-center px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl border border-primary-200 shadow-soft mb-6">
                 <Building className="w-5 h-5 text-nzoo-dark mr-2" />
                 <span className="text-nzoo-dark font-semibold font-poppins">Sélection d'offre</span>
               </div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-nzoo-dark font-heading">
                   {language === 'fr' ? 'Nos offres disponibles' : 'Our available offers'}
                 </h2>
                                <p className="text-lg text-primary-600 max-w-2xl mx-auto font-body">
                   {language === 'fr' 
                     ? 'Choisissez l\'offre pour votre réservation'
                     : 'Choose the offer for your reservation'
                   }
                 </p>
             </div>

                         {/* Grille des offres - Version opérationnelle */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
               {spaceOptions.map((space) => (
                 <div
                   key={space.key}
                   className={`group bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-medium overflow-hidden cursor-pointer ${
                     space.available 
                       ? 'border-primary-200 hover:border-nzoo-dark shadow-soft' 
                       : 'border-primary-200 opacity-60 cursor-not-allowed'
                   }`}
                   onClick={() => space.available && handleSpaceSelection(space.key)}
                 >
                   {/* Image simplifiée */}
                   <div className="relative h-40 bg-primary-100">
                     <img
                       src={space.image}
                       alt={space.title}
                       className="w-full h-full object-cover"
                     />
                     {!space.available && (
                       <div className="absolute top-3 right-3">
                         <div className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-red-500">
                           {language === 'fr' ? 'Occupé' : 'Occupied'}
                         </div>
                       </div>
                     )}
                   </div>

                   <div className="p-6">
                     <h3 className="text-xl font-bold text-nzoo-dark mb-2 font-heading">
                       {space.title}
                     </h3>
                      
                     <p className="text-primary-600 text-sm mb-4 line-clamp-2 font-body">
                       {space.description}
                     </p>

                     <div className="space-y-2 mb-4">
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-primary-500 font-medium">{language === 'fr' ? 'Prix' : 'Price'}</span>
                         <span className="font-semibold text-nzoo-dark">{space.price}</span>
                       </div>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-primary-500 font-medium">{language === 'fr' ? 'Capacité' : 'Capacity'}</span>
                         <span className="font-semibold text-nzoo-dark">{space.capacity}</span>
                       </div>
                     </div>

                     {/* Bouton opérationnel */}
                     {space.available ? (
                       <button className="w-full py-3 px-4 bg-gradient-nzoo text-white rounded-xl font-semibold hover:shadow-nzoo-hover transition-all duration-300 transform hover:scale-105">
                         <span className="flex items-center justify-center space-x-2">
                           <span>{language === 'fr' ? 'Sélectionner' : 'Select'}</span>
                           <ArrowRight className="w-4 h-4" />
                         </span>
                       </button>
                     ) : (
                       <div className="w-full py-3 px-4 bg-primary-200 text-primary-600 rounded-xl font-semibold text-center">
                         {language === 'fr' ? 'Indisponible' : 'Unavailable'}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

             {/* Formulaire de réservation */}
       {!showSpaceSelection && (
         <>
                      {/* Header Section - Version opérationnelle */}
            <section className="relative bg-gradient-nzoo pt-24 pb-16 overflow-hidden">
                               {/* Background Image - Offres de travail modernes */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
                                     alt="Offres de travail modernes"
                  className="w-full h-full object-cover object-center scale-110 opacity-40 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {/* Overlay gradient pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-nzoo-dark/60 via-transparent to-nzoo-dark/60"></div>
              </div>

              {/* Éléments décoratifs de fond */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-nzoo-dark/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/20 to-nzoo-dark/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-nzoo-dark/10 to-transparent rounded-full blur-3xl"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-6">
                    <Calendar className="w-4 h-4 text-white mr-2" />
                    <span className="text-white/90 font-medium text-sm font-poppins">
                      {language === 'fr' ? 'Réservation en ligne' : 'Online reservation'}
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
                    {t.title}
                  </h1>
                  
                                     <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto font-body">
                     {language === 'fr' 
                       ? 'Réservez votre offre en quelques étapes'
                       : 'Book your offer in a few steps'
                     }
                   </p>
                  
                                     {/* Bouton retour à la sélection d'offre */}
                  <button
                    onClick={handleBackToSpaceSelection}
                    className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-sm font-poppins"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                                         {language === 'fr' ? 'Changer d\'offre' : 'Change offer'}
                  </button>
                </div>
              </div>
            </section>

            {/* Bannière Réservations et Paiements en ligne - Charte N'zoo Immo */}
            <section className="relative bg-gradient-nzoo py-12 overflow-hidden">
              {/* Éléments décoratifs de fond */}
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
              </div>

              <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between">
                  {/* Contenu textuel */}
                  <div className="text-center lg:text-left mb-8 lg:mb-0 lg:mr-12">
                    <div className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 mb-6 shadow-soft">
                      <CreditCard className="w-5 h-5 text-white mr-3" />
                      <span className="text-white font-semibold text-sm font-poppins">
                        {language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
                      {language === 'fr' 
                        ? 'Réservation et paiement en ligne'
                        : 'Online booking and payment'
                      }
                    </h2>
                    
                    <p className="text-white/90 text-lg max-w-2xl font-body leading-relaxed">
                      {language === 'fr'
                        ? 'Réservez votre offre en toute sécurité et payez en ligne avec nos méthodes de paiement fiables et sécurisées.'
                        : 'Book your offer securely and pay online with our reliable and secure payment methods.'
                      }
                    </p>

                    {/* Avantages */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/90 text-sm font-medium font-poppins">
                          {language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/90 text-sm font-medium font-poppins">
                          {language === 'fr' ? 'Traitement rapide' : 'Fast processing'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white/90 text-sm font-medium font-poppins">
                          {language === 'fr' ? 'Support 24/7' : '24/7 support'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Carte de paiement illustrative */}
                  <div className="relative">
                    <div className="w-56 h-36 md:w-72 md:h-44 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/25 p-6 flex items-center justify-center shadow-soft">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center shadow-soft">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center shadow-soft">
                            <Smartphone className="w-5 h-5 text-white" />
                          </div>
                          <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center shadow-soft">
                            <Banknote className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <p className="text-white/90 text-sm font-semibold font-poppins">
                          {language === 'fr' ? 'Méthodes de paiement multiples' : 'Multiple payment methods'}
                        </p>
                        <p className="text-white/70 text-xs mt-1 font-body">
                          {language === 'fr' ? 'Orange Money • Airtel Money • VISA • Espèces' : 'Orange Money • Airtel Money • VISA • Cash'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Badges de sécurité flottants */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">✓</span>
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-xs font-bold text-white">🔒</span>
                    </div>
                  </div>
                </div>

                {/* Barre de progression des étapes - Style N'zoo */}
                <div className="mt-10">
                  <div className="flex items-center justify-center space-x-6">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-soft ${
                          currentStep >= step 
                            ? 'bg-white text-nzoo-dark shadow-nzoo-hover' 
                            : 'bg-white/20 text-white/60 border border-white/30'
                        }`}>
                          {step}
                        </div>
                        {step < 4 && (
                          <div className={`w-12 h-1 mx-3 transition-all duration-300 rounded-full ${
                            currentStep > step ? 'bg-white shadow-soft' : 'bg-white/20'
                          }`}></div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-white/80 text-sm mt-3 font-body">
                    {language === 'fr' 
                      ? `Étape ${currentStep} sur 4 - ${t.steps[currentStep === 1 ? 'selection' : currentStep === 2 ? 'details' : currentStep === 3 ? 'payment' : 'confirmation']}`
                      : `Step ${currentStep} of 4 - ${t.steps[currentStep === 1 ? 'selection' : currentStep === 2 ? 'details' : currentStep === 3 ? 'payment' : 'confirmation']}`
                    }
                  </p>
                </div>
              </div>
            </section>

            <main className="relative -mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Conteneur principal - Version opérationnelle */}
              <div className="bg-white rounded-3xl shadow-strong border border-primary-200 overflow-hidden">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentStep === 3) {
                      handleReservation();
                    } else {
                      nextStep();
                    }
                  }}
                  className="p-6 md:p-8"
                >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                
                                                                   {/* Navigation - Version opérationnelle */}
                  {currentStep !== 4 && (
                    <div className="mt-8 flex justify-between items-center bg-gradient-nzoo-light p-6 rounded-2xl border border-primary-200">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={prevStep}
                          className="px-6 py-3 bg-white text-nzoo-dark border border-primary-300 rounded-xl hover:bg-primary-50 transition-all duration-300 font-medium font-poppins shadow-soft"
                          disabled={paymentProcessing}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{t.buttons.previous}</span>
                          </span>
                        </button>
                      )}
                      
                      {currentStep !== 3 && (
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-nzoo text-white rounded-xl hover:shadow-nzoo-hover disabled:opacity-50 transition-all duration-300 font-medium ml-auto font-poppins shadow-soft"
                          disabled={!validateStep(currentStep) || paymentLoading || !spaceAvailability.isAvailable}
                        >
                          <span className="flex items-center space-x-2">
                            <span>{t.buttons.next}</span>
                          </span>
                        </button>
                      )}
                      
                      {currentStep === 3 && (
                        <button
                          type="button"
                          onClick={handleReservation}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-nzoo-hover disabled:opacity-50 transition-all duration-300 font-medium ml-auto font-poppins shadow-soft"
                          disabled={paymentProcessing || paymentLoading || !selectedPaymentMethod || !spaceAvailability.isAvailable}
                        >
                          <span className="flex items-center space-x-2">
                            {paymentProcessing || paymentLoading ? (
                              <>
                                <span>{language === 'fr' ? 'Traitement...' : 'Processing...'}</span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {!spaceAvailability.isAvailable && selectedSpace === 'bureau-prive' 
                                    ? 'Bureaux indisponibles' 
                                    : selectedPaymentMethod === 'CASH' 
                                      ? t.buttons.reserve 
                                      : t.buttons.pay
                                  }
                                </span>
                              </>
                            )}
                          </span>
                        </button>
                      )}
                    </div>
                  )}
              </form>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default ReservationPage;