# 🧪 Guide de Test - AB Épargne

## 📋 **Prérequis**
1. ✅ Serveur API démarré sur le port 5000
2. ✅ Application React démarrée sur le port 3000
3. ✅ Script SQL `create-savings-rpc-functions.sql` exécuté dans Supabase
4. ✅ Configuration FedaPay active

## 🚀 **Étapes de Test**

### **1. Accéder à l'application**
- Ouvrir http://localhost:3000 dans le navigateur
- Se connecter avec un compte utilisateur existant

### **2. Naviguer vers AB Épargne**
- Cliquer sur "AB Épargne" dans le menu principal
- Tu devrais voir l'interface d'épargne

### **3. Créer un plan d'épargne**
- Cliquer sur le bouton "Créer un plan d'épargne" ou similaire
- Un modal de paiement des frais de création (1000 FCFA) devrait s'ouvrir

### **4. Effectuer le paiement**
- Cliquer sur le bouton FedaPay
- Utiliser les données de test FedaPay :
  - **Numéro de téléphone** : 97000000
  - **Code PIN** : 1234
  - **OTP** : 123456

### **5. Vérifier le résultat**
Après le paiement réussi, tu devrais voir :
- ✅ Message de succès
- ✅ Plan d'épargne créé
- ✅ Compte d'épargne créé
- ✅ Interface mise à jour

## 🔍 **Points à vérifier**

### **Côté Interface :**
- [ ] Modal de paiement s'ouvre correctement
- [ ] Bouton FedaPay fonctionne
- [ ] Paiement se traite sans erreur
- [ ] Message de succès s'affiche
- [ ] Interface se met à jour après paiement

### **Côté Serveur (logs) :**
- [ ] Webhook reçoit la requête
- [ ] `processFedaPaySavingsPlanCreation` s'exécute
- [ ] Compte d'épargne créé
- [ ] Plan d'épargne créé
- [ ] Transaction d'épargne créée

### **Côté Base de Données :**
- [ ] Table `savings_accounts` : nouveau compte créé
- [ ] Table `savings_plans` : nouveau plan créé
- [ ] Table `savings_transactions` : transaction de frais créée

## 🚨 **En cas d'erreur**

### **Erreur RLS :**
```
new row violates row-level security policy
```
**Solution :** Exécuter le script `create-savings-rpc-functions.sql` dans Supabase

### **Erreur FedaPay :**
```
Transaction invalide
```
**Solution :** Vérifier la configuration FedaPay et les données de test

### **Erreur de connexion :**
```
Configuration Supabase manquante
```
**Solution :** Vérifier les variables d'environnement

## 📊 **Données de Test Créées**

Après un test réussi, tu devrais avoir :
- **Compte d'épargne** : 1000 FCFA de frais payés
- **Plan d'épargne** : 100 FCFA tous les 10 jours pendant 3 mois
- **Transaction** : Frais de création de compte

## 🎯 **Résultat Attendu**

Le test est réussi si :
1. Le paiement FedaPay se termine sans erreur
2. L'interface affiche le plan d'épargne créé
3. Les logs du serveur montrent la création réussie
4. La base de données contient les nouvelles données

---

**💡 Astuce :** Surveille les logs du serveur dans le terminal pour voir le processus en temps réel !
