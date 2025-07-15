import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

/**
 * Props for the AddHabitModal component.
 */
interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    name: string,
    icon: string,
    goalType: string,
    targetCount?: number
  ) => Promise<boolean>;
}

/**
 * A modal component for adding new habits.
 * Provides a form with name input, icon selection (including custom emoji), and goal type selection.
 */
export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🏃‍♂️");
  const [goalType, setGoalType] = useState("binary");
  const [targetCount, setTargetCount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");
  const [useCustomEmoji, setUseCustomEmoji] = useState(false);

  const icons = [
    "🏃‍♂️", // Exercise
    "💪", // Strength
    "🧠", // Learning
    "📚", // Reading
    "💧", // Hydration
    "🥗", // Healthy eating
    "😴", // Sleep
    "🧘‍♀️", // Meditation
    "🎯", // Focus
    "⭐", // Achievement
    "🔥", // Motivation
    "💎", // Consistency
  ];

  const goalTypes = [
    {
      key: "binary",
      label: "Daily Goal",
      description: "Complete or not complete",
    },
    { key: "count", label: "Count Goal", description: "Track number of times" },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalIcon =
        useCustomEmoji && customEmoji ? customEmoji : selectedIcon;
      const finalTargetCount =
        goalType === "count" ? parseInt(targetCount) : undefined;

      const success = await onAdd(
        name.trim(),
        finalIcon,
        goalType,
        finalTargetCount
      );
      if (success) {
        handleClose();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add habit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedIcon("🏃‍♂️");
    setGoalType("binary");
    setTargetCount("1");
    setCustomEmoji("");
    setUseCustomEmoji(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Add New Habit</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Habit Name Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habit Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Exercise, Read, Drink Water"
              placeholderTextColor="#999"
              autoFocus
              maxLength={50}
            />
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose an Icon</Text>

            {/* Custom Emoji Section */}
            <View style={styles.customEmojiSection}>
              <TouchableOpacity
                style={[
                  styles.customEmojiToggle,
                  useCustomEmoji && styles.customEmojiToggleActive,
                ]}
                onPress={() => setUseCustomEmoji(!useCustomEmoji)}
              >
                <Text
                  style={[
                    styles.customEmojiToggleText,
                    useCustomEmoji && styles.customEmojiToggleTextActive,
                  ]}
                >
                  {useCustomEmoji ? "✓" : "○"} Use Custom Emoji
                </Text>
              </TouchableOpacity>

              {useCustomEmoji && (
                <View style={styles.customEmojiInputContainer}>
                  <TextInput
                    style={styles.customEmojiInput}
                    value={customEmoji}
                    onChangeText={setCustomEmoji}
                    placeholder="Enter emoji (e.g., 🎯)"
                    placeholderTextColor="#999"
                    maxLength={2}
                    autoFocus
                  />
                  {customEmoji && (
                    <Text style={styles.customEmojiPreview}>{customEmoji}</Text>
                  )}
                </View>
              )}
            </View>

            {!useCustomEmoji && (
              <View style={styles.iconGrid}>
                {icons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.selectedIconButton,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Goal Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goal Type</Text>
            {goalTypes.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.goalTypeButton,
                  goalType === type.key && styles.selectedGoalTypeButton,
                ]}
                onPress={() => setGoalType(type.key)}
              >
                <View style={styles.goalTypeContent}>
                  <Text
                    style={[
                      styles.goalTypeLabel,
                      goalType === type.key && styles.selectedGoalTypeLabel,
                    ]}
                  >
                    {type.label}
                  </Text>
                  <Text
                    style={[
                      styles.goalTypeDescription,
                      goalType === type.key &&
                        styles.selectedGoalTypeDescription,
                    ]}
                  >
                    {type.description}
                  </Text>
                </View>
                {goalType === type.key && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Target Count for Count Goals */}
          {goalType === "count" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Target Count</Text>
              <TextInput
                style={styles.input}
                value={targetCount}
                onChangeText={setTargetCount}
                placeholder="How many times?"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!name.trim() || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!name.trim() || isSubmitting}
          >
            <Text
              style={[
                styles.submitButtonText,
                (!name.trim() || isSubmitting) &&
                  styles.submitButtonTextDisabled,
              ]}
            >
              {isSubmitting ? "Adding..." : "Add Habit"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  customEmojiSection: {
    marginBottom: 12,
  },
  customEmojiToggle: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#f8f8f8",
  },
  customEmojiToggleActive: {
    backgroundColor: "#e8f5e8",
    borderColor: "#4CAF50",
    borderWidth: 1,
  },
  customEmojiToggleText: {
    fontSize: 14,
    color: "#666",
  },
  customEmojiToggleTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  customEmojiInputContainer: {
    marginTop: 8,
    alignItems: "center",
  },
  customEmojiInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
    width: 80,
  },
  customEmojiPreview: {
    fontSize: 32,
    marginTop: 8,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  selectedIconButton: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e8",
  },
  iconText: {
    fontSize: 24,
  },
  goalTypeButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedGoalTypeButton: {
    borderColor: "#4CAF50",
    backgroundColor: "#e8f5e8",
  },
  goalTypeContent: {
    flex: 1,
  },
  goalTypeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  selectedGoalTypeLabel: {
    color: "#4CAF50",
  },
  goalTypeDescription: {
    fontSize: 14,
    color: "#666",
  },
  selectedGoalTypeDescription: {
    color: "#4CAF50",
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonTextDisabled: {
    color: "#999",
  },
});
