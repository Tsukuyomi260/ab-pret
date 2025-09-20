const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkAllUsersLoans() {
  try {
    console.log('🔍 Vérification de tous les utilisateurs avec des prêts...');
    
    // Récupérer tous les prêts avec les informations utilisateur
    const { data: loans, error } = await supabase
      .from('loans')
      .select(`
        *,
        users!inner(
          id,
          email,
          phone_number,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📊 Utilisateurs avec des prêts:');
    
    // Grouper par utilisateur
    const usersMap = new Map();
    loans.forEach(loan => {
      const userId = loan.user_id;
      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          user: loan.users,
          loans: []
        });
      }
      usersMap.get(userId).loans.push(loan);
    });
    
    usersMap.forEach((userData, userId) => {
      const { user, loans } = userData;
      console.log(`\n👤 Utilisateur: ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`   - ID: ${userId}`);
      console.log(`   - Téléphone: ${user.phone_number}`);
      console.log(`   - Nombre de prêts: ${loans.length}`);
      
      loans.forEach((loan, index) => {
        console.log(`   ${index + 1}. Prêt #${loan.id} - ${loan.status} - ${loan.amount} FCFA`);
      });
      
      // Vérifier s'il y a des prêts actifs
      const activeLoans = loans.filter(loan => loan.status === 'active' || loan.status === 'approved');
      if (activeLoans.length > 0) {
        console.log(`   ⚠️  ${activeLoans.length} prêt(s) actif(s) - Ne peut pas faire de nouvelle demande`);
      } else {
        console.log(`   ✅ Aucun prêt actif - Peut faire une nouvelle demande`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkAllUsersLoans();
