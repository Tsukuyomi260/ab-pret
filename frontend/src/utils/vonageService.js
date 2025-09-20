// =====================================================
// SERVICE VONAGE POUR SMS OTP
// =====================================================

const { Vonage } = require('@vonage/server-sdk');

// Configuration Vonage
const vonage = new Vonage({
  apiKey: process.env.REACT_APP_VONAGE_API_KEY || "5991994e",
  apiSecret: process.env.REACT_APP_VONAGE_API_SECRET || "TXqA0XxEzJQWBtfI"
});

const BRAND_NAME = process.env.REACT_APP_VONAGE_BRAND_NAME || "AB Campus Finance";

class VonageService {
  /**
   * Démarrer la vérification OTP
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  static async startVerification(phoneNumber) {
    try {
      console.log(`📱 Démarrage vérification Vonage pour: ${phoneNumber}`);
      
      const response = await vonage.verify.start({
        number: phoneNumber,
        brand: BRAND_NAME
      });
      
      console.log(`✅ Vérification démarrée, request_id: ${response.request_id}`);
      
      return {
        success: true,
        request_id: response.request_id,
        message: 'Code de vérification envoyé'
      };
      
    } catch (error) {
      console.error(`❌ Erreur Vonage startVerification:`, error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du code'
      };
    }
  }

  /**
   * Vérifier le code OTP
   * @param {string} requestId - ID de la requête
   * @param {string} code - Code OTP
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  static async checkVerification(requestId, code) {
    try {
      console.log(`🔍 Vérification du code: ${code} pour request_id: ${requestId}`);
      
      const response = await vonage.verify.check(requestId, code);
      
      console.log(`✅ Vérification terminée:`, response);
      
      return {
        success: true,
        status: response.status,
        message: 'Code vérifié avec succès'
      };
      
    } catch (error) {
      console.error(`❌ Erreur Vonage checkVerification:`, error);
      return {
        success: false,
        error: error.message || 'Erreur lors de la vérification'
      };
    }
  }

  /**
   * Annuler la vérification
   * @param {string} requestId - ID de la requête
   * @returns {Promise<Object>} - Résultat de l'annulation
   */
  static async cancelVerification(requestId) {
    try {
      console.log(`❌ Annulation de la vérification: ${requestId}`);
      
      const response = await vonage.verify.cancel(requestId);
      
      console.log(`✅ Vérification annulée:`, response);
      
      return {
        success: true,
        message: 'Vérification annulée'
      };
      
    } catch (error) {
      console.error(`❌ Erreur Vonage cancelVerification:`, error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'annulation'
      };
    }
  }

  /**
   * Envoyer un SMS simple (alternative)
   * @param {string} phoneNumber - Numéro de téléphone
   * @param {string} message - Message à envoyer
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  static async sendSMS(phoneNumber, message) {
    try {
      console.log(`📱 Envoi SMS Vonage à: ${phoneNumber}`);
      
      const response = await vonage.message.sendSms(
        BRAND_NAME,
        phoneNumber,
        message
      );
      
      console.log(`✅ SMS envoyé:`, response);
      
      return {
        success: true,
        message_id: response.messages[0]['message-id'],
        message: 'SMS envoyé avec succès'
      };
      
    } catch (error) {
      console.error(`❌ Erreur Vonage sendSMS:`, error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du SMS'
      };
    }
  }

  /**
   * Générer un code OTP et l'envoyer
   * @param {string} phoneNumber - Numéro de téléphone
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  static async sendOTP(phoneNumber) {
    try {
      // Générer un code OTP à 6 chiffres
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const message = `Votre code de vérification AB Campus Finance est: ${otpCode}. Valide 10 minutes.`;
      
      const result = await this.sendSMS(phoneNumber, message);
      
      if (result.success) {
        return {
          success: true,
          otp_code: otpCode,
          message_id: result.message_id,
          message: 'Code OTP envoyé avec succès'
        };
      } else {
        return result;
      }
      
    } catch (error) {
      console.error(`❌ Erreur Vonage sendOTP:`, error);
      return {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du code OTP'
      };
    }
  }
}

module.exports = VonageService;
