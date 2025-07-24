import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { categories, Category } from '../../utils/categories';
import { getThemeColors, useTheme } from '../../utils/theme';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

/**
 * A compact component for selecting habit categories.
 * Displays categories in a horizontal scrollable list with icons and names.
 */
export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  console.log('[CategorySelector] Rendered:', { selectedCategory });

  const renderCategoryItem = (category: Category) => {
    const isSelected = selectedCategory === category.id;

    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryItem,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          isSelected && {
            backgroundColor: colors.primary + '20',
            borderColor: colors.primary,
          },
        ]}
        onPress={() => onCategoryChange(category.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text
          style={[
            styles.categoryName,
            { color: colors.text },
            isSelected && { color: colors.primary },
          ]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {categories.map(renderCategoryItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  scrollContainer: {
    paddingHorizontal: 4,
  },
  categoryItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
