// Test du système de rappels pour l'utilisateur spécifique
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');
const webPush = require('./config/push');

const USER_ID = '33b107a8-bedf-4c54-9535-5b25803e19d7';

async function testReminderSystem() {
  console.log('\n=== 🧪 Test du Système de Rappels ===\n');
  console.log(`👤 User ID: ${USER_ID}\n`);

  try {
    // 1. Récupérer le plan d'épargne actif
    console.log('1️⃣ Récupération du plan d\'épargne...');
    const { data: allPlans, error: planError } = await supabase
      .from('savings_plans')
      .select(`
        id,
        plan_name,
        total_amount_target,
        current_balance,
        fixed_amount,
        next_deposit_date,
        status,
        user_id
      `)
      .eq('user_id', USER_ID);

    if (planError) {
      console.error('❌ Erreur récupération plans:', planError.message);
      return;
    }

    if (!allPlans || allPlans.length === 0) {
      console.log('❌ Aucun plan d\'épargne trouvé');
      return;
    }

    const savingsPlans = allPlans.find(plan => plan.status === 'active');
    
    if (!savingsPlans) {
      console.log('❌ Aucun plan d\'épargne actif trouvé');
      console.log('📋 Plans existants:');
      allPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.plan_name} (${plan.status})`);
      });
      return;
    }


    console.log(`✅ Plan trouvé: ${savingsPlans.plan_name}`);
    console.log(`📅 Prochain dépôt: ${savingsPlans.next_deposit_date}`);
    console.log(`💰 Montant: ${parseInt(savingsPlans.fixed_amount).toLocaleString()} FCFA`);

    // 2. Simuler la logique de rappel
    console.log('\n2️⃣ Simulation de la logique de rappel...');
    const today = new Date();
    const depositDate = new Date(savingsPlans.next_deposit_date);
    const daysRemaining = Math.ceil((depositDate - today) / (1000 * 60 * 60 * 24));
    
    console.log(`📅 Aujourd'hui: ${today.toLocaleDateString('fr-FR')}`);
    console.log(`📅 Dépôt prévu: ${depositDate.toLocaleDateString('fr-FR')}`);
    console.log(`⏰ Jours restants: ${daysRemaining}`);

    // Vérifier si le plan devrait recevoir des rappels
    const shouldSendReminder = daysRemaining >= 0 && daysRemaining <= 3;
    console.log(`🔔 Rappel nécessaire: ${shouldSendReminder ? 'OUI' : 'NON'}`);

    if (!shouldSendReminder) {
      console.log('ℹ️  Aucun rappel nécessaire (dépôt trop éloigné ou déjà passé)');
      return;
    }

    // 3. Récupérer les infos utilisateur
    console.log('\n3️⃣ Récupération des données utilisateur...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', USER_ID)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur récupération utilisateur:', userError?.message);
      return;
    }

    console.log(`✅ Utilisateur: ${userData.first_name} ${userData.last_name}`);

    // 4. Récupérer les abonnements push
    console.log('\n4️⃣ Vérification des abonnements push...');
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('id, subscription, created_at')
      .eq('user_id', USER_ID);

    if (subError) {
      console.error('❌ Erreur récupération abonnements:', subError.message);
      return;
    }

    console.log(`📱 Abonnements trouvés: ${subscriptions.length}`);
    
    if (subscriptions.length === 0) {
      console.log('⚠️  L\'utilisateur n\'est pas abonné aux notifications push');
      console.log('💡 Il ne recevra PAS les rappels automatiques');
      return;
    }

    // 5. Générer le message de rappel
    console.log('\n5️⃣ Génération du message de rappel...');
    const clientName = `${userData.first_name} ${userData.last_name}`;
    const amountFormatted = `${parseInt(savingsPlans.fixed_amount).toLocaleString()} FCFA`;
    
    let title, body;
    
    if (daysRemaining === 0) {
      title = "AB Campus Finance - Dépôt d'épargne aujourd'hui !";
      body = `Bonjour ${clientName}, c'est aujourd'hui que vous devez effectuer votre dépôt d'épargne de ${amountFormatted}. Si vous ne le faites pas aujourd'hui, vous pourriez perdre tous les intérêts que vous avez accumulés jusqu'à présent.`;
    } else {
      const daysText = daysRemaining === 1 ? '24h' : `${daysRemaining} jours`;
      title = "AB Campus Finance - Rappel de dépôt d'épargne";
      body = `Bonjour ${clientName}, votre prochain dépôt sur votre compte épargne est dans ${daysText}. Effectuer votre dépôt pour ne pas perdre les intérêts cumulés à ce jour.`;
    }

    console.log(`📝 Titre: ${title}`);
    console.log(`📝 Message: ${body}`);

    // 6. Créer la notification dans la base de données
    console.log('\n6️⃣ Création de la notification dans la DB...');
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .insert([{
        user_id: USER_ID,
        title: title,
        message: body,
        type: 'savings_reminder',
        data: {
          plan_id: savingsPlans.id,
          amount: savingsPlans.fixed_amount,
          days_remaining: daysRemaining,
          deposit_date: savingsPlans.next_deposit_date
        }
      }])
      .select()
      .single();

    if (notifError) {
      console.error('❌ Erreur création notification:', notifError.message);
      return;
    }

    console.log(`✅ Notification créée (ID: ${notifData.id})`);

    // 7. Envoyer les notifications push
    console.log('\n7️⃣ Envoi des notifications push...');
    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: '/ab-epargne',
        type: 'savings_reminder',
        plan_id: savingsPlans.id
      }
    });

    let successCount = 0;
    let errorCount = 0;

    for (const sub of subscriptions) {
      try {
        await webPush.sendNotification(sub.subscription, payload);
        successCount++;
        console.log(`✅ Push envoyé avec succès (sub ${sub.id.substring(0, 8)}...)`);
      } catch (pushError) {
        errorCount++;
        console.log(`❌ Erreur push (sub ${sub.id.substring(0, 8)}...):`, pushError.message);
        
        // Si l'abonnement est expiré, le supprimer
        if (pushError.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', sub.id);
          console.log(`🗑️  Abonnement expiré supprimé`);
        }
      }
    }

    console.log(`\n📊 Résultats: ${successCount} réussi(s), ${errorCount} échec(s)`);

    // 8. Résumé final
    console.log('\n=== ✅ RÉSUMÉ DU TEST ===\n');
    console.log(`👤 Utilisateur: ${clientName}`);
    console.log(`📅 Dépôt prévu: ${depositDate.toLocaleDateString('fr-FR')} (${daysRemaining} jour(s))`);
    console.log(`💰 Montant: ${amountFormatted}`);
    console.log(`📱 Abonnements: ${subscriptions.length}`);
    console.log(`📬 Notification DB: ✅ Créée`);
    console.log(`📤 Push notifications: ${successCount}/${subscriptions.length} envoyées`);
    
    if (successCount > 0) {
      console.log('\n🎉 Test réussi ! L\'utilisateur devrait recevoir la notification.');
    } else {
      console.log('\n⚠️  Aucune notification push envoyée (vérifiez les abonnements).');
    }

    console.log('\n✅ Test terminé !\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le test
testReminderSystem();
