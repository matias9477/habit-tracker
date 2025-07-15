# Habit Tracker

A React Native habit tracking app built with Expo, TypeScript, and Zustand.

## 🚀 Getting Started

```bash
npm install
npm start
```

## 📝 Committing Changes

This project uses Commitizen with conventional commits for consistent commit messages.

### Making Commits

Instead of using `git commit`, use:

```bash
npm run commit
```

This will launch an interactive prompt to create conventional commit messages.

### Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Reverting previous commits

### Commit Format

```
type(scope): subject

[optional body]

[optional footer]
```

### Examples

```bash
feat(habits): add habit completion tracking
fix(ui): resolve modal closing issue
docs(readme): update installation instructions
refactor(store): simplify habit state management
```

## 🛠️ Development

- **TypeScript**: All code is written in TypeScript
- **Zustand**: State management
- **SQLite**: Local data persistence
- **Expo**: React Native framework
- **Material UI**: UI components

## 📁 Project Structure

```
habit-tracker/
├── components/     # Reusable UI components
├── db/            # Database layer and queries
├── screens/       # Screen components
├── store/         # Zustand state management
└── assets/        # Static assets
```

## 🔧 Scripts

- `npm start`: Start the Expo development server
- `npm run commit`: Create a conventional commit
- `npm run android`: Run on Android
- `npm run ios`: Run on iOS
- `npm run web`: Run on web
