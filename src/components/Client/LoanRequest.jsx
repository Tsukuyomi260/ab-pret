import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import NotificationBell from '../UI/NotificationBell';
import LoanCalculator from '../UI/LoanCalculator';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star,
  Zap,
  Target,
  BookOpen,
  ShoppingBag,
  Home,
  Car,
  Heart,
  Smartphone,
  GraduationCap,
  Briefcase,
  User,
  FileText,
  ArrowRight,
  Sparkles,
  Activity,
  BarChart3,
  Percent,
  Award,
  Gift,
  Rocket,
  Download
} from 'lucide-react';
import { LOAN_CONFIG } from '../../utils/loanConfig';
import { formatCurrency } from '../../utils/helpers';
import jsPDF from 'jspdf';

const LoanRequest = () => {
  const { notifications, addNotification, markAsRead, showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    duration: 5,
    purpose: '',
    monthlyIncome: '',
    employmentStatus: 'self-employed',
    category: '',
    documents: []
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [calculation, setCalculation] = useState(null);

  // Styles CSS pour les animations
  const gradientAnimation = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 15s ease infinite;
    }
    
    /* Animations pour les interactions */
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
      50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
    }
    
    .pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    .slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
    
    .bounce-in {
      animation: bounce-in 0.6s ease-out;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .float {
      animation: float 3s ease-in-out infinite;
    }
    
    @keyframes shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .shine {
      animation: shine 2s ease-in-out infinite;
    }
  `;

  // Catégories de prêts avec icônes et couleurs
  const loanCategories = [
    { 
      id: 'education', 
      name: 'Éducation', 
      icon: <BookOpen className="w-6 h-6" />, 
      color: 'from-blue-500 to-blue-600',
      description: 'Frais de scolarité, matériel scolaire, formation'
    },
    { 
      id: 'business', 
      name: 'Entreprise', 
      icon: <ShoppingBag className="w-6 h-6" />, 
      color: 'from-green-500 to-green-600',
      description: 'Démarrage d\'activité, investissement, stock'
    },
    { 
      id: 'housing', 
      name: 'Logement', 
      icon: <Home className="w-6 h-6" />, 
      color: 'from-orange-500 to-orange-600',
      description: 'Loyer, rénovation, ameublement'
    },
    { 
      id: 'personal', 
      name: 'Raison personnelle', 
      icon: <User className="w-6 h-6" />, 
      color: 'from-purple-500 to-purple-600',
      description: 'Voyage, événement spécial, projet personnel'
    },
    { 
      id: 'health', 
      name: 'Santé', 
      icon: <Heart className="w-6 h-6" />, 
      color: 'from-pink-500 to-pink-600',
      description: 'Soins médicaux, médicaments, consultation'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const selectedCategoryData = loanCategories.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      purpose: selectedCategoryData ? selectedCategoryData.description : ''
    }));
  };

  const handleCalculation = (result) => {
    setFormData(prev => ({
      ...prev,
      amount: result.principal.toString(),
      duration: result.duration
    }));
    setCalculation(result);
  };

  // Calcul automatique quand le montant ou la durée change
  useEffect(() => {
    if (formData.amount && formData.duration) {
      const numAmount = parseFloat(formData.amount);
      const numDuration = parseInt(formData.duration);
      
      if (numAmount >= LOAN_CONFIG.amounts.min && numAmount <= LOAN_CONFIG.amounts.max) {
        const interestRate = LOAN_CONFIG.getInterestRate(numDuration);
        const interestAmount = LOAN_CONFIG.calculateInterest(numAmount, numDuration);
        const totalAmount = LOAN_CONFIG.calculateTotalAmount(numAmount, numDuration);
        const paymentAmount = LOAN_CONFIG.calculatePaymentAmount(totalAmount, numDuration);

        const result = {
          principal: numAmount,
          duration: numDuration,
          interestRate,
          interestAmount,
          totalAmount,
          paymentAmount,
          durationLabel: LOAN_CONFIG.durations.find(d => d.days === numDuration)?.label
        };

        handleCalculation(result);
      }
    }
  }, [formData.amount, formData.duration]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedCategory) {
          newErrors.category = 'Veuillez sélectionner une catégorie';
        }
        break;
      case 2:
        if (!formData.amount || parseFloat(formData.amount) < LOAN_CONFIG.amounts.min) {
          newErrors.amount = `Le montant minimum est de ${LOAN_CONFIG.amounts.min.toLocaleString()} FCFA`;
        }
        if (parseFloat(formData.amount) > LOAN_CONFIG.amounts.max) {
          newErrors.amount = `Le montant maximum est de ${LOAN_CONFIG.amounts.max.toLocaleString()} FCFA`;
        }
        if (!formData.duration) {
          newErrors.duration = 'Veuillez sélectionner une durée';
        }
        break;
      case 3:
        if (!formData.purpose.trim()) {
          newErrors.purpose = 'Veuillez préciser l\'objet du prêt';
        }
        if (!formData.monthlyIncome) {
          newErrors.monthlyIncome = 'Le revenu mensuel est requis';
        } else {
          const income = parseFloat(formData.monthlyIncome);
          const incomeValidation = LOAN_CONFIG.validateMonthlyIncome(income);
          if (!incomeValidation.isValid) {
            newErrors.monthlyIncome = incomeValidation.errors[0];
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
      
      setTimeout(() => {
        showSuccess('Demande de prêt soumise avec succès ! Notre équipe vous contactera dans les 24h.');
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      showError('Erreur lors de la soumission de la demande');
      setLoading(false);
    }
  };

  // Fonction pour formater les montants en format FCFA
  const formatAmountFCFA = (amount) => {
    if (!amount || isNaN(amount)) return '0F';
    const numAmount = parseFloat(amount);
    // Formatage sans espaces, avec points pour les milliers
    const formatted = numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formatted + 'F';
  };

  // Fonction pour obtenir le texte de l'objectif basé sur la catégorie
  const getPurposeText = () => {
    if (formData.purpose && formData.purpose.trim() !== '') {
      return formData.purpose;
    }
    
    // Si pas d'objectif saisi, utiliser la catégorie sélectionnée
    const selectedCategoryData = loanCategories.find(c => c.id === selectedCategory);
    if (selectedCategoryData) {
      return selectedCategoryData.description;
    }
    
    // Valeur par défaut
    return 'Financement personnel';
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Configuration de la police pour supporter les caractères français
    doc.setFont('helvetica');
    doc.setLanguage('fr');
    
    // Configuration des couleurs
    const primaryColor = [59, 130, 246]; // Bleu AB Pret
    const secondaryColor = [107, 114, 128]; // Gris
    const darkColor = [17, 24, 39]; // Noir foncé
    const accentColor = [34, 197, 94]; // Vert pour les accents
    
    // Fonction pour créer un logo stylisé
    const createStyledLogo = () => {
      // Créer un rectangle stylisé pour le logo
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 10, 30, 20, 5, 5, 'F');
      
      // Ajouter les lettres "AB" dans le rectangle
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text('AB', 35, 22, { align: 'center' });
      
      // Ajouter une bordure
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, 10, 30, 20, 5, 5, 'S');
    };
    
    // ===== EN-TÊTE DU DOCUMENT =====
    
    // Logo/Header AB Pret (zone stylisée)
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    // Créer le logo stylisé
    createStyledLogo();
    
    // Titre principal (ajusté avec le logo)
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255); // Blanc
    doc.text('ENGAGEMENT DE PRÊT', 120, 20, { align: 'center' });
    
    doc.setFontSize(20);
    doc.text('AB PRET', 120, 32, { align: 'center' });
    
    // ===== INFORMATIONS DE CONTACT =====
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    doc.text('À Mr. Le Directeur de AB Pret', 20, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
         doc.text('Telephone: +229 53463606', 20, 65);
     doc.text('Email: abpret51@gmail.com', 20, 75);
    
    // Date avec style
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
         doc.text(`Date: ${new Date().toLocaleDateString('fr-FR', { 
       day: 'numeric', 
       month: 'long', 
       year: 'numeric' 
     })}`, 20, 90);
    
    // Ligne de séparation stylisée
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(1);
    doc.line(20, 100, 190, 100);
    
    // ===== CORPS DU DOCUMENT =====
    
    // Variables pour les données
    const clientName = 'Elise HASSI';
    const filiere = 'Informatique'; // À récupérer depuis la base de données
    const anneeEtude = '3ème année'; // À récupérer depuis la base de données
    const montantPret = formatAmountFCFA(parseFloat(formData.amount) || 0);
    const dureePret = LOAN_CONFIG.durations.find(d => d.days === parseInt(formData.duration))?.label || 'Non spécifiée';
    
    // Texte de l'engagement avec meilleur formatage
    doc.setFontSize(12);
    doc.setTextColor(...darkColor);
    
    const engagementText = [
      `Je soussigne(e) ${clientName}, etudiant(e) en ${filiere} en ${anneeEtude},`,
      `reconnais avoir recu un pret de ${montantPret} de la part de AB Pret,`,
      `a rembourser avant ${dureePret}.`,
      '',
      'En cas de retard, une penalite de 2% sera appliquee.'
    ];
    
    let yPosition = 115;
    engagementText.forEach((line, index) => {
      if (line === '') {
        yPosition += 10; // Plus d'espacement
      } else {
        doc.text(line, 20, yPosition);
        yPosition += 15;
      }
    });
    
    // ===== INFORMATIONS DÉTAILLÉES =====
    
    // Section Informations du crédit avec fond coloré
    yPosition += 10;
    doc.setFillColor(240, 248, 255); // Bleu très clair
    doc.rect(15, yPosition - 5, 180, 80, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
         doc.text('INFORMATIONS DU CREDIT', 20, yPosition);
    
    yPosition += 20;
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    
    if (calculation) {
             const creditInfo = [
         `Montant du pret: ${formatAmountFCFA(calculation.principal)}`,
         `Taux d'interet: ${calculation.interestRate}%`,
         `Interets: ${formatAmountFCFA(calculation.interestAmount)}`,
         `Montant total a rembourser: ${formatAmountFCFA(calculation.totalAmount)}`,
         `Duree: ${calculation.durationLabel}`,
         `Objectif: ${getPurposeText()}`
       ];
      
      creditInfo.forEach((info, index) => {
        doc.text(info, 25, yPosition + (index * 12));
      });
    }
    
    // Section Informations du client
    yPosition += 100;
    doc.setFillColor(240, 255, 244); // Vert très clair
    doc.rect(15, yPosition - 5, 180, 60, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(...accentColor);
         doc.text('INFORMATIONS DU CLIENT', 20, yPosition);
    
    yPosition += 20;
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    
         const clientInfo = [
       `Nom et prenom: ${clientName}`,
       `Filiere: ${filiere}`,
       `Annee d'etude: ${anneeEtude}`,
       `Revenu mensuel: ${formatAmountFCFA(parseFloat(formData.monthlyIncome) || 0)}`,
       `Statut: ${formData.employmentStatus === 'self-employed' ? 'Independent' : 'Etudiant'}`
     ];
    
    clientInfo.forEach((info, index) => {
      doc.text(info, 25, yPosition + (index * 12));
    });
    
    // ===== SIGNATURES =====
    yPosition += 80;
    doc.setFontSize(16);
    doc.setTextColor(...primaryColor);
         doc.text('SIGNATURES', 20, yPosition);
    
    yPosition += 20;
    doc.setFontSize(11);
    doc.setTextColor(...darkColor);
    
    // Lignes de signature stylisées
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    
         // Signature de l'emprunteur
     doc.text('Emprunteur:', 20, yPosition);
     doc.text('Nom et prenom: ', 20, yPosition + 12);
     doc.line(60, yPosition + 12, 110, yPosition + 12);
     doc.text('Signature: ', 20, yPosition + 24);
     doc.line(50, yPosition + 24, 110, yPosition + 24);
     
     // Signature du temoin
     doc.text('Temoin:', 120, yPosition);
     doc.text('Nom et prenom: ', 120, yPosition + 12);
     doc.line(160, yPosition + 12, 210, yPosition + 12);
     doc.text('Signature: ', 120, yPosition + 24);
     doc.line(150, yPosition + 24, 210, yPosition + 24);
    
    // ===== PIED DE PAGE =====
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
         doc.text('Document genere automatiquement par AB Pret', 20, 280);
     doc.text('Ce document constitue un engagement de pret officiel', 20, 285);
     doc.text('Validite: Ce document est valide pour la duree du pret', 20, 290);
    
    // Sauvegarder le PDF
    const fileName = `engagement_pret_abpret_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const getStepIcon = (step) => {
    switch (step) {
      case 1: return <Target className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 2: return <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 3: return <User className="w-4 h-4 sm:w-5 sm:h-5" />;
      case 4: return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      default: return <FileText className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getStepTitle = (step) => {
    switch (step) {
      case 1: return 'Catégorie du prêt';
      case 2: return 'Montant et durée';
      case 3: return 'Informations personnelles';
      case 4: return 'Validation';
      default: return 'Étape';
    }
  };

  return (
    <div id="loan-request-page" className="min-h-screen bg-accent-50">
      <style>{gradientAnimation}</style>
      
      {/* Header avec design moderne */}
      <div className="relative overflow-hidden">
        {/* Background avec gradient animé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 opacity-15 animate-gradient"></div>
        
        {/* Couche de profondeur supplémentaire */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent"></div>
        
        {/* Pattern décoratif amélioré */}
        <div className="absolute inset-0 opacity-8">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [180, 360, 180],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl"
          />
          
          {/* Particules flottantes */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-300 rounded-full"
          />
          <motion.div
            animate={{ 
              y: [0, 15, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-3/4 right-1/3 w-3 h-3 bg-purple-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 10, 0],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-indigo-300 rounded-full"
          />
          
          {/* Particules supplémentaires */}
          <motion.div
            animate={{ 
              x: [0, -15, 0],
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: 7, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute top-1/3 right-1/4 w-2 h-2 bg-green-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, 12, 0],
              y: [0, -8, 0],
              opacity: [0.2, 0.7, 0.2]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 1.5
            }}
            className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-pink-300 rounded-full"
          />
          <motion.div
            animate={{ 
              x: [0, -8, 0],
              y: [0, 12, 0],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ 
              duration: 9, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 2.5
            }}
            className="absolute top-2/3 left-1/3 w-1 h-1 bg-yellow-300 rounded-full"
          />
        </div>

        {/* Contenu Header */}
        <div className="relative px-4 lg:px-8 py-8 lg:py-12 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Section Hero - En-tête principal */}
            <div className="text-center mb-8 lg:mb-12">
              {/* Badge animé */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6 shadow-lg relative overflow-hidden"
              >
                {/* Effet de brillance sur le badge */}
                <motion.div
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: 1
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="text-sm font-medium text-green-700 font-montserrat bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  🚀 Demande de Prêt
                </motion.span>
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-6xl font-bold text-secondary-900 font-montserrat mb-4"
              >
                Demande de{' '}
                <motion.span 
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] bg-clip-text text-transparent"
                >
                  Prêt
                </motion.span>{' '}
                <motion.span
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="inline-block"
                >
                  💰
                </motion.span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg lg:text-xl text-neutral-600 font-montserrat max-w-3xl mx-auto leading-relaxed"
              >
                Remplissez les étapes ci-dessous pour demander votre prêt. 
                Notre processus est simple, rapide et sécurisé.
              </motion.p>

              {/* Sous-titre avec icônes animées */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-center space-x-6 mt-6"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <CheckCircle size={16} className="text-green-500" />
                  <span>Processus simple</span>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Clock size={16} className="text-blue-500" />
                  <span>Réponse rapide</span>
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 2
                  }}
                  className="flex items-center space-x-2 text-sm text-neutral-500"
                >
                  <Shield size={16} className="text-purple-500" />
                  <span>100% sécurisé</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Indicateur de progression */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center space-x-2 sm:space-x-4 px-4 max-w-md mx-auto">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1 max-w-16 sm:max-w-20">
                    <div className={`flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${
                      step <= currentStep 
                        ? 'bg-primary-500 border-primary-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      {step < currentStep ? (
                        <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          {getStepIcon(step)}
                        </div>
                      )}
                    </div>
                    {step < 4 && (
                      <div className={`flex-1 h-1 mx-1 sm:mx-2 transition-all duration-300 ${
                        step < currentStep ? 'bg-primary-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-4 px-4 max-w-md mx-auto">
                <p className="text-base sm:text-lg font-semibold text-secondary-900 font-montserrat">
                  {getStepTitle(currentStep)}
                </p>
                <p className="text-xs sm:text-sm text-secondary-600 font-montserrat">
                  Étape {currentStep} sur 4
                </p>
              </div>
            </motion.div>

            {/* Contenu des étapes */}
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Sélection de catégorie */}
                    <Card className="bg-white">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                          Choisissez votre catégorie
                        </h3>
                        <p className="text-secondary-600 font-montserrat">
                          Sélectionnez la catégorie qui correspond le mieux à votre besoin
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {loanCategories.map((category, index) => (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ 
                              scale: 1.05, 
                              y: -5,
                              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                            }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                              selectedCategory === category.id
                                ? 'border-primary-500 bg-primary-50 shadow-lg'
                                : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                            }`}
                            onClick={() => handleCategorySelect(category.id)}
                          >
                            {/* Effet de brillance */}
                            <motion.div
                              animate={{ 
                                x: ['-100%', '100%']
                              }}
                              transition={{ 
                                duration: 3, 
                                repeat: Infinity, 
                                ease: "linear",
                                delay: index * 0.5
                              }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            />
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 bg-gradient-to-r ${category.color} rounded-lg text-white`}>
                                {category.icon}
                              </div>
                              <h4 className="font-semibold text-secondary-900 font-montserrat">
                                {category.name}
                              </h4>
                            </div>
                            <p className="text-sm text-secondary-600 font-montserrat relative z-10">
                              {category.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {errors.category && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
                          <AlertCircle size={20} />
                          <span>{errors.category}</span>
                        </div>
                      )}
                    </Card>

                    {/* Informations sur les catégories */}
                    <div className="space-y-6">
                      <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Sparkles className="w-8 h-8" />
                          <h3 className="text-xl font-bold font-montserrat">
                            Pourquoi choisir AB PRET ?
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Traitement rapide en 24h</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Taux d'intérêt compétitifs</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Processus simplifié</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Support client 24/7</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-6 h-6 text-primary-600" />
                          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">
                            Sécurité garantie
                          </h3>
                        </div>
                        <p className="text-secondary-600 font-montserrat text-sm">
                          Vos données sont protégées et sécurisées. Nous respectons les normes de sécurité les plus strictes.
                        </p>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* Formulaire montant et durée */}
                    <div className="lg:col-span-2">
                      <Card className="bg-white">
                        <div className="mb-6">
                          <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                            Montant et durée
                          </h3>
                          <p className="text-secondary-600 font-montserrat">
                            Définissez le montant que vous souhaitez emprunter et la durée de remboursement
                          </p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="Montant demandé (FCFA)"
                              type="number"
                              name="amount"
                              value={formData.amount}
                              onChange={handleChange}
                              placeholder="50000"
                              min={LOAN_CONFIG.amounts.min}
                              max={LOAN_CONFIG.amounts.max}
                              error={errors.amount}
                              required
                            />

                            <div>
                              <Input
                                label="Durée du prêt"
                                type="select"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                error={errors.duration}
                                required
                              >
                                {LOAN_CONFIG.durations.map((option) => (
                                  <option key={option.value} value={option.days}>
                                    {option.label}
                                  </option>
                                ))}
                              </Input>
                              {formData.amount && formData.duration && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-700 font-montserrat">
                                    💰 Taux d'intérêt: <span className="font-semibold">
                                      {LOAN_CONFIG.getInterestRate(parseInt(formData.duration))}%
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Calculatrice */}
                    <div className="space-y-6">
                      <LoanCalculator 
                        onCalculate={handleCalculation}
                        initialAmount={formData.amount}
                        initialDuration={formData.duration}
                        syncWithForm={true}
                      />
                      
                      <Card className="bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <TrendingUp className="w-6 h-6 text-primary-600" />
                          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">
                            Taux d'intérêt
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-800 font-montserrat">5 jours</span>
                            <span className="text-lg font-bold text-green-600 font-montserrat">6%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-blue-800 font-montserrat">10 jours</span>
                            <span className="text-lg font-bold text-blue-600 font-montserrat">10%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <span className="text-sm font-medium text-yellow-800 font-montserrat">15 jours</span>
                            <span className="text-lg font-bold text-yellow-600 font-montserrat">15%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="text-sm font-medium text-orange-800 font-montserrat">25 jours</span>
                            <span className="text-lg font-bold text-orange-600 font-montserrat">22%</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="text-sm font-medium text-red-800 font-montserrat">30 jours</span>
                            <span className="text-lg font-bold text-red-600 font-montserrat">25%</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                  >
                    {/* Informations personnelles */}
                    <Card className="bg-white">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                          Informations personnelles
                        </h3>
                        <p className="text-secondary-600 font-montserrat">
                          Aidez-nous à mieux comprendre votre situation financière
                        </p>
                      </div>

                      <div className="space-y-6">
                        <Input
                          label="Objet du prêt"
                          type="textarea"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleChange}
                          placeholder="Décrivez en détail l'utilisation prévue du prêt..."
                          error={errors.purpose}
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input
                            label="Revenu mensuel (FCFA)"
                            type="number"
                            name="monthlyIncome"
                            value={formData.monthlyIncome}
                            onChange={handleChange}
                            placeholder={`${LOAN_CONFIG.monthlyIncome.min.toLocaleString()} - ${LOAN_CONFIG.monthlyIncome.max.toLocaleString()}`}
                            min={LOAN_CONFIG.monthlyIncome.min}
                            max={LOAN_CONFIG.monthlyIncome.max}
                            error={errors.monthlyIncome}
                            required
                          />

                          <Input
                            label="Statut professionnel"
                            type="select"
                            name="employmentStatus"
                            value={formData.employmentStatus}
                            onChange={handleChange}
                            required
                          >
                                                          <option value="self-employed">Indépendant</option>
                            <option value="student">Étudiant</option>
                          </Input>
                        </div>
                      </div>
                    </Card>

                    {/* Informations importantes */}
                    <div className="space-y-6">
                      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Clock className="w-6 h-6" />
                          <h3 className="text-lg font-semibold font-montserrat">
                            Délais de traitement
                          </h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Validation automatique : 2h</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Validation manuelle : 24h</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-300" />
                            <span className="font-montserrat">Versement : 48h max</span>
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-white">
                        <div className="flex items-center space-x-3 mb-4">
                          <Shield className="w-6 h-6 text-primary-600" />
                          <h3 className="text-lg font-semibold text-secondary-900 font-montserrat">
                            Documents requis
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm text-secondary-600 font-montserrat">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Pièce d'identité valide</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Justificatif de domicile</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Justificatif de revenus</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Relevé bancaire (3 mois)</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-4xl mx-auto"
                  >
                    <Card className="bg-white">
                      <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-secondary-900 font-montserrat mb-2">
                          Récapitulatif de votre demande
                        </h3>
                        <p className="text-secondary-600 font-montserrat">
                          Vérifiez toutes les informations avant de soumettre votre demande
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                          <div className="p-4 bg-accent-50 rounded-xl">
                            <h4 className="font-semibold text-secondary-900 font-montserrat mb-2">Détails du prêt</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Catégorie:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {loanCategories.find(c => c.id === selectedCategory)?.name}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Montant:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {formatCurrency(parseFloat(formData.amount) || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Durée:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {LOAN_CONFIG.durations.find(d => d.days === parseInt(formData.duration))?.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 bg-accent-50 rounded-xl">
                            <h4 className="font-semibold text-secondary-900 font-montserrat mb-2">Informations personnelles</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Revenu mensuel:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {formatCurrency(parseFloat(formData.monthlyIncome) || 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-secondary-600 font-montserrat">Statut:</span>
                                <span className="font-medium text-secondary-900 font-montserrat">
                                  {formData.employmentStatus === 'self-employed' ? 'Indépendant' : 'Étudiant'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-blue-900 font-montserrat mb-2">
                              Important à savoir
                            </h4>
                            <ul className="text-blue-800 font-montserrat text-sm space-y-1">
                              <li>• Votre demande sera traitée dans les 24h</li>
                              <li>• Vous recevrez un email de confirmation</li>
                              <li>• Notre équipe vous contactera pour finaliser le processus</li>
                              <li>• Le versement sera effectué sous 48h après approbation</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Notice de téléchargement */}
                      <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          </div>
                          <div>
                            <p className="text-gray-700 font-montserrat text-sm">
                              <span className="font-semibold text-blue-600">Note :</span> Télécharger le récapitulatif avant de soumettre la demande
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bouton de téléchargement PDF */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-6"
                      >
                        <Button
                          onClick={generatePDF}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-3 mx-auto"
                        >
                          <Download className="w-5 h-5" />
                          <span className="font-semibold">Télécharger l'Engagement de Prêt (PDF)</span>
                        </Button>
                        <p className="text-sm text-gray-600 mt-2 font-montserrat">
                          Téléchargez votre engagement de prêt officiel
                        </p>
                      </motion.div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation entre les étapes */}
              <motion.div 
                className="flex justify-between items-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center space-x-2 relative overflow-hidden"
                  >
                    <motion.div
                      whileHover={{ rotate: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </motion.div>
                    <span>Précédent</span>
                  </Button>
                </motion.div>

                {currentStep < 4 ? (
                  <motion.div
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={nextStep}
                      className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 relative overflow-hidden"
                    >
                      <span>Suivant</span>
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={submitted ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || submitted}
                      className={`relative overflow-hidden flex items-center space-x-2 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-500 ${
                        submitted 
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/50' 
                          : loading
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-105'
                      }`}
                    >
                      {submitted ? (
                        <>
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex items-center justify-center"
                          >
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                          >
                            Demande soumise !
                          </motion.span>
                        </>
                      ) : loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex items-center justify-center"
                          >
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full" />
                          </motion.div>
                          <span>Soumission en cours...</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.div>
                          <span>Soumettre la demande</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanRequest;

