const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Assurez-vous que .env.local contient VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationsSystem() {
  console.log('🧪 Test du système de notifications réelles\n');

  try {
    // 1. Vérifier que la table notifications existe
    console.log('1️⃣ Vérification de la table notifications...');
    const { data: tableExists, error: tableError } = await supabase
      .from('notifications')
      .select('count')
      .limit(1);

    if (tableError) {
      console.log('⚠️  Table notifications non trouvée, création en cours...');
      // Créer la table (simulation - en production, utilisez le script SQL)
      console.log('📋 Exécutez le script create-notifications-table.sql dans Supabase');
      return;
    }

    console.log('✅ Table notifications trouvée');

    // 2. Charger les notifications existantes
    console.log('\n2️⃣ Chargement des notifications existantes...');
    const { data: existingNotifications, error: loadError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (loadError) {
      throw new Error(`Erreur lors du chargement: ${loadError.message}`);
    }

    console.log(`📊 ${existingNotifications.length} notifications trouvées`);

    if (existingNotifications.length > 0) {
      console.log('\n📋 Notifications existantes:');
      existingNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. [${notif.type.toUpperCase()}] ${notif.title}`);
        console.log(`      ${notif.message}`);
        console.log(`      Priorité: ${notif.priority} | Lu: ${notif.read ? 'Oui' : 'Non'}`);
        console.log(`      Créée: ${new Date(notif.created_at).toLocaleString('fr-FR')}\n`);
      });
    }

    // 3. Créer une notification de test
    console.log('3️⃣ Création d\'une notification de test...');
    const testNotification = {
      title: '🧪 Test du système de notifications',
      message: 'Cette notification a été créée pour tester le système en temps réel',
      type: 'info',
      priority: 'medium',
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'test-script'
      },
      action: 'Voir les détails'
    };

    const { data: newNotification, error: createError } = await supabase
      .from('notifications')
      .insert([testNotification])
      .select()
      .single();

    if (createError) {
      throw new Error(`Erreur lors de la création: ${createError.message}`);
    }

    console.log('✅ Notification de test créée avec succès');
    console.log(`   ID: ${newNotification.id}`);
    console.log(`   Titre: ${newNotification.title}`);

    // 4. Mettre à jour la notification comme lue
    console.log('\n4️⃣ Test de mise à jour (marquer comme lue)...');
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', newNotification.id);

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
    }

    console.log('✅ Notification marquée comme lue');

    // 5. Vérifier la mise à jour
    console.log('\n5️⃣ Vérification de la mise à jour...');
    const { data: updatedNotification, error: verifyError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', newNotification.id)
      .single();

    if (verifyError) {
      throw new Error(`Erreur lors de la vérification: ${verifyError.message}`);
    }

    console.log(`✅ Notification mise à jour: lu = ${updatedNotification.read}`);

    // 6. Supprimer la notification de test
    console.log('\n6️⃣ Nettoyage - suppression de la notification de test...');
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', newNotification.id);

    if (deleteError) {
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
    }

    console.log('✅ Notification de test supprimée');

    // 7. Statistiques finales
    console.log('\n7️⃣ Statistiques finales...');
    const { data: finalNotifications, error: statsError } = await supabase
      .from('notifications')
      .select('*');

    if (statsError) {
      throw new Error(`Erreur lors du comptage: ${statsError.message}`);
    }

    const unreadCount = finalNotifications.filter(n => !n.read).length;
    const totalCount = finalNotifications.length;

    console.log(`📊 Total des notifications: ${totalCount}`);
    console.log(`📖 Non lues: ${unreadCount}`);
    console.log(`📖 Lues: ${totalCount - unreadCount}`);

    // 8. Test des types de notifications
    console.log('\n8️⃣ Test des différents types de notifications...');
    const notificationTypes = [
      {
        title: '🎯 Demande de prêt approuvée',
        message: 'Votre demande de prêt de 150 000 FCFA a été approuvée avec succès',
        type: 'success',
        priority: 'high',
        data: { loan_amount: 150000, status: 'approved' }
      },
      {
        title: '⚠️ Rappel de paiement',
        message: 'Votre prochain paiement de 25 000 FCFA est prévu dans 3 jours',
        type: 'warning',
        priority: 'medium',
        data: { payment_amount: 25000, due_date: '2024-02-15' }
      },
      {
        title: '💳 Paiement reçu',
        message: 'Votre paiement de 20 000 FCFA a été enregistré avec succès',
        type: 'success',
        priority: 'low',
        data: { payment_amount: 20000, received_at: new Date().toISOString() }
      }
    ];

    for (const notif of notificationTypes) {
      const { data: createdNotif, error: typeError } = await supabase
        .from('notifications')
        .insert([notif])
        .select()
        .single();

      if (typeError) {
        console.log(`❌ Erreur lors de la création de ${notif.type}: ${typeError.message}`);
      } else {
        console.log(`✅ Notification ${notif.type} créée: ${createdNotif.title}`);
      }
    }

    console.log('\n🎉 Test du système de notifications terminé avec succès !');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Vérifiez les notifications dans l\'interface admin');
    console.log('   2. Testez les notifications en temps réel');
    console.log('   3. Vérifiez que les notifications s\'affichent correctement');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Exécuter le test
testNotificationsSystem();
