# Deploy OSCAR Fashion to Apple App Store

> A step-by-step guide for freelancers: from client testing (TestFlight) to production release.

---

## Prerequisites

| Item | Who Provides | Notes |
|------|-------------|-------|
| **Expo account** | You (freelancer) | Free at [expo.dev](https://expo.dev) — same one you used for Android |
| **Apple Developer account** | Client | $99/year at [developer.apple.com](https://developer.apple.com/programs/) |
| **Mac computer** | Not needed | EAS Build compiles on Apple's cloud — no Mac required |
| **App Store Connect access** | Client invites you | So you can manage builds and TestFlight |
| **Apple API Key (.p8)** | Client's App Store Connect | For automated submission via EAS |
| **App screenshots & graphics** | You / Client | For the App Store listing |

---

## Key Difference from Android

| | Android (Play Store) | iOS (App Store) |
|---|---|---|
| **Developer account** | $25 one-time | $99/year |
| **Testing** | APK file or internal track | TestFlight (Apple's official tool) |
| **Review time** | 1-7 days (first) | 1-2 days typically |
| **Build format** | .aab (App Bundle) | .ipa (via EAS Build) |
| **Need a Mac?** | No | No (EAS builds in the cloud) |

---

## PHASE 1: Client Testing via TestFlight

### Step 1 — Client Creates Apple Developer Account

Your client must:

1. Go to [developer.apple.com/programs](https://developer.apple.com/programs/)
2. Enroll as an **Organization** (business) or **Individual**
   - Organization requires a **D-U-N-S number** (free, but takes a few days to get)
   - Individual is faster but shows the person's name on the App Store
3. Pay **$99/year**
4. Wait for Apple to approve the enrollment (1-2 days)

### Step 2 — Client Gives You Access

Your client goes to [App Store Connect](https://appstoreconnect.apple.com):

1. **Users and Access → Add User**
2. Add your Apple ID email
3. Role: **Developer** or **Admin**
4. This lets you manage builds and TestFlight without owning the account

### Step 3 — Create Apple API Key (for automated submission)

In [App Store Connect](https://appstoreconnect.apple.com):

1. Go to **Users and Access → Integrations → App Store Connect API**
2. Click **Generate API Key**
   - Name: `eas-submit`
   - Access: **Developer** (minimum) or **Admin**
3. Download the **.p8 file** (you can only download it once!)
4. Note down:
   - **Key ID** (e.g., `ABC123DEFG`)
   - **Issuer ID** (shown at the top of the API keys page)

Save these — you'll need all three values in Step 6.

### Step 4 — Register the App (Bundle ID)

In [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list):

1. Go to **Certificates, Identifiers & Profiles → Identifiers**
2. Click **+** to register a new identifier
3. Select **App IDs → App**
4. Fill in:
   - Description: `OSCAR Fashion`
   - Bundle ID (Explicit): `com.oscar.fashion`
5. Enable any capabilities you need (Push Notifications, etc.)
6. Click **Register**

Then in **App Store Connect**:

1. Go to **Apps → + New App**
2. Fill in:
   - Platform: iOS
   - Name: `OSCAR Fashion`
   - Primary language: French
   - Bundle ID: select `com.oscar.fashion`
   - SKU: `oscar-fashion` (internal reference, anything works)
3. Click **Create**

### Step 5 — Build for iOS

```bash
cd apps/mobile

# Build for internal distribution (TestFlight)
eas build --profile production --platform ios
```

On the **first build**, EAS will ask you to:
- Log in with the Apple Developer account (or use the API key)
- It auto-generates provisioning profiles and certificates
- Say **Yes** to let EAS manage credentials for you

Build takes ~15-30 minutes.

### Step 6 — Configure EAS Submit for iOS

Update **`apps/mobile/eas.json`** to add iOS submit config:

```jsonc
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "ascApiKeyId": "ABC123DEFG",
        "ascApiKeyPath": "./AuthKey_ABC123DEFG.p8",
        "ascApiKeyIssuerId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      }
    }
  }
}
```

Place the `.p8` file in the mobile app root:
```bash
cp ~/Downloads/AuthKey_ABC123DEFG.p8 apps/mobile/
```

**Add to `.gitignore`** — never commit this:
```
AuthKey_*.p8
```

### Step 7 — Submit to TestFlight

```bash
eas submit --profile production --platform ios
```

**What happens next:**
1. EAS uploads the `.ipa` to App Store Connect
2. Apple processes the build (~5-30 minutes)
3. The build appears in **App Store Connect → TestFlight**
4. Add testers:
   - **Internal testers** — anyone on the App Store Connect team (up to 100, no review needed)
   - **External testers** — anyone by email (up to 10,000, requires a quick Apple review first time)
5. Testers get a notification in the **TestFlight app** to install and test

### Step 8 — Iterate on Feedback

**Full rebuild** (native changes):
```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

**OTA update** (JS/TS-only changes — instant, no rebuild or review):
```bash
eas update --branch production --message "fix: updated checkout flow"
```

---

## PHASE 2: App Store Release

### Step 9 — Complete the App Store Listing

In [App Store Connect](https://appstoreconnect.apple.com), go to your app:

| Field | Details |
|-------|---------|
| **App name** | OSCAR Fashion |
| **Subtitle** | Max 30 characters, e.g. "Mode algérienne" |
| **Description** | Full description in French / Arabic |
| **Keywords** | Comma-separated, max 100 characters total |
| **Screenshots** | Required for each device size you support: |
| | - 6.7" (iPhone 15 Pro Max): 1290x2796 |
| | - 6.5" (iPhone 14 Plus): 1284x2778 |
| | - 5.5" (iPhone 8 Plus): 1242x2208 (optional) |
| **App icon** | 1024x1024 (no transparency, no rounded corners — Apple rounds them) |
| **Privacy policy URL** | Required — must be a live URL |
| **Category** | Shopping |
| **Age rating** | Complete the questionnaire |
| **App privacy (nutrition labels)** | Declare data collection practices |
| **Support URL** | Required |
| **Copyright** | e.g. "2026 OSCAR Fashion" |

### Step 10 — Submit for Review

In App Store Connect:

1. Go to your app → **App Store** tab
2. Select the build from TestFlight
3. Fill in **"What's New"** (for updates) or leave blank for first release
4. Answer the **Export Compliance** question (usually "No" if you don't use custom encryption — standard HTTPS is fine, just declare it)
5. Click **Submit for Review**

**Apple review typically takes 1-2 days.** They check for:
- Crashes and bugs
- UI guidelines compliance
- Privacy policy and data practices
- Content appropriateness

If rejected, Apple tells you exactly why — fix the issue and resubmit.

### Step 11 — Release

After approval, you choose:
- **Manually release** — you click "Release" when ready
- **Automatic release** — goes live as soon as approved

The app is now live on the App Store!

---

## Command Cheat Sheet

```bash
# ── SETUP (same Expo account as Android) ──
eas login
cd apps/mobile

# ── BUILD iOS ──
eas build --profile production --platform ios

# ── SUBMIT TO APP STORE / TESTFLIGHT ──
eas submit --profile production --platform ios

# ── OTA UPDATE (JS changes only, instant) ──
eas update --branch production --message "description"

# ── BUILD BOTH PLATFORMS AT ONCE ──
eas build --profile production --platform all

# ── SUBMIT BOTH PLATFORMS AT ONCE ──
eas submit --profile production --platform all

# ── MANAGE iOS SIGNING CREDENTIALS ──
eas credentials --platform ios
```

---

## Files to Update

| File | What to Change |
|------|---------------|
| `eas.json` | Add `ios` section under `submit.production` (Step 6) |
| `.gitignore` | Add `AuthKey_*.p8` |
| `AuthKey_*.p8` | Place Apple API key file here (Step 3) |

> `app.json` already has the iOS bundle ID (`com.oscar.fashion`) configured — no changes needed there.

---

## Checklist

- [ ] Client enrolled in Apple Developer Program ($99/year)
- [ ] Client added you to App Store Connect team
- [ ] Apple API Key (.p8) downloaded with Key ID and Issuer ID
- [ ] Bundle ID `com.oscar.fashion` registered in Apple Developer Portal
- [ ] App created in App Store Connect
- [ ] `eas build --profile production --platform ios` succeeds
- [ ] `eas.json` updated with iOS submit config
- [ ] `eas submit --profile production --platform ios` uploads to App Store Connect
- [ ] TestFlight build available, testers added
- [ ] Client tested and approved via TestFlight
- [ ] App Store listing completed (screenshots, description, privacy policy)
- [ ] Submitted for Apple review
- [ ] Review passed
- [ ] App is live on the App Store

---

## Common Gotchas

| Issue | Solution |
|-------|---------|
| **"No provisioning profile"** | Let EAS manage it: `eas credentials --platform ios` → reset profiles |
| **Build fails on first try** | Make sure the Apple Developer account enrollment is fully approved |
| **TestFlight build "Processing"** | Normal — wait 5-30 minutes for Apple to process |
| **Rejected for missing privacy policy** | Add a live URL in App Store Connect AND in `app.json` under `ios.privacyManifests` if needed |
| **Export compliance warning** | If you only use HTTPS (no custom encryption), answer "No" to the encryption question |
| **Screenshots required per device** | Use a tool like [screenshots.pro](https://screenshots.pro) or Simulator to capture them |
