import React, { createContext, useContext } from "react";
import ToastManager, { Toast } from "toastify-react-native";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const showToast = (
    message: string,
    type: ToastType = "info",
    duration = 1500
  ) => {
    // Set toast configuration
    const options = { duration };

    switch (type) {
      case "success":
        Toast.success(message, options);
        break;
      case "error":
        Toast.error(message, options);
        break;
      case "warning":
        Toast.warn(message, options);
        break;
      default:
        Toast.info(message, options);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Configure the ToastManager component directly */}
      <ToastManager showProgressBar={false} showCloseIcon={false} />
    </ToastContext.Provider>
  );
};
