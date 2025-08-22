import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../utils/theme';
import { ThemedButton } from '../components/shared/ThemedButton';

/**
 * Props for the OnboardingScreen component.
 */
interface OnboardingScreenProps {
  onComplete: () => void;
}

/**
 * Onboarding screen that introduces users to the app and guides them through the basics.
 * Shows key features and provides a smooth first-time user experience.
 */
export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Consistency',
      subtitle: 'Build better habits, one day at a time',
      icon: '🎯',
      description:
        'Track your daily habits and build lasting positive routines.',
    },
    {
      title: 'Track Your Progress',
      subtitle: 'See your streaks and statistics',
      icon: '📊',
      description:
        'Monitor your progress with detailed statistics and streak tracking.',
    },
    {
      title: 'Stay Motivated',
      subtitle: 'Get reminders and stay on track',
      icon: '🔔',
      description: 'Set up notifications to never miss your important habits.',
    },
    {
      title: 'Ready to Start?',
      subtitle: 'Create your first habit',
      icon: '✨',
      description:
        "You're all set! Let's create your first habit to build consistency.",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];

  // Safety check - if currentStepData is undefined, use the first step
  if (!currentStepData) {
    return null;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Consistency
          </Text>
          {currentStep < steps.length - 1 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={[styles.skipButton, { color: colors.primary }]}>
                Skip
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepContainer}>
          {/* Icon */}
          <View
            style={[styles.iconContainer, { backgroundColor: colors.surface }]}
          >
            <Text style={styles.icon}>{currentStepData.icon}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            {currentStepData.title}
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {currentStepData.subtitle}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text }]}>
            {currentStepData.description}
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: Math.max(20, insets.bottom),
          },
        ]}
      >
        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <ThemedButton
          title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  skipButton: {
    fontSize: 16,
    color: '#fcba03',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  actionButton: {
    backgroundColor: '#fcba03',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
