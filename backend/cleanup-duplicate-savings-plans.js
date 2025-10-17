// Script pour nettoyer les plans d'épargne en double
require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

const USER_ID = '33b107a8-bedf-4c54-9535-5b25803e19d7';

async function cleanupDuplicateSavingsPlans() {
  console.log('\n=== 🧹 Nettoyage des Plans d\'Épargne en Double ===\n');
  console.log(`👤 User ID: ${USER_ID}\n`);

  try {
    // 1. Récupérer tous les plans de l'utilisateur
    console.log('1️⃣ Récupération des plans...');
    const { data: allPlans, error: plansError } = await supabase
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

    if (plansError) {
      console.error('❌ Erreur récupération plans:', plansError.message);
      return;
    }

    if (!allPlans || allPlans.length === 0) {
      console.log('❌ Aucun plan trouvé');
      return;
    }

    console.log(`📋 Plans trouvés: ${allPlans.length}`);
    allPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.id} - ${plan.plan_name} (${plan.status}) - ${parseInt(plan.current_balance).toLocaleString()} FCFA`);
    });

    // 2. Grouper les plans par nom
    const plansByName = {};
    allPlans.forEach(plan => {
      if (!plansByName[plan.plan_name]) {
        plansByName[plan.plan_name] = [];
      }
      plansByName[plan.plan_name].push(plan);
    });

    console.log('\n2️⃣ Groupement par nom de plan...');
    Object.keys(plansByName).forEach(planName => {
      const plans = plansByName[planName];
      console.log(`📋 "${planName}": ${plans.length} plan(s)`);
    });

    // 3. Identifier les doublons et garder le meilleur
    const plansToKeep = [];
    const plansToDelete = [];

    Object.keys(plansByName).forEach(planName => {
      const plans = plansByName[planName];
      
      if (plans.length === 1) {
        console.log(`✅ "${planName}": Un seul plan, gardé`);
        plansToKeep.push(plans[0]);
        return;
      }

      console.log(`🔍 "${planName}": ${plans.length} plans, analyse...`);
      
      // Trier par solde décroissant, puis par date de création
      const sortedPlans = plans.sort((a, b) => {
        const balanceA = parseInt(a.current_balance) || 0;
        const balanceB = parseInt(b.current_balance) || 0;
        
        if (balanceA !== balanceB) {
          return balanceB - balanceA; // Plus grand solde en premier
        }
        
        return new Date(b.created_at) - new Date(a.created_at); // Plus récent en premier
      });

      // Garder le premier (meilleur)
      const planToKeep = sortedPlans[0];
      const plansToRemove = sortedPlans.slice(1);
      
      plansToKeep.push(planToKeep);
      plansToDelete.push(...plansToRemove);
      
      console.log(`   ✅ Gardé: ${planToKeep.id} (${parseInt(planToKeep.current_balance).toLocaleString()} FCFA)`);
      plansToRemove.forEach(plan => {
        console.log(`   🗑️  À supprimer: ${plan.id} (${parseInt(plan.current_balance).toLocaleString()} FCFA)`);
      });
    });

    // 4. Afficher le résumé
    console.log('\n3️⃣ Résumé des actions...');
    console.log(`✅ Plans à garder: ${plansToKeep.length}`);
    console.log(`🗑️  Plans à supprimer: ${plansToDelete.length}`);

    if (plansToDelete.length === 0) {
      console.log('✅ Aucun doublon trouvé, rien à nettoyer');
      return;
    }

    // 5. Demander confirmation
    console.log('\n⚠️  ATTENTION: Cette action va supprimer des plans d\'épargne !');
    console.log('Plans qui seront supprimés:');
    plansToDelete.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.id} - ${parseInt(plan.current_balance).toLocaleString()} FCFA`);
    });

    // Pour l'instant, on ne supprime pas automatiquement
    console.log('\n🔒 Mode sécurisé: Aucune suppression automatique');
    console.log('💡 Pour supprimer manuellement, utilisez les IDs ci-dessus');

    // 6. Recommandations
    console.log('\n=== 💡 RECOMMANDATIONS ===\n');
    
    if (plansToDelete.length > 0) {
      console.log('🔧 ACTIONS RECOMMANDÉES:');
      console.log('1. Vérifier que les plans à supprimer n\'ont pas de dépôts importants');
      console.log('2. Transférer les soldes vers le plan principal si nécessaire');
      console.log('3. Supprimer les plans en double manuellement');
      console.log('4. Mettre à jour le frontend pour gérer les plans multiples');
    }

    console.log('\n✅ Analyse terminée !\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le nettoyage
cleanupDuplicateSavingsPlans();

