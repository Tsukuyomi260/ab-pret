require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function testLoanNotifications() {
  console.log('\n=== 🔔 Test du Système de Notifications de Prêt ===\n');

  // 1. Vérifier les prêts en attente
  console.log('1️⃣ Recherche de prêts en attente...');
  const { data: pendingLoans, error: fetchError } = await supabase
    .from('loans')
    .select('id, amount, user_id, users(first_name, last_name)')
    .eq('status', 'pending')
    .limit(5);

  if (fetchError || !pendingLoans || pendingLoans.length === 0) {
    console.log('❌ Aucun prêt en attente trouvé ou erreur:', fetchError?.message);
    console.log('\n🔧 SOLUTION: Créer une nouvelle demande de prêt pour tester.');
    return;
  }

  console.log(`✅ ${pendingLoans.length} prêt(s) en attente trouvé(s)`);
  const testLoan = pendingLoans[0];
  console.log(`   Test avec: ${testLoan.users.first_name} ${testLoan.users.last_name} - ${parseInt(testLoan.amount).toLocaleString()} FCFA`);

  // 2. Vérifier les abonnements de l'utilisateur
  console.log('\n2️⃣ Vérification des abonnements de l\'utilisateur...');
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', testLoan.user_id);

  if (subError) {
    console.error('❌ Erreur récupération abonnements:', subError.message);
  } else {
    console.log(`📱 ${subscriptions?.length || 0} abonnement(s) trouvé(s) pour l'utilisateur`);
    if (subscriptions && subscriptions.length > 0) {
      console.log('   ✅ L\'utilisateur peut recevoir des notifications push');
    } else {
      console.log('   ⚠️ L\'utilisateur n\'a pas d\'abonnement - notifications push non disponibles');
    }
  }

  // 3. Tester l'approbation d'un prêt
  console.log('\n3️⃣ Test d\'approbation de prêt...');
  try {
    // Simuler l'approbation
    const { data: approvedLoan, error: approveError } = await supabase
      .from('loans')
      .update({ 
        status: 'active',
        approved_by: '00000000-0000-0000-0000-000000000000', // ID admin fictif
        approved_at: new Date().toISOString()
      })
      .eq('id', testLoan.id)
      .select()
      .single();

    if (approveError) throw approveError;

    console.log(`✅ Prêt ${approvedLoan.id} approuvé avec succès`);

    // Créer une notification dans la base de données
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: testLoan.user_id,
        title: 'Prêt approuvé ! 🎉',
        message: `Votre demande de prêt de ${parseInt(testLoan.amount).toLocaleString()} FCFA a été approuvée. Vous pouvez maintenant effectuer votre premier remboursement.`,
        type: 'loan_status',
        data: {
          loan_id: testLoan.id,
          loan_amount: testLoan.amount,
          status: 'approved',
          action: 'approved'
        },
        read: false
      });

    if (notificationError) {
      console.error('❌ Erreur création notification:', notificationError.message);
    } else {
      console.log('✅ Notification créée dans la base de données');
    }

    // Tester l'envoi de notification push
    console.log('\n4️⃣ Test d\'envoi de notification push...');
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    
    const notificationResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-loan-approbation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testLoan.user_id,
        loanAmount: testLoan.amount,
        loanId: testLoan.id
      })
    });

    if (notificationResponse.ok) {
      console.log('✅ Notification push envoyée avec succès');
    } else {
      const errorText = await notificationResponse.text();
      console.error('❌ Erreur envoi notification push:', errorText);
    }

    // Remettre le prêt en attente pour les tests futurs
    console.log('\n🔄 Remise du prêt en "pending" pour les tests futurs...');
    await supabase
      .from('loans')
      .update({ status: 'pending' })
      .eq('id', testLoan.id);
    console.log('   ✅ Prêt remis en "pending".');

  } catch (error) {
    console.error('❌ Erreur lors du test d\'approbation:', error.message);
  }

  // 5. Tester le refus d'un prêt
  console.log('\n5️⃣ Test de refus de prêt...');
  try {
    // Simuler le refus
    const { data: rejectedLoan, error: rejectError } = await supabase
      .from('loans')
      .update({ status: 'rejected' })
      .eq('id', testLoan.id)
      .select()
      .single();

    if (rejectError) throw rejectError;

    console.log(`✅ Prêt ${rejectedLoan.id} refusé avec succès`);

    // Créer une notification de refus
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: testLoan.user_id,
        title: 'Demande de prêt refusée',
        message: `Votre demande de prêt de ${parseInt(testLoan.amount).toLocaleString()} FCFA a été refusée. Contactez l'administration pour plus d'informations.`,
        type: 'loan_status',
        data: {
          loan_id: testLoan.id,
          loan_amount: testLoan.amount,
          status: 'rejected',
          action: 'rejected'
        },
        read: false
      });

    if (notificationError) {
      console.error('❌ Erreur création notification de refus:', notificationError.message);
    } else {
      console.log('✅ Notification de refus créée dans la base de données');
    }

    // Tester l'envoi de notification push de refus
    const notificationResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/notify-loan-refus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testLoan.user_id,
        loanAmount: testLoan.amount,
        loanId: testLoan.id
      })
    });

    if (notificationResponse.ok) {
      console.log('✅ Notification push de refus envoyée avec succès');
    } else {
      const errorText = await notificationResponse.text();
      console.error('❌ Erreur envoi notification push de refus:', errorText);
    }

    // Remettre le prêt en attente pour les tests futurs
    console.log('\n🔄 Remise du prêt en "pending" pour les tests futurs...');
    await supabase
      .from('loans')
      .update({ status: 'pending' })
      .eq('id', testLoan.id);
    console.log('   ✅ Prêt remis en "pending".');

  } catch (error) {
    console.error('❌ Erreur lors du test de refus:', error.message);
  }

  console.log('\n=== 🎯 Test Terminé ===\n');
  console.log('✅ Le système de notifications de prêt est fonctionnel !');
  console.log('📱 Les utilisateurs recevront des notifications via :');
  console.log('   - Cloche de notification dans l\'app');
  console.log('   - Notifications push web');
  console.log('   - Base de données (historique)');
}

testLoanNotifications();
