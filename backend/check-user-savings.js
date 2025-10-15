// Script pour vérifier le plan d'épargne d'un utilisateur spécifique
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

const USER_ID = '33b107a8-bedf-4c54-9535-5b25803e19d7';

async function checkUserSavingsPlan() {
  console.log('\n=== 🔍 Vérification Plan d\'Épargne Utilisateur ===\n');
  console.log(`👤 User ID: ${USER_ID}\n`);

  try {
    // 1. Récupérer les infos de l'utilisateur
    console.log('1️⃣ Informations utilisateur...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone_number, created_at')
      .eq('id', USER_ID)
      .single();

    if (userError) {
      console.error('❌ Erreur récupération utilisateur:', userError.message);
      return;
    }

    if (!userData) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    console.log(`✅ Utilisateur: ${userData.first_name} ${userData.last_name}`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`📱 Téléphone: ${userData.phone_number}`);
    console.log(`📅 Inscrit le: ${new Date(userData.created_at).toLocaleDateString('fr-FR')}`);

    // 2. Récupérer le plan d'épargne actif
    console.log('\n2️⃣ Plan d\'épargne actif...');
    const { data: savingsPlans, error: planError } = await supabase
      .from('savings_plans')
      .select(`
        id,
        plan_name,
        total_amount_target,
        current_balance,
        fixed_amount,
        next_deposit_date,
        status,
        created_at,
        updated_at
      `)
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false });

    if (planError) {
      console.error('❌ Erreur récupération plan:', planError.message);
      return;
    }

    if (!savingsPlans || savingsPlans.length === 0) {
      console.log('❌ Aucun plan d\'épargne trouvé');
      return;
    }

    console.log(`📋 Plans d'épargne trouvés: ${savingsPlans.length}`);
    
    // Trouver le plan actif
    const activePlan = savingsPlans.find(plan => plan.status === 'active');
    
    if (!activePlan) {
      console.log('❌ Aucun plan d\'épargne actif trouvé');
      console.log('\n📋 Plans existants:');
      savingsPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.plan_name} (${plan.status}) - ${new Date(plan.created_at).toLocaleDateString('fr-FR')}`);
      });
      return;
    }

    const savingsPlan = activePlan;
    console.log(`✅ Plan actif: ${savingsPlan.plan_name}`);
    console.log(`💰 Objectif: ${parseInt(savingsPlan.total_amount_target).toLocaleString()} FCFA`);
    console.log(`💵 Solde actuel: ${parseInt(savingsPlan.current_balance).toLocaleString()} FCFA`);
    console.log(`📅 Prochain dépôt: ${savingsPlan.next_deposit_date}`);
    console.log(`💸 Montant mensuel: ${parseInt(savingsPlan.fixed_amount).toLocaleString()} FCFA`);
    console.log(`📊 Statut: ${savingsPlan.status}`);
    // Calculer le pourcentage de progression
    const progress = savingsPlan.total_amount_target > 0 
      ? Math.round((savingsPlan.current_balance / savingsPlan.total_amount_target) * 100)
      : 0;
    console.log(`📊 Progression: ${progress}%`);

    // 3. Calculer les dates de rappel
    console.log('\n3️⃣ Dates de rappel programmées...');
    const today = new Date();
    const nextDepositDate = new Date(savingsPlan.next_deposit_date);
    
    console.log(`📅 Aujourd'hui: ${today.toLocaleDateString('fr-FR')}`);
    console.log(`📅 Prochain dépôt: ${nextDepositDate.toLocaleDateString('fr-FR')}`);
    
    const daysRemaining = Math.ceil((nextDepositDate - today) / (1000 * 60 * 60 * 24));
    console.log(`⏰ Jours restants: ${daysRemaining}`);

    // Calculer les dates de rappel
    const reminderDates = [];
    for (let i = 3; i >= 0; i--) {
      const reminderDate = new Date(nextDepositDate);
      reminderDate.setDate(reminderDate.getDate() - i);
      reminderDates.push({
        daysBefore: i,
        date: reminderDate,
        isPast: reminderDate < today,
        isToday: reminderDate.toDateString() === today.toDateString(),
        isFuture: reminderDate > today
      });
    }

    console.log('\n📋 Calendrier des rappels:');
    reminderDates.forEach(reminder => {
      const status = reminder.isPast ? '✅ PASSÉ' : 
                    reminder.isToday ? '🔥 AUJOURD\'HUI' : 
                    '⏳ FUTUR';
      const daysText = reminder.daysBefore === 0 ? 'Jour J' : 
                      reminder.daysBefore === 1 ? 'J-1' : 
                      `J-${reminder.daysBefore}`;
      
      console.log(`   ${daysText} (${reminder.date.toLocaleDateString('fr-FR')}): ${status}`);
    });

    // 4. Vérifier les abonnements push
    console.log('\n4️⃣ Abonnements notifications push...');
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, created_at, user_id')
      .eq('user_id', USER_ID);

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError.message);
    } else {
      console.log(`📱 Abonnements push: ${subscriptions.length}`);
      if (subscriptions.length > 0) {
        console.log('✅ Utilisateur abonné aux notifications');
        subscriptions.forEach((sub, index) => {
          console.log(`   ${index + 1}. Abonné le: ${new Date(sub.created_at).toLocaleDateString('fr-FR')}`);
        });
      } else {
        console.log('⚠️  Utilisateur NON abonné aux notifications push');
        console.log('💡 Il ne recevra PAS les rappels automatiques');
      }
    }

    // 5. Vérifier les notifications déjà envoyées
    console.log('\n5️⃣ Historique des notifications...');
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, title, message, type, created_at, read')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) {
      console.error('❌ Erreur récupération notifications:', notifError.message);
    } else {
      console.log(`📬 Dernières notifications (${notifications.length}):`);
      if (notifications.length === 0) {
        console.log('   Aucune notification trouvée');
      } else {
        notifications.forEach((notif, index) => {
          const readStatus = notif.read ? '✅ Lu' : '📬 Non lu';
          console.log(`   ${index + 1}. [${readStatus}] ${notif.title}`);
          console.log(`      📅 ${new Date(notif.created_at).toLocaleDateString('fr-FR')} - ${notif.type}`);
        });
      }
    }

    // 6. Résumé et recommandations
    console.log('\n=== 📊 RÉSUMÉ ===\n');
    
    console.log(`👤 Utilisateur: ${userData.first_name} ${userData.last_name}`);
    console.log(`📅 Prochain dépôt: ${nextDepositDate.toLocaleDateString('fr-FR')} (dans ${daysRemaining} jour(s))`);
    console.log(`💰 Montant: ${parseInt(savingsPlan.fixed_amount).toLocaleString()} FCFA`);
    console.log(`📱 Notifications: ${subscriptions.length > 0 ? '✅ Abonné' : '❌ Non abonné'}`);
    console.log(`📊 Progression: ${progress}%`);

    // Recommandations
    console.log('\n=== 💡 RECOMMANDATIONS ===\n');
    
    if (subscriptions.length === 0) {
      console.log('🔔 IMPORTANT: L\'utilisateur n\'est pas abonné aux notifications push');
      console.log('   → Il ne recevra PAS les rappels automatiques');
      console.log('   → Demandez-lui d\'accepter les notifications dans son navigateur');
    }

    if (progress >= 100) {
      console.log('🎉 FÉLICITATIONS: Objectif atteint !');
      console.log('   → L\'utilisateur peut maintenant demander un retrait');
    }

    if (daysRemaining <= 3 && daysRemaining >= 0) {
      console.log('📢 RAPPEL: Dépôt imminent');
      console.log(`   → ${daysRemaining === 0 ? 'AUJOURD\'HUI' : `dans ${daysRemaining} jour(s)`}`);
      console.log('   → Le système enverra automatiquement des rappels');
    }

    console.log('\n✅ Vérification terminée !\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer la vérification
checkUserSavingsPlan();
