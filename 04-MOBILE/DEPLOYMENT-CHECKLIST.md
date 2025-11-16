# OSCAR Fashion Mobile App - Deployment Checklist

This comprehensive checklist will guide you through deploying the OSCAR Fashion mobile app to production.

---

## Pre-Deployment Checklist

### 1. Code Preparation

#### Code Quality
- [ ] All code formatted with Prettier
- [ ] No TypeScript errors
- [ ] No console.log or debugging code
- [ ] All TODOs addressed or documented
- [ ] Commented code removed
- [ ] Unused imports removed

#### Environment Configuration
- [ ] Production API URL configured
- [ ] GraphQL endpoint configured
- [ ] Payment gateway credentials configured (CIB, BaridiMob)
- [ ] App name and version updated in `app.json`
- [ ] Bundle identifiers configured (iOS and Android)

#### Testing
- [ ] All features manually tested
- [ ] Authentication flows tested
- [ ] Payment flows tested (all methods)
- [ ] Order flows tested
- [ ] Profile management tested
- [ ] Language switching tested
- [ ] RTL layout tested (Arabic)
- [ ] Error scenarios tested
- [ ] Network error handling tested

### 2. Backend Integration

- [ ] Production API is live and stable
- [ ] GraphQL endpoint accessible
- [ ] Authentication working
- [ ] All queries returning correct data
- [ ] All mutations working correctly
- [ ] File uploads working (if applicable)
- [ ] Email service configured
- [ ] Payment webhook endpoints configured
- [ ] CORS configured correctly
- [ ] Rate limiting configured
- [ ] Database production-ready

### 3. App Store Assets

#### Required Assets
- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] iOS screenshots (6.5", 5.5" required)
- [ ] Android screenshots (phone and tablet)
- [ ] App description (short and long)
- [ ] App keywords
- [ ] App category selected
- [ ] Age rating completed

#### Legal Documents
- [ ] Privacy Policy written and published
- [ ] Terms & Conditions written and published
- [ ] Support/Contact URL configured
- [ ] GDPR compliance reviewed (if applicable)

### 4. Accounts Setup

#### Expo
- [ ] Expo account created
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Logged into Expo (`eas login`)
- [ ] Project initialized (`eas build:configure`)

#### Apple (iOS)
- [ ] Apple Developer account ($99/year)
- [ ] App ID created in Apple Developer Portal
- [ ] App created in App Store Connect
- [ ] Distribution certificate generated
- [ ] App Store provisioning profile created
- [ ] Team ID configured

#### Google (Android)
- [ ] Google Play Console account ($25 one-time)
- [ ] App created in Play Console
- [ ] App signing key generated
- [ ] Release track configured (internal/alpha/beta/production)

---

## Deployment Steps

### Phase 1: Preparation

#### Step 1: Update App Configuration

**File**: `app.json`

```json
{
  "expo": {
    "name": "OSCAR Fashion",
    "slug": "oscar-fashion",
    "version": "2.0.0",
    "scheme": "myapp",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2C3E50"
    },
    "ios": {
      "bundleIdentifier": "com.oscar.fashion",
      "buildNumber": "1",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "Allow OSCAR Fashion to access your camera to upload photos",
        "NSPhotoLibraryUsageDescription": "Allow OSCAR Fashion to access your photos to upload images"
      }
    },
    "android": {
      "package": "com.oscar.fashion",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2C3E50"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

**Checklist**:
- [ ] App name updated
- [ ] Version number set
- [ ] Bundle identifiers configured
- [ ] Icons added (icon.png, adaptive-icon.png, splash.png)
- [ ] Permissions configured
- [ ] Deep linking scheme configured

#### Step 2: Create Environment Variables

**File**: `.env.production`

```bash
EXPO_PUBLIC_API_URL=https://api.oscarfashion.dz
EXPO_PUBLIC_GRAPHQL_URL=https://api.oscarfashion.dz/graphql
EXPO_PUBLIC_CIB_MERCHANT_ID=your_actual_cib_merchant_id
EXPO_PUBLIC_BARIDIMOB_MERCHANT_ID=your_actual_baridimob_merchant_id
EXPO_PUBLIC_APP_VERSION=2.0.0
```

**Checklist**:
- [ ] Production API URLs configured
- [ ] Payment gateway IDs configured
- [ ] No hardcoded secrets in code
- [ ] `.env.production` added to `.gitignore`

#### Step 3: Configure EAS Build

**File**: `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.oscarfashion.dz",
        "EXPO_PUBLIC_GRAPHQL_URL": "https://api.oscarfashion.dz/graphql"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Checklist**:
- [ ] Build profiles configured
- [ ] Production environment variables set
- [ ] Submit configuration ready

---

### Phase 2: iOS Deployment

#### Step 1: Configure iOS in Apple Developer Portal

1. **Create App ID**
   - Go to developer.apple.com
   - Certificates, Identifiers & Profiles
   - Identifiers → Register a New Identifier
   - App IDs → App
   - Bundle ID: `com.oscar.fashion`
   - Enable capabilities: Push Notifications (if needed)

2. **Create App in App Store Connect**
   - Go to appstoreconnect.apple.com
   - My Apps → New App
   - Platform: iOS
   - Name: OSCAR Fashion
   - Bundle ID: com.oscar.fashion
   - SKU: oscar-fashion-001

**Checklist**:
- [ ] App ID created
- [ ] App created in App Store Connect
- [ ] Certificates configured
- [ ] Provisioning profiles ready

#### Step 2: Build for iOS

```bash
# Build for App Store
eas build --platform ios --profile production

# Wait for build to complete (~15-30 minutes)
# Build will be uploaded to EAS servers
```

**Checklist**:
- [ ] Build initiated
- [ ] Build completed successfully
- [ ] No errors in build logs
- [ ] .ipa file downloadable

#### Step 3: Submit to App Store

**Option A: Using EAS Submit**
```bash
eas submit --platform ios
```

**Option B: Manual Upload**
1. Download .ipa from EAS
2. Use Transporter app to upload to App Store Connect

**Checklist**:
- [ ] App binary uploaded
- [ ] App submitted for review
- [ ] All required metadata filled
- [ ] Screenshots uploaded
- [ ] App description complete
- [ ] Keywords configured
- [ ] Age rating selected
- [ ] Privacy policy URL added

#### Step 4: App Store Review

**What Apple Reviews**:
- App functionality
- Content quality
- User interface
- Privacy compliance
- Performance
- Metadata accuracy

**Timeline**: 1-3 days typically

**Checklist**:
- [ ] App submitted for review
- [ ] Review status monitored
- [ ] Ready to respond to feedback
- [ ] Contact information accurate

---

### Phase 3: Android Deployment

#### Step 1: Configure Android in Google Play Console

1. **Create App in Play Console**
   - Go to play.google.com/console
   - Create app
   - App name: OSCAR Fashion
   - Default language: French
   - App/Game: App
   - Free/Paid: Free

2. **Complete Store Listing**
   - App name
   - Short description (80 characters)
   - Full description (4000 characters)
   - Screenshots (minimum 2)
   - Feature graphic (1024 x 500)
   - App icon (512 x 512)

**Checklist**:
- [ ] App created in Play Console
- [ ] Store listing completed
- [ ] Graphics uploaded
- [ ] Content rating completed
- [ ] App category selected

#### Step 2: Build for Android

```bash
# Build for Play Store
eas build --platform android --profile production

# Wait for build to complete (~10-20 minutes)
```

**Checklist**:
- [ ] Build initiated
- [ ] Build completed successfully
- [ ] No errors in build logs
- [ ] .aab file downloadable

#### Step 3: Upload to Play Console

**Using EAS Submit**:
```bash
eas submit --platform android
```

**Manual Upload**:
1. Download .aab from EAS
2. Upload to Play Console → Production → Create new release

**Checklist**:
- [ ] AAB uploaded to Play Console
- [ ] Release notes added
- [ ] App signing verified
- [ ] Release name configured

#### Step 4: Create Release

1. **Production Track**
   - Create new release
   - Upload AAB
   - Release name: "2.0.0 - Initial Release"
   - Release notes (in French, English, Arabic)

2. **Review and Rollout**
   - Review release details
   - Start rollout to production
   - Choose rollout percentage (start with 10%, then 50%, then 100%)

**Checklist**:
- [ ] Release created
- [ ] Release notes added (all languages)
- [ ] Rollout started
- [ ] Release status monitored

#### Step 5: Google Play Review

**What Google Reviews**:
- App content policy compliance
- Security and privacy
- Metadata accuracy
- Store listing quality

**Timeline**: Few hours to 2-3 days

**Checklist**:
- [ ] App submitted for review
- [ ] Review status monitored
- [ ] Ready to respond to policy violations (if any)

---

### Phase 4: Post-Deployment

#### Step 1: Monitor Launch

**First 24 Hours**:
- [ ] Monitor crash reports (if crash reporting configured)
- [ ] Check for immediate user feedback
- [ ] Monitor server load and API performance
- [ ] Verify payment flows working
- [ ] Check analytics (if configured)

**First Week**:
- [ ] Monitor app store reviews
- [ ] Track download numbers
- [ ] Monitor user retention
- [ ] Check for common issues
- [ ] Gather user feedback

#### Step 2: Configure Monitoring (Recommended)

**Crash Reporting**:
```bash
# Install Sentry
npx expo install @sentry/react-native

# Configure in app
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: 'production',
});
```

**Analytics**:
```bash
# Install Google Analytics or Mixpanel
# Configure tracking events
```

**Checklist**:
- [ ] Crash reporting configured
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Error tracking working

#### Step 3: OTA Updates (Over-The-Air)

For quick bug fixes without app store review:

```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Users will receive update on next app open
```

**When to use OTA**:
- Bug fixes
- Minor UI improvements
- Text/translation updates
- Configuration changes

**When NOT to use OTA**:
- Native code changes
- New native dependencies
- Major feature additions
- Breaking changes

**Checklist**:
- [ ] OTA update strategy defined
- [ ] Update branch configured
- [ ] Testing process for OTA updates

---

## Testing Checklist (Pre-Launch)

### Functional Testing

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new account
- [ ] Register with existing email (error)
- [ ] Forgot password flow
- [ ] Auto-login on app restart
- [ ] Logout functionality

#### Products
- [ ] Product list loads
- [ ] Product search works
- [ ] Category filter works
- [ ] Price filter works
- [ ] Product detail loads
- [ ] Product images display
- [ ] Add to cart from detail

#### Shopping Cart
- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Cart badge updates
- [ ] Cart persists on app restart
- [ ] Empty cart state displays

#### Checkout
- [ ] Shipping address form validation
- [ ] Payment method selection
- [ ] Order summary displays correctly
- [ ] Order placement succeeds
- [ ] Cart clears after order
- [ ] Confirmation screen displays

#### Payment
- [ ] COD order completes
- [ ] CIB payment WebView loads (mock)
- [ ] BaridiMob payment WebView loads (mock)
- [ ] Payment success flow
- [ ] Payment failure flow
- [ ] Payment cancellation flow

#### Orders
- [ ] Order history loads
- [ ] Order detail displays
- [ ] Order timeline shows correctly
- [ ] Order cancellation works (pending/confirmed)
- [ ] Reorder button works (when implemented)

#### Profile
- [ ] Profile displays user info
- [ ] Edit profile updates info
- [ ] Change password works
- [ ] Language switching works
- [ ] Settings toggles work
- [ ] Logout confirmation works

### UI/UX Testing

- [ ] All screens display correctly on iPhone
- [ ] All screens display correctly on Android
- [ ] Responsive layout on different screen sizes
- [ ] Tab navigation works smoothly
- [ ] Back button navigation works
- [ ] Loading spinners display
- [ ] Error messages are clear
- [ ] Success messages display
- [ ] Empty states are helpful
- [ ] Icons display correctly
- [ ] Colors are consistent

### Localization Testing

- [ ] French language complete and correct
- [ ] English language complete and correct
- [ ] Arabic language complete and correct
- [ ] RTL layout works for Arabic
- [ ] Language switcher works
- [ ] Numbers format correctly per locale
- [ ] Dates format correctly per locale

### Performance Testing

- [ ] App starts quickly (< 3 seconds)
- [ ] Screen transitions are smooth
- [ ] No lag during scrolling
- [ ] Images load progressively
- [ ] API calls don't block UI
- [ ] Forms respond instantly
- [ ] No memory leaks during testing

### Edge Cases

- [ ] Poor network connection handling
- [ ] No network connection handling
- [ ] API timeout handling
- [ ] Invalid API responses
- [ ] Very long product names
- [ ] Very long addresses
- [ ] Large order quantities
- [ ] Empty search results
- [ ] No products in category

---

## Rollback Plan

### If Critical Issues Found

#### OTA Rollback (for minor issues)
```bash
# Publish previous working version
eas update --branch production --message "Rollback to previous version"
```

#### App Store Rollback (for major issues)

**iOS**:
1. Go to App Store Connect
2. My Apps → OSCAR Fashion
3. Remove from Sale (temporary)
4. Fix issues and resubmit

**Android**:
1. Go to Play Console
2. Halt rollout
3. Create new release with fixes
4. Resume rollout

**Checklist**:
- [ ] Rollback procedure documented
- [ ] Team knows how to execute rollback
- [ ] Previous working version tagged in Git
- [ ] Communication plan for users

---

## Success Metrics

### Launch Day Metrics
- Downloads: Track first 24 hours
- Installations: Successful app installs
- Crash-free rate: Target > 99.5%
- Registration rate: % of downloads that register
- First order rate: % of registrations that order

### Week 1 Metrics
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average session duration
- Retention rate (Day 1, Day 3, Day 7)
- Conversion rate (registration to purchase)
- Average order value

### Performance Metrics
- App startup time: < 3 seconds
- API response time: < 2 seconds average
- Screen load time: < 1 second
- Crash rate: < 0.5%
- ANR rate (Android): < 0.1%

---

## Support Plan

### Customer Support Channels
- In-app support section
- Email: support@oscarfashion.dz
- Phone: +213 XXX XXX XXX
- Social media: @oscarfashion

### Issue Response Times
- Critical (app crashes): < 2 hours
- High (payment issues): < 4 hours
- Medium (UI bugs): < 24 hours
- Low (feature requests): < 72 hours

### Common Issues Preparation
- [ ] FAQ document created
- [ ] Support team trained
- [ ] Issue tracking system set up
- [ ] Escalation process defined

---

## Final Pre-Launch Checklist

### 24 Hours Before Launch
- [ ] All tests passed
- [ ] Backend stable
- [ ] Payment gateways tested
- [ ] App store approval received
- [ ] Support team ready
- [ ] Marketing materials ready
- [ ] Social media posts scheduled
- [ ] Monitoring tools configured

### Launch Day
- [ ] App made available in stores
- [ ] Social media announcement
- [ ] Email campaign sent
- [ ] Monitoring dashboards open
- [ ] Support team standing by
- [ ] Team ready for issues

### Day 1 Post-Launch
- [ ] Monitor crash reports
- [ ] Check app store reviews
- [ ] Review analytics
- [ ] Address critical issues
- [ ] Gather initial feedback
- [ ] Celebrate launch! 🎉

---

## Conclusion

This checklist ensures a smooth, successful deployment of the OSCAR Fashion mobile app. Follow each step carefully, test thoroughly, and monitor closely after launch.

**Remember**: It's normal to find issues post-launch. Have your rollback plan ready and stay responsive to user feedback.

**Good luck with your launch!** 🚀

