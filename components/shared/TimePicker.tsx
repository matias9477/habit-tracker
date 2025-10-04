import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, useTheme } from '../../utils/theme';

interface TimePickerProps {
  value: string; // Format: "HH:MM"
  onValueChange: (time: string) => void;
  label?: string;
  disabled?: boolean;
}

/**
 * Time picker component for selecting reminder times.
 * Shows a modal with time selection on iOS/Android.
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onValueChange,
  label = 'Time',
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();
  const colors = getThemeColors(isDarkMode);
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (time: string) => {
    onValueChange(time);
    setShowPicker(false);
  };

  const openTimePicker = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.timeButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.6 : 1,
          },
        ]}
        onPress={openTimePicker}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.timeText, { color: colors.text }]}>{value}</Text>
        <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Time Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Reminder Time
              </Text>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeOptions}>
              {[
                '06:00',
                '07:00',
                '08:00',
                '09:00',
                '10:00',
                '11:00',
                '12:00',
                '13:00',
                '14:00',
                '15:00',
                '16:00',
                '17:00',
                '18:00',
                '19:00',
                '20:00',
                '21:00',
                '22:00',
              ].map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    {
                      backgroundColor:
                        time === value ? colors.primary : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleTimeChange(time)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      {
                        color: time === value ? '#fff' : colors.text,
                        fontWeight: time === value ? '600' : '400',
                      },
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 16,
  },
});
