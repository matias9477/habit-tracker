import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from './db/database';
import { MainTabNavigator } from './navigation/MainTabNavigator';
import { configureNotifications } from './utils/notifications';
import { useOnboardingStore } from './store/onboardingStore';
import { OnboardingScreen } from './screens/OnboardingScreen';

/**
 * Loading screen component shown while the database is being initialized.
 */
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
    <Text style={styles.loadingText}>Setting up Consistency...</Text>
  </View>
);

/**
 * App content wrapper that handles onboarding logic.
 * Shows onboarding on first launch, otherwise shows the main app.
 */
const AppContent: React.FC = () => {
  const { hasCompletedOnboarding, setOnboardingCompleted } =
    useOnboardingStore();
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted();
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <MainTabNavigator />
    </NavigationContainer>
  );
};

/**
 * Main App component that initializes the database and sets up navigation.
 * Handles database migrations on app startup and provides the main navigation structure.
 */
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run database migrations
        await runMigrations();

        // Configure notifications
        await configureNotifications();

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError('Failed to initialize the app. Please restart.');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
});
