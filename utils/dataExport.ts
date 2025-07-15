import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { HabitWithCompletion } from '../store/habitStore';

export interface ExportData {
  habits: HabitWithCompletion[];
  exportDate: string;
  totalHabits: number;
  completedToday: number;
}

/**
 * Export habit data as CSV file.
 * @param habits - Array of habits with completion data
 * @returns Promise<boolean> - Success status
 */
export const exportHabitData = async (
  habits: HabitWithCompletion[]
): Promise<boolean> => {
  try {
    const exportData: ExportData = {
      habits,
      exportDate: new Date().toISOString(),
      totalHabits: habits.length,
      completedToday: habits.filter((h) => h.isCompletedToday).length,
    };

    // Create CSV content
    const csvContent = createCSVContent(exportData);

    // Create file path
    const fileName = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // Write file
    await FileSystem.writeAsStringAsync(fileUri, csvContent);

    // Share file
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Habit Data',
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to export data:', error);
    return false;
  }
};

/**
 * Create CSV content from habit data.
 * @param exportData - Data to export
 * @returns string - CSV content
 */
const createCSVContent = (exportData: ExportData): string => {
  const { habits, exportDate, totalHabits, completedToday } = exportData;

  // Header
  let csv =
    'Habit Name,Icon,Goal Type,Target Count,Completed Today,Total Completions\n';

  // Data rows
  habits.forEach((habit) => {
    const row = [
      `"${habit.name}"`,
      habit.icon,
      habit.goal_type,
      habit.target_count || '',
      habit.isCompletedToday ? 'Yes' : 'No',
      habit.currentCount || 0,
    ].join(',');
    csv += row + '\n';
  });

  // Summary
  csv += '\n';
  csv += 'Summary\n';
  csv += `Export Date,${exportDate}\n`;
  csv += `Total Habits,${totalHabits}\n`;
  csv += `Completed Today,${completedToday}\n`;

  return csv;
};
