# OSCAR Back-Office

Back-office admin panel for OSCAR Fashion e-commerce platform built with React, TypeScript, Tailwind CSS, and GraphQL.

## 🚀 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.x
- **Data Management**: Apollo Client + GraphQL Code Generation
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Forms**: Formik + Yup
- **Charts**: MUI X Charts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend GraphQL API running on http://localhost:8080/graphql

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create .env.local file:
```
VITE_GRAPHQL_URL=http://localhost:8080/graphql
VITE_API_URL=http://localhost:8080
```

### GraphQL Code Generation

Generate TypeScript types from GraphQL schema:
```bash
npm run codegen
```

## 🔐 Authentication

**Default credentials for testing:**
- Email: admin@oscarfashion.dz
- Password: password123

## 📊 Features

### Implemented

✅ Dashboard with analytics and charts (MUI X Charts)
✅ Product management (list view)
✅ Order management (list view)
✅ Category management (list view)
✅ User management (list view)
✅ Reports page
✅ Settings page
✅ Authentication with protected routes
✅ Responsive sidebar navigation
✅ Toast notifications
✅ Loading states and error handling
✅ Reusable UI component library
✅ Redux state management
✅ Apollo Client setup for GraphQL

## 📝 License

© 2025 OSCAR Fashion. All rights reserved.
