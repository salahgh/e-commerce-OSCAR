# Authentication Guide — OSCAR Fashion

## Overview

OSCAR uses Vendure's native **email/password authentication** strategy. This document covers the current implementation, email verification setup, password reset flow, and a roadmap for future OTP/SMS verification.

---

## 1. Current Auth Flow (Email/Password)

### Registration
1. User fills: name, email, phone (optional), password
2. App calls `registerCustomerAccount(input)` Vendure mutation
3. If `requireVerification: false` (current dev setting): account is active immediately
4. If `requireVerification: true` (production): Vendure sends verification email
5. App auto-logs in the user after successful registration

### Login
1. User enters email + password
2. App calls `login(username, password, rememberMe)` mutation
3. Vendure returns `CurrentUser` or error (`InvalidCredentialsError`, `NotVerifiedError`)
4. On success, session token is stored (SecureStore on mobile, cookies on frontend)

### Password Reset
1. User requests reset: `requestPasswordReset(emailAddress)` mutation
2. Vendure sends email with reset token link
3. User clicks link → opens reset page with token in URL
4. User sets new password: `resetPassword(token, password)` mutation

---

## 2. Backend Configuration

**File:** `apps/backend/src/vendure-config.ts`

### Auth Options (line 72-84)
```typescript
authOptions: {
  tokenMethod: ['bearer', 'cookie'],
  superadminCredentials: {
    identifier: process.env.SUPERADMIN_USERNAME || 'superadmin',
    password: process.env.SUPERADMIN_PASSWORD || 'superadmin123',
  },
  cookieOptions: {
    secret: process.env.COOKIE_SECRET || 'oscar-cookie-secret',
  },
  requireVerification: false, // Set to true in production
},
```

### Email Plugin (line 149-161)
```typescript
EmailPlugin.init({
  devMode: true,                    // In dev: writes emails to disk instead of sending
  outputPath: path.join(__dirname, '../static/email/test-emails'),
  route: 'mailbox',                 // Dev mailbox at /mailbox
  handlers: defaultEmailHandlers,   // Handles: verification, password-reset, order-confirmation
  templatePath: path.join(__dirname, '../static/email/templates'),
  globalTemplateVars: {
    fromAddress: '"OSCAR Fashion" <noreply@oscarfashion.dz>',
    verifyEmailAddressUrl: 'http://localhost:3000/verify',
    passwordResetUrl: 'http://localhost:3000/password-reset',
    changeEmailAddressUrl: 'http://localhost:3000/verify-email-address-change',
  },
}),
```

---

## 3. Enabling Email Verification (Production)

### Step 1: Set `requireVerification: true`
```typescript
// apps/backend/src/vendure-config.ts
authOptions: {
  requireVerification: true,
}
```

### Step 2: Configure SMTP (replace `devMode: true`)
```typescript
EmailPlugin.init({
  devMode: false,
  transport: {
    type: 'smtp',
    host: process.env.SMTP_HOST,       // e.g., 'smtp.gmail.com'
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  handlers: defaultEmailHandlers,
  templatePath: path.join(__dirname, '../static/email/templates'),
  globalTemplateVars: {
    fromAddress: '"OSCAR Fashion" <noreply@oscarfashion.dz>',
    verifyEmailAddressUrl: 'https://oscarfashion.com/verify',
    passwordResetUrl: 'https://oscarfashion.com/password-reset',
    changeEmailAddressUrl: 'https://oscarfashion.com/verify-email-address-change',
  },
}),
```

### Step 3: Add SMTP env vars to `.env`
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Step 4: Email Verification Flow
1. User registers → Vendure sends email with link: `https://oscarfashion.com/verify?token=xxx`
2. Frontend `verify-email` page reads token from URL query params
3. Calls `verifyCustomerAccount(token)` mutation
4. On success → redirects to login

### Email Templates
Located at `apps/backend/static/email/templates/`:
- `email-verification/body.hbs` — verification email
- `password-reset/body.hbs` — password reset email
- `order-confirmation/body.hbs` — order confirmation
- `partials/header.hbs` + `partials/footer.hbs` — shared layout

### Dev Mode: Testing Emails
When `devMode: true`, emails are written to `static/email/test-emails/` as HTML files. View them in your browser. Also accessible at `http://localhost:8085/mailbox`.

---

## 4. Frontend Auth Pages

| Page | Path | Purpose |
|------|------|---------|
| Login | `/[locale]/(auth)/login` | Email/password login |
| Register | `/[locale]/(auth)/register` | Create account (supports phone-to-email format) |
| Verify Email | `/[locale]/(auth)/verify-email?token=xxx` | Handles verification token from email link |
| Forgot Password | `/[locale]/(auth)/forgot-password` | Request password reset email |
| Reset Password | `/[locale]/(auth)/reset-password?token=xxx` | Set new password with token |

**Auth Context:** `apps/frontend/src/contexts/AuthContext.tsx`
- `login(email, password, rememberMe)` → calls `ShopLogin` mutation
- `register(data)` → calls `ShopRegister` mutation
- `verifyEmail(token)` → calls `VerifyCustomerAccount` mutation
- `requestPasswordReset(email)` → calls `RequestPasswordReset` mutation
- `resetPassword(token, password)` → calls `ResetPassword` mutation

---

## 5. Mobile Auth Screens

| Screen | File | Purpose |
|--------|------|---------|
| Login | `app/(auth)/login.tsx` | Email/password login, forgot password link |
| Register | `app/(auth)/register.tsx` | Name, email, phone, password → register + auto-login |
| Forgot Password | `app/(auth)/forgot-password.tsx` | Request reset email |
| Register Success | `app/(auth)/register-success.tsx` | Animated success screen |
| Verify Phone | `app/(auth)/verify-phone.tsx` | OTP input (reserved for future) |

**Auth Context:** `apps/mobile/src/contexts/AuthContext.tsx`
- Same mutations as frontend
- Token stored in `expo-secure-store` (native) / `localStorage` (web)
- User data cached in `AsyncStorage`

---

## 6. GraphQL Auth Mutations

```graphql
# Login
mutation ShopLogin($username: String!, $password: String!, $rememberMe: Boolean) {
  login(username: $username, password: $password, rememberMe: $rememberMe) {
    ... on CurrentUser { id }
    ... on InvalidCredentialsError { errorCode message }
    ... on NotVerifiedError { errorCode message }
  }
}

# Register
mutation ShopRegister($input: RegisterCustomerInput!) {
  registerCustomerAccount(input: $input) {
    ... on Success { success }
    ... on MissingPasswordError { errorCode message }
    ... on PasswordValidationError { errorCode message }
  }
}

# Verify Email
mutation VerifyCustomerAccount($token: String!) {
  verifyCustomerAccount(token: $token) {
    ... on CurrentUser { id }
    ... on VerificationTokenInvalidError { errorCode message }
    ... on VerificationTokenExpiredError { errorCode message }
  }
}

# Request Password Reset
mutation RequestPasswordReset($emailAddress: String!) {
  requestPasswordReset(emailAddress: $emailAddress) {
    ... on Success { success }
    ... on NativeAuthStrategyError { errorCode message }
  }
}

# Reset Password
mutation ResetPassword($token: String!, $password: String!) {
  resetPassword(token: $token, password: $password) {
    ... on CurrentUser { id }
    ... on PasswordResetTokenInvalidError { errorCode message }
    ... on PasswordResetTokenExpiredError { errorCode message }
  }
}
```

---

## 7. OTP/SMS Verification — Future Implementation

Vendure does not have built-in OTP support. This requires a custom plugin.

### Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Mobile App  │────▶│  Vendure Plugin   │────▶│ SMS Provider│
│              │     │  (OTP Service)    │     │ (Twilio/..) │
│ verify-phone │◀────│  sendOtp()        │◀────│             │
│   screen     │     │  verifyOtp()      │     │             │
└─────────────┘     └──────────────────┘     └─────────────┘
```

### Custom Plugin Design

**New entity: `OtpVerification`**
```typescript
@Entity()
class OtpVerification {
  @Column() phoneNumber: string;
  @Column() code: string;        // 6-digit code
  @Column() expiresAt: Date;     // 5-minute expiry
  @Column() attempts: number;    // Max 3 attempts
  @Column() verified: boolean;
  @ManyToOne(() => Customer) customer: Customer;
}
```

**GraphQL mutations:**
```graphql
extend type Mutation {
  sendOtp(phoneNumber: String!): OtpResult!
  verifyOtp(phoneNumber: String!, code: String!): OtpVerifyResult!
}
```

**Service logic:**
1. `sendOtp`: Generate 6-digit code → store in DB with 5min expiry → send via SMS API
2. `verifyOtp`: Check code + expiry + attempts → mark phone as verified on Customer

### Custom Field Addition
```typescript
// Add to vendure-config.ts customFields
Customer: [
  { name: 'phoneNumber', type: 'string' },
  { name: 'phoneVerified', type: 'boolean', defaultValue: false },
]
```

---

## 8. Algerian SMS Providers — Comparison

### International Providers

| Provider | Price per SMS (Algeria) | API | Notes |
|----------|------------------------|-----|-------|
| **Twilio** | ~$0.26 (≈35 DZD) | REST + SDKs | Most popular, excellent docs, reliable delivery |
| **Plivo** | ~$0.15-0.20 (≈20-27 DZD) | REST + SDKs | Cheaper than Twilio, good for volume |
| **Vonage (Nexmo)** | ~$0.18 (≈24 DZD) | REST + SDKs | Good delivery rates in North Africa |
| **Unimatrix** | ~$0.10-0.15 (≈14-20 DZD) | REST | Budget option, dedicated Algeria SMS |
| **SendSMSGate** | ~$0.08-0.12 (≈11-16 DZD) | REST | Cheapest, specifically targets Algeria |

### Local Algerian Operators

| Operator | Market Share | API Available | Notes |
|----------|-------------|---------------|-------|
| **Djezzy** (Optimum Telecom) | ~33% | Yes (B2B) | Requires business contract |
| **Ooredoo** Algeria | ~32% | Yes (B2B) | Bulk SMS platform available |
| **ATM Mobilis** | ~35% | Yes (B2B) | Government-owned, widest coverage |

**Local operator advantages:** Cheapest rates (~2-5 DZD/SMS), best delivery rates, local support. **Disadvantages:** Require Algerian business registration, longer setup time, less developer-friendly APIs.

### Cost Estimation

For 1,000 registrations/month:
| Provider | Cost/month |
|----------|-----------|
| Twilio | ~$260 (≈35,000 DZD) |
| Plivo | ~$180 (≈24,000 DZD) |
| SendSMSGate | ~$100 (≈13,500 DZD) |
| Local operator | ~$15-37 (≈2,000-5,000 DZD) |

---

## 9. OTP Prerequisites

### Technical
- [ ] SMS provider account + API keys
- [ ] Sender ID registration (required in Algeria — apply through provider)
- [ ] Backend: Custom Vendure plugin with OTP entity and service
- [ ] Database migration for OTP table + Customer phone fields
- [ ] Rate limiting: max 3 OTP requests per phone per hour
- [ ] Code expiry: 5 minutes

### Business/Legal
- [ ] Algerian business registration (for local operators)
- [ ] Sender ID approval (ARPCE — Algeria's telecom regulator)
- [ ] Privacy policy update (phone number collection + SMS sending)
- [ ] Terms of service update

### Recommended Setup
1. **Development:** Use Twilio (instant setup, test numbers available)
2. **Production:** Migrate to local operator (Djezzy/Ooredoo/Mobilis) for cost savings
3. **Fallback:** Keep Twilio as backup for delivery failures

---

## 10. OTP Implementation Roadmap

### Phase 1: Backend Plugin (2-3 days)
- Create `OtpPlugin` with entity, service, resolvers
- Integrate Twilio SDK for dev/test
- Add `phoneNumber` + `phoneVerified` Customer custom fields
- Test with Twilio test numbers

### Phase 2: Mobile Integration (1-2 days)
- Wire `verify-phone.tsx` screen to real API calls
- Add OTP step after registration
- Handle resend, expiry, max attempts

### Phase 3: Production SMS (1-2 days)
- Register Sender ID with Algerian operator
- Configure production SMS transport
- Add monitoring and delivery tracking

### Phase 4: Frontend Integration (1 day)
- Add phone verification to frontend register flow
- Update verify-email page to also handle phone verification

**Total estimated effort: 5-8 days**

---

## Sources

- [Twilio SMS Pricing — Algeria](https://www.twilio.com/en-us/sms/pricing/dz)
- [Plivo SMS Pricing — Algeria](https://www.plivo.com/sms/pricing/dz/)
- [Algeria SMS Pricing Comparison 2025](https://www.sent.dm/resources/algeria-sms-pricing)
- [SendSMSGate — Algeria Gateway](https://sendsmsgate.com/en/sms-gateway/dz/algeria/)
- [Unimatrix Algeria SMS](https://www.unimtx.com/sms/dz)
- [Vendure Auth Documentation](https://docs.vendure.io/guides/core-concepts/auth/)
