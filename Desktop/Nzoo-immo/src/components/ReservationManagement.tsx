import React, { useState, useEffect } from 'react';
import { Edit, Save, X, CheckCircle, XCircle, Clock, AlertCircle, Mail, Phone, Eye, Trash2, Lock, Shield, User, Send, MessageSquare, FileText, RefreshCw } from 'lucide-react';
import { useReservations } from '../hooks/useReservations';
import { useAuth } from '../hooks/useAuth';
import { ReservationEditForm } from './ReservationEditForm';
import { type Reservation } from '../types';
import { sendConfirmationEmail } from '../services/emailService';
import { generateAndDownloadInvoice } from '../services/invoiceService';
import { safeString } from '../utils/validation';
import { checkAndApplyReservationRules, getRulesSummary } from '../utils/reservationRules';


interface ReservationManagementProps {
  language: 'fr' | 'en';
}

const ReservationManagement: React.FC<ReservationManagementProps> = ({ language }) => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  
  // Log pour vérifier les données utilisateur
  console.log('👤 ReservationManagement - Données utilisateur:', { 
    user: user ? { email: user.email, role: user.role } : null,
    isAdmin: isAdmin(),
    authLoading 
  });

  const { reservations, loading, error, updateReservationStatus, updateReservation, deleteReservation } = useReservations(
    user ? { email: user.email, role: user.role } : undefined
  );

  // Log pour déboguer
  console.log('🔍 ReservationManagement - État:', {
    user: user ? { email: user.email, role: user.role } : null,
    reservationsCount: reservations?.length || 0,
    loading,
    error,
    authLoading
  });
  const [editingReservation, setEditingReservation] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Reservation>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const translations = {
    fr: {
      title: 'Gestion des Réservations',
      myReservations: 'Mes Réservations',
      search: 'Rechercher...',
      filter: 'Filtrer par statut',
      all: 'Toutes',
      pending: 'En attente',
      confirmed: 'Confirmées',
      cancelled: 'Annulées',
      completed: 'Terminées',
      edit: 'Modifier',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      view: 'Voir',
      contact: 'Contacter',
      status: 'Statut',
      client: 'Client',
      space: 'Espace',
      period: 'Période',
      amount: 'Montant',
      actions: 'Actions',
      noReservations: 'Aucune réservation trouvée',
      noMyReservations: 'Vous n\'avez pas encore de réservations',
      editReservation: 'Modifier la réservation',
      fullName: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      company: 'Entreprise',
      activity: 'Activité',
      occupants: 'Occupants',
      paymentMethod: 'Méthode de paiement',
      notes: 'Notes',
      adminNotes: 'Notes admin',
      restrictedAccess: 'Accès restreint - Seul le statut peut être modifié',
      adminOnly: 'Réservé aux administrateurs',
      currentUser: 'Utilisateur actuel',
      role: 'Rôle',

      adminAccess: 'Accès administrateur',
      userAccess: 'Accès utilisateur standard',
      permissionsInfo: 'Vos permissions',
      canModifyAll: 'Peut modifier tous les champs',
      canModifyStatus: 'Peut modifier uniquement le statut',
      userPermissionsNote: 'En tant qu\'utilisateur, vous pouvez consulter, modifier les statuts et contacter les clients',
      adminPermissionsNote: 'En tant qu\'administrateur, vous avez accès à toutes les fonctionnalités',
      saveSuccess: 'Réservation mise à jour avec succès',
      saveError: 'Erreur lors de la sauvegarde',
      statusUpdateSuccess: 'Statut mis à jour avec succès',
      statusUpdateError: 'Erreur lors du changement de statut',
      delete: 'Supprimer',
      deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette réservation ?',
      deleteSuccess: 'Réservation supprimée avec succès',
      deleteError: 'Erreur lors de la suppression',
      sendEmail: 'Envoyer un email',
      emailSuccess: 'Email envoyé avec succès',
      emailError: 'Erreur lors de l\'envoi de l\'email',
      callClient: 'Appeler le client',
      copyPhone: 'Copier le numéro',
      phoneCopied: 'Numéro copié dans le presse-papiers',
      confirmDelete: 'Confirmer la suppression',
      cancelDelete: 'Annuler',
      downloadInvoice: 'Télécharger Facture',
      invoiceGenerating: 'Génération...',
      invoiceGenerated: 'Facture générée',
      confirmedOnly: 'Seules les réservations confirmées peuvent générer une facture',



    },
    en: {
      title: 'Reservation Management',
      myReservations: 'My Reservations',
      search: 'Search...',
      filter: 'Filter by status',
      all: 'All',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      view: 'View',
      contact: 'Contact',
      status: 'Status',
      client: 'Client',
      space: 'Space',
      period: 'Period',
      amount: 'Amount',
      actions: 'Actions',
      noReservations: 'No reservations found',
      noMyReservations: 'You don\'t have any reservations yet',
      editReservation: 'Edit reservation',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      activity: 'Activity',
      occupants: 'Occupants',
      paymentMethod: 'Payment method',
      notes: 'Notes',
      adminNotes: 'Admin notes',
      restrictedAccess: 'Restricted access - Only status can be modified',
      adminOnly: 'Admin only',
      currentUser: 'Current user',
      role: 'Role',

      adminAccess: 'Administrator access',
      userAccess: 'Standard user access',
      permissionsInfo: 'Your permissions',
      canModifyAll: 'Can modify all fields',
      canModifyStatus: 'Can only modify status',
      userPermissionsNote: 'As a user, you can view, modify statuses and contact clients',
      adminPermissionsNote: 'As an administrator, you have access to all features',
      saveSuccess: 'Reservation updated successfully',
      saveError: 'Error while saving',
      statusUpdateSuccess: 'Status updated successfully',
      statusUpdateError: 'Error while updating status',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this reservation?',
      deleteSuccess: 'Reservation deleted successfully',
      deleteError: 'Error while deleting',
      sendEmail: 'Send email',
      emailSuccess: 'Email sent successfully',
      emailError: 'Error while sending email',
      callClient: 'Call client',
      copyPhone: 'Copy phone number',
      phoneCopied: 'Phone number copied to clipboard',
      confirmDelete: 'Confirm deletion',
      cancelDelete: 'Cancel',
      downloadInvoice: 'Download Invoice',
      invoiceGenerating: 'Generating...',
      invoiceGenerated: 'Invoice generated',
      confirmedOnly: 'Only confirmed reservations can generate an invoice',



    }
  };

  const t = translations[language];

  // Fonction pour vérifier et mettre à jour automatiquement les statuts selon les règles documentées
  const checkAndUpdateReservationStatuses = async () => {
    try {
      const result = await checkAndApplyReservationRules(reservations, updateReservationStatus);
      
      if (result.updatedCount > 0) {
        const message = `${result.updatedCount} réservation(s) mises à jour automatiquement`;
        showNotification('info', message);
      }
      
      if (result.errors.length > 0) {
        console.error('Erreurs lors de la mise à jour automatique:', result.errors);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification automatique des statuts:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSpaceType = (spaceType: string) => {
    const types = {
      'coworking': 'Coworking',
      'bureau-prive': 'Bureau Privé',
      'salle-reunion': 'Salle Réunion'
    };
    return types[spaceType as keyof typeof types] || spaceType;
  };

  const handleEdit = (reservation: Reservation) => {
    // Vérifier que l'utilisateur est admin
    if (user?.role !== 'admin') {
      showNotification('error', t.adminOnly);
      return;
    }
    
    setEditingReservation(reservation.id);
    setEditFormData({
      full_name: reservation.full_name,
      email: reservation.email,
      phone: reservation.phone,
      company: reservation.company || '',
      activity: reservation.activity,
      occupants: reservation.occupants,
      amount: reservation.amount,
      status: reservation.status,
      payment_method: reservation.payment_method,
      notes: reservation.notes || '',
      admin_notes: reservation.admin_notes || ''
    });
  };

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Fonction pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSave = async () => {
    if (!editingReservation) return;
    
    try {
      // Si l'utilisateur n'est pas admin, on ne sauvegarde que le statut
      const dataToSave = user?.role === 'admin' ? editFormData : { status: editFormData.status };
      
      await updateReservation(editingReservation, dataToSave);
      showNotification('success', t.saveSuccess);
      setEditingReservation(null);
      setEditFormData({});
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showNotification('error', t.saveError + ': ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const handleCancel = () => {
    setEditingReservation(null);
    setEditFormData({});
  };

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      await updateReservationStatus(reservationId, newStatus);
      showNotification('success', t.statusUpdateSuccess);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      showNotification('error', t.statusUpdateError);
    }
  };

  // Fonction pour supprimer une réservation
  const handleDelete = async (reservationId: string) => {
    // Vérifier que l'utilisateur est admin
    if (user?.role !== 'admin') {
      showNotification('error', t.adminOnly);
      setShowDeleteConfirm(null);
      return;
    }
    
    try {
      await deleteReservation(reservationId);
      showNotification('success', t.deleteSuccess);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showNotification('error', t.deleteError + ': ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  // Fonction pour envoyer un email
  const handleSendEmail = async (reservation: Reservation) => {
    setSendingEmail(reservation.id);
    try {
      const emailResult = await sendConfirmationEmail({
        to: reservation.email,
        subject: `Mise à jour de votre réservation - ${reservation.full_name}`,
        reservationData: {
          fullName: reservation.full_name,
          email: reservation.email,
          phone: reservation.phone,
          company: reservation.company || undefined,
          activity: reservation.activity || '',
          spaceType: reservation.space_type,
          startDate: reservation.start_date,
          endDate: reservation.end_date,
          amount: reservation.amount,
          transactionId: reservation.id,
          status: reservation.status
        }
      });

      if (emailResult.emailSent) {
        showNotification('success', t.emailSuccess);
      } else {
        showNotification('error', t.emailError + ': ' + (emailResult.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      showNotification('error', t.emailError + ': ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setSendingEmail(null);
    }
  };

  // Fonction pour copier le numéro de téléphone
  const handleCopyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      showNotification('success', t.phoneCopied);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      showNotification('error', 'Erreur lors de la copie du numéro');
    }
  };

  // Fonction pour appeler le client
  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  // Fonction pour télécharger la facture d'une réservation
  const handleDownloadInvoice = async (reservation: Reservation) => {
    setDownloadingInvoice(reservation.id);
    try {
      await generateAndDownloadInvoice(reservation);
      showNotification('success', t.invoiceGenerated);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la facture:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du téléchargement de la facture';
      showNotification('error', errorMessage);
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      reservation.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Erreur de chargement</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-700' 
            : notification.type === 'error'
            ? 'bg-red-50 border-red-400 text-red-700'
            : 'bg-blue-50 border-blue-400 text-blue-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'clients' ? 'Mes Réservations' : t.title}
          </h2>
          <p className="text-gray-600">
            {user?.role === 'clients' 
              ? 'Consultez et gérez vos réservations personnelles' 
              : 'Gérez les réservations selon vos permissions'
            }
          </p>
          {user?.role === 'clients' && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <User className="w-3 h-3 mr-1" />
                Vos réservations uniquement
              </span>
              <span className="text-sm text-gray-500">
                {reservations.length} réservation{reservations.length > 1 ? 's' : ''} trouvée{reservations.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        {/* Bouton de vérification manuelle des statuts */}
        <div className="flex items-center space-x-3">
          <button
            onClick={checkAndUpdateReservationStatuses}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            title="Vérifier et mettre à jour automatiquement les statuts des réservations"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {language === 'fr' ? 'Vérifier Statuts' : 'Check Statuses'}
            </span>
          </button>
        </div>
        
        {/* User Permissions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              {user?.role === 'clients' ? 'Vos Accès' : t.permissionsInfo}
            </h3>
            {user?.role === 'admin' ? (
              <div className="flex items-center text-green-600">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">ADMIN</span>
              </div>
            ) : user?.role === 'clients' ? (
              <div className="flex items-center text-blue-600">
                <User className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">CLIENT</span>
              </div>
            ) : (
              <div className="flex items-center text-blue-600">
                <User className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">{user?.role?.toUpperCase() || 'USER'}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t.currentUser}:</span>
              <span className="font-medium">{user?.full_name || user?.username || user?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{t.role}:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-green-100 text-green-800' 
                  : user?.role === 'clients'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className={`flex items-center text-xs ${
                user?.role === 'admin' ? 'text-green-600' : user?.role === 'clients' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {user?.role === 'admin' ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t.adminPermissionsNote}
                  </>
                ) : user?.role === 'clients' ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vous pouvez consulter et gérer vos propres réservations
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {t.userPermissionsNote}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-40"
            >
              <option value="all">{t.all}</option>
              <option value="pending">{t.pending}</option>
              <option value="confirmed">{t.confirmed}</option>
              <option value="completed">{t.completed}</option>
              <option value="cancelled">{t.cancelled}</option>
            </select>
          </div>
        </div>
      </div>



      {/* Reservations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">
              {user?.role === 'clients' ? t.noMyReservations : t.noReservations}
            </p>
            {user?.role === 'clients' && (
              <p className="text-sm text-gray-400 mt-2">
                Créez votre première réservation pour commencer
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user?.role === 'clients' ? 'Mes Informations' : t.client}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.space}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.period}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.amount}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.status}</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.full_name}</div>
                        <div className="text-sm text-gray-500">{reservation.email}</div>
                        <div className="text-sm text-gray-500">{reservation.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatSpaceType(reservation.space_type)}</div>
                      <div className="text-sm text-gray-500">{reservation.occupants} personnes</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(reservation.start_date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${reservation.amount}</div>
                      <div className="text-sm text-gray-500">{reservation.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value as Reservation['status'])}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:shadow-sm transition-shadow ${getStatusColor(reservation.status)}`}
                      >
                        <option value="pending">{t.pending}</option>
                        <option value="confirmed">{t.confirmed}</option>
                        <option value="completed">{t.completed}</option>
                        <option value="cancelled">{t.cancelled}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Boutons visibles pour tous les utilisateurs */}
                        <button 
                          onClick={() => handleSendEmail(reservation)}
                          disabled={sendingEmail === reservation.id}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                          title={t.sendEmail}
                        >
                          {sendingEmail === reservation.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleCallClient(reservation.phone)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                          title={t.callClient}
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleCopyPhone(reservation.phone)}
                          className="text-purple-600 hover:text-purple-900 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title={t.copyPhone}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        
                        {/* Boutons réservés aux administrateurs uniquement */}
                        {user?.role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleEdit(reservation)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title={t.edit}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadInvoice(reservation)}
                              disabled={downloadingInvoice === reservation.id || reservation.status !== 'confirmed'}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                reservation.status === 'confirmed'
                                  ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title={reservation.status === 'confirmed' ? t.downloadInvoice : t.confirmedOnly}
                            >
                              {downloadingInvoice === reservation.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(reservation.id)}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title={t.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingReservation && (
        <ReservationEditForm
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          onCancel={handleCancel}
          onSave={handleSave}
          isAdmin={isAdmin()}
          language={language}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">{t.delete}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t.deleteConfirm}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t.cancelDelete}
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagement;