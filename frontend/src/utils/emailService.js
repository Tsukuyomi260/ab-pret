import { Resend } from 'resend';

// Initialiser Resend avec la clé API
const resend = new Resend(process.env.REACT_APP_RESEND_API_KEY);

// Template d'email pour l'OTP
const createOTPEmailTemplate = (otp, userName) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de vérification - Campus Finance</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            color: #C8AC44;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .otp-code {
            background-color: #f8f9fa;
            border: 2px solid #C8AC44;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #C8AC44;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CAMPUS FINANCE</div>
            <h2>Code de vérification</h2>
        </div>
        
        <p>Bonjour ${userName},</p>
        
        <p>Vous avez demandé un code de vérification pour créer votre compte Campus Finance.</p>
        
        <div class="otp-code">${otp}</div>
        
        <p>Ce code est valide pendant <strong>15 minutes</strong>.</p>
        
        <div class="warning">
            <strong>⚠️ Sécurité :</strong> Ne partagez jamais ce code avec qui que ce soit. 
            L'équipe Campus Finance ne vous demandera jamais votre code de vérification.
        </div>
        
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
        
        <div class="footer">
            <p>© 2024 Campus Finance. Tous droits réservés.</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
        </div>
    </div>
</body>
</html>
`;

// Fonction pour envoyer un email OTP
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    if (!process.env.REACT_APP_RESEND_API_KEY) {
      console.error('[EMAIL] Clé API Resend manquante');
      return { success: false, error: 'Configuration email manquante' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Campus Finance <noreply@campusfinance.com>', // Remplacez par votre domaine vérifié
      to: [email],
      subject: 'Code de vérification - Campus Finance',
      html: createOTPEmailTemplate(otp, userName)
    });

    if (error) {
      console.error('[EMAIL] Erreur lors de l\'envoi:', error);
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] Email OTP envoyé avec succès:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi:', error.message);
    return { success: false, error: error.message };
  }
};

// Fonction pour envoyer un email de bienvenue
export const sendWelcomeEmail = async (email, userName) => {
  try {
    if (!process.env.REACT_APP_RESEND_API_KEY) {
      console.error('[EMAIL] Clé API Resend manquante');
      return { success: false, error: 'Configuration email manquante' };
    }

    const { data, error } = await resend.emails.send({
      from: 'Campus Finance <noreply@campusfinance.com>',
      to: [email],
      subject: 'Bienvenue chez Campus Finance !',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C8AC44;">Bienvenue chez Campus Finance !</h2>
          <p>Bonjour ${userName},</p>
          <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à toutes nos fonctionnalités.</p>
          <p>Merci de nous faire confiance pour vos besoins financiers.</p>
          <p>Cordialement,<br>L'équipe Campus Finance</p>
        </div>
      `
    });

    if (error) {
      console.error('[EMAIL] Erreur lors de l\'envoi du bienvenue:', error);
      return { success: false, error: error.message };
    }

    console.log('[EMAIL] Email de bienvenue envoyé:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[EMAIL] Erreur lors de l\'envoi du bienvenue:', error.message);
    return { success: false, error: error.message };
  }
};
