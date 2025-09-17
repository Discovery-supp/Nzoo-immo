import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, Calendar, Edit3, Save, X, Eye, EyeOff, Shield, Crown, Camera, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { getFormattedSpaceText } from '../utils/spaceDisplayHelper';

interface ClientProfilePageProps {
  language: 'fr' | 'en';
}

const ClientProfilePage: React.FC<ClientProfilePageProps> = ({ language }) => {
  const { user, isAuthenticated, isClient } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [clientReservations, setClientReservations] = useState<any[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  // État pour les informations modifiables
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    activity: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Charger les données du profil au montage du composant
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadClientReservations();
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        address: user.address || '',
        activity: user.activity || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  // Fonction pour charger le profil utilisateur
  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const result = await profileService.getProfile(user.id);
      if (result.success && result.user) {
        setUserProfile(result.user);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  // Fonction pour charger les réservations du client
  const loadClientReservations = async () => {
    if (!user) return;
    
    setReservationsLoading(true);
    try {
      const { ClientAccountService } = await import('../services/clientAccountService');
      
      // Récupérer les réservations par email (même si client_id n'est pas défini)
      const reservations = await ClientAccountService.getClientReservationsByEmail(user.email);
      setClientReservations(reservations);
      
      console.log('✅ Réservations client chargées:', reservations.length);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      setClientReservations([]);
    } finally {
      setReservationsLoading(false);
    }
  };

  // Fonction pour gérer les changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fonction pour sauvegarder les modifications
  const handleSave = async () => {
    if (!user) return;
    
    // Validation des mots de passe
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Préparer les données de mise à jour
      const updateData: any = {};
      
      if (formData.full_name !== user.full_name) updateData.full_name = formData.full_name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.phone !== user.phone) updateData.phone = formData.phone;
      if (formData.company !== user.company) updateData.company = formData.company;
      if (formData.address !== user.address) updateData.address = formData.address;
      if (formData.activity !== user.activity) updateData.activity = formData.activity;
      
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Mettre à jour le profil
      const result = await profileService.updateProfile(user.id, updateData);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setIsEditing(false);
        
        // Réinitialiser les champs de mot de passe
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Recharger les données utilisateur
        await loadUserProfile();
        
        // Mettre à jour l'état local
        if (result.user) {
          setUserProfile(result.user);
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour annuler les modifications
  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || '',
      address: user?.address || '',
      activity: user?.activity || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setMessage(null);
  };

  // Traductions
  const t = {
    fr: {
      title: 'Mon Profil',
      subtitle: 'Gérez vos informations personnelles et vos préférences',
      editProfile: 'Modifier le profil',
      personalInfo: 'Informations Personnelles',
      systemInfo: 'Informations Système',
      changePassword: 'Changer le mot de passe',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      edit: 'Modifier',
      memberSince: 'Membre depuis',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
      notProvided: 'Non renseigné',
      fullName: 'Nom complet',
      email: 'Adresse email',
      phone: 'Téléphone',
      company: 'Entreprise',
      address: 'Adresse',
      activity: 'Activité',
      currentPassword: 'Mot de passe actuel',
      newPassword: 'Nouveau mot de passe',
      confirmPassword: 'Confirmer le nouveau mot de passe',
      saveSuccess: 'Profil mis à jour avec succès',
      saveError: 'Erreur lors de la sauvegarde',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      saving: 'Sauvegarde...'
    },
    en: {
      title: 'My Profile',
      subtitle: 'Manage your personal information and preferences',
      editProfile: 'Edit Profile',
      personalInfo: 'Personal Information',
      systemInfo: 'System Information',
      changePassword: 'Change Password',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      memberSince: 'Member since',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      notProvided: 'Not provided',
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone',
      company: 'Company',
      address: 'Address',
      activity: 'Activity',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      saveSuccess: 'Profile updated successfully',
      saveError: 'Error saving profile',
      passwordMismatch: 'Passwords do not match',
      saving: 'Saving...'
    }
  };

  const translations = t[language];

  // Vérifier l'authentification et les permissions
  if (!isAuthenticated || !isClient()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'fr' ? 'Accès refusé' : 'Access Denied'}
          </h1>
          <p className="text-gray-600">
            {language === 'fr' 
              ? 'Vous devez être connecté en tant que client pour accéder à cette page.'
              : 'You must be logged in as a client to access this page.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header Section */}
      <section className="relative bg-gradient-nzoo pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
              {translations.title}
            </h1>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto font-body">
              {translations.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative -mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-strong border border-primary-200 overflow-hidden">
          <div className="p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-nzoo-dark mb-2 font-heading">
                  {userProfile?.full_name || user?.full_name || user?.username}
                </h2>
                <p className="text-primary-600 mb-3 font-body">
                  {userProfile?.email || user?.email}
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="ml-1">Client</span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-nzoo text-white rounded-xl hover:shadow-nzoo-hover transition-all duration-300 font-medium font-poppins shadow-soft"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {translations.editProfile}
              </button>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl p-6 border border-primary-200">
                <h3 className="text-lg font-bold text-nzoo-dark mb-4 font-heading flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {translations.personalInfo}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600 font-body">Email</p>
                      <p className="text-nzoo-dark font-medium">{userProfile?.email || user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600 font-body">{translations.phone}</p>
                      <p className="text-nzoo-dark font-medium">{userProfile?.phone || user?.phone || translations.notProvided}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600 font-body">{translations.company}</p>
                      <p className="text-nzoo-dark font-medium">{userProfile?.company || user?.company || translations.notProvided}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600 font-body">{translations.address}</p>
                      <p className="text-nzoo-dark font-medium">{userProfile?.address || user?.address || translations.notProvided}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600 font-body">{translations.activity}</p>
                      <p className="text-nzoo-dark font-medium">{userProfile?.activity || user?.activity || translations.notProvided}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="bg-gradient-to-br from-white to-primary-50 rounded-2xl p-6 border border-primary-200">
                <h3 className="text-lg font-bold text-nzoo-dark mb-4 font-heading flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {translations.systemInfo}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600 font-body">{translations.memberSince}</p>
                      <p className="text-nzoo-dark font-medium">
                        {new Date(userProfile?.created_at || user?.created_at).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm text-primary-600 font-body">{translations.status}</p>
                      <p className="text-nzoo-dark font-medium">
                        {userProfile?.is_active || user?.is_active ? translations.active : translations.inactive}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">{translations.title}</h2>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Message */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Profile Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">{translations.personalInfo}</h4>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>{translations.cancel}</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>{translations.edit}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.fullName}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userProfile?.full_name || user?.full_name || translations.notProvided}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.email}
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userProfile?.email || user?.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.phone}
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userProfile?.phone || user?.phone || translations.notProvided}</span>
                      </div>
                    )}
                  </div>

                  {/* Entreprise */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.company}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userProfile?.company || user?.company || translations.notProvided}</span>
                      </div>
                    )}
                  </div>

                  {/* Adresse */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.address}
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-start space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                        <span className="text-gray-900">{userProfile?.address || user?.address || translations.notProvided}</span>
                      </div>
                    )}
                  </div>

                  {/* Activité */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translations.activity}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="activity"
                        value={formData.activity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">{userProfile?.activity || user?.activity || translations.notProvided}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Client Reservations Section */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {translations.myReservations || 'Mes Réservations'}
                  </h5>
                  
                  {reservationsLoading ? (
                    <div className="text-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-500 mt-2">{translations.loading || 'Chargement...'}</p>
                    </div>
                  ) : clientReservations.length > 0 ? (
                    <div className="space-y-3">
                      {clientReservations.map((reservation, index) => (
                        <div key={reservation.id || index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {getFormattedSpaceText(reservation, 'Espace non spécifié')}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {reservation.status === 'confirmed' ? 'Confirmé' :
                                   reservation.status === 'pending' ? 'En attente' :
                                   reservation.status === 'cancelled' ? 'Annulé' :
                                   reservation.status}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>Du {new Date(reservation.start_date).toLocaleDateString('fr-FR')} au {new Date(reservation.end_date).toLocaleDateString('fr-FR')}</p>
                                <p>Montant: ${reservation.amount}</p>
                                {reservation.email !== user?.email && (
                                  <p className="text-xs text-blue-600 mt-1">
                                    Réservation avec l'email: {reservation.email}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(reservation.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>{translations.noReservations || 'Aucune réservation trouvée'}</p>
                    </div>
                  )}
                </div>

                {/* Change Password Section */}
                {isEditing && (
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">{translations.changePassword}</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translations.currentPassword}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translations.newPassword}
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {translations.confirmPassword}
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {translations.cancel}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>{translations.saving}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{translations.save}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientProfilePage;
