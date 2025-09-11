/**
 * Écran d'onboarding pour Axiom
 *
 * Fonctionnalités :
 * - Introduction à l'application
 * - Guide de configuration initial
 * - Présentation des fonctionnalités principales
 * - Configuration des préférences de base
 *
 * @version 1.0.0
 * @author Axiom Team
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

interface OnboardingScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const { width: screenWidth } = Dimensions.get('window');

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Bienvenue sur Axiom',
    description:
      'Votre nouvelle application de messagerie sécurisée avec chiffrement de bout en bout et transfert de fichiers P2P.',
    icon: '🔐',
    color: '#007AFF',
  },
  {
    id: 2,
    title: 'Sécurité Maximale',
    description:
      'Vos messages et fichiers sont chiffrés avant même de quitter votre appareil. Personne d\'autre ne peut les lire.',
    icon: '🛡️',
    color: '#34C759',
  },
  {
    id: 3,
    title: 'Transferts P2P',
    description:
      'Partagez des fichiers directement avec vos contacts sans passer par nos serveurs. Rapide et privé.',
    icon: '📁',
    color: '#FF9500',
  },
  {
    id: 4,
    title: 'Performance Optimisée',
    description:
      'Axiom s\'adapte automatiquement à votre appareil pour offrir la meilleure expérience possible.',
    icon: '⚡',
    color: '#AF52DE',
  },
  {
    id: 5,
    title: 'Prêt à Commencer',
    description:
      'Tout est configuré ! Vous pouvez maintenant commencer à utiliser Axiom en toute sécurité.',
    icon: '🚀',
    color: '#FF3B30',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const goToNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      // Animation de transition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
        scrollViewRef.current?.scrollTo({
          x: (currentStep + 1) * screenWidth,
          animated: true,
        });
        
        // Animation d'entrée
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      completeOnboarding();
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep - 1);
        scrollViewRef.current?.scrollTo({
          x: (currentStep - 1) * screenWidth,
          animated: true,
        });
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const completeOnboarding = () => {
    // Marquer l'onboarding comme terminé (à stocker dans AsyncStorage)
    navigation.navigate('Home');
  };

  const skipOnboarding = () => {
    navigation.navigate('Home');
  };

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={[styles.stepContainer, { width: screenWidth }]}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icône principale */}
        <View style={[styles.iconContainer, { backgroundColor: step.color }]}>
          <Text style={styles.icon}>{step.icon}</Text>
        </View>

        {/* Titre */}
        <Text style={[styles.title, { color: step.color }]}>{step.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{step.description}</Text>

        {/* Indicateurs de progression */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                {
                  backgroundColor: i === index ? step.color : '#E0E0E0',
                  transform: [{ scale: i === index ? 1.2 : 1 }],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );

  const currentStepData = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      {/* Header avec bouton Skip */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {onboardingSteps.map((step, index) => renderStep(step, index))}
      </ScrollView>

      {/* Footer avec boutons de navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={goToPrevious}
          style={[
            styles.navigationButton,
            styles.previousButton,
            { opacity: currentStep === 0 ? 0.3 : 1 },
          ]}
          disabled={currentStep === 0}
        >
          <Text style={styles.previousText}>Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNext}
          style={[
            styles.navigationButton,
            styles.nextButton,
            { backgroundColor: currentStepData.color },
          ]}
        >
          <Text style={styles.nextText}>
            {currentStep === onboardingSteps.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  navigationButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  nextButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previousText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default OnboardingScreen;
