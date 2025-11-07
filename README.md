# OSCAR Fashion E-commerce Platform
## Project Documentation - Version 2.0 (Updated Stack)

---

## 📁 Project Structure

```
e-commerce-OSCAR/
├── 01-BACKEND/                 # Spring Boot + GraphQL API
│   ├── SPECIFICATION.md        ✅ UPDATED - GraphQL + SPQR + iText
│   ├── CALENDAR.md             # 14-16 weeks timeline
│   └── BUDGET.md               # ~2.4M DZD
│
├── 02-FRONTEND/                # Next.js Web Application
│   ├── SPECIFICATION.md        ✅ UPDATED - Next.js + Tailwind + GraphQL
│   ├── CALENDAR.md             # 12-14 weeks timeline
│   └── BUDGET.md               # ~1.8M DZD
│
├── 03-BACKOFFICE/              # React Admin Panel
│   ├── SPECIFICATION.md        # React + Apollo + Tailwind + Redux
│   ├── CALENDAR.md             # 8 weeks timeline
│   └── BUDGET.md               # ~1.1M DZD
│
├── 04-MOBILE/                  # React Native (Expo) App
│   ├── SPECIFICATION.md        # Expo + GraphQL
│   ├── CALENDAR.md             # 9-10 weeks timeline
│   └── BUDGET.md               # ~1.4M DZD
│
├── MASTER-PROJECT-PLAN.md      # Consolidated project plan
├── TECHNICAL-CHANGES-SUMMARY.md ✅ NEW - All tech stack changes
└── README.md                   # This file
```

---

## 🚀 Technology Stack (Version 2.0)

### Backend
- **Framework**: Spring Boot 3.x (Java 17+)
- **API**: **GraphQL** with **SPQR library**
- **Database**: PostgreSQL
- **PDF Generation**: **iText 7** (instead of Jasper Reports)
- **Documentation**: GraphQL Playground + Voyager
- **No Redis** (DataLoader for caching)

### Frontend Web
- **Framework**: **Next.js 14+** (App Router)
- **Build**: Vite
- **Language**: TypeScript
- **UI**: **Tailwind CSS** (not Material-UI)
- **Data**: **GraphQL** with Apollo Client + Code Generation
- **Forms**: **Formik + Yup**
- **Dates**: date-fns
- **i18n**: next-intl
- **Icons**: Lucide Icons / Heroicons

### Back-Office
- **Framework**: React.js
- **UI**: **Tailwind CSS** (except MUI X Charts for analytics)
- **Data**: **GraphQL** with Apollo Client
- **State**: **Redux Toolkit**
- **Forms**: **Formik + Yup**
- **Charts**: MUI X Charts (kept)

### Mobile
- **Framework**: React Native with **Expo**
- **Data**: **GraphQL** with Apollo Client + Code Generation
- **No Firebase** (no push notifications for now)
- **No Offline Mode**

---

## 🔄 Major Changes from V1.0

### ✅ What Changed

| Component | V1.0 | V2.0 |
|-----------|------|------|
| Backend API | REST | **GraphQL (SPQR)** |
| Backend PDF | Jasper Reports | **iText 7** |
| Backend Cache | Redis | **Removed** |
| Frontend Framework | React (CRA) | **Next.js 14** |
| Frontend UI | Material-UI | **Tailwind CSS** |
| Frontend Data | REST + React Query | **GraphQL + Apollo** |
| Frontend Forms | React Hook Form | **Formik + Yup** |
| BackOffice UI | Material-UI | **Tailwind** (+ MUI Charts) |
| Mobile Setup | RN CLI | **Expo** |
| Mobile Offline | Yes | **No** (removed) |
| Mobile Push | Firebase | **Removed** |

### ❌ Removed (For Now)

- Testing (Jest, Cypress, Detox)
- ESLint (Prettier only)
- Git Hooks (Husky)
- CI/CD (local development)
- Storybook
- Redis cache
- Firebase (mobile)

---

## 📊 Project Overview

### Budget Total: **~6.7M DZD**

| Component | Duration | Hours | Estimated Cost |
|-----------|----------|-------|----------------|
| Backend | 14-16 weeks | 1,680-1,920h | ~2.4M DZD |
| Frontend | 12-14 weeks | 1,440-1,680h | ~1.8M DZD |
| Back-Office | 8 weeks | 960h | ~1.1M DZD |
| Mobile | 9-10 weeks | 1,080-1,200h | ~1.4M DZD |

### Timeline: **~26 weeks** (6.5 months)

### Team: **~12 professionals**
- Backend developers (Spring Boot + GraphQL)
- Frontend developers (Next.js + React)
- Mobile developers (React Native + Expo)
- UI/UX developer
- QA engineers
- DevOps engineer
- Architect/Tech Lead

---

## 🎯 Key Features

### E-commerce Core
✅ Product catalog with categories
✅ Advanced search & filtering
✅ Shopping cart
✅ Multi-step checkout
✅ Order management
✅ User authentication & profiles

### Payments
✅ CIB (Algerian bank cards)
✅ Baridimob (mobile payment)
✅ Cash on Delivery

### Multi-platform
✅ Web (Next.js - Desktop & Mobile responsive)
✅ iOS App (React Native Expo)
✅ Android App (React Native Expo)
✅ Admin Panel (React)

### Multi-language
✅ Arabic (with RTL support)
✅ French
✅ English

### Admin Features
✅ Dashboard with analytics (MUI X Charts)
✅ Product management (CRUD)
✅ Order management
✅ Customer management
✅ Reporting & statistics
✅ PDF invoice generation (iText)

### Integrations
✅ ERP/WMS synchronization
✅ Email notifications
✅ SMS notifications

---

## 🛠️ Development Setup

### Backend
```bash
cd 01-BACKEND
./mvnw spring-boot:run
# GraphQL Playground: http://localhost:8080/graphql
```

### Frontend
```bash
cd 02-FRONTEND
npm install
npm run codegen    # Generate GraphQL types
npm run dev       # http://localhost:3000
```

### Back-Office
```bash
cd 03-BACKOFFICE
npm install
npm run codegen    # Generate GraphQL types
npm run dev
```

### Mobile
```bash
cd 04-MOBILE
npm install
npm run codegen    # Generate GraphQL types
npx expo start
```

---

## 📖 Documentation

### Main Documents
1. **[MASTER-PROJECT-PLAN.md](MASTER-PROJECT-PLAN.md)** - Complete project overview
2. **[TECHNICAL-CHANGES-SUMMARY.md](TECHNICAL-CHANGES-SUMMARY.md)** - All tech stack changes

### Component Documentation
- **Backend**: [01-BACKEND/SPECIFICATION.md](01-BACKEND/SPECIFICATION.md)
- **Frontend**: [02-FRONTEND/SPECIFICATION.md](02-FRONTEND/SPECIFICATION.md)
- **Back-Office**: [03-BACKOFFICE/SPECIFICATION.md](03-BACKOFFICE/SPECIFICATION.md)
- **Mobile**: [04-MOBILE/SPECIFICATION.md](04-MOBILE/SPECIFICATION.md)

---

## 🔍 GraphQL Code Generation

All frontend components use GraphQL Code Generator for type-safe API calls.

**Workflow**:
1. Backend exposes GraphQL schema
2. Run `npm run codegen` in frontend projects
3. Auto-generated TypeScript types
4. Use typed queries/mutations

**Example**:
```typescript
// Auto-generated types
import { useQuery } from '@apollo/client';
import { GetProductsQuery, GetProductsQueryVariables } from './graphql/generated';

const { data } = useQuery<GetProductsQuery, GetProductsQueryVariables>(GET_PRODUCTS, {
  variables: { page: 1, size: 20 }
});
```

---

## 🎨 Design System

### Colors (Tailwind Config)
- **Primary**: #2C3E50 (Blue marine)
- **Secondary**: #E8D5C4 (Beige/cream)
- **Accent**: #C9A992 (Terracotta)

### Typography
- **Font**: Inter (web), System fonts (mobile)

### Components
- Built with **Tailwind CSS**
- Responsive design (mobile-first)
- RTL support for Arabic

---

## ⚙️ Environment Variables

### Backend
```
DATABASE_URL=
DATABASE_USERNAME=
DATABASE_PASSWORD=
JWT_SECRET=
CIB_MERCHANT_ID=
BARIDIMOB_MERCHANT_ID=
SMTP_HOST=
SMS_API_KEY=
```

### Frontend/Back-Office/Mobile
```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
```

---

## 📅 Project Phases

### Phase 1: Setup & Architecture (Weeks 1-4)
- Project initialization
- Database schema design
- GraphQL schema design
- UI/UX design finalization

### Phase 2: Backend Development (Weeks 5-16)
- GraphQL API with SPQR
- Authentication & users
- Products & catalog
- Orders & payments (CIB, Baridimob)
- Notifications
- PDF reports (iText)
- ERP synchronization

### Phase 3: Frontend Development (Weeks 5-16)
- Next.js setup with App Router
- GraphQL integration
- Product catalog with Tailwind UI
- Cart & checkout flow
- User authentication & profile
- Multi-language support (next-intl)

### Phase 4: Mobile Development (Weeks 7-16)
- Expo setup
- GraphQL integration
- Core shopping features
- Payment integration
- Notifications

### Phase 5: Back-Office (Weeks 9-16)
- Dashboard with MUI X Charts
- Product management
- Order management
- Customer management
- Reports & analytics

### Phase 6: Testing & Deployment (Weeks 17-26)
- Manual testing
- Bug fixes
- Performance optimization
- Production deployment
- Training

---

## 🚀 Deployment

### Backend
- Docker container
- PostgreSQL database
- Java 17+ runtime

### Frontend (Next.js)
- Vercel (recommended) or custom hosting
- SSR/SSG support

### Mobile
- iOS: App Store submission
- Android: Google Play submission
- Expo EAS Build

### Back-Office
- Static hosting or Vercel

---

## 📞 Support & Contact

For questions about the project:
- See [MASTER-PROJECT-PLAN.md](MASTER-PROJECT-PLAN.md)
- Check component-specific SPECIFICATION.md files
- Review [TECHNICAL-CHANGES-SUMMARY.md](TECHNICAL-CHANGES-SUMMARY.md) for tech details

---

## 📜 License

Proprietary - OSCAR Fashion
All rights reserved.

---

**Version**: 2.0 (Updated Technology Stack)
**Last Updated**: Novembre 2025
**Status**: Planning & Specification Phase
