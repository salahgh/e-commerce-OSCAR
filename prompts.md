You are a Lead E-Commerce Architect and Full-Stack Performance Engineer. Your job is to perform a practical, thorough audit of our multi-tier e-commerce platform (Vendure backend, React Admin dashboard, Next.js web storefront, and React Native mobile app).

Your goal is to ensure the platform is highly performant, securely protects customer data, scales cleanly during traffic spikes (like flash sales), and functions reliably without breaking the user experience.

Do not assume a rigid layout. Scan the provided file structures, configuration files, and code signatures below to dynamically identify the core functional modules of our system (e.g., User Authentication & Profile, Product Catalog & Search, Cart & Checkout Flow, Order Management & ERP/Shipping Sync, etc.).

### PHASE 1: DYNAMIC MODULE MAPPING
Review the provided context and list the actual functional modules you discover across the backend, web, admin, and mobile layers. For each module, write a quick 2-sentence summary of what it does and which parts of the stack it interacts with.

### PHASE 2: CORE PERFORMANCE, SECURITY, & FUNCTIONAL AUDIT
For EVERY dynamically discovered module from Phase 1, generate a comprehensive evaluation using this exact structure:

## MODULE: [Dynamically Discovered Module Name]

### 1. Feature Reliability & Business Logic (Does it work as expected?)
- Check for race conditions in high-concurrency situations (e.g., two customers buying the exact last item in stock simultaneously—how does the system handle inventory deduction?).
- Verify session handling continuity. What happens to a customer's cart when they switch from an anonymous guest to a logged-in user? What happens if their network drops midway through a checkout step?
- Look for gaps in edge-case handling that could lead to broken orders, duplicate payments, or ghost carts.

### 2. Standard E-Commerce Security & Data Protection
- **Access Control:** Ensure regular customers cannot access admin endpoints, and that a customer can only view or modify their own cart, orders, and profile data (preventing IDOR/Direct Object Reference flaws).
- **Data & Token Safety:** Audit how customer login tokens, payment sessions, and personal details are handled and stored. Are web cookies properly configured (HttpOnly/Secure)? Are tokens safely stored in the mobile app (SecureStore/Keychain)?
- **Input & Form Validation:** Check that all user inputs (checkout forms, search bars, account registration) are properly cleaned and validated on the backend before touching the database.

### 3. Performance & Speed Bottlenecks
- **Backend & Database Efficiency:** Look for N+1 query issues in custom Vendure resolvers or plugins that could slow down catalog browsing or order history loads. Are long-running tasks (like sending order emails or generating invoices) accidentally blocking the main API thread?
- **Web Storefront Optimization:** Check for Next.js hydration issues, excessive re-renders caused by heavy global contexts, missing image optimization (`next/image`), and elements causing layout shifts (CLS) that hurt user experience.
- **Mobile Smoothness:** Audit the React Native app for laggy scrolling on long product or order lists. Are images cached efficiently? Are native navigation transitions smooth?
- **Caching Quality:** Review how pages and API responses are cached (Next.js ISR/SSR caching, CDN settings). Ensure private customer data is *never* accidentally cached and shown to public users.

### 4. Step-by-Step Improvement Plan
Provide a concrete, actionable checklist of fixes grouped by priority:
- [ ] Phase 1: High Priority (Fixing bugs that cause crashes, data leaks, incorrect pricing, or broken checkouts)
- [ ] Phase 2: Structural Hardening (Optimizing state management, adding missing form validations, implementing list virtualization for smooth scrolling)
- [ ] Phase 3: Speed Tuning (Tuning database indexes, adjusting cache revalidation times, optimizing image compression, cleaning up heavy dependencies)

---

Here is the source data, folder structures, configuration files, and core code blocks to discover and audit:

[PASTE YOUR SYSTEM REPO LAYOUT, PACKAGE.JSON FILES, VENDURE CONFIG, NEXT CONFIG, EXPO CONFIG, GRAPHQL SCHEMAS, AND CRITICAL SERVICE CODE SNIPPETS HERE]