const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkLoanStatus() {
  try {
    console.log('🔍 Vérification des prêts dans la base de données...');
    
    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 Prêts trouvés:', loans.length);
    loans.forEach((loan, index) => {
      console.log(`${index + 1}. Prêt #${loan.id}`);
      console.log(`   - Statut: ${loan.status}`);
      console.log(`   - Montant: ${loan.amount}`);
      console.log(`   - User ID: ${loan.user_id}`);
      console.log(`   - Créé le: ${loan.created_at}`);
      console.log(`   - Mis à jour le: ${loan.updated_at}`);
      console.log('---');
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkLoanStatus();
