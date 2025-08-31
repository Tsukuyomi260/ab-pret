const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function fixLoanStatus(loanId) {
  try {
    console.log(`🔧 Correction du statut du prêt: ${loanId}`);
    
    // Mettre à jour le statut du prêt à 'completed'
    const { data, error } = await supabase
      .from('loans')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', loanId)
      .select();
    
    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }
    
    console.log('✅ Statut du prêt mis à jour avec succès:');
    console.log(`   - ID: ${data[0].id}`);
    console.log(`   - Nouveau statut: ${data[0].status}`);
    console.log(`   - Mis à jour le: ${data[0].updated_at}`);
    
    // Vérifier que la mise à jour a bien fonctionné
    const { data: verifyData, error: verifyError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return;
    }
    
    console.log('🔍 Vérification finale:');
    console.log(`   - Statut confirmé: ${verifyData.status}`);
    console.log(`   - L'utilisateur peut maintenant faire une nouvelle demande de prêt.`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Prêt à corriger
const loanId = '2e5ded52-759e-462c-ae18-a402f3ea8bb7';
fixLoanStatus(loanId);
