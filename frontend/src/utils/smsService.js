import axios from 'axios';

// Fonction pour valider un numéro de téléphone béninois
export const validateBeninPhoneNumber = (phoneNumber) => {
  const beninPhoneRegex = /^\+229[0-9]{8}$/;
  let formattedNumber = phoneNumber;
  if (!phoneNumber.startsWith('+229')) {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
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

// Fonction pour envoyer un SMS OTP via backend
export const sendOTPSMS = async (phoneNumber, otp, userName) => {
  try {
    const validation = validateBeninPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const { data } = await axios.post('/api/sms/send-otp', {
      phoneNumber: validation.formattedNumber,
      otp,
      userName
    });
    return data;
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// Fonction pour envoyer un SMS de bienvenue via backend
export const sendWelcomeSMS = async (phoneNumber, userName) => {
  try {
    const validation = validateBeninPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const { data } = await axios.post('/api/sms/send-welcome', {
      phoneNumber: validation.formattedNumber,
      userName
    });
    return data;
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// =====================================================
// FONCTIONS VONAGE VERIFY
// =====================================================

// Démarrer la vérification Vonage
export const startVonageVerification = async (phoneNumber) => {
  try {
    const validation = validateBeninPhoneNumber(phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const { data } = await axios.post('/api/sms/start-verification', {
      phoneNumber: validation.formattedNumber
    });
    
    return data;
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// Vérifier le code Vonage
export const checkVonageVerification = async (requestId, code) => {
  try {
    const { data } = await axios.post('/api/sms/check-verification', {
      requestId,
      code
    });
    
    return data;
  } catch (error) {
    return { success: false, error: error.response?.data?.error || error.message };
  }
};

// Fonction combinée pour l'inscription avec Vonage
export const registerWithVonage = async (phoneNumber, userData) => {
  try {
    // 1. Démarrer la vérification
    const startResult = await startVonageVerification(phoneNumber);
    if (!startResult.success) {
      return startResult;
    }
    
    return {
      success: true,
      request_id: startResult.request_id,
      message: 'Code de vérification envoyé'
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};
