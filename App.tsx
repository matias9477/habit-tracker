import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from './db/database';
import { MainStackNavigator } from './navigation/MainTabNavigator';
import { configureNotifications } from './utils/notifications';
import { useOnboardingStore } from './store/onboardingStore';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { getThemeColors, useTheme } from './utils/theme';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Loading screen component shown while the database is being initialized.
 */
const LoadingScreen: React.FC = () => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  return (
    <View
      style={[styles.loadingContainer, { backgroundColor: colors.background }]}
    >
      <ActivityIndicator size="large" color={colors.loading} />
      <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
        Setting up Consistency...
      </Text>
    </View>
  );
};

/**
 * App content wrapper that handles onboarding logic.
 * Shows onboarding on first launch, otherwise shows the main app.
 */
const AppContent: React.FC = () => {
  const { hasCompletedOnboarding, hasHydrated, setOnboardingCompleted } =
    useOnboardingStore();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (hasHydrated) {
      setShowOnboarding(!hasCompletedOnboarding);
    }
  }, [hasHydrated]);

  if (!hasHydrated) return null;

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
      <MainStackNavigator />
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
        console.log('[App] Starting initialization');
        // Run database migrations
        console.log('[App] Running migrations...');
        await runMigrations();
        console.log('[App] Migrations complete');

        // Configure notifications
        console.log('[App] Configuring notifications...');
        await configureNotifications();
        console.log('[App] Notifications configured');

        // Uncomment the line below to seed fake data (for testing)
        // await seedFakeData();

        setIsInitialized(true);
        console.log('[App] Initialization complete');
      } catch (err) {
        console.error('[App] Failed to initialize app:', err);
        setError('Failed to initialize the app. Please restart.');
      }
    };

    initializeApp();
  }, []);

  if (error) {
    const { isDarkMode } = useTheme();
    const colors = getThemeColors(isDarkMode);

    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
