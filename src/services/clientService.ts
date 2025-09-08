import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmailWithCredentials } from './emailServiceUnified';

// Interface pour les données d'inscription client
export interface ClientSignupData {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  password: string;
}

// Interface pour les données de connexion client
export interface ClientLoginData {
  email: string;
  password: string;
}

// Interface pour l'utilisateur client
export interface ClientUser {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  company?: string;
  created_at: string;
  is_active: boolean;
}

// Fonction pour hasher le mot de passe
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Fonction pour vérifier le mot de passe
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Fonction pour inscrire un nouveau client
export const signupClient = async (data: ClientSignupData): Promise<ClientUser> => {
  try {
    console.log('👤 [CLIENT] Début inscription client:', data.email);

    // Vérifier si l'email existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', data.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Erreur lors de la vérification de l\'email');
    }

    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Créer un nom d'utilisateur basé sur l'email
    const username = data.email.split('@')[0] + '_' + Date.now();

    // Hasher le mot de passe
    const passwordHash = await hashPassword(data.password);

    // Insérer le nouveau client dans la base de données
    const { data: newUser, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        username: username,
        email: data.email,
        password_hash: passwordHash,
        role: 'clients', // Rôle spécifique pour les clients
        full_name: data.fullName,
        phone: data.phone,
        company: data.company || null,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ [CLIENT] Erreur lors de l\'insertion:', insertError);
      throw new Error('Erreur lors de la création du compte');
    }

    console.log('✅ [CLIENT] Compte client créé avec succès:', newUser.id);

    // Envoyer l'email de bienvenue
    try {
      console.log('📧 [CLIENT] Envoi email de bienvenue...');
      const emailResult = await sendWelcomeEmailWithCredentials({
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        company: data.company,
        password: data.password // Envoyer le mot de passe en clair pour l'email
      });

      if (emailResult.success) {
        console.log('✅ [CLIENT] Email de bienvenue envoyé avec succès');
      } else {
        console.warn('⚠️ [CLIENT] Email de bienvenue non envoyé:', emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ [CLIENT] Erreur envoi email de bienvenue:', emailError);
      // L'email n'est pas critique, on continue
    }

    // Retourner les données du client (sans le mot de passe)
    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name,
      phone: newUser.phone,
      company: newUser.company,
      created_at: newUser.created_at,
      is_active: newUser.is_active
    };

  } catch (error) {
    console.error('❌ [CLIENT] Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// Fonction pour connecter un utilisateur (client, admin, ou user)
export const loginClient = async (data: ClientLoginData): Promise<ClientUser> => {
  try {
    console.log('🔐 [CLIENT] Tentative de connexion:', data.email);

    // Récupérer l'utilisateur par email (tous les rôles)
    const { data: user, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', data.email)
      .single();

    if (fetchError) {
      throw new Error('Email ou mot de passe incorrect');
    }

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    if (!user.is_active) {
      throw new Error('Compte désactivé. Contactez l\'administrateur.');
    }

    // Vérifier le mot de passe selon le type de stockage
    let isPasswordValid = false;
    
    // Pour les anciens utilisateurs (admin, user) - mots de passe en texte brut
    if (user.role === 'admin' || user.role === 'user') {
      isPasswordValid = user.password_hash === data.password;
    } else {
      // Pour les nouveaux clients - mots de passe hashés avec bcrypt
      isPasswordValid = await verifyPassword(data.password, user.password_hash);
    }

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    console.log('✅ [CLIENT] Connexion réussie:', user.email);

    // Retourner les données de l'utilisateur (sans le mot de passe)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      phone: user.phone,
      company: user.company,
      created_at: user.created_at,
      is_active: user.is_active
    };

  } catch (error) {
    console.error('❌ [CLIENT] Erreur lors de la connexion:', error);
    throw error;
  }
};

// Fonction pour récupérer tous les clients
export const getAllClients = async (): Promise<ClientUser[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('role', 'clients')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
};

// Fonction pour récupérer un client par ID
export const getClientById = async (id: string): Promise<ClientUser | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .eq('role', 'clients')
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du client:', error);
    throw error;
  }
};
