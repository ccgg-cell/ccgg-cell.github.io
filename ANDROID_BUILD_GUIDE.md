# Building and Publishing Artifact Atlas to Google Play

This guide walks you through converting your PWA to an Android app and publishing it to Google Play.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Setup Capacitor](#setup-capacitor)
3. [Configure Android Project](#configure-android-project)
4. [Create Signing Key](#create-signing-key)
5. [Build APK/AAB](#build-apkaab)
6. [Publish to Google Play](#publish-to-google-play)

---

## Prerequisites

### Required Software
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **Java Development Kit (JDK)** - [Download JDK 11 or 17](https://www.oracle.com/java/technologies/downloads/)
- **Android Studio** - [Download](https://developer.android.com/studio)
- **Git** (already have it)

### Google Account
- Google Play Developer account ($25 one-time fee) - [Sign up](https://play.google.com/console/signup)

---

## Setup Capacitor

### Step 1: Install Dependencies

Open your terminal/command prompt in your project directory and run:

```bash
npm install
```

This installs Capacitor and its dependencies from `package.json`.

### Step 2: Initialize Capacitor

Run the interactive initialization:

```bash
npx cap init
```

When prompted, enter:
```
App name: Artifact Atlas
App ID (Package Name): com.artifactatlas.app
Web dir: . (current directory, where your index.html is)
```

This creates a `capacitor.config.json` file. Verify it looks like:

```json
{
  "appId": "com.artifactatlas.app",
  "appName": "Artifact Atlas",
  "webDir": ".",
  "server": {
    "androidScheme": "https"
  },
  "plugins": {}
}
```

### Step 3: Add Android Platform

```bash
npx cap add android
```

This creates an `android/` folder with a full Android Studio project.

### Step 4: Sync Web Files to Android

Every time you update your web files (HTML/CSS/JS), sync them to Android:

```bash
npx cap sync android
```

---

## Configure Android Project

### Step 1: Open Android Studio

```bash
npx cap open android
```

This launches Android Studio with your Android project open.

### Step 2: Update Project Settings

In Android Studio, you may see a "Gradle Sync" popup. Click **Sync Now**.

Allow the build system to download all dependencies (this takes a few minutes).

### Step 3: Update App Icons and Splash Screen (Optional but Recommended)

To replace the default Capacitor icons with your Artifact Atlas branding:

1. **Get your icon files:**
   - Prepare a 512x512 PNG image of your app icon
   - Place it in: `android/app/src/main/res/`

2. **Update in Android Studio:**
   - Right-click `android/app/src/main` → New → Image Asset
   - Select your 512x512 PNG and let Android generate all sizes

---

## Create Signing Key

To publish to Google Play, you **must** sign your APK with a private signing key.

### Step 1: Generate Keystore File

In Android Studio:

1. Go to **Build** → **Generate Signed Bundle/APK**
2. Select **APK** (or **Android App Bundle** for better compression)
3. Click **Next**
4. Under "Key store path", click **Create new...**

Fill in the form:

```
Key store path: Choose a safe location (e.g., C:\Users\YourName\artifact-atlas.jks or ~/artifact-atlas.jks)
Password: Create a STRONG password (write this down!)
Confirm: Repeat password
Key alias: artifact-atlas-key
Password: Same or different (write this down!)
Validity: 50 years (recommended)
Certificate:
  - First and Last Name: Your Name or "Artifact Atlas"
  - Organization Unit: Your Name
  - Organization: Artifact Atlas
  - City: Durham (or your city)
  - State/Province: North Carolina
  - Country Code: US
```

Click **OK** and then **Next**.

### Step 2: Select Build Variant

On the "New APK" dialog:

```
Build Variant: release
```

Click **Finish**.

**IMPORTANT:** Save your keystore file and password in a secure location. You'll need these to update your app in the future.

---

## Build APK/AAB

### Option A: Build Release APK (Simpler)

In Android Studio:

1. Go to **Build** → **Build Bundle(s)/APK(s)** → **Build APK**
2. Wait for the build to complete (2-5 minutes)
3. A notification will appear saying "Build successful"
4. Click **Locate** to find your APK

The file will be at:
```
android/app/release/app-release.apk
```

### Option B: Build Release AAB (Recommended for Google Play)

AAB (Android App Bundle) is smaller and Google Play prefers it:

1. Go to **Build** → **Generate Signed Bundle/APK**
2. Select **Android App Bundle**
3. Click **Next**
4. Select your keystore file from Step 1
5. Enter your keystore and key passwords
6. Select **release** build variant
7. Click **Finish**

The file will be at:
```
android/app/release/app-release.aab
```

---

## Publish to Google Play

### Step 1: Create Google Play Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account
3. Pay the $25 registration fee
4. Agree to the Developer Distribution Agreement

### Step 2: Create New App

1. Click **Create app**
2. Fill in:
   - **App name:** Artifact Atlas
   - **Default language:** English
   - **App type:** App
   - **Free or Paid:** Choose one
3. Accept the declarations and click **Create**

### Step 3: Complete App Details

You'll land on the app dashboard. Complete these sections:

#### A. App Access
- Go to **App access**
- Select access level (usually "Full game" or "Default")

#### B. Content Rating
- Go to **Content rating**
- Fill out the questionnaire
- Publish your rating

#### C. Target Audience & Content
- Go to **Target audience and content**
- Select your target age group
- Declare content ratings (Violence, Profanity, etc.)

#### D. App Details
- Go to **App details**
- Fill in:
  - **Short description:** (80 chars max)
    ```
    NC Civil War Field Guide & Relic Hunter Community
    ```
  - **Full description:** (4000 chars max)
    ```
    The definitive interactive field guide for Civil War relic hunting, 
    historians, and researchers. 42+ documented sites across North Carolina, 
    interactive maps, legal guidance, expert techniques, and an open community forum.
    ```
  - **Category:** Maps & Navigation (or Education)
  - **Email address:** Your contact email
  - **Website:** https://artifactatlas.space
  - **Privacy policy:** Link to your privacy policy (create one)

#### E. Branding
- Go to **Branding**
- Upload:
  - **App icon:** 512x512 PNG (your Artifact Atlas logo)
  - **Feature graphic:** 1024x500 PNG (banner image)
  - **Screenshots:** 4-8 screenshots showing the app (landscape or portrait)
  - **Video (optional):** Demo video

#### F. Release Notes
- Go to **Release notes**
- Add release notes for your first version

### Step 4: Upload Your Build

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Click **Browse files** under "Android App Bundle (.aab) or .apk file"
4. Select your `app-release.aab` or `app-release.apk`
5. Add release notes:
   ```
   Initial release: Interactive Civil War field guide with 42+ sites, 
   community forum, and legal guidance for NC relic hunters.
   ```
6. Click **Review release**
7. Verify all information
8. Click **Start rollout to Production**

### Step 5: Wait for Review

Google Play will review your app (usually 24-48 hours, but can take up to a week).

You can check status in **Release** → **Production**.

---

## After Publishing

### Future Updates

To update your app:

1. Update your web files in GitHub
2. Run: `npx cap sync android`
3. Rebuild the APK/AAB in Android Studio
4. Sign with your keystore
5. Upload new AAB to Google Play Console

### Monitor Performance

In Google Play Console, you can view:
- **Installs & uninstalls**
- **User reviews & ratings**
- **Crash reports**
- **User demographics**

---

## Troubleshooting

### "App ID should read 'artifactatlas.app'"
- Make sure your package name in `capacitor.config.json` is exactly: `com.artifactatlas.app`
- Rebuild the Android project

### Gradle Build Failures
- In Android Studio, go to **File** → **Sync Now**
- Or run: `cd android && ./gradlew clean build`

### Signing Key Issues
- Use the same keystore file and password for all updates
- Store your keystore in a safe place (not in version control)
- Add `android/` to `.gitignore`

### APK Too Large
- Use Android App Bundle (AAB) instead of APK
- AAB is automatically optimized for different devices

---

## Important Notes

✅ **Do:**
- Keep your signing key secure
- Test the APK on a real Android device before uploading
- Include privacy policy if you collect any user data
- Update your app regularly

❌ **Don't:**
- Commit keystore files to GitHub
- Lose your signing key password
- Ignore Google Play policy violations
- Publish without testing

---

## Quick Reference Commands

```bash
# Initial setup
npm install
npx cap init
npx cap add android

# Development
npx cap sync android
npx cap open android

# Building (in Android Studio)
Build → Generate Signed Bundle/APK
```

---

## Questions?

If you encounter issues, check:
- [Capacitor Documentation](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/guide)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
