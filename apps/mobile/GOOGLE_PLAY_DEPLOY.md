# Deploying OSCAR Fashion to Google Play

## Prerequisites

1. **Expo account** — sign up at [expo.dev](https://expo.dev)
2. **Google Play Developer account** — $25 one-time fee at [play.google.com/console](https://play.google.com/console)
3. **EAS CLI** installed:
   ```bash
   npm install -g eas-cli
   ```

## Step 1: Initialize EAS

```bash
cd apps/mobile
eas login
eas init
```

`eas init` creates the project on Expo's servers and outputs a **project ID**. Paste it into `app.json`:

```json
"extra": {
  "eas": {
    "projectId": "YOUR_EAS_PROJECT_ID"
  }
}
```

## Step 2: Set the Production API URL

In `app.json`, update `extra.graphqlUrl` to your production backend:

```json
"extra": {
  "graphqlUrl": "https://YOUR-RAILWAY-BACKEND.up.railway.app/shop-api"
}
```

## Step 3: Build the AAB

```bash
eas build --platform android --profile production
```

On first run, EAS will ask about the signing keystore — choose **"Generate new keystore"**. EAS manages it for you.

This produces a signed `.aab` (Android App Bundle) in the cloud. You'll get a download link when the build completes.

## Step 4: Create the App in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Click **"Create app"**
3. Fill in:
   - App name: **OSCAR Fashion**
   - Default language: **French**
   - App type: **App**
   - Free or paid: your choice
4. Complete the **store listing**:
   - Short description & full description
   - App icon (512x512), feature graphic (1024x500)
   - Phone screenshots (minimum 2)
   - Privacy policy URL
5. Complete the **content rating** questionnaire
6. Set up **target audience and content**

## Step 5: Set Up Automated Submission (Optional)

To use `eas submit` for automated uploads:

### Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Enable the **Google Play Android Developer API**
4. Go to **IAM & Admin** → **Service Accounts** → **Create Service Account**
5. Name it (e.g., `eas-submit`), grant **"Service Account User"** role
6. Click the service account → **Keys** → **Add Key** → **Create new key** → **JSON**
7. Save the downloaded file as `apps/mobile/google-service-account.json`

### Link to Google Play Console

1. Go to Play Console → **Settings** → **API access**
2. Click **"Link"** to link your Google Cloud project
3. Find your service account → click **"Manage Play Console permissions"**
4. Grant **"Release to production, exclude devices, and use Play App Signing"** permission
5. Click **"Invite user"** → **"Send invite"**

> The service account key is in `.gitignore` — never commit it.

### Submit

```bash
eas submit --platform android --profile production
```

Or build + submit in one command:

```bash
eas build --platform android --profile production --auto-submit
```

## Step 6: Testing & Release

The `eas.json` is configured to submit to the **internal testing** track. This lets you test with a small group before going public.

### Testing flow

1. **Internal testing** — upload via EAS, add testers by email in Play Console
2. **Closed testing** — wider beta group
3. **Open testing** — public beta
4. **Production** — full release

To change the track, edit `eas.json`:

```json
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "production"
    }
  }
}
```

Available tracks: `internal`, `alpha`, `beta`, `production`.

## Updating the App

For subsequent releases:

1. Bump `version` in `app.json` (e.g., `"1.1.0"`)
2. The `versionCode` auto-increments via `"autoIncrement": true` in `eas.json`
3. Build and submit:
   ```bash
   eas build --platform android --profile production --auto-submit
   ```

## Quick Reference

| Command | Description |
|---------|-------------|
| `eas login` | Authenticate with Expo |
| `eas init` | Link project to EAS |
| `eas build -p android --profile production` | Build production AAB |
| `eas build -p android --profile preview` | Build preview APK (for testing) |
| `eas submit -p android` | Submit to Google Play |
| `eas build -p android --auto-submit` | Build + submit in one step |
| `eas credentials -p android` | Manage signing keystores |
| `eas build:list` | View build history |

## Troubleshooting

### Build fails with dependency errors
```bash
cd apps/mobile
rm -rf node_modules
npm install
eas build --platform android --profile production --clear-cache
```

### Need to manage the keystore manually
```bash
eas credentials --platform android
```
This lets you download, upload, or regenerate the keystore.

### App rejected for missing privacy policy
Add a privacy policy URL in both:
- `app.json` → `expo.android.config.googleServicesFile` is not needed unless using Firebase
- Google Play Console → **App content** → **Privacy policy**

### Need an APK instead of AAB (for direct install testing)
```bash
eas build --platform android --profile preview
```
The `preview` profile builds an APK with internal distribution.
