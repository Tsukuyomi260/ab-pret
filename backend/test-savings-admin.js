require('dotenv').config({ path: '.env.local' });
const { supabase } = require('./utils/supabaseClient-server');

async function testSavingsAdmin() {
  console.log('🔍 Test de la page Admin AB Epargne\n');

  try {
    // 1. Vérifier la connexion Supabase
    console.log('1️⃣ Test de connexion Supabase...');
    const { data: testConnection, error: connError } = await supabase
      .from('savings_plans')
      .select('id')
      .limit(1);

    if (connError) {
      console.error('❌ Erreur de connexion:', connError.message);
      return;
    }
    console.log('✅ Connexion Supabase OK\n');

    // 2. Compter les plans d'épargne
    console.log('2️⃣ Comptage des plans d\'épargne...');
    const { count, error: countError } = await supabase
      .from('savings_plans')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Erreur comptage:', countError.message);
    } else {
      console.log(`✅ Nombre total de plans: ${count}\n`);
    }

    // 3. Récupérer tous les plans avec infos utilisateur
    console.log('3️⃣ Récupération des plans avec infos utilisateur...');
    const { data: plans, error } = await supabase
      .from('savings_plans')
      .select(`
        *,
        users!savings_plans_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone_number
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération:', error);
      console.error('   Message:', error.message);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
      
      // Test alternatif sans jointure
      console.log('\n4️⃣ Test sans jointure utilisateur...');
      const { data: plansOnly, error: error2 } = await supabase
        .from('savings_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error2) {
        console.error('❌ Erreur même sans jointure:', error2.message);
      } else {
        console.log(`✅ Plans récupérés sans jointure: ${plansOnly?.length || 0}`);
        if (plansOnly && plansOnly.length > 0) {
          console.log('\n📋 Premier plan (structure):');
          console.log(JSON.stringify(plansOnly[0], null, 2));
        }
      }
    } else {
      console.log(`✅ Plans récupérés avec jointure: ${plans?.length || 0}`);
      
      if (plans && plans.length > 0) {
        console.log('\n📋 Premier plan (avec utilisateur):');
        console.log(JSON.stringify(plans[0], null, 2));
        
        console.log('\n📊 Statuts des plans:');
        const statuses = {};
        plans.forEach(plan => {
          const status = plan.status || 'undefined';
          statuses[status] = (statuses[status] || 0) + 1;
        });
        Object.entries(statuses).forEach(([status, count]) => {
          console.log(`   ${status}: ${count}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testSavingsAdmin()
  .then(() => {
    console.log('\n✅ Test terminé');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur:', err);
    process.exit(1);
  });

