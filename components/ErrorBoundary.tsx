import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { getThemeColors } from '../utils/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree.
 * Logs those errors and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In a production app, you would send this to a crash reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRestart = () => {
    Alert.alert('Restart App', 'Would you like to restart the app?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        onPress: () => {
          // In a real app, you might want to reload the app
          // For now, we'll just reset the error state
          this.setState({ hasError: false });
        },
      },
    ]);
  };

  render() {
    if (this.state.hasError) {
      console.log(
        '[ErrorBoundary] Fallback UI rendered due to error:',
        this.state.error
      );
      return <ErrorFallback onRestart={this.handleRestart} />;
    }

    return this.props.children;
  }
}

/**
 * Fallback UI component shown when an error occurs.
 */
const ErrorFallback: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
  const { isDarkMode } = useThemeStore();
  const colors = getThemeColors(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Ionicons
          name="warning-outline"
          size={64}
          color={colors.error}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Oops! Something went wrong
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          We're sorry, but something unexpected happened. Please try restarting
          the app.
        </Text>
        <TouchableOpacity
          style={[styles.restartButton, { backgroundColor: colors.primary }]}
          onPress={onRestart}
        >
          <Text style={styles.restartButtonText}>Restart App</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  restartButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
