# 🚨 Guide d'Installation - Système de Pénalités pour l'Épargne

## 📋 **Vue d'ensemble**

Ce système gère automatiquement les pénalités pour les dépôts d'épargne en retard selon les règles suivantes :

- ⚠️ **1-6 jours de retard** : Notification d'avertissement + perte des intérêts accumulés
- 🚫 **7+ jours de retard** : Suspension du plan + perte définitive des intérêts

## 🚀 **Installation**

### **1. Exécuter le script SQL**
```sql
-- Dans Supabase SQL Editor, exécuter :
-- backend/add-savings-penalty-fields.sql
```

### **2. Redémarrer le serveur backend**
```bash
cd backend
npm start
```

### **3. Vérifier l'installation**
```bash
cd backend
node test-savings-penalty-system.js
```

## 🔧 **Fonctionnalités**

### **Notifications automatiques :**
- 📱 **Rappels** : 3, 2, 1 jour(s) avant le dépôt
- ⚠️ **Avertissement** : Jour du dépôt + jours de retard
- 🚨 **Suspension** : Après 7 jours de retard

### **Gestion des pénalités :**
- 💸 **Perte des intérêts** : Tous les intérêts accumulés sont perdus
- 🚫 **Suspension** : Plan suspendu après 7 jours
- 📊 **Suivi** : Nombre de jours de retard et montants perdus

## 📊 **Nouvelles colonnes en base de données**

| Colonne | Type | Description |
|---------|------|-------------|
| `is_overdue` | BOOLEAN | Plan en retard de dépôt |
| `overdue_since` | TIMESTAMP | Date de début du retard |
| `days_overdue` | INTEGER | Nombre de jours de retard |
| `is_suspended` | BOOLEAN | Plan suspendu (7+ jours) |
| `suspended_since` | TIMESTAMP | Date de suspension |
| `lost_interest_amount` | DECIMAL | Intérêts perdus |

## ⏰ **Exécution automatique**

Le système s'exécute **automatiquement à 11h chaque jour** et :

1. ✅ Vérifie tous les plans d'épargne actifs
2. ⚠️ Identifie les plans avec dépôts en retard
3. 💸 Calcule et applique les pénalités
4. 📱 Envoie les notifications appropriées
5. 🚫 Suspend les plans après 7 jours

## 🧪 **Test du système**

### **Test manuel :**
```bash
cd backend
node test-savings-penalty-system.js
```

### **Test en conditions réelles :**
1. Créer un plan d'épargne
2. Modifier la date de dépôt dans la base de données
3. Attendre l'exécution automatique ou redémarrer le serveur

## 📱 **Types de notifications**

### **Rappels (avant retard) :**
- **3 jours avant** : "Votre prochain dépôt est dans 3 jours"
- **2 jours avant** : "Votre prochain dépôt est dans 2 jours"  
- **1 jour avant** : "Votre prochain dépôt est dans 24h"
- **Jour même** : "C'est aujourd'hui que vous devez effectuer votre dépôt"

### **Pénalités (après retard) :**
- **1-6 jours** : "Dépôt en retard de X jour(s). Si vous ne déposez pas dans les 7 jours, vous perdrez tous vos intérêts"
- **7+ jours** : "Plan suspendu après X jours de retard. Vous avez perdu X FCFA d'intérêts"

## 🔍 **Monitoring**

### **Logs du serveur :**
```
[SAVINGS_OVERDUE] Vérification des plans d'épargne en retard...
[SAVINGS_OVERDUE] X plan(s) d'épargne en retard trouvé(s)
[SAVINGS_OVERDUE] ⚠️ Plan #123 - Client: 5 jour(s) de retard, intérêts perdus: 1,250 FCFA
[SAVINGS_OVERDUE] 🚨 Plan #456 suspendu après 7 jours de retard
[SAVINGS_OVERDUE] 📱 Notification de pénalité envoyée à Client
```

### **Statistiques quotidiennes :**
```
[SCHEDULER] Rappels et gestion terminés: {
  loans: 'Envoyés',
  savings: 'Envoyés', 
  overdueLoans: 'Traité',
  overdueSavings: 'Traité'
}
```

## ⚠️ **Points d'attention**

1. **Exécution quotidienne** : Le système s'exécute automatiquement à 11h
2. **Perte définitive** : Les intérêts perdus ne peuvent pas être récupérés
3. **Suspension** : Les plans suspendus ne peuvent plus recevoir de dépôts
4. **Notifications** : Dépendent des abonnements push des utilisateurs

## 🆘 **Dépannage**

### **Problème : Colonnes manquantes**
```sql
-- Vérifier les colonnes
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'savings_plans' 
AND column_name IN ('is_overdue', 'is_suspended', 'lost_interest_amount');
```

### **Problème : Notifications non envoyées**
- Vérifier les abonnements push dans `push_subscriptions`
- Vérifier les clés VAPID dans les variables d'environnement
- Consulter les logs du serveur

### **Problème : Système ne s'exécute pas**
- Vérifier que le serveur backend est démarré
- Vérifier les logs du scheduler
- Redémarrer le serveur si nécessaire
