const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkUserLoans(userId) {
  try {
    console.log(`🔍 Vérification des prêts pour l'utilisateur: ${userId}`);
    
    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 Prêts trouvés:', loans.length);
    loans.forEach((loan, index) => {
      console.log(`${index + 1}. Prêt #${loan.id}`);
      console.log(`   - Statut: ${loan.status}`);
      console.log(`   - Montant: ${loan.amount}`);
      console.log(`   - Créé le: ${loan.created_at}`);
      console.log(`   - Mis à jour le: ${loan.updated_at}`);
      console.log('---');
    });

    // Vérifier s'il y a des prêts actifs
    const activeLoans = loans.filter(loan => loan.status === 'active' || loan.status === 'approved');
    console.log(`🚨 Prêts actifs/approuvés: ${activeLoans.length}`);
    
    if (activeLoans.length > 0) {
      console.log('⚠️  L\'utilisateur a des prêts actifs, il ne peut pas faire une nouvelle demande.');
    } else {
      console.log('✅ L\'utilisateur peut faire une nouvelle demande de prêt.');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Remplacer par l'ID de l'utilisateur qui a le problème
const userId = '053acf46-f955-4f13-9f20-f7230c42b6ba'; // Utilisateur avec prêt actif
checkUserLoans(userId);
