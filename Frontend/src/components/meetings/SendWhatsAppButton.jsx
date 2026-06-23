import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function SendWhatsAppButton({ meeting, onSent, alreadySent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = () => {
    if (!confirmed) {
      setConfirmed(true);
      setTimeout(() => setConfirmed(false), 3000); // auto-reset if not confirmed
      toast("Click again to confirm sending", { icon: "⚠️", duration: 2500 });
      return;
    }
    handleSend();
  };

  const handleSend = async () => {
    setIsLoading(true);
    setConfirmed(false);
    const toastId = toast.loading("Sending to parent...");
    try {
      await api.post(`/whatsapp/send/${meeting.id}`);
      
      // Clean phone number and construct WhatsApp direct URL
      const phone = meeting.student?.parentPhone || "";
      let cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length === 10) {
        cleanPhone = "91" + cleanPhone;
      }
      
      const message = `Dear ${meeting.student?.parentName || "Parent"},\n\nWe hope this message finds you well.\n\n${meeting.aiSummary}\n\nWarm regards,\nFirstCry Intellitots Team`;
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp web / app in new tab
      window.open(waUrl, "_blank");

      toast.success("WhatsApp link opened!", { id: toastId });
      onSent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (alreadySent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600">
        <CheckCircle size={13} /> Sent
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
        confirmed
          ? "bg-orange-500 text-white animate-pulse"
          : "bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md"
      }`}
    >
      {isLoading ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <Send size={13} />
      )}
      {isLoading ? "Sending..." : confirmed ? "Confirm?" : "Send WhatsApp"}
    </button>
  );
}