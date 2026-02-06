/**
 * Script pour nettoyer les doublons de transactions dans la table payments
 * Basé sur transaction_id
 * 
 * Usage: node cleanup-duplicate-payments.js [--dry-run]
 * 
 * --dry-run: Mode simulation (affiche ce qui serait supprimé sans supprimer)
 */

const { createClient } = require('@supabase/supabase-js');

// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.error('Vérifiez que REACT_APP_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont configurés');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DRY_RUN = process.argv.includes('--dry-run');

async function cleanupDuplicatePayments() {
  console.log('🔍 Recherche des doublons de transactions...\n');

  try {
    // Récupérer toutes les transactions
    const { data: allPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, transaction_id, loan_id, user_id, amount, created_at, payment_date')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📊 Total de transactions trouvées: ${allPayments.length}\n`);

    // Grouper par transaction_id uniquement
    const duplicatesByTransactionId = {};

    allPayments.forEach(payment => {
      const transactionId = payment.transaction_id;

      // Grouper par transaction_id (seulement si transaction_id existe)
      if (transactionId) {
        if (!duplicatesByTransactionId[transactionId]) {
          duplicatesByTransactionId[transactionId] = [];
        }
        duplicatesByTransactionId[transactionId].push(payment);
      }
    });

    // Identifier les doublons (groupes avec plus d'un élément)
    const duplicateGroups = [];
    
    // Vérifier les doublons par transaction_id
    Object.entries(duplicatesByTransactionId).forEach(([id, payments]) => {
      if (payments.length > 1) {
        duplicateGroups.push({
          identifier: `transaction_id: ${id}`,
          payments: payments,
          type: 'transaction_id'
        });
      }
    });

    if (duplicateGroups.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }

    console.log(`⚠️  ${duplicateGroups.length} groupe(s) de doublons trouvé(s)\n`);

    let totalToDelete = 0;
    const paymentsToDelete = [];

    // Pour chaque groupe de doublons, garder le plus récent et marquer les autres pour suppression
    duplicateGroups.forEach((group, index) => {
      console.log(`\n📦 Groupe ${index + 1}: ${group.identifier}`);
      console.log(`   ${group.payments.length} transaction(s) trouvée(s)`);

      // Trier par date de création (la plus récente en premier)
      const sorted = [...group.payments].sort((a, b) => {
        const dateA = new Date(a.created_at || a.payment_date || 0);
        const dateB = new Date(b.created_at || b.payment_date || 0);
        return dateB - dateA;
      });

      // Garder la première (la plus récente)
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);

      console.log(`   ✅ À garder: ID ${toKeep.id} (créé le ${new Date(toKeep.created_at || toKeep.payment_date).toLocaleString('fr-FR')})`);
      
      toDelete.forEach(payment => {
        console.log(`   ❌ À supprimer: ID ${payment.id} (créé le ${new Date(payment.created_at || payment.payment_date).toLocaleString('fr-FR')})`);
        paymentsToDelete.push(payment.id);
        totalToDelete++;
      });
    });

    console.log(`\n📊 Résumé:`);
    console.log(`   - Groupes de doublons: ${duplicateGroups.length}`);
    console.log(`   - Transactions à supprimer: ${totalToDelete}`);
    console.log(`   - Transactions à garder: ${allPayments.length - totalToDelete}`);

    if (DRY_RUN) {
      console.log(`\n🔍 MODE DRY-RUN: Aucune suppression effectuée`);
      console.log(`   Exécutez sans --dry-run pour supprimer réellement les doublons`);
      return;
    }

    if (paymentsToDelete.length === 0) {
      console.log('\n✅ Aucune transaction à supprimer');
      return;
    }

    // Demander confirmation
    console.log(`\n⚠️  ATTENTION: ${totalToDelete} transaction(s) seront supprimée(s)`);
    console.log(`   Appuyez sur Ctrl+C pour annuler dans les 5 secondes...`);
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Supprimer les doublons
    console.log(`\n🗑️  Suppression des doublons...`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const paymentId of paymentsToDelete) {
      const { error: deleteError } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId);

      if (deleteError) {
        console.error(`   ❌ Erreur suppression ID ${paymentId}:`, deleteError.message);
        errorCount++;
      } else {
        deletedCount++;
        if (deletedCount % 10 === 0) {
          console.log(`   ✅ ${deletedCount}/${totalToDelete} supprimée(s)...`);
        }
      }
    }

    console.log(`\n✅ Nettoyage terminé:`);
    console.log(`   - Transactions supprimées: ${deletedCount}`);
    if (errorCount > 0) {
      console.log(`   - Erreurs: ${errorCount}`);
    }
    console.log(`   - Transactions restantes: ${allPayments.length - deletedCount}`);

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
cleanupDuplicatePayments()
  .then(() => {
    console.log('\n✨ Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
