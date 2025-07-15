import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodayScreen } from '../screens/TodayScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

/**
 * Main tab navigator component that provides bottom tab navigation.
 * Uses SafeAreaView to ensure proper spacing on devices with home indicators.
 * Includes Today, Stats, and Settings tabs with appropriate icons and labels.
 */
export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="calendar-today" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="bar-chart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Simple tab icon component using text-based icons.
 * In a real app, you'd use a proper icon library like @expo/vector-icons.
 */
const TabIcon: React.FC<{ name: string; color: string; size: number }> = ({
  name,
  color,
  size,
}) => {
  const getIconText = (iconName: string) => {
    switch (iconName) {
      case 'calendar-today':
        return '📅';
      case 'bar-chart':
        return '📊';
      case 'settings':
        return '⚙️';
      default:
        return '📱';
    }
  };

  return <Text style={{ fontSize: size, color }}>{getIconText(name)}</Text>;
};
