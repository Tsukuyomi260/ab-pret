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
  // Utiliser un formatage simple avec des espaces normaux
  const formatted = parseInt(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
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

// Fonction pour nettoyer le texte des caractères problématiques
const cleanText = (text) => {
  if (!text) return 'Non renseigne';
  // Remplacer les caractères problématiques
  return text
    .replace(/[^\x20-\x7E\xC0-\xFF]/g, '') // Garder ASCII + Latin-1
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
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
    
    // Ajouter un espace avant le footer
    doc.moveDown(3);
    
    // Position du footer basée sur la position actuelle
    const footerY = doc.y;
    
    // Fond bleu foncé pour le pied de page
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

// Route pour générer le PDF par ID de prêt
router.get('/generate-pdf/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;

    if (!loanId) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID de prêt requis' 
      });
    }

    console.log('[PDF] Génération du PDF pour le prêt:', loanId);

    // Récupérer les données du prêt
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (loanError || !loanData) {
      console.error('[PDF] Erreur récupération prêt:', loanError);
      return res.status(404).json({ 
        success: false, 
        error: 'Prêt non trouvé' 
      });
    }

    // Récupérer les données de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', loanData.user_id)
      .single();

    if (userError || !userData) {
      console.error('[PDF] Erreur récupération utilisateur:', userError);
      return res.status(404).json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      });
    }

    // Créer le document PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Configuration de la réponse HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=engagement-pret-${loanId}.pdf`);
    
    // Pipe le PDF vers la réponse
    doc.pipe(res);

    // Couleurs
    const primaryColor = '#1e40af'; // Bleu
    const secondaryColor = '#64748b'; // Gris
    const accentColor = '#f59e0b'; // Orange

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

    // En-tête
    doc.fontSize(24)
       .fillColor(primaryColor)
       .text('AB CAMPUS FINANCE', 100, 30, { align: 'left' });
    
    doc.fontSize(10)
       .fillColor(secondaryColor)
       .text('Votre succès, notre mission', 100, 55, { align: 'left' });

    // Ligne de séparation
    doc.moveTo(50, 80)
       .lineTo(545, 80)
       .strokeColor(primaryColor)
       .lineWidth(2)
       .stroke();

    // Titre du document
    doc.moveDown(3);
    doc.fontSize(20)
       .fillColor(primaryColor)
       .text('DOCUMENT D\'ENGAGEMENT DE PRÊT', { align: 'center' });
    
    doc.moveDown(2);

    // Informations de l'emprunteur
    doc.fontSize(14)
       .fillColor(primaryColor)
       .text('INFORMATIONS DE L\'EMPRUNTEUR', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(11)
       .fillColor('#000000')
       .text(`Nom complet: ${userData.first_name} ${userData.last_name}`)
       .text(`Email: ${userData.email}`)
       .text(`Téléphone: ${userData.phone_number || 'Non renseigné'}`)
       .text(`Date de demande: ${new Date(loanData.created_at).toLocaleDateString('fr-FR')}`);

    doc.moveDown(1.5);

    // Détails du prêt
    doc.fontSize(14)
       .fillColor(primaryColor)
       .text('DÉTAILS DU PRÊT', { underline: true });
    
    doc.moveDown(0.5);
    
    const interestAmount = Math.round(loanData.amount * (loanData.interest_rate / 100));
    const totalAmount = loanData.amount + interestAmount;
    
    doc.fontSize(11)
       .fillColor('#000000')
       .text(`Montant emprunté: ${formatAmountFCFA(loanData.amount)}`)
       .text(`Durée: ${getDurationText(loanData.duration)}`)
       .text(`Taux d'intérêt: ${loanData.interest_rate}%`)
       .text(`Intérêts: ${formatAmountFCFA(interestAmount)}`)
       .text(`Montant total à rembourser: ${formatAmountFCFA(totalAmount)}`, { 
         bold: true, 
         fillColor: accentColor 
       });

    doc.moveDown(1.5);

    // Conditions d'engagement
    doc.fontSize(14)
       .fillColor(primaryColor)
       .text('CONDITIONS D\'ENGAGEMENT', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10)
       .fillColor('#000000')
       .text('Je soussigné(e), ' + userData.first_name + ' ' + userData.last_name + ', reconnais avoir reçu la somme de ' + formatAmountFCFA(loanData.amount) + ' de la part d\'AB Campus Finance.', {
         align: 'justify'
       });
    
    doc.moveDown(0.5);
    doc.text('Je m\'engage à rembourser la totalité du prêt, soit ' + formatAmountFCFA(totalAmount) + ' (capital + intérêts), dans un délai de ' + getDurationText(loanData.duration) + ' à compter de ce jour.', {
      align: 'justify'
    });

    doc.moveDown(0.5);
    doc.text('En cas de retard de paiement, des pénalités de 2% par jour seront appliquées sur le montant restant dû.', {
      align: 'justify'
    });

    doc.moveDown(1.5);

    // Garantie
    if (loanData.guarantee) {
      doc.fontSize(14)
         .fillColor(primaryColor)
         .text('GARANTIE', { underline: true });
      
      doc.moveDown(0.5);
      doc.fontSize(10)
         .fillColor('#000000')
         .text(`Garantie fournie: ${cleanText(loanData.guarantee)}`);
      
      doc.moveDown(1.5);
    }

    // Signatures
    doc.fontSize(14)
       .fillColor(primaryColor)
       .text('SIGNATURES', { underline: true });
    
    doc.moveDown(2);
    
    const signatureY = doc.y;
    
    // Signature emprunteur
    doc.fontSize(10)
       .fillColor('#000000')
       .text('L\'emprunteur', 80, signatureY);
    doc.text('(Signature)', 80, signatureY + 15);
    doc.moveTo(80, signatureY + 60)
       .lineTo(230, signatureY + 60)
       .stroke();
    doc.text(userData.first_name + ' ' + userData.last_name, 80, signatureY + 65);
    
    // Signature prêteur
    doc.text('Le prêteur', 350, signatureY);
    doc.text('(Signature)', 350, signatureY + 15);
    doc.moveTo(350, signatureY + 60)
       .lineTo(500, signatureY + 60)
       .stroke();
    doc.text('AB Campus Finance', 350, signatureY + 65);

    // Footer
    doc.moveDown(3);
    const footerY = doc.y;
    doc.rect(0, footerY, 595, 50)
       .fill(primaryColor);
    
    doc.fontSize(10)
       .fill('#ffffff')
       .text('AB Campus Finance', 50, footerY + 10)
       .text('Téléphone: +229 53463606', 50, footerY + 25)
       .text('Email: abpret51@gmail.com', 50, footerY + 40);
    
    doc.fontSize(9)
       .fill('#ffffff')
       .text('Document généré automatiquement - Valide pour la durée du prêt', 300, footerY + 25);

    // Finaliser le PDF
    doc.end();

  } catch (error) {
    console.error('[PDF] Erreur lors de la génération du PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la génération du PDF' 
    });
  }
});

// Route pour générer un PDF preview (avant soumission)
router.post('/generate-preview-pdf', async (req, res) => {
  try {
    const { user, loan, calculation } = req.body;

    if (!user || !loan || !calculation) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données manquantes' 
      });
    }

    console.log('[PDF PREVIEW] Génération du PDF preview');
    console.log('[PDF PREVIEW] User data:', user);
    
    // Récupérer les infos du témoin depuis l'utilisateur
    const witness = {
      name: user.temoin_name || 'Non renseigné',
      phone: user.temoin_phone || 'Non renseigné',
      address: user.temoin_quartier || 'Non renseigné',
      email: user.temoin_email || 'Non renseigné'
    };

    // Créer le document PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Configuration de la réponse HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=engagement-pret-preview.pdf`);
    
    // Pipe le PDF vers la réponse
    doc.pipe(res);

    // Couleurs
    const primaryColor = '#1e40af'; // Bleu
    const secondaryColor = '#64748b'; // Gris
    const accentColor = '#f59e0b'; // Orange

    // Logo AB Campus Finance
    try {
      const logoPath = path.join(__dirname, '../../frontend/public/logo-campus-finance.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 20, { width: 40, height: 40 });
      } else {
        doc.rect(50, 20, 40, 40)
           .fill('#ffffff')
           .stroke(primaryColor);
        doc.fontSize(16)
           .fill(primaryColor)
           .text('AB', 70, 35, { align: 'center' });
      }
    } catch (error) {
      console.error('[PDF] Erreur chargement logo:', error);
      doc.rect(50, 20, 40, 40)
         .fill('#ffffff')
         .stroke(primaryColor);
      doc.fontSize(16)
         .fill(primaryColor)
         .text('AB', 70, 35, { align: 'center' });
    }

    // En-tête
    doc.fontSize(24)
       .fillColor(primaryColor)
       .text('AB CAMPUS FINANCE', 100, 30, { align: 'left' });
    
    doc.fontSize(10)
       .fillColor(secondaryColor)
       .text('Votre succès, notre mission', 100, 55, { align: 'left' });

    // Ligne de séparation
    doc.moveTo(50, 80)
       .lineTo(545, 80)
       .strokeColor(primaryColor)
       .lineWidth(2)
       .stroke();

    // Titre du document
    doc.moveDown(1.5);
    doc.fontSize(16)
       .fillColor(primaryColor)
       .text('DOCUMENT D\'ENGAGEMENT DE PRÊT', { align: 'center' });
    
    doc.moveDown(1);

    // Informations de l'emprunteur
    doc.fontSize(12)
       .fillColor(primaryColor)
       .text('INFORMATIONS DE L\'EMPRUNTEUR', { underline: true });
    
    doc.moveDown(0.3);
    doc.fontSize(10)
       .fillColor('#000000')
       .text(`Nom complet: ${user.first_name} ${user.last_name}`)
       .text(`Email: ${user.email}`)
       .text(`Téléphone: ${user.phone_number || 'Non renseigné'}`)
       .text(`Date de demande: ${new Date().toLocaleDateString('fr-FR')}`);

    doc.moveDown(0.8);

    // Détails du prêt
    doc.fontSize(12)
       .fillColor(primaryColor)
       .text('DÉTAILS DU PRÊT', { underline: true });
    
    doc.moveDown(0.3);
    
    doc.fontSize(10)
       .fillColor('#000000')
       .text(`Montant emprunté: ${formatAmountFCFA(loan.amount)}`)
       .text(`Durée: ${getDurationText(loan.duration)}`)
       .text(`Taux d'intérêt: ${loan.interest_rate}%`)
       .text(`Intérêts: ${formatAmountFCFA(calculation.interest)}`)
       .text(`Montant total à rembourser: ${formatAmountFCFA(calculation.totalAmount)}`, { 
         bold: true, 
         fillColor: accentColor 
       });

    doc.moveDown(0.8);

    // Garantie
    if (loan.guarantee) {
      doc.fontSize(12)
         .fillColor(primaryColor)
         .text('GARANTIE', { underline: true });
      
      doc.moveDown(0.3);
      doc.fontSize(9)
         .fillColor('#000000')
         .text(`Garantie: ${cleanText(loan.guarantee)}`);
      
      doc.moveDown(0.8);
    }

    // Conditions d'engagement (version compacte)
    doc.fontSize(12)
       .fillColor(primaryColor)
       .text('CONDITIONS D\'ENGAGEMENT', { underline: true });
    
    doc.moveDown(0.3);
    doc.fontSize(9)
       .fillColor('#000000')
       .text('Je soussigné(e), ' + user.first_name + ' ' + user.last_name + ', reconnais avoir reçu ' + formatAmountFCFA(loan.amount) + ' d\'AB Campus Finance et m\'engage à rembourser ' + formatAmountFCFA(calculation.totalAmount) + ' dans un délai de ' + getDurationText(loan.duration) + '. Pénalités: 2%/jour en cas de retard.', {
         align: 'justify'
       });

    doc.moveDown(0.8);

    // Informations du témoin
    doc.fontSize(12)
       .fillColor(primaryColor)
       .text('INFORMATIONS DU TÉMOIN', { underline: true });
    
    doc.moveDown(0.3);
    doc.fontSize(9)
       .fillColor('#000000')
       .text(`Nom: ${witness.name} | Tél: ${witness.phone} | Email: ${witness.email}`)
       .text(`Adresse: ${witness.address}`);

    doc.moveDown(0.8);

    // Signatures (version compacte - 3 colonnes)
    doc.fontSize(12)
       .fillColor(primaryColor)
       .text('SIGNATURES', { underline: true });
    
    doc.moveDown(0.5);
    
    const signatureY = doc.y;
    
    // Signature emprunteur (gauche)
    doc.fontSize(8)
       .fillColor('#000000')
       .text('L\'emprunteur', 50, signatureY);
    doc.moveTo(50, signatureY + 30)
       .lineTo(150, signatureY + 30)
       .stroke();
    doc.fontSize(7).text(user.first_name + ' ' + user.last_name, 50, signatureY + 33);
    
    // Signature témoin (centre)
    doc.fontSize(8).text('Le témoin', 200, signatureY);
    doc.moveTo(200, signatureY + 30)
       .lineTo(300, signatureY + 30)
       .stroke();
    doc.fontSize(7).text(witness.name, 200, signatureY + 33);

    // Signature prêteur (droite)
    doc.fontSize(8).text('Le prêteur', 350, signatureY);
    doc.moveTo(350, signatureY + 30)
       .lineTo(450, signatureY + 30)
       .stroke();
    doc.fontSize(7).text('AB Campus Finance', 350, signatureY + 33);

    // Footer (positionner après les signatures)
    // Calculer la position après les signatures
    const footerY = signatureY + 50;
    doc.rect(0, footerY, 595, 50)
       .fill(primaryColor);
    
    doc.fontSize(10)
       .fill('#ffffff')
       .text('AB Campus Finance', 50, footerY + 10)
       .text('Téléphone: +229 53463606', 50, footerY + 25)
       .text('Email: abpret51@gmail.com', 50, footerY + 40);
    
    doc.fontSize(9)
       .fill('#ffffff')
       .text('Document généré automatiquement - Valide pour la durée du prêt', 300, footerY + 25);

    // Finaliser le PDF
    doc.end();

  } catch (error) {
    console.error('[PDF PREVIEW] Erreur complète:', error);
    console.error('[PDF PREVIEW] Message:', error.message);
    console.error('[PDF PREVIEW] Stack:', error.stack);
    
    // Ne pas envoyer de JSON si les headers ont déjà été envoyés
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        error: `Erreur lors de la génération du PDF: ${error.message}` 
      });
    }
  }
});

module.exports = router;


