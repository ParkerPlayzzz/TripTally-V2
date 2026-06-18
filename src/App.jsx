import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import { TransparencyProvider } from '@/lib/TransparencyContext';
import { FontSizeProvider } from '@/lib/FontSizeContext';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Planner from '@/pages/Planner';
import Budget from '@/pages/Budget';
import Analytics from '@/pages/Analytics';
import Trips from '@/pages/Trips';
import Settings from '@/pages/Settings';
import Wishlist from '@/pages/Wishlist';

function App() {
  return (
    <AuthProvider>
      <TransparencyProvider>
        <FontSizeProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/planner" element={<Planner />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/trips" element={<Trips />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                  </Route>
                </Route>
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </QueryClientProvider>
        </FontSizeProvider>
      </TransparencyProvider>
    </AuthProvider>
  )
}

export default App
