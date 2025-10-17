// Script pour appliquer la correction de la contrainte de statut des prêts
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');
const fs = require('fs');
const path = require('path');

async function applyLoansStatusFix() {
  console.log('\n=== 🔧 Correction de la Contrainte de Statut des Prêts ===\n');

  try {
    // 1. Lire le script SQL
    const sqlPath = path.join(__dirname, 'fix-loans-status-constraint.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('1️⃣ Application du script SQL...');
    console.log('📄 Script à exécuter:');
    console.log(sqlScript);

    // 2. Exécuter le script SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlScript
    });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution du script:', error.message);
      
      // Essayer une approche alternative avec des requêtes séparées
      console.log('\n🔄 Tentative avec des requêtes séparées...');
      
      try {
        // Supprimer l'ancienne contrainte
        console.log('   Suppression de l\'ancienne contrainte...');
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_status_check;'
        });
        
        if (dropError) {
          console.log('   ⚠️ Erreur suppression (peut-être déjà supprimée):', dropError.message);
        } else {
          console.log('   ✅ Ancienne contrainte supprimée');
        }

        // Créer la nouvelle contrainte
        console.log('   Création de la nouvelle contrainte...');
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: "ALTER TABLE public.loans ADD CONSTRAINT loans_status_check CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected'));"
        });
        
        if (createError) {
          console.error('   ❌ Erreur création contrainte:', createError.message);
          return;
        } else {
          console.log('   ✅ Nouvelle contrainte créée');
        }
      } catch (altError) {
        console.error('❌ Erreur approche alternative:', altError.message);
        return;
      }
    } else {
      console.log('✅ Script exécuté avec succès');
    }

    // 3. Tester la nouvelle contrainte
    console.log('\n2️⃣ Test de la nouvelle contrainte...');
    
    // Récupérer un prêt en attente pour le test
    const { data: testLoan, error: loanError } = await supabase
      .from('loans')
      .select('id')
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (loanError || !testLoan) {
      console.log('⚠️ Pas de prêt en attente pour tester');
      return;
    }

    // Tester le statut 'rejected'
    const { error: testError } = await supabase
      .from('loans')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', testLoan.id);

    if (testError) {
      console.error('❌ Test échoué:', testError.message);
      return;
    }

    console.log('✅ Test réussi ! Le statut "rejected" est maintenant autorisé');

    // Remettre le prêt en pending
    await supabase
      .from('loans')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', testLoan.id);

    console.log('✅ Prêt remis en "pending"');

    console.log('\n=== 🎉 CORRECTION APPLIQUÉE AVEC SUCCÈS ===\n');
    console.log('💡 L\'admin peut maintenant rejeter les demandes de prêt !');
    console.log('💡 Testez la fonctionnalité dans l\'interface admin.');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer la correction
applyLoansStatusFix();
