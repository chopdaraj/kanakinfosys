import React, { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export default function OtpVerification() {
  const { user, logout, refreshUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/verify-email-otp", {
        email: user.email,
        otp: otp.trim()
      });
      toast.success("Email verified successfully! Unlocking dashboard...");
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Verification failed. Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/send-email-otp", {
        email: user.email
      });
      toast.success("A new verification code has been generated. Check server logs!");
    } catch (err) {
      toast.error("Failed to resend verification OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background radial highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-700/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-700/10 rounded-full blur-3xl" />

      <div className="glass-card max-w-md w-full rounded-3xl p-8 border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl relative z-10 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto text-3xl">✉️</div>
        
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-400 mt-2">
            We have sent a 6-digit verification code to <span className="text-white font-semibold">{user?.email}</span>. 
            Enter it below to unlock dashboard access.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="0 0 0 0 0 0"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-center text-xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
          />

          <p className="text-[10px] text-slate-500">
            Hint: In development, the OTP is printed directly in the server console log.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying OTP...
              </>
            ) : (
              "Confirm & Verify"
            )}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs pt-4 border-t border-white/5">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-50"
          >
            {resending ? "Sending code..." : "Resend OTP Code"}
          </button>
          
          <button
            onClick={logout}
            className="text-rose-400 hover:text-rose-300 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
