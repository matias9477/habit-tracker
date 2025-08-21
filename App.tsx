import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations, resetDatabase } from './db/database';
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
 * Error screen component shown when initialization fails.
 */
const ErrorScreen: React.FC<{ error: string; onRetry: () => void; onReset: () => void }> = ({ 
  error, 
  onRetry, 
  onReset 
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);

  return (
    <View
      style={[styles.errorContainer, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      
      <View style={styles.errorActions}>
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={[styles.errorButtonText, { color: colors.surface }]}>
            Retry
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.errorButton, { backgroundColor: colors.error }]}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <Text style={[styles.errorButtonText, { color: colors.surface }]}>
            Reset Database
          </Text>
        </TouchableOpacity>
      </View>
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
  }, [hasHydrated, hasCompletedOnboarding]);

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
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Always call useTheme to avoid hooks violation
  const { isDarkMode } = useTheme();

  const initializeApp = useCallback(async () => {
    try {
      console.log('[App] Starting initialization');
      setError(null);
      
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
      
      // Provide more specific error messages
      let errorMessage = 'Failed to initialize the app. Please restart.';
      
      if (err instanceof Error) {
        if (err.message.includes('Database has been reset')) {
          errorMessage = err.message;
        } else if (err.message.includes('Database has been repaired')) {
          errorMessage = err.message;
        } else if (err.message.includes('Database migration, repair, and reset all failed')) {
          errorMessage = 'Critical database error. Please reinstall the app.';
        } else {
          errorMessage = `Initialization failed: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    }
  }, []);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    await initializeApp();
    setIsRetrying(false);
  }, [initializeApp]);

  const handleReset = useCallback(async () => {
    try {
      setIsRetrying(true);
      setError(null);
      
      console.log('[App] Resetting database...');
      await resetDatabase();
      
      // Try to initialize again
      await initializeApp();
    } catch (err) {
      console.error('[App] Database reset failed:', err);
      setError('Database reset failed. Please reinstall the app.');
    } finally {
      setIsRetrying(false);
    }
  }, [initializeApp]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} onReset={handleReset} />;
  }

  if (!isInitialized || isRetrying) {
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
    marginBottom: 24,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 16,
  },
  errorButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
