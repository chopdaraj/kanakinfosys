import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider, useAuth } from "@/lib/auth";
import { ModalProvider } from "@/context/ModalContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy-loaded pages for bundle size optimization & code splitting
const Landing = React.lazy(() => import("@/pages/Landing"));
const Login = React.lazy(() => import("@/pages/Login"));
const Register = React.lazy(() => import("@/pages/Register"));
const ClientDashboard = React.lazy(() => import("@/pages/ClientDashboard"));
const Profile = React.lazy(() => import("@/pages/Profile"));
const Policy = React.lazy(() => import("@/pages/Policy"));
const Transactions = React.lazy(() => import("@/pages/Transactions"));
const ReferralDashboard = React.lazy(() => import("@/pages/ReferralDashboard"));
const AdminDashboard = React.lazy(() => import("@/pages/AdminDashboard"));
const AdminClients = React.lazy(() => import("@/pages/AdminClients"));
const AdminTree = React.lazy(() => import("@/pages/AdminTree"));
const AdminPending = React.lazy(() => import("@/pages/AdminPending"));
const AdminClientDetail = React.lazy(() => import("@/pages/AdminClientDetail"));
const AdminWithdrawals = React.lazy(() => import("@/pages/AdminWithdrawals"));
const AdminSettings = React.lazy(() => import("@/pages/AdminSettings"));
const AdminBroadcasts = React.lazy(() => import("@/pages/AdminBroadcasts"));

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Landing />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
}

export default function App() {
  // Global block to prevent any native popup dialog usage in third-party or legacy code
  React.useEffect(() => {
    window.alert = (msg) => {
      console.warn("Blocked window.alert call. Use useModal() context instead: ", msg);
    };
    window.confirm = (msg) => {
      console.warn("Blocked window.confirm call. Use useModal() context instead: ", msg);
      return false;
    };
    window.prompt = (msg) => {
      console.warn("Blocked window.prompt call. Use useModal() context instead: ", msg);
      return null;
    };
  }, []);

  return (
    <AuthProvider>
      <ModalProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <React.Suspense 
            fallback={
              <div className="flex items-center justify-center min-h-screen bg-slate-50 text-xs font-semibold text-slate-400">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
                  <span>Loading platform...</span>
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/referral"
                element={
                  <ProtectedRoute>
                    <ReferralDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policy"
                element={
                  <ProtectedRoute>
                    <Policy />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminClients />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tree"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminTree />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/pending"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPending />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/clients/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminClientDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/withdrawals"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminWithdrawals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/broadcasts"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBroadcasts />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </ModalProvider>
    </AuthProvider>
  );
}

