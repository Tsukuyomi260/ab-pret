const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { requireAuth } = require('../utils/authMiddleware');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const formatAmountFCFA = (amount) => {
  const formatted = parseInt(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
};

const getDurationText = (days) => {
  const durations = { 5: '5 jours', 15: '15 jours', 30: '1 mois', 60: '2 mois', 90: '3 mois', 120: '4 mois', 150: '5 mois', 180: '6 mois' };
  return durations[days] || `${days} jours`;
};

const cleanText = (text) => {
  if (!text) return 'Non renseigne';
  return text.replace(/[^\x20-\x7E\xC0-\xFF]/g, '').replace(/\s+/g, ' ').trim();
};

// ─── Design constants ───────────────────────────────────────────────────────
const C = {
  primary:   '#0f2d6b',  // bleu marine
  accent:    '#e8a020',  // or
  light:     '#f0f4ff',  // bleu très clair
  border:    '#c8d4f0',
  text:      '#1a1a2e',
  muted:     '#5a6a8a',
  white:     '#ffffff',
  rowEven:   '#f7f9ff',
  rowOdd:    '#ffffff',
  green:     '#0d6e3f',
};

/**
 * Génère un PDF d'engagement complet sur une seule page A4.
 * @param {Object} opts
 *   - firstName, lastName, email, phone
 *   - amount, duration, interestRate, interest, totalAmount, guarantee
 *   - witnessName, witnessPhone, witnessEmail, witnessAddress
 *   - refNumber, createdAt
 */
function buildPDF(doc, opts) {
  const {
    firstName, lastName, email, phone,
    amount, duration, interestRate, interest, totalAmount, guarantee,
    witnessName, witnessPhone, witnessEmail, witnessAddress,
    refNumber, createdAt,
  } = opts;

  const fullName = `${firstName} ${lastName}`.trim();
  const PAGE_W = 595;
  const MARGIN = 38;
  const COL_W = (PAGE_W - MARGIN * 2 - 12) / 2; // two columns with 12pt gap

  // ── HEADER ──────────────────────────────────────────────────────────────
  // Dark blue background
  doc.rect(0, 0, PAGE_W, 88).fill(C.primary);

  // Gold left accent bar
  doc.rect(0, 0, 6, 88).fill(C.accent);

  // Logo
  const logoPath = path.join(__dirname, '../../frontend/public/logo-campus-finance.png');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, MARGIN, 14, { width: 52, height: 52 });
  } else {
    doc.roundedRect(MARGIN, 14, 52, 52, 6).fill(C.accent);
    doc.fontSize(18).fill(C.primary).text('AB', MARGIN + 14, 30);
  }

  // Company name
  doc.fontSize(20).fill(C.white).font('Helvetica-Bold')
     .text('AB CAMPUS FINANCE', MARGIN + 62, 20, { lineBreak: false });
  doc.fontSize(9).fill(C.accent).font('Helvetica')
     .text('Votre succès, notre mission', MARGIN + 62, 44, { lineBreak: false });

  // Ref + Date block (right side)
  const refX = PAGE_W - MARGIN - 130;
  doc.roundedRect(refX, 16, 130, 54, 4).fill('rgba(255,255,255,0.08)');
  doc.fontSize(7).fill(C.accent).font('Helvetica-Bold')
     .text('RÉFÉRENCE', refX + 8, 22);
  doc.fontSize(10).fill(C.white).font('Helvetica-Bold')
     .text(`#${refNumber}`, refX + 8, 32);
  doc.fontSize(7).fill(C.accent).font('Helvetica-Bold')
     .text('DATE', refX + 8, 47);
  doc.fontSize(8).fill(C.white).font('Helvetica')
     .text(createdAt, refX + 8, 57);

  // ── TITLE BAND ──────────────────────────────────────────────────────────
  doc.rect(0, 88, PAGE_W, 26).fill(C.accent);
  doc.fontSize(12).fill(C.primary).font('Helvetica-Bold')
     .text('DOCUMENT D\'ENGAGEMENT DE PRÊT', 0, 96, { align: 'center', width: PAGE_W });

  // ── TWO-COLUMN SECTION ───────────────────────────────────────────────────
  const colY = 126;
  const leftX = MARGIN;
  const rightX = MARGIN + COL_W + 12;

  // Helper: section title
  const sectionTitle = (title, x, y, w) => {
    doc.rect(x, y, w, 18).fill(C.primary);
    doc.fontSize(8).fill(C.white).font('Helvetica-Bold')
       .text(title, x + 8, y + 5, { width: w - 16 });
    return y + 18;
  };

  // Helper: info row inside a column
  const infoRow = (label, value, x, y, w, even) => {
    doc.rect(x, y, w, 16).fill(even ? C.rowEven : C.rowOdd);
    doc.rect(x, y, w, 16).stroke(C.border).lineWidth(0.3);
    doc.fontSize(7).fill(C.muted).font('Helvetica')
       .text(label, x + 5, y + 5, { width: w * 0.42, lineBreak: false });
    doc.fontSize(7.5).fill(C.text).font('Helvetica-Bold')
       .text(cleanText(String(value)), x + w * 0.44, y + 4.5, { width: w * 0.54, lineBreak: false });
    return y + 16;
  };

  // LEFT – Emprunteur
  let ly = sectionTitle('INFORMATIONS DE L\'EMPRUNTEUR', leftX, colY, COL_W);
  ly = infoRow('Nom complet', fullName, leftX, ly, COL_W, true);
  ly = infoRow('Téléphone', phone || 'Non renseigné', leftX, ly, COL_W, false);
  ly = infoRow('Email', email || 'Non renseigné', leftX, ly, COL_W, true);
  ly = infoRow('Date de demande', createdAt, leftX, ly, COL_W, false);

  // RIGHT – Prêt
  let ry = sectionTitle('DÉTAILS DU PRÊT', rightX, colY, COL_W);
  ry = infoRow('Montant emprunté', formatAmountFCFA(amount), rightX, ry, COL_W, true);
  ry = infoRow('Durée', getDurationText(duration), rightX, ry, COL_W, false);
  ry = infoRow('Taux d\'intérêt', `${interestRate}%`, rightX, ry, COL_W, true);
  ry = infoRow('Intérêts', formatAmountFCFA(interest), rightX, ry, COL_W, false);

  // Total row – highlighted
  const totalY = ry;
  doc.rect(rightX, totalY, COL_W, 18).fill(C.primary);
  doc.fontSize(7).fill(C.accent).font('Helvetica')
     .text('TOTAL À REMBOURSER', rightX + 5, totalY + 5, { width: COL_W * 0.5, lineBreak: false });
  doc.fontSize(8.5).fill(C.white).font('Helvetica-Bold')
     .text(formatAmountFCFA(totalAmount), rightX + COL_W * 0.5, totalY + 4, { width: COL_W * 0.48, lineBreak: false });
  ry = totalY + 18;

  const afterCols = Math.max(ly, ry) + 10;

  // ── ENGAGEMENT BOX ───────────────────────────────────────────────────────
  const engY = afterCols;
  const engH = 50;
  doc.rect(leftX, engY, PAGE_W - MARGIN * 2, engH).fill(C.light).stroke(C.border).lineWidth(0.4);
  doc.rect(leftX, engY, 4, engH).fill(C.accent);
  doc.fontSize(7).fill(C.muted).font('Helvetica-Bold')
     .text('CONDITIONS D\'ENGAGEMENT', leftX + 12, engY + 6);
  const engText = `Je soussigné(e), ${fullName}, reconnais avoir reçu ${formatAmountFCFA(amount)} d'AB Campus Finance et m'engage à rembourser ${formatAmountFCFA(totalAmount)} dans un délai de ${getDurationText(duration)} à compter de la date d'approbation. En cas de retard, une pénalité de 2% tous les 5 jours sera appliquée sur le montant restant dû.`;
  doc.fontSize(7.5).fill(C.text).font('Helvetica')
     .text(engText, leftX + 12, engY + 17, { width: PAGE_W - MARGIN * 2 - 20, align: 'justify' });

  // ── GARANTIE + TÉMOIN (side by side) ─────────────────────────────────────
  const gtY = engY + engH + 8;

  // Garantie (left)
  if (guarantee) {
    let gy = sectionTitle('GARANTIE', leftX, gtY, COL_W);
    gy = infoRow('Objet', guarantee, leftX, gy, COL_W, true);
  }

  // Témoin (right)
  let ty = sectionTitle('INFORMATIONS DU TÉMOIN', rightX, gtY, COL_W);
  ty = infoRow('Nom', witnessName || 'Non renseigné', rightX, ty, COL_W, true);
  ty = infoRow('Téléphone', witnessPhone || 'Non renseigné', rightX, ty, COL_W, false);
  ty = infoRow('Email', witnessEmail || 'Non renseigné', rightX, ty, COL_W, true);
  ty = infoRow('Adresse', witnessAddress || 'Non renseigné', rightX, ty, COL_W, false);

  const afterGT = Math.max(gtY + (guarantee ? 34 : 18), ty) + 10;

  // ── SIGNATURES ───────────────────────────────────────────────────────────
  const sigY = afterGT;
  const sigW = (PAGE_W - MARGIN * 2 - 20) / 3;
  const sigTitles = ['L\'emprunteur', 'Le témoin', 'Le prêteur'];
  const sigNames  = [fullName, witnessName || '—', 'AB Campus Finance'];

  sigTitles.forEach((title, i) => {
    const sx = leftX + i * (sigW + 10);
    doc.rect(sx, sigY, sigW, 56).fill(C.rowEven).stroke(C.border).lineWidth(0.3);
    doc.rect(sx, sigY, sigW, 14).fill(C.primary);
    doc.fontSize(7).fill(C.white).font('Helvetica-Bold')
       .text(title, sx, sigY + 4, { width: sigW, align: 'center' });
    // Signature line
    doc.moveTo(sx + 14, sigY + 42).lineTo(sx + sigW - 14, sigY + 42)
       .strokeColor(C.border).lineWidth(0.8).stroke();
    doc.fontSize(7).fill(C.muted).font('Helvetica')
       .text(sigNames[i], sx, sigY + 45, { width: sigW, align: 'center' });
  });

  // ── FOOTER ───────────────────────────────────────────────────────────────
  const footerY = 800;
  doc.rect(0, footerY, PAGE_W, 42).fill(C.primary);
  doc.rect(0, footerY, PAGE_W, 2).fill(C.accent);

  doc.fontSize(8).fill(C.white).font('Helvetica-Bold')
     .text('AB Campus Finance', leftX, footerY + 8);
  doc.fontSize(7).fill(C.accent).font('Helvetica')
     .text('+229 53463606  |  abpret51@gmail.com', leftX, footerY + 20);

  doc.fontSize(7).fill(C.muted).font('Helvetica')
     .text('Document généré automatiquement — Valide pour la durée du prêt', 0, footerY + 28, { align: 'center', width: PAGE_W });
}

// ─── Route preview (avant soumission) ────────────────────────────────────────
router.post('/generate-preview-pdf', requireAuth, async (req, res) => {
  try {
    const { user, loan, calculation } = req.body;
    if (!user || !loan || !calculation) {
      return res.status(400).json({ success: false, error: 'Données manquantes' });
    }

    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=engagement-pret-preview.pdf');
    doc.pipe(res);

    buildPDF(doc, {
      firstName: user.first_name,
      lastName:  user.last_name,
      email:     user.email,
      phone:     user.phone_number,
      amount:      loan.amount,
      duration:    loan.duration,
      interestRate: loan.interest_rate,
      interest:    calculation.interest,
      totalAmount: calculation.totalAmount,
      guarantee:   loan.guarantee,
      witnessName:    user.temoin_name,
      witnessPhone:   user.temoin_phone,
      witnessEmail:   user.temoin_email,
      witnessAddress: user.temoin_quartier,
      refNumber: `PREV-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    });

    doc.end();
  } catch (error) {
    console.error('[PDF PREVIEW] Erreur:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: `Erreur génération PDF: ${error.message}` });
    }
  }
});

// ─── Route par ID de prêt (après approbation) ────────────────────────────────
router.get('/generate-pdf/:loanId', requireAuth, async (req, res) => {
  try {
    const { loanId } = req.params;

    const { data: loanData, error: loanError } = await supabase
      .from('loans').select('*').eq('id', loanId).single();
    if (loanError || !loanData) {
      return res.status(404).json({ success: false, error: 'Prêt non trouvé' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users').select('*').eq('id', loanData.user_id).single();
    if (userError || !userData) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    const interest = Math.round(loanData.amount * (loanData.interest_rate / 100));
    const totalAmount = loanData.amount + interest;

    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=engagement-pret-${loanId}.pdf`);
    doc.pipe(res);

    buildPDF(doc, {
      firstName: userData.first_name,
      lastName:  userData.last_name,
      email:     userData.email,
      phone:     userData.phone_number,
      amount:      loanData.amount,
      duration:    loanData.duration || loanData.duration_months,
      interestRate: loanData.interest_rate,
      interest,
      totalAmount,
      guarantee:   loanData.guarantee,
      witnessName:    userData.temoin_name,
      witnessPhone:   userData.temoin_phone,
      witnessEmail:   userData.temoin_email,
      witnessAddress: userData.temoin_quartier,
      refNumber: loanId.toString().slice(-6).toUpperCase(),
      createdAt: new Date(loanData.created_at).toLocaleDateString('fr-FR'),
    });

    doc.end();
  } catch (error) {
    console.error('[PDF] Erreur:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: `Erreur génération PDF: ${error.message}` });
    }
  }
});

// ─── Route generate-loan-pdf (admin/legacy) ──────────────────────────────────
router.post('/generate-loan-pdf', requireAuth, async (req, res) => {
  try {
    const { userId, loanData } = req.body;
    if (!userId || !loanData) {
      return res.status(400).json({ success: false, error: 'userId et loanData requis' });
    }

    const { data: userData, error: userError } = await supabase
      .from('users').select('*').eq('id', userId).single();
    if (userError || !userData) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    const interest = Math.round(loanData.amount * ((loanData.interest_rate || 0) / 100));
    const totalAmount = loanData.amount + interest;

    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=engagement_pret_${userData.last_name}_${new Date().toISOString().split('T')[0]}.pdf`);
    doc.pipe(res);

    buildPDF(doc, {
      firstName: userData.first_name,
      lastName:  userData.last_name,
      email:     userData.email,
      phone:     userData.phone_number,
      amount:      loanData.amount,
      duration:    loanData.duration_months || loanData.duration,
      interestRate: loanData.interest_rate || 0,
      interest,
      totalAmount,
      guarantee:   loanData.guarantee,
      witnessName:    userData.temoin_name,
      witnessPhone:   userData.temoin_phone,
      witnessEmail:   userData.temoin_email,
      witnessAddress: userData.temoin_quartier,
      refNumber: `${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toLocaleDateString('fr-FR'),
    });

    doc.end();
  } catch (error) {
    console.error('[PDF] Erreur:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: `Erreur génération PDF: ${error.message}` });
    }
  }
});

module.exports = router;
