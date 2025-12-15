import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { Provider as ReduxProvider } from 'react-redux';
import { useEffect } from 'react';
import { apolloClient } from './lib/apollo-client';
import { store } from './store/store';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AuthInitializer } from './components/auth/AuthInitializer';
import { Login } from './pages/Login';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { Dashboard } from './pages/DashboardWithPermissions';
import { ProductList } from './pages/products/ProductList';
import { ProductView } from './pages/products/ProductView';
import { ProductEdit } from './pages/products/ProductEdit';
import { ProductCreate } from './pages/products/ProductCreate';
import { OrderList } from './pages/orders/OrderList';
import { OrderDetail } from './pages/orders/OrderDetail';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { CategoryList } from './pages/categories/CategoryList';
import { CategoryDetail } from './pages/categories/CategoryDetail';
import { AdminProfile } from './pages/profile/AdminProfile';
import { Settings } from './pages/settings/Settings';
import { Reports } from './pages/reports/Reports';
import { BulkOperations } from './pages/products/BulkOperations';
import { UserList, UserDetail, UserForm, RoleList, RoleForm } from './pages/users';
import { PromotionList, PromotionForm } from './pages/promotions';

// Component to initialize theme from localStorage
const ThemeInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('oscar-theme') || 'actuelle';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return <>{children}</>;
};

function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeInitializer>
        <ApolloProvider client={apolloClient}>
          <AuthInitializer>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />

                  {/* Products */}
                  <Route path="products">
                    <Route index element={<ProductList />} />
                    <Route path="new" element={<ProductCreate />} />
                    <Route path="bulk" element={<BulkOperations />} />
                    <Route path=":id" element={<ProductView />} />
                    <Route path=":id/edit" element={<ProductEdit />} />
                  </Route>

                  {/* Orders */}
                  <Route path="orders">
                    <Route index element={<OrderList />} />
                    <Route path=":id" element={<OrderDetail />} />
                  </Route>

                  {/* Customers */}
                  <Route path="customers">
                    <Route index element={<CustomerList />} />
                    <Route path=":id" element={<CustomerDetail />} />
                  </Route>

                  {/* Categories */}
                  <Route path="categories">
                    <Route index element={<CategoryList />} />
                    <Route path="new" element={<CategoryDetail />} />
                    <Route path=":id" element={<CategoryDetail />} />
                  </Route>

                  {/* Promotions */}
                  <Route path="promotions">
                    <Route index element={<PromotionList />} />
                    <Route path="new" element={<PromotionForm />} />
                    <Route path=":id" element={<PromotionForm />} />
                  </Route>

                  {/* Users (Administrators) */}
                  <Route path="users">
                    <Route index element={<UserList />} />
                    <Route path="new" element={<UserForm />} />
                    <Route path=":id" element={<UserDetail />} />
                    <Route path=":id/edit" element={<UserForm />} />
                    <Route path="roles" element={<RoleList />} />
                    <Route path="roles/new" element={<RoleForm />} />
                    <Route path="roles/:id/edit" element={<RoleForm />} />
                  </Route>

                  {/* Profile */}
                  <Route path="profile" element={<AdminProfile />} />

                  {/* Settings */}
                  <Route path="settings" element={<Settings />} />

                  {/* Reports */}
                  <Route path="reports" element={<Reports />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthInitializer>
        </ApolloProvider>
      </ThemeInitializer>
    </ReduxProvider>
  );
}

export default App;
