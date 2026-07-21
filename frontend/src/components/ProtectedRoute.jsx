import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import OtpVerification from "@/components/OtpVerification";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-500 text-sm tracking-wider uppercase">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  
  return children;
}

