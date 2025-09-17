import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  activity?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  message: string;
  user?: any;
}

class ProfileService {
  // Mettre à jour les informations du profil
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<ProfileUpdateResult> {
    try {
      console.log('🔄 Mise à jour du profil pour l\'utilisateur:', userId);
      
      // Préparer les données à mettre à jour
      const updateData: any = {};
      
      if (data.full_name) updateData.full_name = data.full_name;
      if (data.email) updateData.email = data.email;
      if (data.phone) updateData.phone = data.phone;
      if (data.company) updateData.company = data.company;
      if (data.address) updateData.address = data.address;
      if (data.activity) updateData.activity = data.activity;

      // Si un nouveau mot de passe est fourni, vérifier l'ancien et le hasher
      if (data.newPassword && data.currentPassword) {
        // Récupérer l'utilisateur actuel pour vérifier le mot de passe
        const { data: currentUser, error: fetchError } = await supabase
          .from('admin_users')
          .select('password_hash, role')
          .eq('id', userId)
          .single();

        if (fetchError) {
          throw new Error('Erreur lors de la récupération des données utilisateur');
        }

        // Vérifier le mot de passe actuel
        let isCurrentPasswordValid = false;
        
        if (currentUser.role === 'admin' || currentUser.role === 'user') {
          // Pour les anciens utilisateurs (admin, user) - mots de passe en texte brut
          isCurrentPasswordValid = currentUser.password_hash === data.currentPassword;
        } else {
          // Pour les nouveaux clients - mots de passe hashés avec bcrypt
          isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, currentUser.password_hash);
        }

        if (!isCurrentPasswordValid) {
          return {
            success: false,
            message: 'Le mot de passe actuel est incorrect'
          };
        }

        // Hasher le nouveau mot de passe
        const newPasswordHash = await bcrypt.hash(data.newPassword, 10);
        updateData.password_hash = newPasswordHash;
      }

      // Mettre à jour l'utilisateur
      const { data: updatedUser, error: updateError } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      console.log('✅ Profil mis à jour avec succès');
      
      return {
        success: true,
        message: 'Profil mis à jour avec succès',
        user: updatedUser
      };

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil'
      };
    }
  }

  // Upload d'avatar
  async uploadAvatar(userId: string, file: File): Promise<ProfileUpdateResult> {
    try {
      console.log('🖼️ Upload d\'avatar pour l\'utilisateur:', userId);
      
      // Vérifier d'abord si le bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Erreur lors de la vérification des buckets:', bucketsError);
        throw new Error('Impossible d\'accéder au storage Supabase');
      }

      const userAvatarsBucket = buckets?.find(b => b.name === 'user-avatars');
      
      if (!userAvatarsBucket) {
        console.error('Le bucket "user-avatars" n\'existe pas');
        throw new Error('Le bucket de storage pour les avatars n\'est pas configuré. Veuillez créer le bucket "user-avatars" dans Supabase Storage.');
      }

      // Vérifier la taille du fichier (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Le fichier est trop volumineux. Taille maximum : 5MB');
      }

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non supporté. Formats acceptés : JPEG, PNG, GIF, WebP');
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${userId}_avatar_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log('📤 Tentative d\'upload vers:', filePath);

      // Upload du fichier vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erreur lors de l\'upload:', uploadError);
        
        // Messages d'erreur plus spécifiques
        if (uploadError.message.includes('bucket')) {
          throw new Error('Bucket de storage non trouvé. Veuillez créer le bucket "user-avatars" dans Supabase.');
        } else if (uploadError.message.includes('permission')) {
          throw new Error('Permissions insuffisantes. Vérifiez les politiques RLS du bucket.');
        } else if (uploadError.message.includes('duplicate')) {
          throw new Error('Un fichier avec ce nom existe déjà. Veuillez réessayer.');
        } else {
          throw new Error(`Erreur lors de l'upload : ${uploadError.message}`);
        }
      }

      console.log('✅ Fichier uploadé avec succès');

      // Obtenir l'URL publique du fichier
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      console.log('🔗 URL publique générée:', publicUrl);

      // Mettre à jour l'URL de l'avatar dans la base de données
      const { data: updatedUser, error: updateError } = await supabase
        .from('admin_users')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'avatar:', updateError);
        throw new Error('Erreur lors de la mise à jour de l\'avatar dans la base de données');
      }

      console.log('✅ Avatar mis à jour avec succès dans la base de données');
      
      return {
        success: true,
        message: 'Avatar mis à jour avec succès',
        user: updatedUser
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'upload de l\'avatar:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'avatar'
      };
    }
  }

  // Supprimer l'avatar
  async deleteAvatar(userId: string): Promise<ProfileUpdateResult> {
    try {
      console.log('🗑️ Suppression d\'avatar pour l\'utilisateur:', userId);
      
      // Récupérer l'URL de l'avatar actuel
      const { data: currentUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (fetchError) {
        throw new Error('Erreur lors de la récupération des données utilisateur');
      }

      if (currentUser.avatar_url) {
        // Extraire le chemin du fichier depuis l'URL
        const urlParts = currentUser.avatar_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `avatars/${fileName}`;

        // Supprimer le fichier du storage
        const { error: deleteError } = await supabase.storage
          .from('user-avatars')
          .remove([filePath]);

        if (deleteError) {
          console.error('Erreur lors de la suppression du fichier:', deleteError);
        }
      }

      // Mettre à jour la base de données pour supprimer l'URL de l'avatar
      const { data: updatedUser, error: updateError } = await supabase
        .from('admin_users')
        .update({ avatar_url: null })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error('Erreur lors de la mise à jour de l\'avatar');
      }

      console.log('✅ Avatar supprimé avec succès');
      
      return {
        success: true,
        message: 'Avatar supprimé avec succès',
        user: updatedUser
      };

    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'avatar:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'avatar'
      };
    }
  }

  // Récupérer les informations du profil
  async getProfile(userId: string): Promise<ProfileUpdateResult> {
    try {
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      return {
        success: true,
        message: 'Profil récupéré avec succès',
        user: user
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération du profil:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération du profil'
      };
    }
  }
}

export const profileService = new ProfileService();
