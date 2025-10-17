// Script pour déboguer le problème de solde d'épargne
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

const USER_ID = '33b107a8-bedf-4c54-9535-5b25803e19d7';
// Utiliser le premier plan actif trouvé
// const PLAN_ID = '0f0bfd83-85b2-4439-af3b-208219ae1271';

async function debugUserSavings() {
  console.log('\n=== 🔍 Debug Solde d\'Épargne ===\n');
  console.log(`👤 User ID: ${USER_ID}`);
  console.log(`📋 Plan ID: À déterminer\n`);

  try {
    // 1. Vérifier l'utilisateur
    console.log('1️⃣ Vérification de l\'utilisateur...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', USER_ID)
      .single();

    if (userError || !userData) {
      console.error('❌ Erreur récupération utilisateur:', userError?.message);
      return;
    }

    console.log(`✅ Utilisateur: ${userData.first_name} ${userData.last_name}`);
    console.log(`📧 Email: ${userData.email}`);

    // 2. Vérifier tous les plans de l'utilisateur d'abord
    console.log('\n2️⃣ Vérification de tous les plans de l\'utilisateur...');
    const { data: allPlans, error: allPlansError } = await supabase
      .from('savings_plans')
      .select(`
        id,
        user_id,
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

    if (allPlansError) {
      console.error('❌ Erreur récupération plans:', allPlansError.message);
      return;
    }

    if (!allPlans || allPlans.length === 0) {
      console.log('❌ Aucun plan d\'épargne trouvé pour cet utilisateur');
      return;
    }

    console.log(`📋 Plans trouvés: ${allPlans.length}`);
    
    // Utiliser le premier plan actif
    const savingsPlan = allPlans.find(plan => plan.status === 'active');
    
    if (!savingsPlan) {
      console.log('❌ Aucun plan actif trouvé');
      console.log('📋 Plans disponibles:');
      allPlans.forEach((plan, index) => {
        console.log(`   ${index + 1}. ${plan.id} - ${plan.plan_name} (${plan.status})`);
      });
      return;
    }
    
    console.log(`🎯 Plan sélectionné: ${savingsPlan.id}`);


    console.log(`✅ Plan trouvé: ${savingsPlan.plan_name}`);
    console.log(`💰 Objectif: ${parseInt(savingsPlan.total_amount_target).toLocaleString()} FCFA`);
    console.log(`💵 Solde actuel: ${parseInt(savingsPlan.current_balance).toLocaleString()} FCFA`);
    console.log(`📅 Prochain dépôt: ${savingsPlan.next_deposit_date}`);
    console.log(`💸 Montant mensuel: ${parseInt(savingsPlan.fixed_amount).toLocaleString()} FCFA`);
    console.log(`📊 Statut: ${savingsPlan.status}`);

    // 3. Vérifier si le plan appartient à l'utilisateur
    if (savingsPlan.user_id !== USER_ID) {
      console.log('❌ ERREUR: Le plan n\'appartient pas à cet utilisateur !');
      console.log(`   Plan user_id: ${savingsPlan.user_id}`);
      console.log(`   Recherché: ${USER_ID}`);
      return;
    }

    console.log('✅ Le plan appartient bien à l\'utilisateur');

    // 4. Afficher tous les plans de l'utilisateur
    console.log('\n3️⃣ Tous les plans de l\'utilisateur...');
    console.log(`📋 Total plans: ${allPlans.length}`);
    allPlans.forEach((plan, index) => {
      const isActive = plan.status === 'active';
      const isTargetPlan = plan.id === savingsPlan.id;
      console.log(`   ${index + 1}. ${plan.plan_name} (${plan.status}) - ${parseInt(plan.current_balance).toLocaleString()} FCFA ${isTargetPlan ? '← TARGET' : ''} ${isActive ? '← ACTIF' : ''}`);
    });

    // 5. Vérifier les dépôts
    console.log('\n4️⃣ Vérification des dépôts...');
    const { data: deposits, error: depositsError } = await supabase
      .from('savings_deposits')
      .select(`
        id,
        amount,
        status,
        created_at,
        savings_plan_id
      `)
      .eq('savings_plan_id', savingsPlan.id)
      .order('created_at', { ascending: false });

    if (depositsError) {
      console.error('❌ Erreur récupération dépôts:', depositsError.message);
      return;
    }

    console.log(`💰 Dépôts trouvés: ${deposits.length}`);
    if (deposits.length > 0) {
      const totalDeposits = deposits.reduce((sum, deposit) => sum + parseInt(deposit.amount), 0);
      const successfulDeposits = deposits.filter(d => d.status === 'completed');
      const totalSuccessful = successfulDeposits.reduce((sum, deposit) => sum + parseInt(deposit.amount), 0);
      
      console.log(`   Total dépôts: ${totalDeposits.toLocaleString()} FCFA`);
      console.log(`   Dépôts réussis: ${totalSuccessful.toLocaleString()} FCFA`);
      console.log(`   Dépôts échoués: ${(totalDeposits - totalSuccessful).toLocaleString()} FCFA`);
      
      deposits.forEach((deposit, index) => {
        console.log(`   ${index + 1}. ${parseInt(deposit.amount).toLocaleString()} FCFA (${deposit.status}) - ${new Date(deposit.created_at).toLocaleDateString('fr-FR')}`);
      });
    } else {
      console.log('⚠️  Aucun dépôt trouvé pour ce plan');
    }

    // 6. Vérifier la logique de calcul du solde
    console.log('\n5️⃣ Analyse du problème...');
    
    if (parseInt(savingsPlan.current_balance) === 0) {
      console.log('🔍 PROBLÈME IDENTIFIÉ: Le solde affiche 0 FCFA');
      
      if (deposits.length === 0) {
        console.log('   → Cause: Aucun dépôt enregistré');
        console.log('   → Solution: L\'utilisateur doit effectuer un dépôt');
      } else {
        const successfulDeposits = deposits.filter(d => d.status === 'completed');
        if (successfulDeposits.length === 0) {
          console.log('   → Cause: Aucun dépôt réussi');
          console.log('   → Solution: Vérifier les paiements FedaPay');
        } else {
          const totalSuccessful = successfulDeposits.reduce((sum, deposit) => sum + parseInt(deposit.amount), 0);
          console.log(`   → Cause: Solde non mis à jour (${totalSuccessful} FCFA de dépôts réussis)`);
          console.log('   → Solution: Mettre à jour manuellement le solde ou vérifier la logique de mise à jour');
        }
      }
    } else {
      console.log('✅ Le solde semble correct dans la base de données');
      console.log('🔍 Vérifier le frontend pour voir pourquoi il affiche 0 FCFA');
    }

    // 7. Recommandations
    console.log('\n=== 💡 RECOMMANDATIONS ===\n');
    
    if (parseInt(savingsPlan.current_balance) === 0 && deposits.length > 0) {
      console.log('🔧 ACTIONS IMMÉDIATES:');
      console.log('1. Vérifier si les dépôts FedaPay sont bien traités');
      console.log('2. Vérifier la logique de mise à jour du solde dans le webhook');
      console.log('3. Mettre à jour manuellement le solde si nécessaire');
    } else if (parseInt(savingsPlan.current_balance) > 0) {
      console.log('🔧 ACTIONS IMMÉDIATES:');
      console.log('1. Vérifier le code frontend qui récupère le solde');
      console.log('2. Vérifier les logs de la console du navigateur');
      console.log('3. Vérifier la requête Supabase dans le frontend');
    }

    console.log('\n✅ Debug terminé !\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le debug
debugUserSavings();
