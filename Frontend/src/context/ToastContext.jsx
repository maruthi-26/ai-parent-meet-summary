import { Toaster } from "react-hot-toast";

export function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Geist Variable', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          },
          success: {
            iconTheme: { primary: "#4ECDC4", secondary: "white" },
            style: {
              background: "white",
              color: "#1a1a2e",
              border: "1px solid #e8f8f7",
            },
          },
          error: {
            iconTheme: { primary: "#FF6B35", secondary: "white" },
            style: {
              background: "white",
              color: "#1a1a2e",
              border: "1px solid #fff0eb",
            },
          },
          loading: {
            iconTheme: { primary: "#FF6B35", secondary: "white" },
            style: {
              background: "white",
              color: "#1a1a2e",
            },
          },
        }}
      />
    </>
  );
}
