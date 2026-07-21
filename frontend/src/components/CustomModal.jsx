import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  LogOut, 
  Download, 
  Upload, 
  CreditCard,
  X 
} from "lucide-react";

export default function CustomModal({ modal, onClose }) {
  const { 
    isOpen, 
    type, 
    title, 
    message, 
    confirmLabel, 
    cancelLabel, 
    placeholder, 
    defaultValue 
  } = modal;

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize input value for prompt
  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue || "");
      // Focus input or container for accessibility
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        } else if (containerRef.current) {
          containerRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, defaultValue]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(type === "prompt" ? null : false);
      }
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        if (type === "prompt") {
          onClose(inputValue);
        } else if (type === "confirm" || type === "delete" || type === "logout" || type === "payment" || type === "download" || type === "upload") {
          onClose(true);
        } else {
          onClose(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, type, inputValue, onClose]);

  // Map icon based on popup type
  const renderIcon = () => {
    const iconClass = "w-6 h-6 shrink-0";
    switch (type) {
      case "success":
        return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
      case "info":
        return <Info className={`${iconClass} text-blue-500`} />;
      case "warning":
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case "error":
        return <XCircle className={`${iconClass} text-rose-500`} />;
      case "delete":
        return <Trash2 className={`${iconClass} text-rose-500`} />;
      case "logout":
        return <LogOut className={`${iconClass} text-slate-700`} />;
      case "download":
        return <Download className={`${iconClass} text-blue-500`} />;
      case "upload":
        return <Upload className={`${iconClass} text-blue-500`} />;
      case "payment":
        return <CreditCard className={`${iconClass} text-emerald-600`} />;
      default:
        return <Info className={`${iconClass} text-slate-500`} />;
    }
  };

  // Determine primary action button style
  const getPrimaryButtonStyle = () => {
    const base = "px-4 py-2 text-xs font-semibold rounded-xl transition duration-200 active:scale-95 outline-none focus:ring-2";
    if (type === "delete" || type === "error") {
      return `${base} bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/20`;
    }
    return `${base} bg-black hover:bg-slate-800 text-white focus:ring-slate-500/20`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
          {/* Overlay Background Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(type === "prompt" ? null : false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-6 z-10 outline-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {renderIcon()}
                <h3 
                  id="modal-title" 
                  className="text-base font-bold text-slate-900"
                >
                  {title}
                </h3>
              </div>
              <button
                onClick={() => onClose(type === "prompt" ? null : false)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                {message}
              </p>

              {type === "prompt" && (
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800 font-medium transition"
                />
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              {cancelLabel && (
                <button
                  onClick={() => onClose(type === "prompt" ? null : false)}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-800 rounded-xl hover:bg-slate-50 transition active:scale-95 outline-none focus:ring-2 focus:ring-slate-500/20"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                onClick={() => {
                  if (type === "prompt") {
                    onClose(inputValue);
                  } else {
                    onClose(true);
                  }
                }}
                className={getPrimaryButtonStyle()}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
