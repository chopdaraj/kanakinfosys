import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function KycWizard({ onComplete }) {
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    dob: user?.dob || "",
    address_line1: user?.address_line1 || "",
    address_line2: user?.address_line2 || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    
    pan_number: user?.pan_number || "",
    pan_front: user?.pan_front || "",
    
    aadhaar_number: user?.aadhaar_number || "",
    aadhaar_front: user?.aadhaar_front || "",
    aadhaar_back: user?.aadhaar_back || "",
    
    selfie: user?.selfie || "",
    
    bank_name: user?.bank_name || "",
    account_holder: user?.account_holder || "",
    account_number: user?.account_number || "",
    confirm_account_number: user?.account_number || "",
    ifsc: user?.ifsc || "",
    branch_name: user?.branch_name || "",
    cancelled_cheque: user?.cancelled_cheque || "",
  });

  const steps = [
    { id: 1, name: "Personal Details", desc: "Basic identity information" },
    { id: 2, name: "PAN Card", desc: "Permanent Account Number verification" },
    { id: 3, name: "Aadhaar Card", desc: "National Identity card verification" },
    { id: 4, name: "Selfie Verification", desc: "Live photo verification" },
    { id: 5, name: "Bank Verification", desc: "Cancelled cheque & account proof" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
        toast.success(`${file.name} uploaded successfully`);
      };
    } catch (err) {
      toast.error("Failed to read file");
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return "Full Name is required";
      if (!formData.dob.trim()) return "Date of Birth is required";
      if (!formData.address_line1.trim()) return "Address is required";
      if (!formData.city.trim()) return "City is required";
      if (!formData.state.trim()) return "State is required";
      if (!formData.pincode.trim()) return "Pincode is required";
    }
    if (currentStep === 2) {
      if (!formData.pan_number.trim()) return "PAN Number is required";
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan_number.toUpperCase().trim())) {
        return "Invalid PAN card number format (e.g. ABCDE1234F)";
      }
      if (!formData.pan_front) return "PAN card photo is required";
    }
    if (currentStep === 3) {
      if (!formData.aadhaar_number.trim()) return "Aadhaar Number is required";
      if (formData.aadhaar_number.replace(/\s/g, "").length !== 12) {
        return "Aadhaar number must be exactly 12 digits";
      }
      if (!formData.aadhaar_front) return "Aadhaar Front photo is required";
      if (!formData.aadhaar_back) return "Aadhaar Back photo is required";
    }
    if (currentStep === 4) {
      if (!formData.selfie) return "Selfie photo is required";
    }
    if (currentStep === 5) {
      if (!formData.bank_name.trim()) return "Bank Name is required";
      if (!formData.account_holder.trim()) return "Account Holder Name is required";
      if (!formData.account_number.trim()) return "Account Number is required";
      if (formData.account_number.trim() !== formData.confirm_account_number.trim()) {
        return "Account Numbers do not match";
      }
      if (!formData.ifsc.trim()) return "IFSC Code is required";
      if (!formData.branch_name.trim()) return "Branch Name is required";
      if (!formData.cancelled_cheque) return "Cancelled cheque or passbook photo is required";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitKyc();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitKyc = async () => {
    setLoading(true);
    try {
      // 1. Save all details to user profile
      const updatePayload = {
        name: formData.name,
        dob: formData.dob,
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        pan_number: formData.pan_number.toUpperCase().trim(),
        pan_front: formData.pan_front,
        aadhaar_number: formData.aadhaar_number.trim(),
        aadhaar_front: formData.aadhaar_front,
        aadhaar_back: formData.aadhaar_back,
        selfie: formData.selfie,
        bank_name: formData.bank_name,
        account_holder: formData.account_holder,
        account_number: formData.account_number,
        ifsc: formData.ifsc.toUpperCase().trim(),
        branch_name: formData.branch_name,
        cancelled_cheque: formData.cancelled_cheque,
        kyc_status: "pending" // Set status to pending on submit
      };

      await api.put("/users/profile", updatePayload);
      await refreshUser();
      toast.success("KYC details submitted successfully! Under Review.");
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to submit KYC details");
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = Math.round(((currentStep - 1) / 4) * 100);

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 max-w-3xl mx-auto border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">KYC Verification Center</h2>
        <p className="text-slate-400 text-sm">Please complete all 5 steps to verify your account and enable platform deposits.</p>
      </div>

      {/* Steps Visual indicator */}
      <div className="mb-8">
        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step circles */}
        <div className="grid grid-cols-5 gap-2 text-center">
          {steps.map((s) => {
            const isCompleted = s.id < currentStep;
            const isActive = s.id === currentStep;
            return (
              <div key={s.id} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg" 
                      : isActive 
                        ? "bg-blue-600 text-white shadow-blue-500/30 shadow-lg ring-4 ring-blue-500/20" 
                        : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : s.id}
                </div>
                <span className="text-[10px] md:text-xs mt-2 text-slate-400 font-medium truncate w-full max-w-[80px] md:max-w-none">
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="min-h-[280px] bg-slate-950/40 border border-white/5 rounded-xl p-6 mb-8">
        {/* STEP 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Step 1: Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name (As in ID)</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter full name" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleInputChange} 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Address Line 1</label>
                <input 
                  type="text" 
                  name="address_line1" 
                  value={formData.address_line1} 
                  onChange={handleInputChange} 
                  placeholder="Street address, company name" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Address Line 2 (Optional)</label>
                <input 
                  type="text" 
                  name="address_line2" 
                  value={formData.address_line2} 
                  onChange={handleInputChange} 
                  placeholder="Apartment, suite, unit" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleInputChange} 
                  placeholder="City" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleInputChange} 
                  placeholder="State" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Pincode</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode} 
                  onChange={handleInputChange} 
                  placeholder="6 Digit PIN" 
                  maxLength={6}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PAN Card */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white mb-2">Step 2: PAN Verification</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">PAN Card Number</label>
              <input 
                type="text" 
                name="pan_number" 
                value={formData.pan_number} 
                onChange={handleInputChange} 
                placeholder="10-digit PAN (e.g. ABCDE1234F)" 
                maxLength={10}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Upload PAN Card Image</label>
              <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "pan_front")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  {formData.pan_front ? (
                    <div className="space-y-2">
                      <img src={formData.pan_front} alt="PAN Front" className="h-32 mx-auto object-contain rounded-lg border border-slate-700" />
                      <p className="text-xs text-emerald-400 font-semibold">Change Image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">Drag & drop or <span className="text-blue-500 font-semibold">browse files</span></p>
                      <p className="text-xs text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Aadhaar Card */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-white mb-2">Step 3: Aadhaar Card Verification</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Aadhaar Card Number</label>
              <input 
                type="text" 
                name="aadhaar_number" 
                value={formData.aadhaar_number} 
                onChange={handleInputChange} 
                placeholder="12-digit Aadhaar Number" 
                maxLength={12}
                className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Aadhaar Front Image</label>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer relative min-h-[160px]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "aadhaar_front")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    {formData.aadhaar_front ? (
                      <div className="space-y-2">
                        <img src={formData.aadhaar_front} alt="Aadhaar Front" className="h-24 mx-auto object-contain rounded-lg border border-slate-700" />
                        <p className="text-xs text-emerald-400 font-semibold">Change Image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-300">Upload Front Side</p>
                        <p className="text-[10px] text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Aadhaar Back Image</label>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer relative min-h-[160px]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "aadhaar_back")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    {formData.aadhaar_back ? (
                      <div className="space-y-2">
                        <img src={formData.aadhaar_back} alt="Aadhaar Back" className="h-24 mx-auto object-contain rounded-lg border border-slate-700" />
                        <p className="text-xs text-emerald-400 font-semibold">Change Image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-300">Upload Back Side</p>
                        <p className="text-[10px] text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Selfie */}
        {currentStep === 4 && (
          <div className="space-y-5 text-center">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Step 4: Selfie Verification</h3>
              <p className="text-slate-400 text-xs mb-4">Please upload a clear selfie of yourself to complete face matching checks.</p>
            </div>
            
            <div className="max-w-xs mx-auto border-2 border-dashed border-slate-700 rounded-xl p-6 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer relative min-h-[220px] flex items-center justify-center">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "selfie")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-full text-center">
                {formData.selfie ? (
                  <div className="space-y-3">
                    <img src={formData.selfie} alt="Selfie" className="w-36 h-36 mx-auto object-cover rounded-full border-4 border-blue-500/20" />
                    <p className="text-xs text-emerald-400 font-semibold">Replace Photo</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-2xl text-slate-400">👤</div>
                    <p className="text-sm text-slate-300">Upload selfie image</p>
                    <p className="text-[10px] text-slate-500">Ensure good lighting and face visibility</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Bank & Cheque */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-2">Step 5: Bank Details & Verification Proof</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Bank Name</label>
                <input 
                  type="text" 
                  name="bank_name" 
                  value={formData.bank_name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. ICICI Bank" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Account Holder Name</label>
                <input 
                  type="text" 
                  name="account_holder" 
                  value={formData.account_holder} 
                  onChange={handleInputChange} 
                  placeholder="Same as your name" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Account Number</label>
                <input 
                  type="password" 
                  name="account_number" 
                  value={formData.account_number} 
                  onChange={handleInputChange} 
                  placeholder="Enter Account Number" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm Account Number</label>
                <input 
                  type="text" 
                  name="confirm_account_number" 
                  value={formData.confirm_account_number} 
                  onChange={handleInputChange} 
                  placeholder="Re-enter Account Number" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">IFSC Code (Required)</label>
                <input 
                  type="text" 
                  name="ifsc" 
                  value={formData.ifsc} 
                  onChange={handleInputChange} 
                  placeholder="11 Character code (e.g. ICIC0001234)" 
                  maxLength={11}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch Name</label>
                <input 
                  type="text" 
                  name="branch_name" 
                  value={formData.branch_name} 
                  onChange={handleInputChange} 
                  placeholder="Enter Branch Name" 
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Upload Cancelled Cheque / First Page of Passbook</label>
              <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4 bg-slate-900/50 hover:bg-slate-900 hover:border-blue-500 transition-all cursor-pointer relative min-h-[140px]">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "cancelled_cheque")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  {formData.cancelled_cheque ? (
                    <div className="space-y-2">
                      <img src={formData.cancelled_cheque} alt="Cheque Proof" className="h-24 mx-auto object-contain rounded-lg border border-slate-700" />
                      <p className="text-xs text-emerald-400 font-semibold">Change Image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300">Click to upload cancelled cheque or passbook first page</p>
                      <p className="text-xs text-slate-500">Supports JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1 || loading}
          className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-all text-sm font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-blue-600/20 text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : currentStep === 5 ? (
            "Submit KYC Details"
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}
