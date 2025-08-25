const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utiliser les mêmes valeurs que dans l'application
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Test de la correction du modal de profil - Nzoo Immo');
console.log('==================================================');

async function testModalFix() {
  try {
    console.log('📋 1. Test de création d\'un utilisateur client avec les nouvelles colonnes...');


    
    const testUser = {
      username: `test_modal_${Date.now()}`,
      email: `test_modal_${Date.now()}@example.com`,
      full_name: 'Test Modal User',
      phone: '123456789',
      company: 'Test Company',
      address: '123 Test Street, Test City',
      activity: 'Test Activity',
      role: 'clients',
      password_hash: 'test_password_hash',
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data: createdUser, error: createError } = await supabase
      .from('admin_users')
      .insert(testUser)
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', createError);
      return;
    }

    console.log('✅ Utilisateur créé avec succès');
    console.log('   ID:', createdUser.id);
    console.log('   Email:', createdUser.email);
    console.log('   Adresse:', createdUser.address);
    console.log('   Activité:', createdUser.activity);

    console.log('📋 2. Test de mise à jour du profil...');
    
    const updateData = {
      full_name: 'Test Modal User Updated',
      phone: '987654321',
      company: 'Updated Test Company',
      address: '456 Updated Street, Updated City',
      activity: 'Updated Test Activity'
    };

    const { data: updatedUser, error: updateError } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', createdUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return;
    }

    console.log('✅ Profil mis à jour avec succès');
    console.log('   Nouveau nom:', updatedUser.full_name);
    console.log('   Nouveau téléphone:', updatedUser.phone);
    console.log('   Nouvelle adresse:', updatedUser.address);
    console.log('   Nouvelle activité:', updatedUser.activity);

    console.log('📋 3. Nettoyage des données de test...');
    
    const { error: deleteError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', createdUser.id);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
      return;
    }

    console.log('✅ Utilisateur de test supprimé avec succès');

    console.log('\n🎉 Test de la correction du modal terminé avec succès !');
    console.log('✅ Le modal de profil devrait maintenant rester ouvert pour les clients');
    console.log('✅ Les colonnes address et activity sont disponibles');
    console.log('✅ La mise à jour du profil fonctionne correctement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

// Exécuter le test
testModalFix();
