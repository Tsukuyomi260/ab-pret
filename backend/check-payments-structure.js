// =====================================================
// VÉRIFICATION DE LA STRUCTURE DE LA TABLE PAYMENTS
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Vérification de la structure de la table payments...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante !');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaymentsStructure() {
  try {
    console.log('🔗 Connexion à Supabase...');
    
    // Essayer de récupérer quelques enregistrements pour voir la structure
    console.log('📊 STRUCTURE DE LA TABLE PAYMENTS :');
    console.log('====================================');
    
    try {
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .limit(1);
      
      if (paymentsError) {
        console.log(`❌ Erreur: ${paymentsError.message}`);
        
        // Si la table existe mais a une structure différente, essayons de voir les colonnes
        console.log('\n🔧 Tentative de récupération de la structure...');
        
        // Essayer de sélectionner des colonnes spécifiques
        const columnsToTest = [
          'id',
          'loan_id', 
          'user_id',
          'amount',
          'payment_date',
          'status',
          'description',
          'created_at',
          'updated_at'
        ];
        
        for (const column of columnsToTest) {
          try {
            const { data, error } = await supabase
              .from('payments')
              .select(column)
              .limit(1);
            
            if (error) {
              console.log(`❌ Colonne ${column}: ${error.message}`);
            } else {
              console.log(`✅ Colonne ${column}: Existe`);
            }
          } catch (err) {
            console.log(`❌ Colonne ${column}: ${err.message}`);
          }
        }
        
      } else {
        console.log('✅ Table payments accessible');
        if (payments && payments.length > 0) {
          console.log('📋 Colonnes disponibles :');
          Object.keys(payments[0]).forEach(column => {
            console.log(`   - ${column}`);
          });
        } else {
          console.log('📭 Table vide, mais accessible');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur générale: ${err.message}`);
    }
    
    // Vérifier aussi la table loans
    console.log('\n💰 STRUCTURE DE LA TABLE LOANS :');
    console.log('==================================');
    
    try {
      const { data: loans, error: loansError } = await supabase
        .from('loans')
        .select('*')
        .limit(1);
      
      if (loansError) {
        console.log(`❌ Erreur: ${loansError.message}`);
      } else {
        console.log('✅ Table loans accessible');
        if (loans && loans.length > 0) {
          console.log('📋 Colonnes disponibles :');
          Object.keys(loans[0]).forEach(column => {
            console.log(`   - ${column}`);
          });
        } else {
          console.log('📭 Table vide, mais accessible');
        }
      }
    } catch (err) {
      console.log(`❌ Erreur: ${err.message}`);
    }
    
    console.log('\n📋 RECOMMANDATIONS :');
    console.log('=====================');
    console.log('1. Si la table payments manque des colonnes, exécutez le script SQL complet');
    console.log('2. Créez les tables d\'épargne manquantes');
    console.log('3. Testez l\'inscription d\'un nouvel utilisateur');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkPaymentsStructure().then(() => {
  console.log('\n✅ Vérification terminée !');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
});
