import twilio from 'twilio';

// Initialiser Twilio avec les clés API
const client = twilio(
  process.env.REACT_APP_TWILIO_ACCOUNT_SID,
  process.env.REACT_APP_TWILIO_AUTH_TOKEN
);

// Fonction pour valider un numéro de téléphone béninois
export const validateBeninPhoneNumber = (phoneNumber) => {
  // Format béninois : +229 XX XX XX XX (10 chiffres après le code pays)
  const beninPhoneRegex = /^\+229[0-9]{8}$/;
  
  // Si le numéro ne commence pas par +229, on l'ajoute
  let formattedNumber = phoneNumber;
  if (!phoneNumber.startsWith('+229')) {
    // Enlever tous les espaces et caractères spéciaux
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Si c'est un numéro local (commence par 0), on le remplace par +229
    if (cleanNumber.startsWith('0')) {
      formattedNumber = '+229' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('229')) {
      formattedNumber = '+' + cleanNumber;
    } else if (cleanNumber.length === 8) {
      formattedNumber = '+229' + cleanNumber;
    } else {
      return { valid: false, error: 'Format de numéro invalide' };
    }
  }
  
  if (!beninPhoneRegex.test(formattedNumber)) {
    return { valid: false, error: 'Numéro de téléphone béninois invalide' };
  }
  
  return { valid: true, formattedNumber };
};

// Fonction pour envoyer un SMS OTP
export const sendOTPSMS = async (phoneNumber, otp, userName) => {
  try {
    // Valider et formater le numéro de téléphone
    const validation = validateBeninPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!process.env.REACT_APP_TWILIO_ACCOUNT_SID || !process.env.REACT_APP_TWILIO_AUTH_TOKEN) {
      console.error('[SMS] Clés API Twilio manquantes');
      return { success: false, error: 'Configuration SMS manquante' };
    }

    // Message SMS
    const message = `CAMPUS FINANCE\n\nBonjour ${userName},\n\nVotre code de vérification est : ${otp}\n\nCe code est valide pendant 15 minutes.\n\nNe partagez jamais ce code avec qui que ce soit.\n\nCampus Finance`;

    // Envoyer le SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: process.env.REACT_APP_TWILIO_PHONE_NUMBER, // Votre numéro Twilio
      to: validation.formattedNumber
    });

    console.log('[SMS] SMS OTP envoyé avec succès:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('[SMS] Erreur lors de l\'envoi SMS:', error.message);
    return { success: false, error: error.message };
  }
};

// Fonction pour envoyer un SMS de bienvenue
export const sendWelcomeSMS = async (phoneNumber, userName) => {
  try {
    // Valider et formater le numéro de téléphone
    const validation = validateBeninPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    if (!process.env.REACT_APP_TWILIO_ACCOUNT_SID || !process.env.REACT_APP_TWILIO_AUTH_TOKEN) {
      console.error('[SMS] Clés API Twilio manquantes');
      return { success: false, error: 'Configuration SMS manquante' };
    }

    // Message de bienvenue
    const message = `CAMPUS FINANCE\n\nBonjour ${userName},\n\nVotre compte a été créé avec succès !\n\nBienvenue chez Campus Finance.\n\nMerci de nous faire confiance pour vos besoins financiers.`;

    // Envoyer le SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: process.env.REACT_APP_TWILIO_PHONE_NUMBER,
      to: validation.formattedNumber
    });

    console.log('[SMS] SMS de bienvenue envoyé:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('[SMS] Erreur lors de l\'envoi du SMS de bienvenue:', error.message);
    return { success: false, error: error.message };
  }
};
