/**
 * Predefined categories for habits with their associated icons and descriptions.
 */
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const categories: Category[] = [
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '💪',
    description: 'Exercise, workouts, and physical activity',
    color: '#FF6B6B',
  },
  {
    id: 'health',
    name: 'Health',
    icon: '🏥',
    description: 'Sleep, hydration, and wellness',
    color: '#4ECDC4',
  },
  {
    id: 'learning',
    name: 'Learning',
    icon: '📚',
    description: 'Reading, studying, and skill development',
    color: '#45B7D1',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: '⚡',
    description: 'Work, focus, and time management',
    color: '#96CEB4',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    icon: '🧘‍♀️',
    description: 'Meditation, reflection, and mental health',
    color: '#FFEAA7',
  },
  {
    id: 'social',
    name: 'Social',
    icon: '👥',
    description: 'Relationships, communication, and social activities',
    color: '#DDA0DD',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    description: 'Budgeting, saving, and financial goals',
    color: '#98D8C8',
  },
  {
    id: 'creativity',
    name: 'Creativity',
    icon: '🎨',
    description: 'Art, music, writing, and creative projects',
    color: '#F7DC6F',
  },
  {
    id: 'home',
    name: 'Home',
    icon: '🏠',
    description: 'Cleaning, organization, and household tasks',
    color: '#BB8FCE',
  },
  {
    id: 'personal',
    name: 'Personal',
    icon: '🌟',
    description: 'Self-improvement and personal development',
    color: '#F8C471',
  },
  {
    id: 'general',
    name: 'General',
    icon: '📋',
    description: 'Other habits and miscellaneous tasks',
    color: '#BDC3C7',
  },
];

/**
 * Get a category by its ID.
 */
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

/**
 * Get the default category (first category in the list).
 */
export const getDefaultCategory = (): Category => {
  return categories[0]!; // Returns the first category (fitness)
};
