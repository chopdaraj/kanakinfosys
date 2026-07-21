import React, { createContext, useContext, useState } from "react";
import CustomModal from "@/components/CustomModal";

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export function ModalProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    type: "info", // success, error, warning, info, confirm, delete, logout, download, upload, payment, prompt
    title: "",
    message: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    placeholder: "",
    defaultValue: "",
    resolve: null,
  });

  const alert = (message, title = "Alert", type = "info", options = {}) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type,
        title,
        message,
        confirmLabel: options.confirmLabel || "Close",
        cancelLabel: "",
        placeholder: "",
        defaultValue: "",
        resolve,
      });
    });
  };

  const confirm = (message, title = "Confirm", type = "confirm", options = {}) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type,
        title,
        message,
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        placeholder: "",
        defaultValue: "",
        resolve,
      });
    });
  };

  const prompt = (message, defaultValue = "", title = "Prompt", options = {}) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        type: "prompt",
        title,
        message,
        confirmLabel: options.confirmLabel || "Submit",
        cancelLabel: options.cancelLabel || "Cancel",
        placeholder: options.placeholder || "Enter value...",
        defaultValue,
        resolve,
      });
    });
  };

  const close = (result = null) => {
    if (modal.resolve) {
      modal.resolve(result);
    }
    setModal((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  return (
    <ModalContext.Provider value={{ alert, confirm, prompt, close }}>
      {children}
      <CustomModal modal={modal} onClose={close} />
    </ModalContext.Provider>
  );
}
