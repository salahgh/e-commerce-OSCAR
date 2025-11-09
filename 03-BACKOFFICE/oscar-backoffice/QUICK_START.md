# OSCAR Back-Office - Quick Start Guide

## 🚀 Installation & Setup

1. **Install dependencies**
   ```bash
   cd 03-BACKOFFICE/oscar-backoffice
   npm install
   ```

2. **Configure environment**
   - Edit `.env.local` if needed
   - Default GraphQL endpoint: `http://localhost:8080/graphql`

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## 🔐 Login Credentials

```
Email: admin@oscarfashion.dz
Password: password123
```

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Sidebar, TopBar, MainLayout
│   └── [feature]/    # Feature-specific components
├── pages/            # Page components with routing
├── store/            # Redux state management
├── lib/              # Apollo Client, utilities
├── graphql/          # GraphQL queries/mutations
└── types/            # TypeScript definitions
```

## 🎨 Available Pages

- **Dashboard** - Analytics with MUI X Charts
- **Products** - Product management
- **Categories** - Category management
- **Orders** - Order management
- **Users** - User management
- **Reports** - Reports & analytics
- **Settings** - Application settings

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run format           # Format code with Prettier
npm run codegen          # Generate GraphQL types

# Type Checking
tsc -b                   # Run TypeScript compiler
```

## 🔗 Integration Checklist

### 1. GraphQL Backend
- [ ] Ensure backend is running at `http://localhost:8080/graphql`
- [ ] Test GraphQL Playground is accessible
- [ ] Verify authentication endpoints are working

### 2. Add Real Queries/Mutations
- [ ] Create GraphQL query files in `src/graphql/queries/`
- [ ] Create GraphQL mutation files in `src/graphql/mutations/`
- [ ] Run `npm run codegen` to generate types
- [ ] Replace mock data with real API calls

### 3. Implement CRUD Operations
- [ ] Product Create/Edit/Delete forms
- [ ] Category Create/Edit/Delete forms
- [ ] Order status updates
- [ ] User management operations

### 4. Add Features
- [ ] Image upload functionality
- [ ] Advanced search and filters
- [ ] Pagination components
- [ ] Real-time notifications
- [ ] PDF invoice generation (backend integration)

## 📱 Responsive Testing

Test the back-office on different screen sizes:
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

## 🎨 UI Customization

All UI components use Tailwind CSS. Customize in:
- `tailwind.config.js` - Theme colors, fonts, etc.
- `src/components/ui/` - Individual components

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <pid> /F
```

### GraphQL connection errors
- Check backend is running
- Verify VITE_GRAPHQL_URL in .env.local
- Check CORS settings on backend

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. Connect to real GraphQL backend
2. Implement actual queries and mutations
3. Add form validation for all CRUD operations
4. Implement file upload for product images
5. Add pagination to all list views
6. Integrate with backend authentication
7. Apply final Figma designs when available

## 🆘 Support

For issues or questions, refer to:
- Main project documentation
- Backend GraphQL schema documentation
- React Router v6 docs: https://reactrouter.com
- Tailwind CSS docs: https://tailwindcss.com
- Apollo Client docs: https://apollographql.com

---

**Happy coding! 🎉**
