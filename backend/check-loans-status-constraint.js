// Script pour vérifier les contraintes de statut des prêts
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function checkLoansStatusConstraint() {
  console.log('\n=== 🔍 Vérification des Contraintes de Statut des Prêts ===\n');

  try {
    // 1. Vérifier les statuts existants dans la table
    console.log('1️⃣ Statuts existants dans la table loans...');
    const { data: existingStatuses, error: statusError } = await supabase
      .from('loans')
      .select('status')
      .not('status', 'is', null);

    if (statusError) {
      console.error('❌ Erreur récupération statuts:', statusError.message);
      return;
    }

    const uniqueStatuses = [...new Set(existingStatuses.map(loan => loan.status))];
    console.log('📊 Statuts trouvés:', uniqueStatuses);

    // 2. Tester différents statuts pour voir lesquels sont autorisés
    console.log('\n2️⃣ Test des différents statuts...');
    
    const testStatuses = [
      'pending',
      'approved', 
      'active',
      'completed',
      'rejected',
      'cancelled',
      'overdue'
    ];

    for (const status of testStatuses) {
      try {
        console.log(`   Test du statut: "${status}"`);
        
        // Récupérer un prêt en attente pour le test
        const { data: testLoan, error: loanError } = await supabase
          .from('loans')
          .select('id')
          .eq('status', 'pending')
          .limit(1)
          .single();

        if (loanError || !testLoan) {
          console.log(`     ⚠️  Pas de prêt en attente pour tester "${status}"`);
          continue;
        }

        // Tenter la mise à jour
        const { error: updateError } = await supabase
          .from('loans')
          .update({
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', testLoan.id);

        if (updateError) {
          console.log(`     ❌ "${status}" - NON AUTORISÉ: ${updateError.message}`);
        } else {
          console.log(`     ✅ "${status}" - AUTORISÉ`);
          
          // Remettre en pending pour le prochain test
          await supabase
            .from('loans')
            .update({
              status: 'pending',
              updated_at: new Date().toISOString()
            })
            .eq('id', testLoan.id);
        }
      } catch (error) {
        console.log(`     ❌ "${status}" - ERREUR: ${error.message}`);
      }
    }

    // 3. Vérifier la structure de la table
    console.log('\n3️⃣ Vérification de la structure de la table...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'loans' });

    if (tableError) {
      console.log('⚠️ Impossible de récupérer les infos de la table via RPC');
    } else {
      console.log('📋 Informations de la table:', tableInfo);
    }

    console.log('\n=== 💡 RECOMMANDATIONS ===\n');
    console.log('🔧 ACTIONS NÉCESSAIRES:');
    console.log('1. Vérifier la contrainte CHECK sur la colonne status');
    console.log('2. Ajouter "rejected" aux valeurs autorisées si nécessaire');
    console.log('3. Ou utiliser un autre statut comme "cancelled" ou "declined"');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer la vérification
checkLoansStatusConstraint();
