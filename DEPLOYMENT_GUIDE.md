# 🚀 Deployment Guide - Consistency App

## 📱 Current App Status

- **App Name**: Consistency
- **Bundle ID**: `com.matiasturra.consistency`
- **EAS Project ID**: `5560a7a3-b43d-4ab9-a47b-c9da50e49725`
- **App Store Connect**: https://appstoreconnect.apple.com/apps/6748652695/testflight/ios
- **Expo Project**: https://expo.dev/accounts/matias.turra/projects/consistency

## 🔄 How to Update and Release New Versions

### 1. **Make Your Changes**

```bash
# Make your code changes
# Test locally with: npm start
```

### 2. **Update Version Numbers**

Edit `app.json` to increment version numbers:

#### **For Bug Fixes (Patch Update)**

```json
{
  "expo": {
    "version": "1.0.1", // Increment patch version
    "ios": {
      "buildNumber": "2" // Increment build number
    },
    "android": {
      "versionCode": 2 // Increment version code
    }
  }
}
```

#### **For New Features (Minor Update)**

```json
{
  "expo": {
    "version": "1.1.0", // Increment minor version
    "ios": {
      "buildNumber": "3" // Increment build number
    },
    "android": {
      "versionCode": 3 // Increment version code
    }
  }
}
```

#### **For Major Changes**

```json
{
  "expo": {
    "version": "2.0.0", // Increment major version
    "ios": {
      "buildNumber": "4" // Increment build number
    },
    "android": {
      "versionCode": 4 // Increment version code
    }
  }
}
```

### 3. **Build New Version**

```bash
# Build for iOS
npx eas-cli build --platform ios

# Build for Android (when ready)
npx eas-cli build --platform android
```

### 4. **Submit to TestFlight/App Store**

```bash
# Submit to TestFlight
npx eas-cli submit --platform ios

# Submit to App Store (when ready for production)
npx eas-cli submit --platform ios --latest
```

## 📋 Version Numbering Guide

### **Semantic Versioning (SemVer)**

- **MAJOR.MINOR.PATCH** format (e.g., 1.2.3)
- **MAJOR**: Breaking changes, major updates (1.0.0 → 2.0.0)
- **MINOR**: New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes, small improvements (1.0.0 → 1.0.1)

### **Build Numbers**

- **iOS**: `buildNumber` must be unique for each App Store submission
- **Android**: `versionCode` must be unique and incrementing

## 🛠️ Development Commands

### **Local Development**

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### **Building**

```bash
# Build for iOS
npx eas-cli build --platform ios

# Build for Android
npx eas-cli build --platform android

# Build for both platforms
npx eas-cli build --platform all
```

### **Submitting**

```bash
# Submit latest build to TestFlight
npx eas-cli submit --platform ios

# Submit specific build
npx eas-cli submit --platform ios --id <build-id>

# Submit to App Store (production)
npx eas-cli submit --platform ios --latest
```

## 🔗 Important Links

### **App Store Connect**

- **TestFlight**: https://appstoreconnect.apple.com/apps/6748652695/testflight/ios
- **App Store**: https://appstoreconnect.apple.com/apps/6748652695

### **Expo Dashboard**

- **Project**: https://expo.dev/accounts/matias.turra/projects/consistency
- **Builds**: https://expo.dev/accounts/matias.turra/projects/consistency/builds

### **Apple Developer**

- **Certificates**: https://developer.apple.com/account/resources/certificates/list
- **Provisioning Profiles**: https://developer.apple.com/account/resources/profiles/list

## ⚠️ Important Notes

### **Before Each Release**

1. ✅ Test all features locally
2. ✅ Update version numbers in `app.json`
3. ✅ Test on physical device if possible
4. ✅ Check that all assets are included
5. ✅ Verify app icon and splash screen

### **Build Requirements**

- **iOS**: Requires Apple Developer Program membership
- **Android**: Requires Google Play Console account
- **EAS**: Requires Expo account and project setup

### **Common Issues**

- **Build fails**: Check EAS project configuration
- **Submission fails**: Verify Apple Developer account status
- **TestFlight not showing**: Wait 5-10 minutes for processing

## 📊 Release Checklist

### **Pre-Build**

- [ ] All features tested locally
- [ ] Version numbers updated
- [ ] Changelog updated
- [ ] Assets optimized

### **Post-Build**

- [ ] Build completed successfully
- [ ] Submitted to TestFlight
- [ ] TestFlight processing complete
- [ ] Tested on TestFlight
- [ ] Ready for App Store submission

### **App Store Release**

- [ ] App Store metadata complete
- [ ] Screenshots uploaded
- [ ] App description finalized
- [ ] Keywords optimized
- [ ] Submitted for review

## 🎯 Quick Reference

### **Current Version Info**

```json
{
  "version": "1.0.0",
  "ios": { "buildNumber": "1" },
  "android": { "versionCode": 1 }
}
```

### **Next Release Commands**

```bash
# 1. Update version in app.json
# 2. Build
npx eas-cli build --platform ios

# 3. Submit
npx eas-cli submit --platform ios
```

---

**Last Updated**: July 15, 2025  
**Current Version**: 1.0.0 (Build 1)
