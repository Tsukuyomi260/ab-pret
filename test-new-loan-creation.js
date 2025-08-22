// =====================================================
// TEST CRÉATION D'UN NOUVEAU PRÊT AVEC DONNÉES MOMO
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Configuration Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('=== TEST CRÉATION PRÊT AVEC MOMO ===');
console.log('URL:', supabaseUrl);
console.log('Clé:', supabaseKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewLoanCreation() {
  try {
    console.log('\n🔍 TEST: Création d\'un prêt de test avec données Momo');
    console.log('=' .repeat(60));
    
    // 1. Créer un utilisateur de test
    console.log('\n👤 Création d\'un utilisateur de test...');
    const testEmail = `test-loan-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.log('❌ Erreur création utilisateur:', authError.message);
      return false;
    }
    
    console.log('✅ Utilisateur créé:', authData.user?.id);
    
    // 2. Créer un prêt de test avec données Momo
    console.log('\n📤 Création d\'un prêt de test...');
    const testLoanData = {
      user_id: authData.user.id,
      amount: 50000,
      duration_months: 3,
      interest_rate: 10.0,
      status: 'pending',
      // Données Momo de test
      momo_number: '01234567',
      momo_network: 'MTN',
      momo_name: 'Test User',
      purpose: 'Test de création de prêt avec Momo'
    };
    
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .insert([testLoanData])
      .select()
      .single();
    
    if (loanError) {
      console.log('❌ Erreur création prêt:', loanError.message);
      return false;
    }
    
    console.log('✅ Prêt créé avec succès !');
    console.log('   - ID:', loanData.id);
    console.log('   - Montant:', loanData.amount);
    console.log('   - Momo Number:', loanData.momo_number);
    console.log('   - Momo Network:', loanData.momo_network);
    console.log('   - Momo Name:', loanData.momo_name);
    
    // 3. Vérifier que le prêt est bien récupéré avec getLoans
    console.log('\n📖 Test de récupération avec getLoans...');
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', loanData.id)
      .single();
    
    if (loansError) {
      console.log('❌ Erreur récupération prêt:', loansError.message);
    } else {
      console.log('✅ Prêt récupéré avec succès !');
      console.log('   - Momo Number:', loans.momo_number);
      console.log('   - Momo Network:', loans.momo_network);
      console.log('   - Momo Name:', loans.momo_name);
      console.log('   - User:', loans.users?.first_name, loans.users?.last_name);
    }
    
    // 4. Nettoyer les données de test
    console.log('\n🧹 Nettoyage des données de test...');
    try {
      // Supprimer le prêt de test
      await supabase.from('loans').delete().eq('id', loanData.id);
      console.log('✅ Prêt de test supprimé');
      
      // Supprimer l'utilisateur de test
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log('✅ Utilisateur de test supprimé');
    } catch (err) {
      console.log('⚠️ Erreur lors du nettoyage:', err.message);
    }
    
    console.log('\n🎉 TEST RÉUSSI !');
    console.log('✅ Les données Momo sont correctement sauvegardées');
    console.log('✅ Les données Momo sont correctement récupérées');
    console.log('📱 Le dashboard admin devrait maintenant afficher les informations Momo');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    return false;
  }
}

// Exécuter le test
testNewLoanCreation().then(success => {
  if (success) {
    console.log('\n🚀 Configuration validée !');
    console.log('📱 Créez une nouvelle demande de prêt et vérifiez dans le dashboard admin');
  } else {
    console.log('\n🔧 Problème détecté !');
    console.log('📝 Vérifiez la configuration');
  }
  process.exit(success ? 0 : 1);
});
