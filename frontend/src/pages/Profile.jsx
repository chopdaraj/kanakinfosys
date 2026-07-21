import React, { useEffect, useState } from "react";
import ClientLayout from "@/components/ClientLayout";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Upload, Camera, ShieldCheck, ShieldAlert, KeyRound, Building2, UserCircle2, Landmark, CheckCircle, Trash2 } from "lucide-react";
import KycWizard from "@/components/KycWizard";
import { useModal } from "@/context/ModalContext";


const Field = ({ label, value, onChange, testId, placeholder, ...rest }) => (
  <div>
    <label className="text-xs font-semibold text-slate-500 block mb-1.5">{label}</label>
    <input
      value={value}
      onChange={onChange}
      data-testid={testId}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium placeholder:text-slate-300"
      {...rest}
    />
  </div>
);

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DocUpload = ({ label, value, onFile, testId }) => (
  <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
    <div>
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">{label}</span>
      <div className="h-32 border border-slate-200/60 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center relative">
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400 font-medium">No Image Uploaded</span>
        )}
      </div>
    </div>
    <label className="mt-3 w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
      <Upload className="w-3.5 h-3.5" /> Upload File
      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        data-testid={testId}
        className="hidden"
      />
    </label>
  </div>
);

export default function Profile() {
  const modal = useModal();
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    address_line1: "",
    address_line2: "",
    email: "",
    phone: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc: "",
    branch_name: "",
    nominee: "",
    profile_photo: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        address_line1: user.address_line1 || "",
        address_line2: user.address_line2 || "",
        email: user.email || "",
        phone: user.phone || "",
        bank_name: user.bank_name || "",
        account_holder: user.account_holder || "",
        account_number: user.account_number || "",
        ifsc: user.ifsc || "",
        branch_name: user.branch_name || "",
        nominee: user.nominee || "",
        profile_photo: user.profile_photo || "",
      });
    }
  }, [user]);

  const handleInputChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFileChange = (k) => async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be under 2 MB");
      return;
    }
    try {
      const b64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, [k]: b64 }));
      toast.success(`${labelFromKey(k)} preloaded. Submit form to save.`);
    } catch (err) {
      toast.error("Error reading file");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }

    // Size validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be under 2 MB");
      return;
    }

    try {
      const b64 = await fileToBase64(file);
      // Immediately submit to database
      await api.put("/users/profile", {
        ...form,
        profile_photo: b64,
      });
      setForm((prev) => ({ ...prev, profile_photo: b64 }));
      await refreshUser();
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update profile photo");
    }
  };

  const handleDeleteAvatar = async () => {
    const yes = await modal.confirm(
      "Are you sure you want to remove your profile photo?",
      "Remove Photo",
      "delete",
      { confirmLabel: "Remove", cancelLabel: "Cancel" }
    );
    if (!yes) return;
    try {
      await api.put("/users/profile", {
        ...form,
        profile_photo: "",
      });
      setForm((prev) => ({ ...prev, profile_photo: "" }));
      await refreshUser();
      toast.success("Profile photo removed successfully!");
    } catch (err) {
      toast.error("Failed to remove profile photo");
    }
  };

  const labelFromKey = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/users/profile", form);
      await refreshUser();
      toast.success("Profile details saved successfully!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }
    setChangingPassword(true);
    try {
      // Secure password change endpoint
      await api.put("/users/change-password", {
        new_password: passwordForm.new_password
      });
      toast.success("Password changed successfully!");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-8" data-testid="profile-page">
        {/* Header */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">User Identity settings</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">Profile & KYC</h1>
          <p className="text-slate-500 text-sm mt-1">
            Maintain verified records for secure compliance and direct payouts.
          </p>
        </div>

        {/* KYC Alert Header */}
        {user?.kyc_status !== "verified" ? (
          <div className="p-4 bg-amber-50 border border-amber-200/40 rounded-2xl flex items-start gap-3.5 text-amber-800">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-amber-900">KYC Status: Pending Verification.</span> Please upload clear visual scans of Aadhaar front/back and PAN front/back. Deposits will be unlocked once an administrator manually audits and approves your identity documentation.
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200/40 rounded-2xl flex items-start gap-3.5 text-emerald-800">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-emerald-900">KYC Verified: Account Fully Operational.</span> Your identity verification is complete. You can create capital deposits and request fund withdrawals.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity & Policy Card */}
          <div className="space-y-6">
            {/* Profile Avatar Card */}
            <div className="kanak-card p-6 flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-md flex items-center justify-center">
                  {form.profile_photo ? (
                    <img src={form.profile_photo} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-700 text-2xl uppercase">
                      {user?.name?.slice(0, 2) || "U"}
                    </div>
                  )}
                </div>
                {form.profile_photo && (
                  <button
                    onClick={handleDeleteAvatar}
                    type="button"
                    className="absolute bottom-0 left-0 p-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-md active:scale-95 animate-fade-in"
                    title="Remove Profile Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-blue-700 text-white rounded-full cursor-pointer hover:bg-blue-800 transition-colors shadow-md active:scale-95">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>

              <h3 className="text-base font-bold text-slate-800 mt-4">{user?.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50 text-left text-xs">
                <div>
                  <span className="text-slate-400 block">Referral ID:</span>
                  <span className="font-mono font-bold text-slate-800">{user?.referral_code}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">System Role:</span>
                  <span className="font-bold text-blue-700 uppercase tracking-wider">{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Password Change Card */}
            <div className="kanak-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">Security Credentials</h3>
              </div>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Field
                  label="New Password"
                  type="password"
                  required
                  placeholder="At least 6 chars"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                />
                <Field
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                />
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/60 rounded-xl text-xs font-semibold transition-all"
                >
                  {changingPassword ? "Updating..." : "Change Account Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Profile Form Details */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="kanak-card p-6 md:p-8 space-y-8 animate-fade-in-up" data-testid="profile-form">
              {/* Personal Details */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
                  <UserCircle2 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-800">Contact & Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Address Line 1"
                    placeholder="Apartment, building unit, street address"
                    value={form.address_line1}
                    onChange={handleInputChange("address_line1")}
                    testId="profile-address1"
                  />
                  <Field
                    label="Address Line 2"
                    placeholder="City, State, PIN code"
                    value={form.address_line2}
                    onChange={handleInputChange("address_line2")}
                    testId="profile-address2"
                  />
                  <Field
                    label="Email Address"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={handleInputChange("email")}
                    testId="profile-email"
                  />
                  <Field
                    label="Mobile Number"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={handleInputChange("phone")}
                    testId="profile-phone"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
                  <Landmark className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-800">Payout Bank Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Bank Name"
                    placeholder="SBI / HDFC / ICICI Bank"
                    value={form.bank_name}
                    onChange={handleInputChange("bank_name")}
                    testId="profile-bank"
                  />
                  <Field
                    label="Account Holder Name"
                    placeholder="Must match bank record"
                    value={form.account_holder}
                    onChange={handleInputChange("account_holder")}
                    testId="profile-holder"
                  />
                  <Field
                    label="Account Number"
                    placeholder="XXXXXXXXXXXX"
                    value={form.account_number}
                    onChange={handleInputChange("account_number")}
                    testId="profile-acct"
                  />
                  <Field
                    label="Bank IFSC Code (Required)"
                    placeholder="SBIN0001234"
                    value={form.ifsc}
                    onChange={handleInputChange("ifsc")}
                    testId="profile-ifsc"
                    required
                  />
                  <Field
                    label="Bank Branch Name"
                    placeholder="Downtown Branch"
                    value={form.branch_name}
                    onChange={handleInputChange("branch_name")}
                  />
                  <Field
                    label="Nominee Full Name (Optional)"
                    placeholder="Family member name"
                    value={form.nominee}
                    onChange={handleInputChange("nominee")}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10"
                  data-testid="profile-save-button"
                >
                  {saving ? "Saving Changes..." : "Save Bank & Address Details"}
                </button>
              </div>
            </form>

            {/* KYC Verification Wizard Block */}
            <div className="mt-8">
              {(!user?.kyc_status || user.kyc_status === "not_started" || user.kyc_status === "rejected") && (
                <KycWizard onComplete={refreshUser} />
              )}
              
              {user?.kyc_status === "pending" && (
                <div className="kanak-card p-6 md:p-8 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-3xl">⏳</div>
                  <h3 className="text-xl font-bold text-slate-800">KYC Verification Under Review</h3>
                  <p className="text-slate-500 text-xs max-w-md mx-auto">
                    Your documents have been submitted and are currently being audited by our security team. 
                    Verification is typically completed within 24-48 business hours.
                  </p>
                  
                  <div className="border border-slate-100 rounded-xl bg-slate-50 p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">Submitted Details</div>
                    <div><span className="text-slate-500 font-bold">Name:</span> <span className="text-slate-800 font-semibold">{user.name}</span></div>
                    <div><span className="text-slate-500 font-bold">PAN Card:</span> <span className="text-slate-800 font-semibold uppercase">{user.pan_number || "—"}</span></div>
                    <div><span className="text-slate-500 font-bold">Aadhaar Card:</span> <span className="text-slate-800 font-semibold">{user.aadhaar_number || "—"}</span></div>
                  </div>
                </div>
              )}
              
              {user?.kyc_status === "verified" && (
                <div className="kanak-card p-6 md:p-8 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-3xl text-emerald-500 font-bold">✓</div>
                  <h3 className="text-xl font-bold text-slate-800">KYC Verification Approved</h3>
                  <p className="text-emerald-600 text-xs font-semibold">Your identity verification is fully verified and active.</p>
                  
                  <div className="border border-slate-100 rounded-xl bg-slate-50 p-4 max-w-sm mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-2">Verified Profile</div>
                    <div><span className="text-slate-500 font-bold">Name:</span> <span className="text-slate-800 font-semibold">{user.name}</span></div>
                    <div><span className="text-slate-500 font-bold">PAN Card:</span> <span className="text-slate-800 font-semibold uppercase">{user.pan_number || "—"}</span></div>
                    <div><span className="text-slate-500 font-bold">Aadhaar Card:</span> <span className="text-slate-800 font-semibold">{user.aadhaar_number || "—"}</span></div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
