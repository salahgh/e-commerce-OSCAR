import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { Provider as ReduxProvider } from 'react-redux';
import { apolloClient } from './lib/apollo-client';
import { store } from './store/store';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';
import { ProductDetail } from './pages/products/ProductDetail';
import { OrderList } from './pages/orders/OrderList';
import { OrderDetail } from './pages/orders/OrderDetail';
import { CategoryList } from './pages/categories/CategoryList';
import { CategoryForm } from './pages/categories/CategoryForm';
import { UserList } from './pages/users/UserList';
import { Reports } from './pages/reports/Reports';
import { Settings } from './pages/settings/Settings';

function App() {
  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

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
                <Route path="new" element={<ProductForm />} />
                <Route path="edit/:id" element={<ProductForm />} />
                <Route path=":id" element={<ProductDetail />} />
              </Route>

              {/* Categories */}
              <Route path="categories">
                <Route index element={<CategoryList />} />
                <Route path="new" element={<CategoryForm />} />
                <Route path="edit/:id" element={<CategoryForm />} />
              </Route>

              {/* Orders */}
              <Route path="orders">
                <Route index element={<OrderList />} />
                <Route path=":id" element={<OrderDetail />} />
              </Route>

              {/* Users */}
              <Route path="users">
                <Route index element={<UserList />} />
              </Route>

              {/* Reports & Settings */}
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </ReduxProvider>
  );
}

export default App;
