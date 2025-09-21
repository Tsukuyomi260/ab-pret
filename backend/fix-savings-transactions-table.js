const { createClient } = require('@supabase/supabase-js');

// Load env from .env.local first, then .env
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSavingsTransactionsTable() {
  console.log('🔧 Correction de la table savings_transactions...\n');

  try {
    // 1. Vérifier la structure actuelle de la table
    console.log('1. Vérification de la structure actuelle...');
    const { data: currentStructure, error: structureError } = await supabase
      .from('savings_transactions')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Erreur lors de la vérification de la structure:', structureError);
      return;
    }

    console.log('✅ Structure actuelle vérifiée');

    // 2. Ajouter la colonne savings_plan_id si elle n'existe pas
    console.log('\n2. Ajout de la colonne savings_plan_id...');
    
    // Note: Supabase ne permet pas d'ajouter des colonnes via l'API JavaScript
    // Il faut le faire via l'interface SQL ou l'interface web
    console.log('⚠️  Pour ajouter la colonne savings_plan_id, exécutez cette requête SQL dans Supabase:');
    console.log(`
ALTER TABLE savings_transactions 
ADD COLUMN IF NOT EXISTS savings_plan_id UUID REFERENCES savings_plans(id);
    `);

    // 3. Vérifier si la colonne existe maintenant
    console.log('\n3. Vérification après correction...');
    const { data: testData, error: testError } = await supabase
      .from('savings_transactions')
      .select('savings_plan_id')
      .limit(1);
    
    if (testError) {
      console.log('❌ La colonne savings_plan_id n\'existe pas encore');
      console.log('   Erreur:', testError.message);
    } else {
      console.log('✅ La colonne savings_plan_id existe maintenant');
    }

    // 4. Afficher la structure recommandée
    console.log('\n4. Structure recommandée pour savings_transactions:');
    console.log(`
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  savings_plan_id UUID REFERENCES savings_plans(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'interest')),
  amount NUMERIC NOT NULL,
  transaction_reference TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `);

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la correction
fixSavingsTransactionsTable().then(() => {
  console.log('\n🏁 Correction terminée');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Allez dans votre projet Supabase');
  console.log('2. Ouvrez l\'éditeur SQL');
  console.log('3. Exécutez la requête ALTER TABLE ci-dessus');
  console.log('4. Relancez le diagnostic pour vérifier');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
