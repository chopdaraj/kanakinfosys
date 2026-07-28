import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ChevronRight, Check } from "lucide-react";

export default function KycWizard({ onComplete }) {
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State (Only PAN and Aadhaar fields)
  const [formData, setFormData] = useState({
    pan_number: user?.pan_number || "",
    pan_front: user?.pan_front || "",
    
    aadhaar_number: user?.aadhaar_number || "",
    aadhaar_front: user?.aadhaar_front || "",
    aadhaar_back: user?.aadhaar_back || "",
  });

  const steps = [
    { id: 1, name: "PAN Card", desc: "Permanent Account Number verification" },
    { id: 2, name: "Aadhaar Card", desc: "National Identity card verification" },
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
      if (!formData.pan_number.trim()) return "PAN Number is required";
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan_number.toUpperCase().trim())) {
        return "Invalid PAN card number format (e.g. ABCDE1234F)";
      }
      if (!formData.pan_front) return "PAN card photo is required";
    }
    if (currentStep === 2) {
      if (!formData.aadhaar_number.trim()) return "Aadhaar Number is required";
      if (formData.aadhaar_number.replace(/\s/g, "").length !== 12) {
        return "Aadhaar number must be exactly 12 digits";
      }
      if (!formData.aadhaar_front) return "Aadhaar Front photo is required";
      if (!formData.aadhaar_back) return "Aadhaar Back photo is required";
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    if (currentStep < 2) {
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
      const updatePayload = {
        pan_number: formData.pan_number.toUpperCase().trim(),
        pan_front: formData.pan_front,
        aadhaar_number: formData.aadhaar_number.trim(),
        aadhaar_front: formData.aadhaar_front,
        aadhaar_back: formData.aadhaar_back,
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

  const progressPercent = currentStep === 1 ? 50 : 100;

  return (
    <div className="kanak-card p-6 md:p-8 max-w-3xl mx-auto shadow-sm border border-slate-100 bg-white text-slate-800 animate-fade-in-up">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">KYC Verification Center</h2>
        <p className="text-slate-500 text-sm">Please complete all 2 steps to verify your account and enable platform deposits.</p>
      </div>

      {/* Steps Visual indicator */}
      <div className="mb-8">
        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step circles */}
        <div className="grid grid-cols-2 gap-2 text-center">
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
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.id}
                </div>
                <span className="text-[10px] md:text-xs mt-2 text-slate-500 font-medium truncate w-full max-w-[80px] md:max-w-none">
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="min-h-[280px] bg-slate-50/50 border border-slate-100 rounded-xl p-6 mb-8">
        {/* STEP 1: PAN Card */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 1: PAN Verification</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">PAN Card Number</label>
              <input 
                type="text" 
                name="pan_number" 
                value={formData.pan_number} 
                onChange={handleInputChange} 
                placeholder="10-digit PAN (e.g. ABCDE1234F)" 
                maxLength={10}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 uppercase transition-all text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Upload PAN Card Image</label>
              <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-white hover:bg-slate-50 transition-all cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "pan_front")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  {formData.pan_front ? (
                    <div className="space-y-2">
                      <img src={formData.pan_front} alt="PAN Front" className="h-32 mx-auto object-contain rounded-lg border border-slate-200" />
                      <p className="text-xs text-emerald-600 font-semibold">Change Image</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">Drag & drop or <span className="text-blue-600 font-semibold">browse files</span></p>
                      <p className="text-xs text-slate-400">Supports JPG, JPEG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Aadhaar Card */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Step 2: Aadhaar Card Verification</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Aadhaar Card Number</label>
              <input 
                type="text" 
                name="aadhaar_number" 
                value={formData.aadhaar_number} 
                onChange={handleInputChange} 
                placeholder="12-digit Aadhaar Number" 
                maxLength={12}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-sm font-medium"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Aadhaar Front Image</label>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-all cursor-pointer relative min-h-[160px]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "aadhaar_front")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    {formData.aadhaar_front ? (
                      <div className="space-y-2">
                        <img src={formData.aadhaar_front} alt="Aadhaar Front" className="h-24 mx-auto object-contain rounded-lg border border-slate-200" />
                        <p className="text-xs text-emerald-600 font-semibold">Change Image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">Upload Front Side</p>
                        <p className="text-[10px] text-slate-400">Supports JPG, JPEG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Aadhaar Back Image</label>
                <div className="mt-2 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white hover:bg-slate-50 transition-all cursor-pointer relative min-h-[160px]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "aadhaar_back")}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    {formData.aadhaar_back ? (
                      <div className="space-y-2">
                        <img src={formData.aadhaar_back} alt="Aadhaar Back" className="h-24 mx-auto object-contain rounded-lg border border-slate-200" />
                        <p className="text-xs text-emerald-600 font-semibold">Change Image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600">Upload Back Side</p>
                        <p className="text-[10px] text-slate-400">Supports JPG, JPEG, PNG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
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
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all text-sm font-semibold"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-blue-500/10 text-sm flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : currentStep === 2 ? (
            "Submit KYC Details"
          ) : (
            <span className="flex items-center gap-1">
              Continue <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
