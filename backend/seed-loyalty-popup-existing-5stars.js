/**
 * Script une fois : crée les notifications de fidélité (popup) pour les utilisateurs
 * qui ont DÉJÀ 5 étoiles actuellement, mais qui n'ont jamais eu le popup.
 *
 * À lancer après avoir exécuté add-loyalty-status.sql.
 *
 * Usage: node seed-loyalty-popup-existing-5stars.js [--dry-run]
 * --dry-run : affiche les utilisateurs concernés sans créer les notifications.
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const DRY_RUN = process.argv.includes('--dry-run');

function computeLoyaltyScore(loans, payments, loyaltyLastReset) {
  const loanById = new Map(loans.map((l) => [l.id, l]));
  const completed = payments.filter((p) => (p.status || '').toLowerCase() === 'completed');
  const lastResetDate = loyaltyLastReset ? new Date(loyaltyLastReset) : null;
  const onTimeLoanIds = new Set();

  completed.forEach((p) => {
    const loan = loanById.get(p.loan_id);
    if (!loan?.approved_at) return;
    const startDate = new Date(loan.approved_at);
    if (lastResetDate && startDate.getTime() < lastResetDate.getTime()) return;
    const durationDays = parseInt(loan.duration_months || loan.duration || 30, 10);
    const dueDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const paymentDate = new Date(p.payment_date || p.created_at || new Date());
    if (paymentDate.getTime() <= dueDate.getTime()) onTimeLoanIds.add(p.loan_id);
  });

  return Math.min(5, onTimeLoanIds.size);
}

async function main() {
  console.log(DRY_RUN ? '🔍 [DRY-RUN] Recherche des utilisateurs à 5 étoiles sans popup...\n' : '🔍 Recherche des utilisateurs à 5 étoiles sans popup...\n');

  // Utilisateurs ayant au moins un prêt (pour limiter le scope)
  const { data: allLoans, error: loansErr } = await supabase.from('loans').select('user_id').not('user_id', 'is', null);
  if (loansErr) {
    console.error('❌ Erreur récupération prêts:', loansErr.message);
    process.exit(1);
  }

  const userIds = [...new Set((allLoans || []).map((l) => l.user_id))];
  console.log(`📊 ${userIds.length} utilisateur(s) avec au moins un prêt.\n`);

  let processed = 0;
  let created = 0;

  for (const userId of userIds) {
    const [loansRes, paymentsRes, userRes] = await Promise.all([
      supabase.from('loans').select('*').eq('user_id', userId),
      supabase.from('payments').select('*').eq('user_id', userId),
      supabase.from('users').select('id, first_name, last_name, loyalty_last_reset').eq('id', userId).single(),
    ]);

    if (loansRes.error || paymentsRes.error || userRes.error || !userRes.data) continue;

    const loans = loansRes.data || [];
    const payments = paymentsRes.data || [];
    const user = userRes.data;
    const score = computeLoyaltyScore(loans, payments, user.loyalty_last_reset);

    if (score !== 5) continue;
    processed++;

    const clientName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Client';

    // Déjà une notification client non lue ?
    const { data: existingClientList } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'loyalty_achievement')
      .eq('read', false)
      .limit(1);

    if (existingClientList && existingClientList.length > 0) {
      console.log(`⏭️  ${clientName} (${userId}) : déjà une notification non lue, ignoré.`);
      continue;
    }

    console.log(`⭐ ${clientName} (${userId}) : 5 étoiles, création des notifications.`);

    if (DRY_RUN) {
      created++;
      continue;
    }

    const { error: clientNotifError } = await supabase.from('notifications').insert({
      user_id: userId,
      title: '🏆 Félicitations ! Score de fidélité maximum atteint',
      message: `Bravo ${clientName} ! Vous avez atteint le score de fidélité maximum (5/5) grâce à vos 5 remboursements ponctuels. Votre sérieux et votre fidélité sont remarquables !`,
      type: 'loyalty_achievement',
      priority: 'high',
      read: false,
      data: { showPopup: true, score: 5, clientName, userId },
    });

    if (clientNotifError) {
      console.error(`   ❌ Notification client: ${clientNotifError.message}`);
      continue;
    }

    const { data: adminData } = await supabase.from('users').select('id').eq('role', 'admin').limit(1).single();
    if (adminData) {
      const { error: adminNotifError } = await supabase.from('notifications').insert({
        user_id: adminData.id,
        title: '🏆 Score de fidélité atteint',
        message: `L'utilisateur ${clientName} a atteint le score de fidélité maximum (5/5). Il attend sa récompense.`,
        type: 'loyalty_achievement_admin',
        priority: 'high',
        read: false,
        data: { showPopup: true, clientName, userId, targetUserId: userId },
      });
      if (adminNotifError) console.error(`   ❌ Notification admin: ${adminNotifError.message}`);
    }

    created++;
  }

  console.log('\n✅ Terminé.');
  console.log(`   Utilisateurs à 5 étoiles traités: ${processed}`);
  console.log(DRY_RUN ? `   [DRY-RUN] Notifications qui auraient été créées: ${created}` : `   Notifications créées pour: ${created} utilisateur(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
