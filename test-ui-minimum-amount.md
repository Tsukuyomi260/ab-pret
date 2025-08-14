# 🧪 Guide de Test - Validation du Montant Minimum (1000 FCFA)

## 📋 **Objectif du Test**
Vérifier que la validation du montant minimum de 1000 FCFA fonctionne correctement dans l'interface utilisateur.

## 🎯 **Scénarios de Test**

### **1. Test avec Montant Valide (1000 FCFA)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `1000` dans le champ "Montant demandé"
- **Résultat attendu** : ✅ Aucune erreur, passage à l'étape suivante autorisé

### **2. Test avec Montant Invalide (999 FCFA)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `999` dans le champ "Montant demandé"
- **Résultat attendu** : ❌ Erreur "Le montant minimum est de 1,000 FCFA"
- **Action suivante** : Impossible de passer à l'étape suivante

### **3. Test avec Montant Invalide (500 FCFA)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `500` dans le champ "Montant demandé"
- **Résultat attendu** : ❌ Erreur "Le montant minimum est de 1,000 FCFA"
- **Action suivante** : Impossible de passer à l'étape suivante

### **4. Test avec Montant Invalide (0 FCFA)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `0` dans le champ "Montant demandé"
- **Résultat attendu** : ❌ Erreur "Le montant minimum est de 1,000 FCFA"
- **Action suivante** : Impossible de passer à l'étape suivante

### **5. Test avec Montant Invalide (Montant négatif)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `-100` dans le champ "Montant demandé"
- **Résultat attendu** : ❌ Erreur "Le montant minimum est de 1,000 FCFA"
- **Action suivante** : Impossible de passer à l'étape suivante

### **6. Test avec Montant Maximum (500,000 FCFA)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `500000` dans le champ "Montant demandé"
- **Résultat attendu** : ✅ Aucune erreur, passage à l'étape suivante autorisé

### **7. Test avec Montant au-dessus du Maximum (600,000 FCFA)**
- **Action** : Aller sur `/loan-request`
- **Étape 1** : Sélectionner une catégorie de prêt
- **Étape 2** : Entrer `600000` dans le champ "Montant demandé"
- **Résultat attendu** : ❌ Erreur "Le montant maximum est de 500,000 FCFA"
- **Action suivante** : Impossible de passer à l'étape suivante

## 🔍 **Éléments à Vérifier**

### **Interface Utilisateur**
- [ ] Le champ "Montant demandé" a l'attribut `min="1000"`
- [ ] Le champ "Montant demandé" a l'attribut `max="500000"`
- [ ] Les messages d'erreur s'affichent correctement
- [ ] Le bouton "Suivant" est désactivé en cas d'erreur
- [ ] La calculatrice de prêt fonctionne avec 1000 FCFA

### **Validation Côté Client**
- [ ] Validation JavaScript active
- [ ] Messages d'erreur appropriés
- [ ] Empêche la progression avec montants invalides
- [ ] Permet la progression avec montants valides

### **Calculatrice de Prêt**
- [ ] Calcule correctement les intérêts pour 1000 FCFA
- [ ] Affiche le montant total à rembourser
- [ ] Synchronise avec le formulaire principal

## 📱 **Test sur Mobile**
- [ ] Validation fonctionne sur appareils mobiles
- [ ] Messages d'erreur sont lisibles sur petit écran
- [ ] Interface tactile fonctionne correctement

## 🧪 **Test de Soumission Complète**

### **Scénario Réussi**
1. **Étape 1** : Sélectionner "Éducation" comme catégorie
2. **Étape 2** : Entrer `1000` comme montant, sélectionner `5 jours`
3. **Étape 3** : Entrer "Test montant minimum" comme objet
4. **Étape 4** : Télécharger le PDF récapitulatif
5. **Étape 5** : Soumettre la demande
6. **Résultat** : ✅ Demande soumise avec succès

### **Scénario Échoué**
1. **Étape 1** : Sélectionner "Éducation" comme catégorie
2. **Étape 2** : Entrer `999` comme montant
3. **Résultat** : ❌ Erreur de validation, impossible de continuer

## 🐛 **Bugs Potentiels à Identifier**

### **Validation**
- [ ] Montants décimaux (ex: 999.99) sont-ils rejetés ?
- [ ] Montants avec espaces sont-ils gérés ?
- [ ] Montants avec virgules sont-ils gérés ?

### **Interface**
- [ ] Messages d'erreur disparaissent-ils après correction ?
- [ ] Le bouton "Suivant" se réactive-t-il après correction ?
- [ ] La calculatrice se met-elle à jour après correction ?

### **Performance**
- [ ] La validation est-elle rapide ?
- [ ] Pas de lag lors de la saisie ?
- [ ] Pas de blocage de l'interface ?

## 📊 **Résultats Attendus**

### **Montants Valides (✅)**
- 1000 FCFA
- 1500 FCFA
- 10000 FCFA
- 100000 FCFA
- 500000 FCFA

### **Montants Invalides (❌)**
- 0 FCFA
- 500 FCFA
- 999 FCFA
- 999.99 FCFA
- 600000 FCFA
- Montants négatifs

## 🔧 **Correction des Problèmes**

### **Si la validation ne fonctionne pas :**
1. Vérifier que `LOAN_CONFIG.amounts.min = 1000`
2. Vérifier que `validateStep(2)` est appelé
3. Vérifier que les erreurs sont bien affichées
4. Vérifier que le bouton "Suivant" est désactivé

### **Si les messages d'erreur ne s'affichent pas :**
1. Vérifier le composant `Input` et sa prop `error`
2. Vérifier que `errors.amount` est bien défini
3. Vérifier le CSS pour l'affichage des erreurs

## 📝 **Notes de Test**
- **Date du test** : _______________
- **Testeur** : _______________
- **Version de l'application** : _______________
- **Navigateur** : _______________
- **Appareil** : _______________

## ✅ **Validation Finale**
- [ ] Tous les scénarios de test passent
- [ ] La validation côté client fonctionne
- [ ] L'interface utilisateur est intuitive
- [ ] Les messages d'erreur sont clairs
- [ ] La calculatrice fonctionne avec le montant minimum
- [ ] Aucun montant < 1000 FCFA n'est accepté
- [ ] Aucun montant > 500000 FCFA n'est accepté

---

**🎯 Objectif atteint : Le montant minimum de 1000 FCFA est maintenant correctement validé dans toute l'application !**
