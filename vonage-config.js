// =====================================================
// CONFIGURATION VONAGE TEMPORAIRE
// =====================================================

// Copiez ces variables dans votre fichier .env.local

const vonageConfig = {
  // Configuration Vonage
  REACT_APP_VONAGE_API_KEY: "5991994e",
  REACT_APP_VONAGE_API_SECRET: "TXqA0XxEzJQWBtfI",
  REACT_APP_VONAGE_BRAND_NAME: "AB Campus Finance",
  
  // Configuration Supabase (à remplacer par vos vraies clés)
  REACT_APP_SUPABASE_URL: "https://dlgfhgcczqefbuhcyazh.supabase.co",
  REACT_APP_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZ2ZoZ2NjenFlZmJ1aGN5YXpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDM3NjQsImV4cCI6MjA3MDE3OTc2NH0.ILqv7fUAP8KAr0GzkqeqaRqDcbKcPhcHtIQR7PYFIgY",
  
  // Configuration du backend
  REACT_APP_BACKEND_URL: "http://localhost:5000",
  
  // Mode SMS
  SMS_MODE: "live" // 'live' pour production, 'echo' pour développement
};

module.exports = vonageConfig;

console.log('📝 Configuration Vonage :');
console.log('==========================');
console.log('Copiez ces variables dans votre fichier .env.local :');
console.log('');
Object.entries(vonageConfig).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});
console.log('');
console.log('⚠️  N\'oubliez pas de remplacer les clés Supabase par vos vraies clés !');
