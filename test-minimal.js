// Test minimal des modules
console.log('🧪 Test des modules...');

try {
  console.log('✅ Express...');
  require('express');
  
  console.log('✅ CORS...');
  require('cors');
  
  console.log('✅ Body-parser...');
  require('body-parser');
  
  console.log('✅ Node-fetch...');
  require('node-fetch');
  
  console.log('✅ Dotenv...');
  require('dotenv');
  
  console.log('✅ Vonage...');
  require('@vonage/server-sdk');
  
  console.log('✅ Supabase API...');
  require('./src/utils/supabaseAPI');
  
  console.log('✅ Tous les modules sont OK !');
  
} catch (error) {
  console.error('❌ Erreur module:', error.message);
} 