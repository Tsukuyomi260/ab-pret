const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour formater les montants en FCFA
const formatAmountFCFA = (amount) => {
  return `${parseInt(amount).toLocaleString('fr-FR')} FCFA`;
};

// Fonction pour obtenir le texte de durée
const getDurationText = (days) => {
  const durations = {
    5: '5 jours',
    15: '15 jours', 
    30: '1 mois',
    60: '2 mois',
    90: '3 mois',
    120: '4 mois',
    150: '5 mois',
    180: '6 mois'
  };
  return durations[days] || `${days} jours`;
};

// Route pour générer le PDF d'engagement de prêt
router.post('/generate-loan-pdf', async (req, res) => {
  try {
    const { userId, loanData } = req.body;

    if (!userId || !loanData) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId et loanData sont requis' 
      });
    }

    console.log('[PDF] Génération du PDF pour l\'utilisateur:', userId);
    console.log('[PDF] Données du prêt:', loanData);

    // Récupérer les données complètes de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('[PDF] Erreur récupération utilisateur:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Créer le document PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Configuration des couleurs inspirées de la facture
    const primaryColor = '#1e3a8a'; // Bleu foncé (comme la facture)
    const accentColor = '#f59e0b'; // Jaune/or (comme la facture)
    const textColor = '#374151'; // Gris foncé
    const lightGray = '#f3f4f6'; // Gris clair

    // Variables pour les données
    const clientName = `${userData.first_name || 'Prénom'} ${userData.last_name || 'Nom'}`.trim();
    const filiere = userData.filiere || 'Non spécifiée';
    const anneeEtude = userData.annee_etude || 'Non spécifiée';
    const montantPret = formatAmountFCFA(loanData.amount);
    const dureePret = getDurationText(loanData.duration_months);
    const tauxInteret = `${loanData.interest_rate}%`;
    const dateEmprunt = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // ===== EN-TÊTE INSPIRÉ DE LA FACTURE =====
    
    // Fond bleu foncé pour l'en-tête (comme la facture)
    doc.rect(0, 0, 595, 80)
       .fill(primaryColor);

    // Logo AB Campus Finance
    try {
      const logoPath = path.join(__dirname, '../../frontend/public/logo-campus-finance.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 20, { width: 40, height: 40 });
      } else {
        // Fallback si le logo n'existe pas
        doc.rect(50, 20, 40, 40)
           .fill('#ffffff')
           .stroke(primaryColor);
        doc.fontSize(16)
           .fill(primaryColor)
           .text('AB', 70, 35, { align: 'center' });
      }
    } catch (error) {
      console.error('[PDF] Erreur chargement logo:', error);
      // Fallback en cas d'erreur
      doc.rect(50, 20, 40, 40)
         .fill('#ffffff')
         .stroke(primaryColor);
      doc.fontSize(16)
         .fill(primaryColor)
         .text('AB', 70, 35, { align: 'center' });
    }

    // Nom de l'entreprise
    doc.fontSize(24)
       .fill('#ffffff')
       .text('AB CAMPUS FINANCE', 120, 25);

    // Sous-titre
    doc.fontSize(14)
       .fill('#ffffff')
       .text('ENGAGEMENT DE PRÊT', 120, 50);

    // Forme décorative jaune (inspirée de la facture)
    doc.save();
    doc.moveTo(450, 0)
       .lineTo(595, 0)
       .lineTo(595, 80)
       .lineTo(520, 80)
       .fill(accentColor);
    doc.restore();

    // Numéro et date (comme la facture)
    doc.fontSize(12)
       .fill('#ffffff')
       .text(`N° ${Date.now().toString().slice(-6)}`, 450, 30)
       .text(`Date: ${dateEmprunt}`, 450, 50);

    // ===== SECTION INFORMATIONS CLIENT =====
    
    let yPosition = 120;

    // Titre de section avec fond jaune
    doc.rect(50, yPosition, 495, 25)
       .fill(accentColor);
    
    doc.fontSize(16)
       .fill('#ffffff')
       .text('INFORMATIONS CLIENT', 60, yPosition + 8);

    yPosition += 40;

    // Informations du client
    const clientInfo = [
      { label: 'Nom complet', value: clientName },
      { label: 'Filière', value: filiere },
      { label: 'Année d\'étude', value: anneeEtude },
      { label: 'Téléphone', value: userData.phone || 'Non spécifié' },
      { label: 'Email', value: userData.email || 'Non spécifié' }
    ];

    clientInfo.forEach((info, index) => {
      const x = 50 + (index % 2) * 250;
      const y = yPosition + Math.floor(index / 2) * 25;
      
      doc.fontSize(10)
         .fill(textColor)
         .text(`${info.label}:`, x, y)
         .text(info.value, x + 80, y);
    });

    yPosition += 80;

    // ===== SECTION DÉTAILS DU PRÊT =====
    
    // Titre de section avec fond jaune
    doc.rect(50, yPosition, 495, 25)
       .fill(accentColor);
    
    doc.fontSize(16)
       .fill('#ffffff')
       .text('DÉTAILS DU PRÊT', 60, yPosition + 8);

    yPosition += 40;

    // Tableau des détails du prêt
    const loanDetails = [
      { label: 'Montant emprunté', value: montantPret },
      { label: 'Durée du prêt', value: dureePret },
      { label: 'Taux d\'intérêt', value: tauxInteret },
      { label: 'Date d\'emprunt', value: dateEmprunt },
      { label: 'Statut', value: 'En attente' }
    ];

    // En-tête du tableau
    doc.rect(50, yPosition, 495, 20)
       .fill(lightGray)
       .stroke(textColor);

    doc.fontSize(12)
       .fill(textColor)
       .text('DÉTAIL', 60, yPosition + 6)
       .text('VALEUR', 350, yPosition + 6);

    yPosition += 25;

    // Lignes du tableau
    loanDetails.forEach((detail, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : lightGray;
      
      doc.rect(50, yPosition, 495, 20)
         .fill(bgColor)
         .stroke(textColor);

      doc.fontSize(10)
         .fill(textColor)
         .text(detail.label, 60, yPosition + 6)
         .text(detail.value, 350, yPosition + 6);

      yPosition += 20;
    });

    yPosition += 30;

    // ===== SECTION ENGAGEMENT =====
    
    // Titre de section avec fond jaune
    doc.rect(50, yPosition, 495, 25)
       .fill(accentColor);
    
    doc.fontSize(16)
       .fill('#ffffff')
       .text('ENGAGEMENT DE REMBOURSEMENT', 60, yPosition + 8);

    yPosition += 40;

    // Texte d'engagement
    const engagementText = [
      `Je soussigné(e) ${clientName}, étudiant(e) en ${filiere} en ${anneeEtude},`,
      `reconnais avoir reçu un prêt de ${montantPret} de la part de AB Campus Finance,`,
      `à rembourser avant ${dureePret}.`,
      '',
      'En cas de retard de paiement, une pénalité de 2% par jour sera appliquée.',
      'Cette pénalité s\'accumule quotidiennement jusqu\'au remboursement complet.'
    ];

    engagementText.forEach((line, index) => {
      if (line === '') {
        yPosition += 10;
      } else {
        doc.fontSize(11)
           .fill(textColor)
           .text(line, 60, yPosition);
        yPosition += 20;
      }
    });

    yPosition += 30;

    // ===== PIED DE PAGE =====
    
    // Position fixe en bas de page (A4 = 842px de hauteur)
    const footerY = 792; // 842 - 50 = 792px pour que le footer fasse 50px de haut
    
    // Fond bleu foncé pour le pied de page (comme la facture)
    doc.rect(0, footerY, 595, 50)
       .fill(primaryColor);

    // Informations de contact
    doc.fontSize(10)
       .fill('#ffffff')
       .text('AB Campus Finance', 50, footerY + 10)
       .text('Téléphone: +229 53463606', 50, footerY + 25)
       .text('Email: abpret51@gmail.com', 50, footerY + 40);

    // Mention de validité
    doc.fontSize(9)
       .fill('#ffffff')
       .text('Document généré automatiquement - Valide pour la durée du prêt', 300, footerY + 25);

    // Finaliser le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="engagement_pret_${clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`);

    doc.pipe(res);
    doc.end();

    console.log('[PDF] PDF généré avec succès pour:', clientName);

  } catch (error) {
    console.error('[PDF] Erreur lors de la génération du PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la génération du PDF' 
    });
  }
});

module.exports = router;


