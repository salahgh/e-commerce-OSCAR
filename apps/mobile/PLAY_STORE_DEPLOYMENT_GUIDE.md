# Deploy OSCAR Fashion to Google Play Store

> A step-by-step guide for freelancers: from client testing to production release.

---

## Prerequisites

| Item | Who Provides | Notes |
|------|-------------|-------|
| **Expo account** | You (freelancer) | Free at [expo.dev](https://expo.dev) |
| **Google Play Console account** | Client | $25 one-time fee at [play.google.com/console](https://play.google.com/console) |
| **Google Service Account JSON** | Client's Play Console | For automated submission via EAS |
| **Backend deployed & running** | You | The production GraphQL URL |
| **App screenshots & graphics** | You / Client | For the Play Store listing |

---

## PHASE 1: Client Testing (Send APK Directly)

### Step 1 — Create & Link Expo Account

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in (or create account at expo.dev)
eas login

# Navigate to mobile app
cd apps/mobile

# Initialize EAS project (links to your Expo account)
eas init
```

After running `eas init`, you'll get a real `projectId`. Update **`apps/mobile/app.json`**:

```jsonc
"extra": {
  "eas": {
    "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  // ← your real project ID
  }
}
```

### Step 2 — Configure Environment

Set the production backend URL in **`apps/mobile/app.json`**:

```jsonc
"extra": {
  "graphqlUrl": "https://your-backend.up.railway.app/shop-api"  // ← real URL
}
```

Create **`apps/mobile/.env`**:

```
EXPO_PUBLIC_GRAPHQL_URL=https://your-backend.up.railway.app/shop-api
```

### Step 3 — Build a Preview APK

The `preview` profile in `eas.json` is already configured to produce an APK:

```bash
cd apps/mobile

eas build --profile preview --platform android
```

- Build takes ~10-20 minutes on EAS servers
- When done, you get a **download link**
- Send this link to your client
- Client installs the APK on their phone (may need to enable "Install from unknown sources" in settings)

### Step 4 — Iterate on Feedback

**Full rebuild** (for native changes):
```bash
eas build --profile preview --platform android
```

**OTA update** (for JS/TS-only changes — instant, no rebuild):
```bash
eas update --branch preview --message "fix: updated checkout flow"
```

Repeat until the client approves.

---

## PHASE 2: Google Play Store Deployment

### Step 5 — Client Creates Google Play Console Account

Your client must:

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay the **$25 one-time registration fee**
3. Complete **identity verification** (ID + address — can take 1-2 days)
4. Create a **new app** in the console:
   - App name: `OSCAR Fashion`
   - Default language: French
   - App type: App
   - Free or paid: as needed

### Step 6 — Create Google Service Account

This allows EAS to automatically upload builds to Play Console.

**A. In Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. Create or select a project
2. Go to **IAM & Admin → Service Accounts**
3. Click **Create Service Account**
   - Name: `eas-submit`
4. Click **Done** (no roles needed here)
5. Click the new account → **Keys** tab → **Add Key → Create new key → JSON**
6. **Download the JSON file**

**B. In Google Play Console:**

1. Go to **Settings → API access**
2. **Link** the Google Cloud project you just used
3. Find the service account → click **Manage Play Console permissions**
4. Grant these permissions:
   - Release to production
   - Manage testing tracks
   - Manage app signing
5. Click **Invite user → Apply**

**C. Save the file:**

```bash
# Place it in the mobile app root (where eas.json expects it)
cp ~/Downloads/your-service-account-file.json apps/mobile/google-service-account.json
```

**IMPORTANT — Never commit this file.** Add to `apps/mobile/.gitignore`:

```
google-service-account.json
```

### Step 7 — Build Production AAB

```bash
cd apps/mobile

eas build --profile production --platform android
```

- Produces an `.aab` (Android App Bundle) — required by Play Store
- EAS manages signing keystores automatically and stores them securely
- Version codes auto-increment (already configured in `eas.json`)

To view or manage your signing credentials:
```bash
eas credentials
```

### Step 8 — Submit to Play Store (Internal Testing)

```bash
eas submit --profile production --platform android
```

The submit profile in `eas.json` is configured to push to the **"internal"** track.

**What happens next:**
- EAS uploads the AAB to Google Play Console
- It appears under **Testing → Internal testing**
- Your client adds testers by email in Play Console
- Testers receive an invite link to install via the Play Store

### Step 9 — Complete the Play Store Listing

Fill in these required fields in Google Play Console:

| Field | Details |
|-------|---------|
| **App name** | OSCAR Fashion |
| **Short description** | Max 80 characters, e.g. "Mode algérienne en ligne" |
| **Full description** | Detailed description in French / Arabic |
| **Screenshots** | Min 2 phone screenshots (1080x1920 recommended) |
| **Feature graphic** | 1024x500 banner image |
| **App icon** | 512x512 (already in your assets) |
| **Privacy policy URL** | Required — must be a live URL |
| **App category** | Shopping |
| **Content rating** | Complete the questionnaire in Play Console |
| **Target audience** | 13+ or appropriate age |
| **Data safety** | Declare what data the app collects |

### Step 10 — Promote to Production

Once the client approves the internal testing build:

**Option A — Via Play Console UI (recommended for first release):**
1. Go to **Testing → Internal testing**
2. Click **Promote release → Production**
3. Review and **Start rollout**

**Option B — Via EAS CLI (for subsequent releases):**

Update `apps/mobile/eas.json` submit track:
```jsonc
"submit": {
  "production": {
    "android": {
      "serviceAccountKeyPath": "./google-service-account.json",
      "track": "production"  // ← change from "internal"
    }
  }
}
```

Then run:
```bash
eas submit --profile production --platform android
```

**Google reviews the app** — typically 1-7 days for the first submission, faster after that.

---

## Command Cheat Sheet

```bash
# ── SETUP ──
npm install -g eas-cli
eas login
cd apps/mobile && eas init

# ── CLIENT TESTING (APK) ──
eas build --profile preview --platform android

# ── OTA UPDATE (JS changes only, instant) ──
eas update --branch preview --message "description"

# ── PRODUCTION BUILD ──
eas build --profile production --platform android

# ── SUBMIT TO PLAY STORE ──
eas submit --profile production --platform android

# ── MANAGE SIGNING KEYS ──
eas credentials
```

---

## Files to Update

| File | What to Change |
|------|---------------|
| `app.json` | Set real `projectId` and `graphqlUrl` |
| `.env` | Set `EXPO_PUBLIC_GRAPHQL_URL` |
| `.gitignore` | Add `google-service-account.json` |
| `google-service-account.json` | Place service account key here (Step 6) |
| `eas.json` | Change submit track to `"production"` for final release |

---

## Checklist

- [ ] `eas whoami` shows your Expo account
- [ ] `eas init` completed, `projectId` set in `app.json`
- [ ] Production `graphqlUrl` configured
- [ ] Preview APK built and sent to client
- [ ] Client tested and approved the app
- [ ] Google Play Console account created and verified
- [ ] Google Service Account JSON in place
- [ ] Production AAB built successfully
- [ ] Submitted to internal testing track
- [ ] Play Store listing completed (screenshots, description, privacy policy)
- [ ] Client approved internal testing build
- [ ] Promoted to production
- [ ] App is live on Google Play Store
