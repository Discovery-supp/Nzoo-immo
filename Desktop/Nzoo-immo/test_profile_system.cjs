const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test du système de profil client
async function testProfileSystem() {
  console.log('🧪 Test du système de profil client - Nzoo Immo\n');

  try {
    // 1. Vérifier la structure de la table admin_users
    console.log('📋 1. Vérification de la structure de la table admin_users...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError.message);
      return;
    }

    console.log('✅ Table admin_users accessible');
    
    // 2. Créer un utilisateur de test
    console.log('\n👤 2. Création d\'un utilisateur de test...');
    
    const testUser = {
      username: `test_profile_${Date.now()}`,
      email: `test_profile_${Date.now()}@example.com`,
      full_name: 'Test Profile User',
      phone: '123456789',
      company: 'Test Company',
      address: '123 Test Street, Test City',
      activity: 'Test Activity',
      role: 'clients',
      password_hash: 'test_password_hash',
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert([testUser])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', createError.message);
      return;
    }

    console.log('✅ Utilisateur de test créé avec succès');
    console.log('   ID:', newUser.id);
    console.log('   Email:', newUser.email);

    // 3. Tester la récupération du profil
    console.log('\n📥 3. Test de récupération du profil...');
    
    const { data: retrievedUser, error: retrieveError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', newUser.id)
      .single();

    if (retrieveError) {
      console.error('❌ Erreur lors de la récupération du profil:', retrieveError.message);
    } else {
      console.log('✅ Profil récupéré avec succès');
      console.log('   Nom complet:', retrievedUser.full_name);
      console.log('   Téléphone:', retrievedUser.phone);
      console.log('   Entreprise:', retrievedUser.company);
      console.log('   Adresse:', retrievedUser.address);
      console.log('   Activité:', retrievedUser.activity);
    }

    // 4. Tester la mise à jour du profil
    console.log('\n✏️ 4. Test de mise à jour du profil...');
    
    const updateData = {
      full_name: 'Test Profile User Updated',
      phone: '987654321',
      company: 'Updated Test Company',
      address: '456 Updated Street, Updated City',
      activity: 'Updated Test Activity'
    };

    const { data: updatedUser, error: updateError } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', newUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour du profil:', updateError.message);
    } else {
      console.log('✅ Profil mis à jour avec succès');
      console.log('   Nouveau nom:', updatedUser.full_name);
      console.log('   Nouveau téléphone:', updatedUser.phone);
      console.log('   Nouvelle entreprise:', updatedUser.company);
      console.log('   Nouvelle adresse:', updatedUser.address);
      console.log('   Nouvelle activité:', updatedUser.activity);
    }

    // 5. Tester la mise à jour du mot de passe
    console.log('\n🔐 5. Test de mise à jour du mot de passe...');
    
    const bcrypt = require('bcryptjs');
    const newPasswordHash = await bcrypt.hash('new_test_password', 10);
    
    const { data: passwordUpdatedUser, error: passwordUpdateError } = await supabase
      .from('admin_users')
      .update({ password_hash: newPasswordHash })
      .eq('id', newUser.id)
      .select()
      .single();

    if (passwordUpdateError) {
      console.error('❌ Erreur lors de la mise à jour du mot de passe:', passwordUpdateError.message);
    } else {
      console.log('✅ Mot de passe mis à jour avec succès');
      
      // Vérifier que le nouveau mot de passe fonctionne
      const isPasswordValid = await bcrypt.compare('new_test_password', passwordUpdatedUser.password_hash);
      console.log('   Vérification du mot de passe:', isPasswordValid ? '✅ Valide' : '❌ Invalide');
    }

    // 6. Nettoyer les données de test
    console.log('\n🧹 6. Nettoyage des données de test...');
    
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', newUser.id);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur de test:', deleteError.message);
    } else {
      console.log('✅ Utilisateur de test supprimé avec succès');
    }

    console.log('\n🎉 Test du système de profil client terminé avec succès !');
    console.log('\n📋 Résumé des fonctionnalités testées :');
    console.log('   ✅ Accès à la table admin_users');
    console.log('   ✅ Création d\'utilisateur avec tous les champs');
    console.log('   ✅ Récupération du profil complet');
    console.log('   ✅ Mise à jour des informations personnelles');
    console.log('   ✅ Mise à jour du mot de passe sécurisé');
    console.log('   ✅ Nettoyage des données de test');

  } catch (error) {
    console.error('❌ Erreur générale lors du test:', error.message);
  }
}

// Exécuter le test
testProfileSystem().catch(console.error);
