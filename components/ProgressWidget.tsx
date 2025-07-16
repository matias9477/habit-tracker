import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, useTheme } from '@/utils/theme';
import { HabitWithCompletion } from '@/store/habitStore';

type ProgressView = 'weekly' | 'monthly';

interface ProgressWidgetProps {
  habit: HabitWithCompletion;
  weeklyData: number[];
}

/**
 * Enhanced progress widget component that displays weekly or monthly progress
 * with a toggle between views and a cool calendar design for monthly view.
 */
export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  habit,
  weeklyData,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [viewMode, setViewMode] = useState<ProgressView>('weekly');
  const [monthlyData, setMonthlyData] = useState<
    {
      date: Date;
      completed: boolean;
      count?: number;
    }[]
  >([]);

  // Generate monthly data
  useEffect(() => {
    const generateMonthlyData = () => {
      const data = [];
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date <= today;

        // Simulate completion data
        const completed = isPast && Math.random() > 0.3; // 70% completion rate
        const count =
          habit.goal_type === 'count'
            ? Math.floor(Math.random() * (habit.targetCount || 1) + 1)
            : undefined;

        data.push({
          date,
          completed,
          count,
        });
      }
      setMonthlyData(data);
    };

    generateMonthlyData();
  }, [habit]);

  const renderWeeklyView = () => (
    <View style={styles.weeklyContainer}>
      <View style={styles.weeklyChart}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
          const value = weeklyData[index] || 0;
          const maxValue =
            habit.goal_type === 'count' ? habit.targetCount || 1 : 1;
          const height = (value / maxValue) * 100;
          const isToday = index === new Date().getDay() - 1;

          return (
            <View key={day} style={styles.chartBar}>
              <View
                style={[
                  styles.chartBarContainer,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.chartBarFill,
                    {
                      height: `${height}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                {isToday && (
                  <View
                    style={[
                      styles.todayIndicator,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[styles.chartLabel, { color: colors.textSecondary }]}
              >
                {day}
              </Text>
              <Text style={[styles.chartValue, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderMonthlyView = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();

    return (
      <View style={styles.monthlyContainer}>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {monthName} {currentYear}
        </Text>

        <View style={styles.calendarGrid}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <View key={day} style={styles.calendarHeader}>
              <Text
                style={[
                  styles.calendarHeaderText,
                  { color: colors.textSecondary },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}

          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: startingDayOfWeek }, (_, index) => (
            <View key={`empty-${index}`} style={styles.calendarCell} />
          ))}

          {/* Calendar days */}
          {monthlyData.map((dayData, index) => {
            const isToday =
              dayData.date.toDateString() === today.toDateString();
            const isPast = dayData.date <= today;

            return (
              <View
                key={index}
                style={[
                  styles.calendarCell,
                  isToday && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    { color: colors.text },
                    !isPast && { color: colors.textSecondary },
                  ]}
                >
                  {dayData.date.getDate()}
                </Text>

                {isPast && (
                  <View
                    style={[
                      styles.completionIndicator,
                      {
                        backgroundColor: dayData.completed
                          ? colors.success
                          : colors.border,
                      },
                    ]}
                  >
                    {habit.goal_type === 'count' && dayData.count ? (
                      <Text style={[styles.countText, { color: colors.text }]}>
                        {dayData.count}
                      </Text>
                    ) : (
                      <Ionicons
                        name={dayData.completed ? 'checkmark' : 'close'}
                        size={8}
                        color={
                          dayData.completed ? '#fff' : colors.textSecondary
                        }
                      />
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Legend */}
        <View style={[styles.legend, { borderTopColor: colors.border }]}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendIndicator,
                { backgroundColor: colors.success },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendIndicator,
                { backgroundColor: colors.border },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Missed
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendIndicator,
                { borderColor: colors.primary, borderWidth: 2 },
              ]}
            />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>
              Today
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header with toggle */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Progress Overview
        </Text>

        <View
          style={[styles.toggleContainer, { backgroundColor: colors.border }]}
        >
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'weekly' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('weekly')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'weekly' ? '#fff' : colors.text },
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'monthly' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('monthly')}
          >
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'monthly' ? '#fff' : colors.text },
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View
        style={[styles.content, viewMode === 'weekly' && { minHeight: 140 }]}
      >
        {viewMode === 'weekly' ? renderWeeklyView() : renderMonthlyView()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    minHeight: 160,
  },
  weeklyContainer: {
    flex: 1,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarContainer: {
    width: 20,
    height: 50,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  chartBarFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  todayIndicator: {
    position: 'absolute',
    top: -2,
    left: '50%',
    width: 4,
    height: 4,
    borderRadius: 2,
    marginLeft: -2,
  },
  chartLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '500',
  },
  monthlyContainer: {
    flex: 1,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarHeader: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarHeaderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    position: 'relative',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  completionIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  countText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});
