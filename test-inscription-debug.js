// =====================================================
// SCRIPT DE TEST POUR DIAGNOSTIQUER LES ERREURS D'INSCRIPTION
// =====================================================

// Test des données d'inscription
const testData = {
  phone: '+229 53463606',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  address: 'Test Address',
  facebookName: 'Test Facebook',
  filiere: 'Informatique',
  anneeEtude: '2ème année',
  entite: 'INSTI'
};

console.log('=== TEST D\'INSCRIPTION ===');
console.log('Données de test:', testData);

// Test de validation
function validateTestData(data) {
  const errors = [];
  
  if (!data.phone || data.phone.length < 8) {
    errors.push('Numéro de téléphone invalide');
  }
  
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('Prénom invalide');
  }
  
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Nom invalide');
  }
  
  if (!data.email || !data.email.includes('@')) {
    errors.push('Email invalide');
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push('Mot de passe trop court');
  }
  
  if (!data.address || data.address.trim().length < 5) {
    errors.push('Adresse invalide');
  }
  
  if (!data.facebookName || data.facebookName.trim().length < 2) {
    errors.push('Nom Facebook invalide');
  }
  
  if (!data.filiere || data.filiere.trim().length < 2) {
    errors.push('Filière invalide');
  }
  
  if (!data.anneeEtude || data.anneeEtude.trim().length < 2) {
    errors.push('Année d\'étude invalide');
  }
  
  if (!data.entite || !['INSTI', 'ENSET'].includes(data.entite)) {
    errors.push('Entité invalide');
  }
  
  return errors;
}

const validationErrors = validateTestData(testData);
console.log('Erreurs de validation:', validationErrors);

if (validationErrors.length === 0) {
  console.log('✅ Données de test valides');
} else {
  console.log('❌ Erreurs de validation détectées');
}

// Test de formatage des données
function formatDataForSupabase(data) {
  return {
    phone_number: data.phone.replace(/[^0-9]/g, ''),
    email: data.email.trim(),
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    address: data.address.trim(),
    facebook_name: data.facebookName.trim(),
    filiere: data.filiere.trim(),
    annee_etude: data.anneeEtude.trim(),
    entite: data.entite.trim()
  };
}

const formattedData = formatDataForSupabase(testData);
console.log('Données formatées pour Supabase:', formattedData);

console.log('=== FIN DU TEST ===');

